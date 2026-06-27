"""
Swiss Ephemeris микросервис расчёта натальной карты.

Контракт: принимает данные рождения, возвращает обезличенную структуру карты
(планеты, дома, аспекты). Никаких Telegram ID / имён — только астрономия.
Интерпретацию пишет отдельно AI (функция interpret), как требует ARCHITECTURE.md.

Расчёт использует встроенную эфемериду Moshier (FLG_MOSEPH) — не требует
внешних файлов .se1, точность ~0.1' достаточна для интерпретации.
"""
import os
from datetime import datetime
from zoneinfo import ZoneInfo

import swisseph as swe
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel
from timezonefinder import TimezoneFinder
from geopy.geocoders import Nominatim

app = FastAPI(title="astro chart-calc")
_tf = TimezoneFinder()
_geocoder = Nominatim(user_agent=os.environ.get("GEOCODER_UA", "astro-mini-app/1.0"))

# Moshier + скорость (для определения ретроградности). Внешние эфемериды не нужны.
FLAGS = swe.FLG_MOSEPH | swe.FLG_SPEED

PLANETS = [
    ("Солнце", "sun", swe.SUN),
    ("Луна", "moon", swe.MOON),
    ("Меркурий", "mercury", swe.MERCURY),
    ("Венера", "venus", swe.VENUS),
    ("Марс", "mars", swe.MARS),
    ("Юпитер", "jupiter", swe.JUPITER),
    ("Сатурн", "saturn", swe.SATURN),
    ("Уран", "uranus", swe.URANUS),
    ("Нептун", "neptune", swe.NEPTUNE),
    ("Плутон", "pluto", swe.PLUTO),
    ("Северный узел", "north_node", swe.MEAN_NODE),
]
SIGNS = ["Овен", "Телец", "Близнецы", "Рак", "Лев", "Дева",
         "Весы", "Скорпион", "Стрелец", "Козерог", "Водолей", "Рыбы"]
ELEMENTS = {
    "Овен": "Огонь", "Лев": "Огонь", "Стрелец": "Огонь",
    "Телец": "Земля", "Дева": "Земля", "Козерог": "Земля",
    "Близнецы": "Воздух", "Весы": "Воздух", "Водолей": "Воздух",
    "Рак": "Вода", "Скорпион": "Вода", "Рыбы": "Вода",
}
ASPECTS = [("Соединение", 0, 8), ("Секстиль", 60, 4), ("Квадрат", 90, 6),
           ("Тригон", 120, 6), ("Оппозиция", 180, 8)]


class BirthIn(BaseModel):
    date: str                 # "1996-06-11"
    time: str | None = None   # "08:40"
    time_unknown: bool = False
    place: str
    lat: float | None = None
    lon: float | None = None


def deg_to_sign(longitude: float):
    idx = int(longitude // 30) % 12
    return SIGNS[idx], round(longitude % 30, 2)


def house_of(longitude: float, cusps):
    """Номер дома (1..12) для долготы при неравных домах (Плацидус)."""
    if not cusps:
        return None
    for i in range(12):
        a = cusps[i]
        b = cusps[(i + 1) % 12]
        if a < b:
            if a <= longitude < b:
                return i + 1
        else:  # дом пересекает 0° Овна
            if longitude >= a or longitude < b:
                return i + 1
    return None


def _check_token(authorization: str):
    expected = os.environ.get("CHART_CALC_TOKEN")
    if expected and authorization != f"Bearer {expected}":
        raise HTTPException(status_code=401, detail="Unauthorized")


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/")
def calc(body: BirthIn, authorization: str = Header(default="")):
    _check_token(authorization)

    # 1. Координаты: из тела или геокодирование места.
    lat, lon = body.lat, body.lon
    if lat is None or lon is None:
        location = _geocoder.geocode(body.place)
        if not location:
            raise HTTPException(status_code=422, detail="Place not found")
        lat, lon = location.latitude, location.longitude

    # 2. Часовой пояс по координатам + исторический сдвиг на дату рождения.
    tzname = _tf.timezone_at(lat=lat, lng=lon) or "UTC"
    tz = ZoneInfo(tzname)

    if body.time_unknown or not body.time:
        hh, mm = 12, 0
    else:
        parts = body.time.split(":")
        hh = int(parts[0])
        mm = int(parts[1]) if len(parts) > 1 else 0
    year, month, day = (int(x) for x in body.date.split("-"))

    local_dt = datetime(year, month, day, hh, mm, tzinfo=tz)
    utc_dt = local_dt.astimezone(ZoneInfo("UTC"))
    jd = swe.julday(
        utc_dt.year, utc_dt.month, utc_dt.day,
        utc_dt.hour + utc_dt.minute / 60 + utc_dt.second / 3600,
    )

    # 3. Дома и угловые точки (только при известном времени).
    cusps = None
    asc = mc = None
    if not body.time_unknown:
        cusps_raw, ascmc = swe.houses(jd, lat, lon, b"P")  # Placidus
        cusps = list(cusps_raw)[-12:]
        asc, mc = ascmc[0], ascmc[1]

    # 4. Планеты.
    planets = []
    elem_count = {}
    for name, key, pid in PLANETS:
        xx, _ = swe.calc_ut(jd, pid, FLAGS)
        plon, speed = xx[0], xx[3]
        sign, deg = deg_to_sign(plon)
        if key != "north_node":  # узел не считаем за стихию
            elem_count[ELEMENTS[sign]] = elem_count.get(ELEMENTS[sign], 0) + 1
        planets.append({
            "name": name, "key": key, "sign": sign, "degree": deg,
            "lon": round(plon, 4),
            "house": house_of(plon, cusps),
            "retrograde": speed < 0,
        })

    # 5. Аспекты между планетами.
    aspects = []
    for i in range(len(planets)):
        for j in range(i + 1, len(planets)):
            diff = abs(planets[i]["lon"] - planets[j]["lon"]) % 360
            if diff > 180:
                diff = 360 - diff
            for aname, angle, orb in ASPECTS:
                if abs(diff - angle) <= orb:
                    aspects.append({
                        "a": planets[i]["key"], "b": planets[j]["key"],
                        "type": aname, "orb": round(abs(diff - angle), 2),
                    })
                    break

    dominant_element = max(elem_count, key=elem_count.get) if elem_count else None
    asc_sign = deg_to_sign(asc)[0] if asc is not None else None

    return {
        "engine": "swisseph-moseph",
        "birth": {
            "date": body.date,
            "time": None if body.time_unknown else body.time,
            "time_unknown": body.time_unknown,
            "place": body.place,
            "lat": round(lat, 4), "lon": round(lon, 4), "timezone": tzname,
        },
        "ascendant": ({"sign": asc_sign, "degree": round(asc % 30, 2)} if asc_sign else None),
        "mc": round(mc, 2) if mc is not None else None,
        "houses_system": None if body.time_unknown else "Placidus",
        "house_cusps": [round(c, 2) for c in cusps] if cusps else None,
        "planets": planets,
        "aspects": aspects,
        "dominant_element": dominant_element,
    }

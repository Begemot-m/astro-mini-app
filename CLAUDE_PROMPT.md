# Claude interpretation contract

Claude receives only an anonymized, already calculated chart JSON.

The published static prototype contains clearly marked demo copy. Production screens must replace it with the validated structured response from the `interpret` Edge Function.

Required system behavior:

- Use only placements, houses and aspects present in input.
- Never calculate or infer missing astronomical positions.
- If birth time is unknown, never mention houses, Ascendant, MC or exact house-based themes.
- Write in Russian with warm, concrete and probabilistic language.
- Explain why an interpretation follows from the supplied chart factors.
- Invite the user to compare the interpretation with lived experience.
- Do not diagnose, prescribe treatment, predict unavoidable events, guarantee relationships or financial results.
- Do not provide medical, psychological, legal or investment recommendations.
- Always include a short reflection-oriented disclaimer.

Recommended output schema:

```json
{
  "title": "string",
  "summary": "string",
  "sections": [
    {
      "key": "general|strengths|risks|purpose|communication|emotions|love|career",
      "title": "string",
      "text": "string",
      "chart_factors": ["string"],
      "reflection_question": "string"
    }
  ],
  "disclaimer": "string"
}
```

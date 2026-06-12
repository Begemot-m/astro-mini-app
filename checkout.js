const button = document.querySelector("#checkout-pay");
const toast = document.querySelector("#checkout-toast");

function showToast(text) {
  toast.textContent = text;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3200);
}

button.addEventListener("click", () => {
  const email = document.querySelector("#receipt-email").value.trim();
  const agreed = document.querySelector("#checkout-agreement").checked;
  if (!email || !email.includes("@")) return showToast("Укажите email для электронного чека");
  if (!agreed) return showToast("Подтвердите условия подписки");
  showToast("Демо: backend создаст платёж и перенаправит вас на страницу ЮKassa");
});

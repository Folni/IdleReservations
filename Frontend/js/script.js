import { renderNav } from "./elements/nav.js";
import { renderFooter } from "./elements/footer.js";
import { showToast } from "./elements/toast.js";

document.getElementById("nav").innerHTML = renderNav();
document.getElementById("footer").innerHTML = renderFooter();

const logoutBtn = document.getElementById("logout-btn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("authToken");

    showToast("Odjavljeni ste.", "info");

    setTimeout(() => {
      window.location.href = "index.html";
    }, 500);
  });
}
import { renderNav } from "../elements/nav.js";
import { renderFooter } from "../elements/footer.js";
import { parseJwt } from "../utils/jwt.js";
import { changePassword } from "../api/authApi.js";
import { showToast } from "../elements/toast.js";

document.getElementById("nav").innerHTML = renderNav();
document.getElementById("footer").innerHTML = renderFooter();

const token = localStorage.getItem("authToken");

guardProfile();

const payload = parseJwt(token);

const username =
  payload?.unique_name ||
  payload?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ||
  payload?.sub ||
  "User";

const role =
  payload?.role ||
  payload?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
  "User";

document.getElementById("profile-username").textContent = username;
document.getElementById("profile-role").textContent = role;

const form = document.getElementById("change-password-form");
const message = document.getElementById("change-password-message");

form.addEventListener("submit", handleChangePassword);

function guardProfile() {
  if (!token) {
    showToast("Morate biti prijavljeni.", "warning");
    setTimeout(() => {
      window.location.href = "./auth.html";
    }, 500);
  }
}

async function handleChangePassword(event) {
  event.preventDefault();

  clearMessage();

  const newPassword = document.getElementById("new-password").value.trim();

  if (newPassword.length < 8) {
    showError("Lozinka mora imati najmanje 8 znakova.");
    showToast("Lozinka mora imati najmanje 8 znakova.", "warning");
    return;
  }

  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  button.textContent = "Spremanje...";

  try {
    await changePassword({
      username,
      newPassword,
    });

    form.reset();
    showSuccess("Lozinka je uspješno promijenjena.");
    showToast("Lozinka je uspješno promijenjena.", "success");
  } catch (error) {
    console.error(error);
    showError(error.message || "Neuspješna promjena lozinke.");
    showToast(error.message || "Neuspješna promjena lozinke.", "error");
  } finally {
    button.disabled = false;
    button.textContent = "Promijeni lozinku";
  }
}

function showSuccess(text) {
  message.textContent = text;
  message.classList.remove("error");
  message.classList.add("success");
}

function showError(text) {
  message.textContent = text;
  message.classList.remove("success");
  message.classList.add("error");
}

function clearMessage() {
  message.textContent = "";
  message.classList.remove("success", "error");
}
import { renderNav } from "../elements/nav.js";
import { renderFooter } from "../elements/footer.js";
import { loginUser, registerUser } from "../api/authApi.js";
import { showToast } from "../elements/toast.js";

document.getElementById("nav").innerHTML = renderNav();
document.getElementById("footer").innerHTML = renderFooter();

const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

const loginMessage = document.getElementById("login-message");
const registerMessage = document.getElementById("register-message");

loginForm.addEventListener("submit", handleLogin);
registerForm.addEventListener("submit", handleRegister);

async function handleLogin(event) {
  event.preventDefault();

  clearMessage(loginMessage);
  setLoading(loginForm, true);

  const payload = {
    username: document.getElementById("login-username").value.trim(),
    password: document.getElementById("login-password").value.trim(),
  };

try {
  const result = await loginUser(payload);

  const token = typeof result === "string" ? result : result.token;

  if (!token) {
    throw new Error("Token nije vraćen s backenda.");
  }

  localStorage.setItem("authToken", token);

  showSuccess(loginMessage, "Prijava uspješna.");
  showToast("Uspješna prijava.", "success");

  setTimeout(() => {
    window.location.href = "./index.html";
  }, 600);
} catch (error) {
  showError(loginMessage, error.message || "Neuspješna prijava.");
  showToast(error.message || "Neuspješna prijava.", "error");
} finally {
  setLoading(loginForm, false);
}
}

async function handleRegister(event) {
  event.preventDefault();

  clearMessage(registerMessage);
  setLoading(registerForm, true);

  const payload = {
    username: document.getElementById("register-username").value.trim(),
    email: document.getElementById("register-email").value.trim(),
    password: document.getElementById("register-password").value.trim(),
    firstName: document.getElementById("register-firstname").value.trim(),
    lastName: document.getElementById("register-lastname").value.trim(),
  };

try {
  const result = await registerUser(payload);

  showSuccess(registerMessage, "Registracija uspješna.");
  showToast("Registracija uspješna.", "success");

  registerForm.reset();

  setTimeout(() => {
    window.location.href = "./index.html";
  }, 600);
} catch (error) {
  console.error("Register error:", error);
  showError(registerMessage, error.message || "Neuspješna registracija.");
  showToast(error.message || "Neuspješna registracija.", "error");
} finally {
  setLoading(registerForm, false);
}
}

function showSuccess(element, message) {
  element.textContent = message;
  element.classList.remove("error");
  element.classList.add("success");
}

function showError(element, message) {
  element.textContent = message;
  element.classList.remove("success");
  element.classList.add("error");
}

function clearMessage(element) {
  element.textContent = "";
  element.classList.remove("success", "error");
}

function setLoading(form, isLoading) {
  const button = form.querySelector('button[type="submit"]');

  if (!button) return;

  button.disabled = isLoading;
  button.textContent = isLoading ? "Molim pričekaj..." : getDefaultButtonText(form.id);
}

function getDefaultButtonText(formId) {
  if (formId === "login-form") return "Prijavi se";
  if (formId === "register-form") return "Registriraj se";
  return "Pošalji";
}
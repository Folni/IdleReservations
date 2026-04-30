import { renderNav } from "../elements/nav.js";
import { renderFooter } from "../elements/footer.js";
import { parseJwt } from "../utils/jwt.js";
import { changePassword, getLoyaltyPoints } from "../api/authApi.js";
import {
  getNotificationsByUser,
  markNotificationAsRead,
} from "../api/notificationsApi.js";
import { showToast } from "../elements/toast.js";

const nav = document.getElementById("nav");
const footer = document.getElementById("footer");
const usernameElement = document.getElementById("profile-username");
const roleElement = document.getElementById("profile-role");
const loyaltyPointsElement = document.getElementById("profile-loyalty-points");
const notificationsHistory = document.getElementById("notifications-history");
const refreshNotificationsBtn = document.getElementById("refresh-notifications-btn");
const form = document.getElementById("change-password-form");
const message = document.getElementById("change-password-message");

if (nav) nav.innerHTML = renderNav();
if (footer) footer.innerHTML = renderFooter();

const token = localStorage.getItem("authToken");

if (!guardProfile(token)) {
  throw new Error("User is not logged in.");
}

const payload = parseJwt(token);

const username =
  payload?.unique_name ||
  payload?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ||
  payload?.username ||
  payload?.sub ||
  "User";

const role =
  payload?.role ||
  payload?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
  payload?.Role ||
  "User";

const userId = getUserIdFromPayload(payload);

if (usernameElement) usernameElement.textContent = username;
if (roleElement) roleElement.textContent = role;

form?.addEventListener("submit", handleChangePassword);
refreshNotificationsBtn?.addEventListener("click", loadNotifications);

loadLoyaltyPoints();
loadNotifications();

function guardProfile(authToken) {
  if (authToken) return true;

  showToast("Morate biti prijavljeni.", "warning");

  setTimeout(() => {
    window.location.href = "./auth.html";
  }, 500);

  return false;
}

function getUserIdFromPayload(tokenPayload) {
  if (!tokenPayload) return null;

  return (
    tokenPayload.userId ||
    tokenPayload.userid ||
    tokenPayload.id ||
    tokenPayload.nameid ||
    tokenPayload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
    tokenPayload["http://schemas.microsoft.com/ws/2008/06/identity/claims/nameidentifier"] ||
    null
  );
}

async function loadLoyaltyPoints() {
  if (!loyaltyPointsElement) return;

  if (!userId) {
    loyaltyPointsElement.textContent = "Nije dostupno";
    return;
  }

  loyaltyPointsElement.textContent = "Učitavanje...";

  try {
    const result = await getLoyaltyPoints(userId);
    const points = result?.points ?? result?.Points ?? result ?? 0;

    loyaltyPointsElement.textContent = `${points} bodova`;
  } catch (error) {
    console.error("Greška pri dohvaćanju loyalty bodova:", error);
    loyaltyPointsElement.textContent = "Nije dostupno";
  }
}

async function loadNotifications() {
  if (!notificationsHistory) return;

  if (!userId) {
    notificationsHistory.innerHTML = `
      <p class="text-muted mb-0">Nije moguće dohvatiti korisnika iz tokena.</p>
    `;
    return;
  }

  notificationsHistory.innerHTML = `
    <p class="text-muted mb-0">Učitavanje notifikacija...</p>
  `;

  try {
    const notifications = await getNotificationsByUser(userId);
    const normalizedNotifications = Array.isArray(notifications) ? notifications : [];

    renderNotifications(normalizedNotifications);
  } catch (error) {
    console.error("Greška pri dohvaćanju notifikacija:", error);

    notificationsHistory.innerHTML = `
      <div class="alert alert-danger mb-0">
        ${escapeHtml(error.message || "Greška pri dohvaćanju notifikacija.")}
      </div>
    `;
  }
}

function renderNotifications(notifications) {
  if (!notificationsHistory) return;

  if (!notifications.length) {
    notificationsHistory.innerHTML = `
      <p class="text-muted mb-0">Trenutno nema notifikacija.</p>
    `;
    return;
  }

  notificationsHistory.innerHTML = notifications
    .map((notification) => {
      const id = notification.notificationId ?? notification.NotificationId;
      const title = notification.title ?? notification.Title ?? "Notifikacija";
      const notificationMessage = notification.message ?? notification.Message ?? "";
      const isRead = notification.isRead ?? notification.IsRead ?? false;

      return `
        <div class="border rounded p-3 mb-3 ${isRead ? "bg-light" : ""}">
          <div class="d-flex justify-content-between gap-3 align-items-start">
            <div>
              <h6 class="mb-1">${escapeHtml(title)}</h6>
              <p class="mb-2">${escapeHtml(notificationMessage)}</p>
              <span class="badge ${isRead ? "text-bg-secondary" : "text-bg-primary"}">
                ${isRead ? "Pročitano" : "Nepročitano"}
              </span>
            </div>

            ${
              isRead
                ? ""
                : `
                  <button
                    type="button"
                    class="btn btn-outline-dark btn-sm mark-notification-read-btn"
                    data-id="${escapeAttr(id)}"
                  >
                    Označi kao pročitano
                  </button>
                `
            }
          </div>
        </div>
      `;
    })
    .join("");

  bindNotificationButtons();
}

function bindNotificationButtons() {
  document.querySelectorAll(".mark-notification-read-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = button.dataset.id;
      if (!id) return;

      button.disabled = true;
      button.textContent = "Spremanje...";

      try {
        await markNotificationAsRead(id);
        showToast("Notifikacija označena kao pročitana.", "success");
        await loadNotifications();
      } catch (error) {
        console.error("Greška pri označavanju notifikacije:", error);
        showToast(error.message || "Greška pri označavanju notifikacije.", "error");

        button.disabled = false;
        button.textContent = "Označi kao pročitano";
      }
    });
  });
}

async function handleChangePassword(event) {
  event.preventDefault();
  clearMessage();

  const newPassword = document.getElementById("new-password")?.value.trim() ?? "";

  if (newPassword.length < 8) {
    showError("Lozinka mora imati najmanje 8 znakova.");
    showToast("Lozinka mora imati najmanje 8 znakova.", "warning");
    return;
  }

  const button = form?.querySelector('button[type="submit"]');

  if (button) {
    button.disabled = true;
    button.textContent = "Spremanje...";
  }

  try {
    await changePassword({
      username,
      newPassword,
    });

    form?.reset();
    showSuccess("Lozinka je uspješno promijenjena.");
    showToast("Lozinka je uspješno promijenjena.", "success");
  } catch (error) {
    console.error(error);
    showError(error.message || "Neuspješna promjena lozinke.");
    showToast(error.message || "Neuspješna promjena lozinke.", "error");
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = "Promijeni lozinku";
    }
  }
}

function showSuccess(text) {
  if (!message) return;

  message.textContent = text;
  message.classList.remove("error");
  message.classList.add("success");
}

function showError(text) {
  if (!message) return;

  message.textContent = text;
  message.classList.remove("success");
  message.classList.add("error");
}

function clearMessage() {
  if (!message) return;

  message.textContent = "";
  message.classList.remove("success", "error");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
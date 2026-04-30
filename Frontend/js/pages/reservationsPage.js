import { renderNav } from "../elements/nav.js";
import { renderFooter } from "../elements/footer.js";
import { renderReservationsTable } from "../elements/reservationsTable.js";
import {
  getAllReservations,
  createReservation,
} from "../api/reservationsApi.js";
import { getAllRestaurants } from "../api/restaurantsApi.js";
import { getAllTables, getTablesByRestaurant } from "../api/tablesApi.js";
import { showToast } from "../elements/toast.js";

const nav = document.getElementById("nav");
const footer = document.getElementById("footer");
const content = document.getElementById("reservations-content");
const createReservationForm = document.getElementById("create-reservation-form");
const formMessage = document.getElementById("reservation-form-message");
const restaurantSelect = document.getElementById("reservation-restaurant-id");
const tableSelect = document.getElementById("reservation-table-id");
const dateInput = document.getElementById("reservation-datetime");

let restaurantsState = [];
let tablesState = [];
let allTablesState = [];

if (nav) nav.innerHTML = renderNav();
if (footer) footer.innerHTML = renderFooter();
if (dateInput) dateInput.min = toDatetimeLocalValue(new Date());

init();

async function init() {
  if (!content) {
    console.error("Nedostaje element #reservations-content u reservations.html");
    return;
  }

  if (!isLoggedIn()) {
    renderUnauthorized();
    return;
  }

  bindEvents();
  await loadLookupData();
  await loadReservations();
}

function bindEvents() {
  createReservationForm?.addEventListener("submit", handleCreateReservation);
  restaurantSelect?.addEventListener("change", handleRestaurantChange);

  document.addEventListener("click", (event) => {
    if (event.target?.id === "retry-btn") {
      loadReservations();
    }
  });
}

async function loadLookupData() {
  try {
    const [restaurants, tables] = await Promise.all([
      getAllRestaurants(),
      getAllTables(),
    ]);

    restaurantsState = normalizeList(restaurants);
    allTablesState = normalizeList(tables);
    renderRestaurantOptions();
  } catch (error) {
    console.error("Greška pri dohvaćanju pomoćnih podataka:", error);
    showToast(getErrorMessage(error, "Greška pri dohvaćanju pomoćnih podataka."), "error");
  }
}

async function loadReservations() {
  content.innerHTML = renderLoading();

  try {
    const reservationsResponse = await getAllReservations();
    const reservations = normalizeList(reservationsResponse);
    const userReservations = filterMyReservations(reservations);
    const enrichedReservations = enrichReservations(userReservations);

    content.innerHTML = renderReservationsTable(enrichedReservations);
  } catch (error) {
    console.error("Greška pri dohvaćanju rezervacija:", error);
    content.innerHTML = renderError(error);
    showToast(getErrorMessage(error, "Greška pri dohvaćanju rezervacija."), "error");
  }
}

function enrichReservations(reservations) {
  return normalizeList(reservations).map((reservation) => {
    const restaurantId =
      reservation.restaurantId ??
      reservation.RestaurantId ??
      reservation.restaurant?.restaurantId ??
      reservation.restaurant?.id ??
      null;

    const tableId =
      reservation.tableId ??
      reservation.TableId ??
      reservation.table?.tableId ??
      reservation.table?.id ??
      null;

    return {
      ...reservation,
      restaurantName: reservation.restaurantName ?? getRestaurantName(restaurantId),
      tableLabel: reservation.tableLabel ?? getTableLabel(tableId),
    };
  });
}

function getRestaurantName(restaurantId) {
  const restaurant = restaurantsState.find(
    (item) => String(item.restaurantId ?? item.id ?? item.RestaurantId) === String(restaurantId),
  );

  return restaurant?.name || `Restoran ${restaurantId ?? "-"}`;
}

function getTableLabel(tableId) {
  const table = allTablesState.find(
    (item) => String(item.tableId ?? item.id ?? item.TableId) === String(tableId),
  );

  if (!table) {
    return `Stol ${tableId ?? "-"}`;
  }

  return `${table.seats ?? table.Seats ?? "-"} mjesta`;
}

function renderRestaurantOptions() {
  if (!restaurantSelect) return;

  const options = restaurantsState
    .map((restaurant) => {
      const id = restaurant.restaurantId ?? restaurant.id ?? restaurant.RestaurantId;
      const name = restaurant.name ?? `Restoran ${id}`;
      return `<option value="${escapeHtml(id)}">${escapeHtml(name)}</option>`;
    })
    .join("");

  restaurantSelect.innerHTML = `
    <option value="">Odaberi restoran</option>
    ${options}
  `;
}

async function handleRestaurantChange() {
  const restaurantId = restaurantSelect?.value;

  if (!restaurantId) {
    tablesState = [];
    renderTableOptions();
    return;
  }

  try {
    const tables = await getTablesByRestaurant(restaurantId);
    tablesState = normalizeList(tables);
    renderTableOptions();
  } catch (error) {
    console.error("Greška pri dohvaćanju stolova:", error);
    tablesState = [];
    renderTableOptions();
    showToast(getErrorMessage(error, "Greška pri dohvaćanju stolova."), "error");
  }
}

function renderTableOptions() {
  if (!tableSelect) return;

  if (!tablesState.length) {
    tableSelect.innerHTML = `<option value="">Nema dostupnih stolova</option>`;
    return;
  }

  const options = tablesState
    .map((table) => {
      const id = table.tableId ?? table.id ?? table.TableId;
      const seats = table.seats ?? table.Seats ?? "-";
      return `<option value="${escapeHtml(id)}">${escapeHtml(seats)} mjesta</option>`;
    })
    .join("");

  tableSelect.innerHTML = `
    <option value="">Odaberi stol</option>
    ${options}
  `;
}

async function handleCreateReservation(event) {
  event.preventDefault();
  clearFormMessage();

  const restaurantId = restaurantSelect?.value.trim() ?? "";
  const tableId = tableSelect?.value.trim() ?? "";
  const reservationDateTime = dateInput?.value.trim() ?? "";
  const partySize = document.getElementById("reservation-party-size")?.value.trim() ?? "";

  if (!restaurantId || !tableId || !reservationDateTime || !partySize) {
    setFormMessage("Sva polja su obavezna.", "danger");
    return;
  }

  if (new Date(reservationDateTime) < new Date()) {
    setFormMessage("Ne možeš rezervirati u prošlosti.", "danger");
    return;
  }

  const selectedTable = tablesState.find(
    (table) => String(table.tableId ?? table.id ?? table.TableId) === String(tableId),
  );

  const seats = Number(selectedTable?.seats ?? selectedTable?.Seats ?? 0);
  if (seats && Number(partySize) > seats) {
    setFormMessage(`Maksimalan broj osoba za ovaj stol je ${seats}.`, "danger");
    return;
  }

  const userId = getUserIdFromToken();
  if (!userId) {
    setFormMessage("Nije moguće odrediti korisnika iz tokena.", "danger");
    return;
  }

  const payload = {
    userId: Number(userId),
    restaurantId: Number(restaurantId),
    tableId: Number(tableId),
    reservationDateTime,
    partySize: Number(partySize),
  };

  try {
    await createReservation(payload);
    showToast("Rezervacija uspješno kreirana.", "success");

    createReservationForm?.reset();
    tablesState = [];
    renderTableOptions();

    const modalElement = document.getElementById("createReservationModal");
    if (modalElement && window.bootstrap?.Modal) {
      const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
      modalInstance?.hide();
    }

    await loadReservations();
  } catch (error) {
    const msg = getErrorMessage(error, "Greška pri kreiranju rezervacije.");
    setFormMessage(msg, "danger");
    showToast(msg, "error");
  }
}

function isLoggedIn() {
  return Boolean(localStorage.getItem("authToken"));
}

function getTokenPayload() {
  const token = localStorage.getItem("authToken");
  if (!token) return null;

  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

function getUserIdFromToken() {
  const payload = getTokenPayload();
  if (!payload) return null;

  return (
    payload.userId ||
    payload.userid ||
    payload.id ||
    payload.nameid ||
    payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
    payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/nameidentifier"] ||
    null
  );
}

function filterMyReservations(reservations) {
  const list = normalizeList(reservations);
  const payload = getTokenPayload();
  if (!payload) return [];

  const username = String(
    payload.unique_name ||
      payload.username ||
      payload.email ||
      payload.sub ||
      ""
  ).toLowerCase();

  const userId = String(getUserIdFromToken() ?? "");

  return list.filter((reservation) => {
    const reservationUserName = String(
      reservation.userName ||
        reservation.username ||
        reservation.UserName ||
        reservation.email ||
        reservation.user?.userName ||
        reservation.user?.username ||
        reservation.user?.email ||
        ""
    ).toLowerCase();

    const reservationUserId = String(
      reservation.userId ||
        reservation.UserId ||
        reservation.applicationUserId ||
        reservation.appUserId ||
        reservation.idUser ||
        reservation.user?.userId ||
        reservation.user?.id ||
        ""
    );

    const matchesByUsername = username && reservationUserName && reservationUserName === username;
    const matchesByUserId = userId && reservationUserId && reservationUserId === userId;

    return matchesByUsername || matchesByUserId;
  });
}

function renderUnauthorized() {
  content.innerHTML = `
    <div class="state-card error-state">
      <h3>Prijava je obavezna</h3>
      <p>Za pregled svojih rezervacija moraš biti prijavljen.</p>
      <a href="./auth.html" class="btn btn-primary-custom mt-2">Idi na prijavu</a>
    </div>
  `;
}

function renderLoading() {
  return `
    <div class="state-card">
      <div class="spinner-border" role="status" aria-hidden="true"></div>
      <p class="mt-3 mb-0">Učitavanje rezervacija...</p>
    </div>
  `;
}

function renderError(error) {
  const message = getErrorMessage(error, "Dogodila se neočekivana greška.");

  return `
    <div class="state-card error-state">
      <h3>Greška pri dohvaćanju rezervacija</h3>
      <p>${escapeHtml(message)}</p>
      <button class="btn btn-primary-custom mt-2" id="retry-btn">Pokušaj ponovno</button>
    </div>
  `;
}

function setFormMessage(message, type = "danger") {
  if (!formMessage) return;
  formMessage.innerHTML = `<div class="alert alert-${type} mb-0">${escapeHtml(message)}</div>`;
}

function clearFormMessage() {
  if (!formMessage) return;
  formMessage.innerHTML = "";
}

function normalizeList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.$values)) return data.$values;
  return [];
}

function getErrorMessage(error, fallback) {
  if (typeof error === "string") return error;
  if (typeof error?.response?.data === "string") return error.response.data;
  if (typeof error?.data === "string") return error.data;
  return error?.message || fallback;
}

function toDatetimeLocalValue(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

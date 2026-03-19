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

document.getElementById("nav").innerHTML = renderNav();
document.getElementById("footer").innerHTML = renderFooter();

const content = document.getElementById("reservations-content");
const createReservationForm = document.getElementById("create-reservation-form");
const formMessage = document.getElementById("reservation-form-message");
const restaurantSelect = document.getElementById("reservation-restaurant-id");
const tableSelect = document.getElementById("reservation-table-id");

let restaurantsState = [];
let tablesState = [];
let allTablesState = [];

init();

async function init() {
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
    if (event.target && event.target.id === "retry-btn") {
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

    restaurantsState = Array.isArray(restaurants) ? restaurants : [];
    allTablesState = Array.isArray(tables) ? tables : [];
    renderRestaurantOptions();
  } catch (error) {
    console.error(error);
    showToast("Greška pri dohvaćanju pomoćnih podataka.", "error");
  }
}

async function loadReservations() {
  content.innerHTML = renderLoading();

  try {
    const reservations = await getAllReservations();
    const userReservations = filterMyReservations(reservations);
    const enrichedReservations = enrichReservations(userReservations);

    content.innerHTML = renderReservationsTable(enrichedReservations);
  } catch (error) {
    console.error(error);
    content.innerHTML = renderError(error);
  }
}

function enrichReservations(reservations) {
  return reservations.map((reservation) => {
    const restaurantId = reservation.restaurantId ?? null;
    const tableId = reservation.tableId ?? null;

    return {
      ...reservation,
      restaurantName: getRestaurantName(restaurantId),
      tableLabel: getTableLabel(tableId),
    };
  });
}

function getRestaurantName(restaurantId) {
  const restaurant = restaurantsState.find(
    (r) => String(r.restaurantId ?? r.id) === String(restaurantId)
  );

  return restaurant?.name || `Restoran ${restaurantId ?? "-"}`;
}

function getTableLabel(tableId) {
  const table = allTablesState.find(
    (t) => String(t.tableId ?? t.id) === String(tableId)
  );

  if (!table) {
    return `Stol ${tableId ?? "-"}`;
  }

  const seats = table.seats ?? "-";
  return `${seats} mjesta`;
}

function renderRestaurantOptions() {
  const options = restaurantsState
    .map((restaurant) => {
      const id = restaurant.restaurantId ?? restaurant.id;
      const name = restaurant.name ?? `Restoran ${id}`;
      return `<option value="${id}">${escapeHtml(name)}</option>`;
    })
    .join("");

  restaurantSelect.innerHTML = `
    <option value="">Odaberi restoran</option>
    ${options}
  `;
}

async function handleRestaurantChange() {
  const restaurantId = restaurantSelect.value;

  if (!restaurantId) {
    tablesState = [];
    renderTableOptions();
    return;
  }

  try {
    const tables = await getTablesByRestaurant(restaurantId);
    tablesState = Array.isArray(tables) ? tables : [];
    renderTableOptions();
  } catch (error) {
    console.error(error);
    tablesState = [];
    renderTableOptions();
    showToast("Greška pri dohvaćanju stolova.", "error");
  }
}

function renderTableOptions() {
  if (!tablesState.length) {
    tableSelect.innerHTML = `
      <option value="">Nema dostupnih stolova</option>
    `;
    return;
  }

  const options = tablesState
    .map((table) => {
      const id = table.tableId ?? table.id;
      const seats = table.seats ?? "-";
      return `<option value="${id}">${seats} mjesta</option>`;
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

  const restaurantId = restaurantSelect.value.trim();
  const tableId = tableSelect.value.trim();
  const reservationDateTime = document.getElementById("reservation-datetime").value.trim();
  const partySize = document.getElementById("reservation-party-size").value.trim();

  if (!restaurantId || !tableId || !reservationDateTime || !partySize) {
    setFormMessage("Sva polja su obavezna.", "danger");
    return;
  }

  if (Number(partySize) < 1) {
    setFormMessage("Broj osoba mora biti veći od 0.", "danger");
    return;
  }

  const tokenPayload = getTokenPayload();

  const userId =
    tokenPayload?.userId ||
    tokenPayload?.nameid ||
    tokenPayload?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
    tokenPayload?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/nameidentifier"] ||
    null;

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
    createReservationForm.reset();
    tablesState = [];
    renderTableOptions();

    const modalElement = document.getElementById("createReservationModal");
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    modalInstance?.hide();

    await loadReservations();
  } catch (error) {
    setFormMessage(error.message || "Greška pri kreiranju rezervacije.", "danger");
    showToast(error.message || "Greška pri kreiranju rezervacije.", "error");
  }
}

function isLoggedIn() {
  return !!localStorage.getItem("authToken");
}

function getTokenPayload() {
  const token = localStorage.getItem("authToken");
  if (!token) return null;

  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=");
    return JSON.parse(atob(padded));
  } catch (error) {
    return null;
  }
}

function filterMyReservations(reservations) {
  if (!Array.isArray(reservations)) return [];

  const payload = getTokenPayload();
  if (!payload) return [];

  const username =
    payload.unique_name ||
    payload.sub ||
    payload.username ||
    payload.email ||
    null;

  const userId =
    payload.nameid ||
    payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
    payload.userId ||
    payload.userid ||
    payload.id ||
    null;

  return reservations.filter((reservation) => {
    const reservationUserName =
      reservation.userName ||
      reservation.username ||
      reservation.email ||
      reservation.user ||
      null;

    const reservationUserId =
      reservation.userId ||
      reservation.applicationUserId ||
      reservation.appUserId ||
      reservation.idUser ||
      reservation.user?.userId ||
      null;

    const matchesByUsername =
      username &&
      reservationUserName &&
      String(reservationUserName).toLowerCase() === String(username).toLowerCase();

    const matchesByUserId =
      userId &&
      reservationUserId &&
      String(reservationUserId) === String(userId);

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
  return `
    <div class="state-card error-state">
      <h3>Greška pri dohvaćanju rezervacija</h3>
      <p>${error.message || "Dogodila se neočekivana greška."}</p>
      <button class="btn btn-primary-custom mt-2" id="retry-btn">Pokušaj ponovno</button>
    </div>
  `;
}

function setFormMessage(message, type = "danger") {
  formMessage.innerHTML = `<div class="alert alert-${type} mb-0">${message}</div>`;
}

function clearFormMessage() {
  formMessage.innerHTML = "";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
import { renderNav } from "../elements/nav.js";
import { renderFooter } from "../elements/footer.js";
import { getAllRestaurants } from "../api/restaurantsApi.js";
import { getTablesByRestaurant } from "../api/tablesApi.js";
import { createReservation } from "../api/reservationsApi.js";
import { showToast } from "../elements/toast.js";

document.getElementById("nav").innerHTML = renderNav();
document.getElementById("footer").innerHTML = renderFooter();

const listContainer = document.getElementById("locations-list");
const createReservationForm = document.getElementById("create-reservation-form");
const formMessage = document.getElementById("reservation-form-message");
const restaurantSelect = document.getElementById("reservation-restaurant-id");
const tableSelect = document.getElementById("reservation-table-id");

let restaurantsState = [];
let tablesState = [];
let map = null;
let infoWindow = null;
let mapRendered = false;

init();

async function init() {
  listContainer.innerHTML = renderLoading();

  try {
    const restaurants = await getAllRestaurants();
    restaurantsState = Array.isArray(restaurants) ? restaurants : [];
    renderRestaurantCards(restaurantsState);
    renderRestaurantOptions();
    bindEvents();
    waitForGoogleMapsAndRender();
  } catch (error) {
    console.error(error);
    listContainer.innerHTML = renderError(error);
    showToast(error.message || "Greška pri dohvaćanju restorana.", "error");
  }
}

function bindEvents() {
  createReservationForm?.addEventListener("submit", handleCreateReservation);
  restaurantSelect?.addEventListener("change", handleRestaurantChange);

  document.addEventListener("click", async (event) => {
    const button = event.target.closest(".open-reservation-modal-btn");
    if (!button) return;

    event.preventDefault();

    if (!isLoggedIn()) {
      showToast("Za rezervaciju se morate prijaviti.", "warning");
      setTimeout(() => {
        window.location.href = "./auth.html";
      }, 500);
      return;
    }

    const restaurantId = button.dataset.restaurantid;
    openReservationModal(restaurantId);
  });
}

function waitForGoogleMapsAndRender() {
  const interval = setInterval(() => {
    if (typeof window.google !== "undefined" && window.google.maps && !mapRendered) {
      clearInterval(interval);
      renderMap();
    }
  }, 200);
}

function renderMap() {
  const mapElement = document.getElementById("map");
  if (!mapElement || mapRendered) return;

  mapRendered = true;

  const croatiaCenter = { lat: 45.1, lng: 15.2 };

  map = new google.maps.Map(mapElement, {
    center: croatiaCenter,
    zoom: 7,
  });

  setTimeout(() => {
    google.maps.event.trigger(map, "resize");
  }, 200);

  infoWindow = new google.maps.InfoWindow();

  if (!restaurantsState.length) {
    return;
  }

  const bounds = new google.maps.LatLngBounds();
  let hasValidMarker = false;

  restaurantsState.forEach((restaurant) => {
    const lat = Number(restaurant.latitude);
    const lng = Number(restaurant.longitude);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return;
    }

    hasValidMarker = true;

    const position = { lat, lng };

    const marker = new google.maps.Marker({
      position,
      map,
      title: restaurant.name || "Restaurant",
    });

    bounds.extend(position);

    marker.addListener("click", () => {
      infoWindow.setContent(buildInfoWindowContent(restaurant));
      infoWindow.open(map, marker);
    });
  });

  if (hasValidMarker) {
    map.fitBounds(bounds);

    setTimeout(() => {
      google.maps.event.trigger(map, "resize");
      map.fitBounds(bounds);
    }, 200);
  }
}

function buildInfoWindowContent(restaurant) {
  const restaurantId = restaurant.restaurantId ?? restaurant.id ?? "";
  const name = escapeHtml(restaurant.name ?? "Restaurant");
  const address = escapeHtml(restaurant.address ?? "-");
  const city = escapeHtml(restaurant.city ?? "-");
  const workingHours = escapeHtml(restaurant.workingHours ?? "Nije dostupno");

  return `
    <div style="max-width: 240px;">
      <h6 style="margin-bottom: 8px;">${name}</h6>
      <div><strong>Adresa:</strong> ${address}</div>
      <div><strong>Grad:</strong> ${city}</div>
      <div><strong>Radno vrijeme:</strong> ${workingHours}</div>
      <div style="margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap;">
        <button
          type="button"
          class="open-reservation-modal-btn"
          data-restaurantid="${restaurantId}"
          style="padding: 6px 10px; background: #212529; color: white; text-decoration: none; border-radius: 6px; border: none;"
        >
          Rezerviraj
        </button>
        <a
          href="${buildGoogleMapsDirectionsUrl(restaurant)}"
          target="_blank"
          rel="noopener noreferrer"
          style="padding: 6px 10px; background: #f8f9fa; color: #212529; text-decoration: none; border-radius: 6px; border: 1px solid #ced4da;"
        >
          Navigacija
        </a>
      </div>
    </div>
  `;
}

function renderRestaurantCards(restaurants) {
  if (!restaurants.length) {
    listContainer.innerHTML = `
      <div class="col-12">
        <div class="empty-state-card">
          <h3>Nema restorana</h3>
          <p>Trenutno nema dostupnih lokacija za prikaz.</p>
        </div>
      </div>
    `;
    return;
  }

  listContainer.innerHTML = restaurants
    .map((restaurant) => {
      const id = restaurant.restaurantId ?? restaurant.id ?? "";
      const name = restaurant.name ?? "Restaurant";
      const address = restaurant.address ?? "-";
      const city = restaurant.city ?? "-";
      const workingHours = restaurant.workingHours ?? "Nije dostupno";

      return `
        <div class="col-12">
          <div class="card p-3 d-flex flex-row align-items-center justify-content-between">
            <div>
              <h6 class="mb-1">${escapeHtml(name)}</h6>
              <p class="mb-1 small">${escapeHtml(address)}, ${escapeHtml(city)}</p>
              <p class="mb-0 small">🕒 ${escapeHtml(workingHours)}</p>
            </div>

            <div class="d-flex gap-2 flex-shrink-0">
              <button
                type="button"
                class="btn btn-primary-custom open-reservation-modal-btn"
                data-restaurantid="${id}"
              >
                Rezerviraj
              </button>
              <a
                class="btn btn-primary-custom"
                href="${buildGoogleMapsDirectionsUrl(restaurant)}"
                target="_blank"
                rel="noopener noreferrer"
              >
                Navigacija
              </a>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
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

async function openReservationModal(restaurantId) {
  clearFormMessage();
  createReservationForm.reset();
  tablesState = [];
  renderTableOptions();

  restaurantSelect.value = String(restaurantId);
  await loadTablesForRestaurant(restaurantId);

  const modalElement = document.getElementById("createReservationModal");
  const modalInstance = new bootstrap.Modal(modalElement);
  modalInstance.show();
}

async function handleRestaurantChange() {
  const restaurantId = restaurantSelect.value;

  if (!restaurantId) {
    tablesState = [];
    renderTableOptions();
    return;
  }

  await loadTablesForRestaurant(restaurantId);
}

async function loadTablesForRestaurant(restaurantId) {
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

  if (!isLoggedIn()) {
    setFormMessage("Za rezervaciju se morate prijaviti.", "danger");
    return;
  }

  const restaurantId = restaurantSelect.value.trim();
  const tableId = tableSelect.value.trim();
  const reservationDateTime = document.getElementById("reservation-datetime").value.trim();
  const partySize = document.getElementById("reservation-party-size").value.trim();

  if (!restaurantId || !tableId || !reservationDateTime || !partySize) {
    setFormMessage("Sva polja su obavezna.", "danger");
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
    createReservationForm.reset();
    tablesState = [];
    renderTableOptions();

    const modalElement = document.getElementById("createReservationModal");
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    modalInstance?.hide();
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
  } catch {
    return null;
  }
}

function getUserIdFromToken() {
  const payload = getTokenPayload();
  if (!payload) return null;

  return (
    payload.userId ||
    payload.nameid ||
    payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
    payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/nameidentifier"] ||
    null
  );
}

function buildGoogleMapsDirectionsUrl(restaurant) {
  const lat = Number(restaurant.latitude);
  const lng = Number(restaurant.longitude);

  if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  }

  const address = `${restaurant.address ?? ""}, ${restaurant.city ?? ""}`.trim();
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

function renderLoading() {
  return `
    <div class="col-12">
      <div class="state-card">
        <div class="spinner-border" role="status" aria-hidden="true"></div>
        <p class="mt-3 mb-0">Učitavanje lokacija...</p>
      </div>
    </div>
  `;
}

function renderError(error) {
  return `
    <div class="col-12">
      <div class="state-card error-state">
        <h3>Greška pri dohvaćanju restorana</h3>
        <p>${escapeHtml(error.message || "Dogodila se neočekivana greška.")}</p>
      </div>
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
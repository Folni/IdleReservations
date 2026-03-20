import { renderNav } from "../elements/nav.js";
import { renderFooter } from "../elements/footer.js";
import {
  getAllReservations,
  cancelReservation,
  updateReservation,
  updateReservationStatus,
} from "../api/reservationsApi.js";
import {
  getAllRestaurants,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} from "../api/restaurantsApi.js";
import {
  getAllTables,
  getTablesByRestaurant,
  createTable,
  updateTable,
  deleteTable,
} from "../api/tablesApi.js";
import { showToast } from "../elements/toast.js";

document.getElementById("nav").innerHTML = renderNav();
document.getElementById("footer").innerHTML = renderFooter();

const adminContent = document.getElementById("admin-content");
const addReservationBtn = document.getElementById("add-reservation-btn");

let state = {
  activeTab: "reservations",
  reservations: [],
  restaurants: [],
  tables: [],
};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  if (!isAdmin()) {
    renderUnauthorized();
    return;
  }

  bindGlobalEvents();
  renderShell();
  await loadAllData();
  renderActiveTab();
}

function bindGlobalEvents() {
  if (addReservationBtn) {
    addReservationBtn.addEventListener("click", () => {
      window.location.href = "./reservations.html";
    });
  }
}

function isAdmin() {
  const token = localStorage.getItem("authToken");
  if (!token) return false;

  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=");
    const payload = JSON.parse(atob(padded));

    const role =
      payload.role ||
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      payload["Role"];

    return role === "Admin" || role === "admin";
  } catch (error) {
    return false;
  }
}

function renderUnauthorized() {
  adminContent.innerHTML = `
    <div class="card p-4">
      <h2>Pristup odbijen</h2>
      <p>Samo administratori mogu pristupiti ovom panelu.</p>
    </div>
  `;

  setTimeout(() => {
    window.location.href = "./auth.html";
  }, 1500);
}

function renderShell() {
  adminContent.innerHTML = `
    <div class="admin-panel">
      <div class="admin-tabs mb-4">
        <button class="btn btn-outline-dark admin-tab" data-tab="reservations">Rezervacije</button>
        <button class="btn btn-outline-dark admin-tab" data-tab="restaurants">Restorani</button>
        <button class="btn btn-outline-dark admin-tab" data-tab="tables">Stolovi</button>
        <button class="btn btn-outline-dark" id="refresh-admin-btn">Osvježi</button>
      </div>

      <div id="admin-stats" class="mb-4"></div>
      <div id="admin-tab-content"></div>
    </div>
  `;

  document.querySelectorAll(".admin-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.activeTab = btn.dataset.tab;
      renderActiveTab();
    });
  });

  document.getElementById("refresh-admin-btn")?.addEventListener("click", async () => {
    await loadAllData();
    renderActiveTab();
    notify("Podaci osvježeni", "success");
  });
}

async function loadAllData() {
  try {
    const [reservations, restaurants, tables] = await Promise.all([
      getAllReservations().catch(() => []),
      getAllRestaurants().catch(() => []),
      getAllTables().catch(() => []),
    ]);

    state.reservations = Array.isArray(reservations) ? reservations : [];
    state.restaurants = Array.isArray(restaurants) ? restaurants : [];
    state.tables = Array.isArray(tables) ? tables : [];
  } catch (error) {
    notify(error.message || "Greška pri dohvaćanju podataka", "error");
  }
}

function renderActiveTab() {
  renderStats();

  const container = document.getElementById("admin-tab-content");
  if (!container) return;

  document.querySelectorAll(".admin-tab").forEach((btn) => {
    btn.classList.toggle("btn-dark", btn.dataset.tab === state.activeTab);
    btn.classList.toggle("btn-outline-dark", btn.dataset.tab !== state.activeTab);
  });

  if (state.activeTab === "reservations") {
    renderReservationsTab(container);
  } else if (state.activeTab === "restaurants") {
    renderRestaurantsTab(container);
  } else if (state.activeTab === "tables") {
    renderTablesTab(container);
  }
}

function renderStats() {
  const stats = document.getElementById("admin-stats");
  if (!stats) return;

  stats.innerHTML = `
    <div class="row g-3">
      <div class="col-md-4">
        <div class="card p-3">
          <h6>Rezervacije</h6>
          <strong>${state.reservations.length}</strong>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card p-3">
          <h6>Restorani</h6>
          <strong>${state.restaurants.length}</strong>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card p-3">
          <h6>Stolovi</h6>
          <strong>${state.tables.length}</strong>
        </div>
      </div>
    </div>
  `;
}

function renderReservationsTab(container) {
  const restaurantOptions = state.restaurants
    .map((r) => {
      const id = r.restaurantId ?? r.id;
      const name = r.name ?? `Restaurant ${id}`;
      return `<option value="${id}">${escapeHtml(name)}</option>`;
    })
    .join("");

  const uniqueUsers = [...new Set(
    state.reservations
      .map((r) => r.username ?? r.userName ?? "")
      .filter(Boolean)
  )].sort((a, b) => a.localeCompare(b));

  const userOptions = uniqueUsers
    .map((user) => `<option value="${escapeAttr(user)}">${escapeHtml(user)}</option>`)
    .join("");

  const filteredReservations = getFilteredReservations();

  const rows = filteredReservations
    .map((r) => {
      const id = r.reservationId ?? r.id ?? "-";
      const userId = r.userId ?? "";
      const user = r.username ?? r.userName ?? "-";
      const restaurantId = r.restaurantId ?? "";
      const restaurantName = r.restaurantName ?? getRestaurantName(restaurantId);
      const tableId = r.tableId ?? "";
      const tableLabel =
        r.seats ? `${restaurantName} - ${r.seats} mjesta` : getTableLabel(tableId);
      const date = r.reservationDateTime ?? r.reservationDate ?? r.date ?? "-";
      const persons = r.partySize ?? r.numberOfGuests ?? r.guests ?? r.persons ?? "-";
      const status = r.status ?? "Active";

      return `
        <tr>
          <td>${escapeHtml(String(user))}</td>
          <td>${escapeHtml(String(restaurantName))}</td>
          <td>${escapeHtml(String(tableLabel))}</td>
          <td>${escapeHtml(formatDateTime(date))}</td>
          <td>${persons}</td>
          <td>
            <select class="form-select form-select-sm reservation-status-select" data-id="${id}">
              <option value="Active" ${String(status).toLowerCase() === "active" ? "selected" : ""}>Active</option>
              <option value="Confirmed" ${String(status).toLowerCase() === "confirmed" ? "selected" : ""}>Confirmed</option>
              <option value="Pending" ${String(status).toLowerCase() === "pending" ? "selected" : ""}>Pending</option>
              <option value="Cancelled" ${String(status).toLowerCase() === "cancelled" ? "selected" : ""}>Cancelled</option>
            </select>
          </td>
          <td class="d-flex gap-2">
            <button
              class="btn btn-sm btn-warning edit-reservation-btn"
              data-id="${id}"
              data-userid="${userId}"
              data-restaurantid="${restaurantId}"
              data-tableid="${tableId}"
              data-datetime="${escapeAttr(String(date))}"
              data-persons="${persons}">
              Uredi
            </button>
            <button class="btn btn-sm btn-danger cancel-reservation-btn" data-id="${id}">
              Otkaži
            </button>
          </td>
        </tr>
      `;
    })
    .join("");

  container.innerHTML = `
    <div class="row g-4 mb-4">
      <div class="col-lg-7">
        <div class="card p-4 h-100">
          <h3 class="mb-3">Uredi rezervaciju</h3>

          <form id="reservation-form" class="row g-3">
            <input type="hidden" id="reservation-id" />
            <input type="hidden" id="reservation-user-id" />

            <div class="col-md-6">
              <label class="form-label">Restoran</label>
              <select class="form-select" id="reservation-restaurant-id" required>
                <option value="">Odaberi restoran</option>
                ${restaurantOptions}
              </select>
            </div>

            <div class="col-md-6">
              <label class="form-label">Stol</label>
              <select class="form-select" id="reservation-table-id" required>
                <option value="">Odaberi stol</option>
              </select>
            </div>

            <div class="col-md-6">
              <label class="form-label">Datum i vrijeme</label>
              <input type="datetime-local" class="form-control" id="reservation-datetime" required />
            </div>

            <div class="col-md-6">
              <label class="form-label">Broj osoba</label>
              <input type="number" class="form-control" id="reservation-party-size" min="1" max="20" required />
            </div>

            <div class="col-12 d-flex gap-2">
              <button type="submit" class="btn btn-primary-custom">Spremi</button>
              <button type="button" class="btn btn-secondary" id="reservation-reset-btn">Reset</button>
            </div>
          </form>
        </div>
      </div>

      <div class="col-lg-5">
        <div class="card p-4 h-100">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h3 class="mb-0">Filter</h3>
            <button type="button" class="btn btn-outline-secondary btn-sm" id="reservation-filters-reset-btn">
              Reset
            </button>
          </div>

          <form id="reservation-filter-form" class="row g-3">
            <div class="col-12">
              <label class="form-label">Korisnik</label>
              <select class="form-select" id="reservation-filter-user">
                <option value="">Svi korisnici</option>
                ${userOptions}
              </select>
            </div>

            <div class="col-12">
              <label class="form-label">Restoran</label>
              <select class="form-select" id="reservation-filter-restaurant">
                <option value="">Svi restorani</option>
                ${restaurantOptions}
              </select>
            </div>

            <div class="col-12">
              <label class="form-label">Status</label>
              <select class="form-select" id="reservation-filter-status">
                <option value="">Svi statusi</option>
                <option value="active">Active</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div class="col-12">
              <label class="form-label">Datum</label>
              <input type="date" class="form-control" id="reservation-filter-date" />
            </div>
          </form>
        </div>
      </div>
    </div>

    <div class="card p-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h3>Upravljanje rezervacijama</h3>
        <span class="badge text-bg-light">${filteredReservations.length} rezultata</span>
      </div>

      ${
        filteredReservations.length === 0
          ? `<p>Nema rezervacija za odabrane filtere.</p>`
          : `
            <div class="table-responsive">
              <table class="table table-striped align-middle">
                <thead>
                  <tr>
                    <th>Korisnik</th>
                    <th>Restoran</th>
                    <th>Stol</th>
                    <th>Datum</th>
                    <th>Osobe</th>
                    <th>Status</th>
                    <th>Akcije</th>
                  </tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>
            </div>
          `
      }
    </div>
  `;

  document.getElementById("reservation-form")?.addEventListener("submit", handleReservationSubmit);
  document.getElementById("reservation-reset-btn")?.addEventListener("click", resetReservationForm);
  document.getElementById("reservation-restaurant-id")?.addEventListener("change", handleReservationRestaurantChange);

  document.getElementById("reservation-filter-user")?.addEventListener("change", renderActiveTab);
  document.getElementById("reservation-filter-restaurant")?.addEventListener("change", renderActiveTab);
  document.getElementById("reservation-filter-status")?.addEventListener("change", renderActiveTab);
  document.getElementById("reservation-filter-date")?.addEventListener("change", renderActiveTab);
  document.getElementById("reservation-filters-reset-btn")?.addEventListener("click", resetReservationFilters);

  restoreReservationFilterValues();

  container.querySelectorAll(".edit-reservation-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.getElementById("reservation-id").value = btn.dataset.id;
      document.getElementById("reservation-user-id").value = btn.dataset.userid;
      document.getElementById("reservation-restaurant-id").value = btn.dataset.restaurantid;
      filterReservationTableOptions(btn.dataset.restaurantid, btn.dataset.tableid);
      document.getElementById("reservation-table-id").value = btn.dataset.tableid;
      document.getElementById("reservation-datetime").value = toDatetimeLocalValue(btn.dataset.datetime);
      document.getElementById("reservation-party-size").value = btn.dataset.persons;
    });
  });

  container.querySelectorAll(".cancel-reservation-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const confirmed = confirm(`Otkaži rezervaciju?`);
      if (!confirmed) return;

      try {
        await cancelReservation(id);
        notify("Rezervacija otkazana", "success");
        await refreshReservations();
        renderActiveTab();
      } catch (error) {
        notify(error.message || "Greška pri otkazivanju rezervacije", "error");
      }
    });
  });

  container.querySelectorAll(".reservation-status-select").forEach((select) => {
    select.addEventListener("change", async (e) => {
      const id = e.target.dataset.id;
      const status = e.target.value;

      try {
        await updateReservationStatus(id, status);
        notify("Status rezervacije ažuriran", "success");
        await refreshReservations();
        renderActiveTab();
      } catch (error) {
        notify(error.message || "Greška pri ažuriranju statusa", "error");
      }
    });
  });
}

async function refreshReservations() {
  const data = await getAllReservations();
  state.reservations = Array.isArray(data) ? data : [];
}

function renderRestaurantsTab(container) {
  const rows = state.restaurants
    .map((r) => {
      const id = r.restaurantId ?? r.id ?? "";
      const name = r.name ?? "";
      const address = r.address ?? "";
      const city = r.city ?? "";
      const latitude = r.latitude ?? "";
      const longitude = r.longitude ?? "";
      const workingHours = r.workingHours ?? "";

      return `
        <tr>
          <td>${escapeHtml(name)}</td>
          <td>${escapeHtml(address)}</td>
          <td>${escapeHtml(city)}</td>
          <td>${escapeHtml(String(latitude))}</td>
          <td>${escapeHtml(String(longitude))}</td>
          <td>${escapeHtml(workingHours)}</td>
          <td class="d-flex gap-2">
            <button class="btn btn-sm btn-warning edit-restaurant-btn"
              data-id="${id}"
              data-name="${escapeAttr(name)}"
              data-address="${escapeAttr(address)}"
              data-city="${escapeAttr(city)}"
              data-latitude="${escapeAttr(String(latitude))}"
              data-longitude="${escapeAttr(String(longitude))}"
              data-workinghours="${escapeAttr(workingHours)}">
              Uredi
            </button>
            <button class="btn btn-sm btn-danger delete-restaurant-btn" data-id="${id}">
              Obriši
            </button>
          </td>
        </tr>
      `;
    })
    .join("");

  container.innerHTML = `
    <div class="row g-4 mb-4">
      <div class="col-lg-7">
        <div class="card p-4 h-100">
          <h3 class="mb-3">Dodaj / uredi restoran</h3>

          <form id="restaurant-form" class="row g-3">
            <input type="hidden" id="restaurant-id" />
            <input type="hidden" id="restaurant-latitude" />
            <input type="hidden" id="restaurant-longitude" />

            <div class="col-md-6">
              <label class="form-label">Naziv</label>
              <input type="text" class="form-control" id="restaurant-name" required />
            </div>

            <div class="col-md-6">
              <label class="form-label">Grad</label>
              <input type="text" class="form-control" id="restaurant-city" required />
            </div>

            <div class="col-12">
              <label class="form-label">Adresa</label>
              <input type="text" class="form-control" id="restaurant-address" required />
            </div>

            <div class="col-md-6">
              <label class="form-label">Radno vrijeme</label>
              <input type="text" class="form-control" id="restaurant-working-hours" placeholder="08:00 - 23:00" />
            </div>

            <div class="col-md-3">
              <label class="form-label">Latitude</label>
              <input type="text" class="form-control" id="restaurant-latitude-preview" readonly />
            </div>

            <div class="col-md-3">
              <label class="form-label">Longitude</label>
              <input type="text" class="form-control" id="restaurant-longitude-preview" readonly />
            </div>

            <div class="col-12 d-flex gap-2">
              <button type="submit" class="btn btn-primary-custom">Spremi</button>
              <button type="button" class="btn btn-secondary" id="restaurant-reset-btn">Reset</button>
            </div>
          </form>
        </div>
      </div>

      <div class="col-lg-5">
        <div class="card p-4 h-100">
          <h3 class="mb-3">Odaberi lokaciju na karti</h3>
          <div id="restaurant-admin-map" style="width: 100%; height: 420px; border-radius: 12px;"></div>
          <small class="text-muted mt-2 d-block">
            Klikni na kartu za automatsko popunjavanje adrese, grada i koordinata.
          </small>
        </div>
      </div>
    </div>

    <div class="card p-4">
      <h3 class="mb-3">Popis restorana</h3>

      ${
        state.restaurants.length === 0
          ? `<p>Nema restorana.</p>`
          : `
            <div class="table-responsive">
              <table class="table table-striped align-middle">
                <thead>
                  <tr>
                    <th>Naziv</th>
                    <th>Adresa</th>
                    <th>Grad</th>
                    <th>Lat</th>
                    <th>Lng</th>
                    <th>Radno vrijeme</th>
                    <th>Akcije</th>
                  </tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>
            </div>
          `
      }
    </div>
  `;

  const form = document.getElementById("restaurant-form");
  const resetBtn = document.getElementById("restaurant-reset-btn");

  form?.addEventListener("submit", handleRestaurantSubmit);
  resetBtn?.addEventListener("click", resetRestaurantForm);

  container.querySelectorAll(".edit-restaurant-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.getElementById("restaurant-id").value = btn.dataset.id;
      document.getElementById("restaurant-name").value = btn.dataset.name;
      document.getElementById("restaurant-address").value = btn.dataset.address;
      document.getElementById("restaurant-city").value = btn.dataset.city;
      document.getElementById("restaurant-latitude").value = btn.dataset.latitude;
      document.getElementById("restaurant-longitude").value = btn.dataset.longitude;
      document.getElementById("restaurant-latitude-preview").value = btn.dataset.latitude;
      document.getElementById("restaurant-longitude-preview").value = btn.dataset.longitude;
      document.getElementById("restaurant-working-hours").value = btn.dataset.workinghours;

      if (typeof initRestaurantAdminMap === "function") {
        initRestaurantAdminMap(Number(btn.dataset.latitude), Number(btn.dataset.longitude));
      }
    });
  });

  container.querySelectorAll(".delete-restaurant-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      if (!confirm(`Obrisati restoran?`)) return;

      try {
        await deleteRestaurant(id);
        notify("Restoran obrisan", "success");
        await refreshRestaurants();
        await refreshTables();
        renderActiveTab();
      } catch (error) {
        notify(error.message || "Greška pri brisanju restorana", "error");
      }
    });
  });

  initializeRestaurantAdminMap();
}

async function handleRestaurantSubmit(e) {
  e.preventDefault();

  const id = document.getElementById("restaurant-id").value.trim();
  const name = document.getElementById("restaurant-name").value.trim();
  const address = document.getElementById("restaurant-address").value.trim();
  const city = document.getElementById("restaurant-city").value.trim();
  const latitude = document.getElementById("restaurant-latitude").value.trim();
  const longitude = document.getElementById("restaurant-longitude").value.trim();
  const workingHours = document.getElementById("restaurant-working-hours").value.trim();

  if (!name || name.length < 2) {
    notify("Naziv restorana mora imati barem 2 znaka", "error");
    return;
  }

  if (!address) {
    notify("Adresa je obavezna", "error");
    return;
  }

  if (!city) {
    notify("Grad je obavezan", "error");
    return;
  }

  if (!latitude || !longitude) {
    notify("Odaberi lokaciju restorana na karti", "error");
    return;
  }

  const payload = {
    name,
    address,
    city,
    latitude: Number(latitude),
    longitude: Number(longitude),
    workingHours,
  };

  try {
    if (id) {
      await updateRestaurant(id, payload);
      notify("Restoran ažuriran", "success");
    } else {
      await createRestaurant(payload);
      notify("Restoran dodan", "success");
    }

    resetRestaurantForm();
    await refreshRestaurants();
    renderActiveTab();
  } catch (error) {
    notify(error.message || "Greška pri spremanju restorana", "error");
  }
}

function resetRestaurantForm() {
  document.getElementById("restaurant-id").value = "";
  document.getElementById("restaurant-name").value = "";
  document.getElementById("restaurant-address").value = "";
  document.getElementById("restaurant-city").value = "";
  document.getElementById("restaurant-latitude").value = "";
  document.getElementById("restaurant-longitude").value = "";
  document.getElementById("restaurant-latitude-preview").value = "";
  document.getElementById("restaurant-longitude-preview").value = "";
  document.getElementById("restaurant-working-hours").value = "";

  if (typeof initRestaurantAdminMap === "function") {
    initRestaurantAdminMap();
  }
}

async function refreshRestaurants() {
  const data = await getAllRestaurants();
  state.restaurants = Array.isArray(data) ? data : [];
}

function renderTablesTab(container) {
  const tableOptions = state.tables
    .map((t) => {
      const id = t.tableId ?? t.id;
      const restaurantName = getRestaurantName(t.restaurantId);
      return `<option value="${id}">${escapeHtml(`${restaurantName} - ${t.seats} mjesta`)}</option>`;
    })
    .join("");

  const restaurantOptions = state.restaurants
    .map((r) => {
      const id = r.restaurantId ?? r.id;
      const name = r.name ?? `Restaurant ${id}`;
      return `<option value="${id}">${escapeHtml(name)}</option>`;
    })
    .join("");

  const uniqueUsers = [...new Set(
    state.reservations
      .map((r) => r.username ?? r.userName ?? "")
      .filter(Boolean)
  )].sort((a, b) => a.localeCompare(b));

  const userOptions = uniqueUsers
    .map((user) => `<option value="${escapeAttr(user)}">${escapeHtml(user)}</option>`)
    .join("");

  const filteredRestaurants = getFilteredRestaurantsForTables();

  const groupedRestaurantsHtml = filteredRestaurants
    .map((restaurant) => {
      const restaurantId = restaurant.restaurantId ?? restaurant.id;
      const restaurantName = restaurant.name ?? "Nepoznato";

      const restaurantTables = state.tables.filter(
        (t) => String(t.restaurantId) === String(restaurantId)
      );

      const tablesHtml = restaurantTables.length
        ? restaurantTables
            .map((table) => {
              const tableId = table.tableId ?? table.id;
              const seats = table.seats ?? "-";
              const reservationsForTable = getFilteredReservationsForTable(tableId);

              const reservationsHtml = reservationsForTable.length
                ? reservationsForTable
                    .map((reservation) => {
                      const user = reservation.username ?? reservation.userName ?? "Nepoznat korisnik";
                      const date = formatDateTime(
                        reservation.reservationDateTime ??
                        reservation.reservationDate ??
                        reservation.date
                      );
                      const status = reservation.status ?? "Active";

                      return `
                        <div class="border rounded p-2 mb-2">
                          <div><strong>Korisnik:</strong> ${escapeHtml(String(user))}</div>
                          <div><strong>Datum:</strong> ${escapeHtml(date)}</div>
                          <div><strong>Osobe:</strong> ${escapeHtml(String(reservation.partySize ?? "-"))}</div>
                          <div><strong>Status:</strong> ${escapeHtml(String(status))}</div>
                        </div>
                      `;
                    })
                    .join("")
                : `<div class="text-muted">Nema rezervacija za ovaj stol.</div>`;

              return `
                <div class="border rounded p-3 mb-3">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <strong>Stol:</strong> ${seats} mjesta
                    </div>
                    <div class="d-flex gap-2">
                      <button class="btn btn-sm btn-warning edit-table-btn"
                        data-id="${tableId}"
                        data-restaurantid="${table.restaurantId}"
                        data-seats="${seats}">
                        Uredi
                      </button>
                      <button class="btn btn-sm btn-danger delete-table-btn" data-id="${tableId}">
                        Obriši
                      </button>
                    </div>
                  </div>
                  <div class="ps-2">
                    ${reservationsHtml}
                  </div>
                </div>
              `;
            })
            .join("")
        : `<p class="text-muted mb-0">Nema stolova za ovaj restoran.</p>`;

      return `
        <div class="card p-4 mb-4">
          <h4 class="mb-3">${escapeHtml(restaurantName)}</h4>
          ${tablesHtml}
        </div>
      `;
    })
    .join("");

  container.innerHTML = `
    <div class="row g-4 mb-4">
      <div class="col-lg-7">
        <div class="card p-4 h-100">
          <h3 class="mb-3">Dodaj / uredi stol</h3>

          <form id="table-form" class="row g-3">
            <input type="hidden" id="table-id" />

            <div class="col-md-12">
              <label class="form-label">Odaberi postojeći stol</label>
              <select class="form-select" id="existing-table-select">
                <option value="">Odaberi stol iz popisa</option>
                ${tableOptions}
              </select>
            </div>

            <div class="col-md-6">
              <label class="form-label">Restoran</label>
              <select class="form-select" id="table-restaurant-id" required>
                <option value="">Odaberi restoran</option>
                ${restaurantOptions}
              </select>
            </div>

            <div class="col-md-6">
              <label class="form-label">Broj mjesta</label>
              <input type="number" class="form-control" id="table-seats" min="1" max="20" required />
            </div>

            <div class="col-12 d-flex gap-2">
              <button type="submit" class="btn btn-primary-custom">Spremi</button>
              <button type="button" class="btn btn-secondary" id="table-reset-btn">Reset</button>
            </div>
          </form>
        </div>
      </div>

      <div class="col-lg-5">
        <div class="card p-4 h-100">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h3 class="mb-0">Filter</h3>
            <button type="button" class="btn btn-outline-secondary btn-sm" id="table-filters-reset-btn">
              Reset
            </button>
          </div>

          <form id="table-filter-form" class="row g-3">
            <div class="col-12">
              <label class="form-label">Restoran</label>
              <select class="form-select" id="table-filter-restaurant">
                <option value="">Svi restorani</option>
                ${restaurantOptions}
              </select>
            </div>

            <div class="col-12">
              <label class="form-label">Korisnik</label>
              <select class="form-select" id="table-filter-user">
                <option value="">Svi korisnici</option>
                ${userOptions}
              </select>
            </div>

            <div class="col-12">
              <label class="form-label">Datum</label>
              <input type="date" class="form-control" id="table-filter-date" />
            </div>
          </form>
        </div>
      </div>
    </div>

    <div class="mb-4">
      ${groupedRestaurantsHtml || `<div class="card p-4"><p class="mb-0">Nema rezultata za odabrane filtere.</p></div>`}
    </div>
  `;

  document.getElementById("table-form")?.addEventListener("submit", handleTableSubmit);
  document.getElementById("table-reset-btn")?.addEventListener("click", resetTableForm);

  document.getElementById("existing-table-select")?.addEventListener("change", (e) => {
    const selectedId = e.target.value;
    const table = state.tables.find((t) => String(t.tableId ?? t.id) === String(selectedId));
    if (!table) return;

    document.getElementById("table-id").value = table.tableId ?? table.id;
    document.getElementById("table-restaurant-id").value = table.restaurantId;
    document.getElementById("table-seats").value = table.seats;
  });

  document.getElementById("table-filter-restaurant")?.addEventListener("change", renderActiveTab);
  document.getElementById("table-filter-user")?.addEventListener("change", renderActiveTab);
  document.getElementById("table-filter-date")?.addEventListener("change", renderActiveTab);
  document.getElementById("table-filters-reset-btn")?.addEventListener("click", resetTableFilters);

  restoreTableFilterValues();

  container.querySelectorAll(".edit-table-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.getElementById("table-id").value = btn.dataset.id;
      document.getElementById("table-restaurant-id").value = btn.dataset.restaurantid;
      document.getElementById("table-seats").value = btn.dataset.seats;

      const existingTableSelect = document.getElementById("existing-table-select");
      if (existingTableSelect) {
        existingTableSelect.value = btn.dataset.id;
      }
    });
  });

  container.querySelectorAll(".delete-table-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      if (!confirm(`Obrisati stol?`)) return;

      try {
        await deleteTable(id);
        notify("Stol obrisan", "success");
        await refreshTables();
        renderActiveTab();
      } catch (error) {
        notify(error.message || "Greška pri brisanju stola", "error");
      }
    });
  });
}

async function handleTableSubmit(e) {
  e.preventDefault();

  const id = document.getElementById("table-id").value.trim();
  const restaurantId = document.getElementById("table-restaurant-id").value.trim();
  const seats = document.getElementById("table-seats").value.trim();

  if (!restaurantId) {
    notify("Restaurant je obavezan", "error");
    return;
  }

  if (!seats || Number(seats) < 1 || Number(seats) > 20) {
    notify("Broj mjesta mora biti između 1 i 20", "error");
    return;
  }

  const payload = {
    restaurantId: Number(restaurantId),
    seats: Number(seats),
  };

  try {
    if (id) {
      await updateTable(id, payload);
      notify("Stol ažuriran", "success");
    } else {
      await createTable(payload);
      notify("Stol dodan", "success");
    }

    resetTableForm();
    await refreshTables();
    renderActiveTab();
  } catch (error) {
    notify(error.message || "Greška pri spremanju stola", "error");
  }
}

async function handleTableFilter() {
  const restaurantId = document.getElementById("tables-filter-restaurant").value;

  try {
    if (!restaurantId) {
      await refreshTables();
    } else {
      const data = await getTablesByRestaurant(restaurantId);
      state.tables = Array.isArray(data) ? data : [];
    }

    renderActiveTab();
  } catch (error) {
    notify(error.message || "Greška pri filtriranju stolova", "error");
  }
}

function resetTableForm() {
  document.getElementById("table-id").value = "";
  document.getElementById("table-restaurant-id").value = "";
  document.getElementById("table-seats").value = "";

  const existingTableSelect = document.getElementById("existing-table-select");
  if (existingTableSelect) {
    existingTableSelect.value = "";
  }
}

async function refreshTables() {
  const data = await getAllTables();
  state.tables = Array.isArray(data) ? data : [];
}

function getRestaurantName(id) {
  const restaurant = state.restaurants.find(
    (x) => x.restaurantId === id || x.id === id
  );
  return restaurant ? restaurant.name : "Nepoznato";
}

function getTableLabel(tableId) {
  const table = state.tables.find(
    (x) => x.tableId === tableId || x.id === tableId
  );

  if (!table) return "Nepoznato";

  const restaurantName = getRestaurantName(table.restaurantId);
  return `${restaurantName} - ${table.seats} mjesta`;
}

function getReservationForTable(tableId) {
  const matchingReservations = state.reservations.filter((r) => {
    const reservationTableId =
      r.tableId ??
      r.TableId ??
      r.table?.tableId ??
      r.table?.id ??
      null;

    const status = String(
      r.status ??
      r.Status ??
      "Active"
    ).toLowerCase();

    return (
      String(reservationTableId) === String(tableId) &&
      status !== "cancelled" &&
      status !== "otkazana"
    );
  });

  if (!matchingReservations.length) {
    return null;
  }

  matchingReservations.sort((a, b) => {
    const dateA = getReservationDateValue(a);
    const dateB = getReservationDateValue(b);

    const timeA = dateA ? new Date(dateA).getTime() : Number.MAX_SAFE_INTEGER;
    const timeB = dateB ? new Date(dateB).getTime() : Number.MAX_SAFE_INTEGER;

    return timeA - timeB;
  });

  return matchingReservations[0];
}

function getReservationDateValue(reservation) {
  return (
    reservation.reservationDateTime ??
    reservation.reservationDate ??
    reservation.dateTime ??
    reservation.date ??
    reservation.Date ??
    reservation.ReservationDateTime ??
    null
  );
}

function getReservationUserName(reservation) {
  return (
    reservation.userName ??
    reservation.username ??
    reservation.userUsername ??
    reservation.user?.username ??
    reservation.user?.userName ??
    reservation.email ??
    reservation.user?.email ??
    reservation.fullName ??
    reservation.user?.fullName ??
    reservation.userId ??
    "Nepoznat korisnik"
  );
}

function formatReservationInfo(tableId) {
  const reservation = getReservationForTable(tableId);

  if (!reservation) {
    return "Nema aktivne rezervacije";
  }

  const user = getReservationUserName(reservation);
  const date = formatDateTime(getReservationDateValue(reservation));

  return `${user} — ${date}`;
}

function formatDateTime(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("hr-HR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function notify(message, type = "info") {
  if (typeof showToast === "function") {
    showToast(message, type);
  } else {
    alert(message);
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return String(value).replaceAll('"', "&quot;");
}

async function handleReservationSubmit(e) {
  e.preventDefault();

  const id = document.getElementById("reservation-id").value.trim();
  const userId = document.getElementById("reservation-user-id").value.trim();
  const restaurantId = document.getElementById("reservation-restaurant-id").value.trim();
  const tableId = document.getElementById("reservation-table-id").value.trim();
  const reservationDateTime = document.getElementById("reservation-datetime").value.trim();
  const partySize = document.getElementById("reservation-party-size").value.trim();

  if (!id) {
    notify("Prvo odaberi rezervaciju za uređivanje.", "error");
    return;
  }

  if (!userId || !restaurantId || !tableId || !reservationDateTime || !partySize) {
    notify("Sva polja su obavezna.", "error");
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
    await updateReservation(id, payload);
    notify("Rezervacija ažurirana", "success");
    resetReservationForm();
    await refreshReservations();
    renderActiveTab();
  } catch (error) {
    notify(error.message || "Greška pri ažuriranju rezervacije", "error");
  }
}

function resetReservationForm() {
  document.getElementById("reservation-id").value = "";
  document.getElementById("reservation-user-id").value = "";
  document.getElementById("reservation-restaurant-id").value = "";
  document.getElementById("reservation-table-id").innerHTML = `<option value="">Odaberi stol</option>`;
  document.getElementById("reservation-datetime").value = "";
  document.getElementById("reservation-party-size").value = "";
}

function handleReservationRestaurantChange() {
  const restaurantId = document.getElementById("reservation-restaurant-id").value;
  filterReservationTableOptions(restaurantId);
}

function filterReservationTableOptions(restaurantId, selectedTableId = "") {
  const reservationTableSelect = document.getElementById("reservation-table-id");
  if (!reservationTableSelect) return;

  const filteredTables = state.tables.filter(
    (t) => String(t.restaurantId) === String(restaurantId)
  );

  const options = filteredTables
    .map((t) => {
      const id = t.tableId ?? t.id;
      const selected = String(id) === String(selectedTableId) ? "selected" : "";
      return `<option value="${id}" ${selected}>${t.seats} mjesta</option>`;
    })
    .join("");

  reservationTableSelect.innerHTML = `
    <option value="">Odaberi stol</option>
    ${options}
  `;
}

function toDatetimeLocalValue(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function getReservationsForTable(tableId) {
  return state.reservations
    .filter((r) => String(r.tableId) === String(tableId))
    .sort((a, b) => {
      const dateA = new Date(a.reservationDateTime ?? a.reservationDate ?? a.date ?? 0).getTime();
      const dateB = new Date(b.reservationDateTime ?? b.reservationDate ?? b.date ?? 0).getTime();
      return dateA - dateB;
    });
}

function getFilteredReservations() {
  const userFilter = document.getElementById("reservation-filter-user")?.value?.trim().toLowerCase() ?? "";
  const restaurantFilter = document.getElementById("reservation-filter-restaurant")?.value?.trim() ?? "";
  const statusFilter = document.getElementById("reservation-filter-status")?.value?.trim().toLowerCase() ?? "";
  const dateFilter = document.getElementById("reservation-filter-date")?.value ?? "";

  return state.reservations.filter((r) => {
    const user = String(r.username ?? r.userName ?? "").toLowerCase();
    const restaurantId = String(r.restaurantId ?? "");
    const status = String(r.status ?? "").toLowerCase();
    const rawDate = r.reservationDateTime ?? r.reservationDate ?? r.date ?? "";
    const normalizedDate = normalizeDateOnly(rawDate);

    const matchesUser = !userFilter || user === userFilter;
    const matchesRestaurant = !restaurantFilter || restaurantId === restaurantFilter;
    const matchesStatus = !statusFilter || status === statusFilter;
    const matchesDate = !dateFilter || normalizedDate === dateFilter;

    return matchesUser && matchesRestaurant && matchesStatus && matchesDate;
  });
}

function normalizeDateOnly(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function resetReservationFilters() {
  const user = document.getElementById("reservation-filter-user");
  const restaurant = document.getElementById("reservation-filter-restaurant");
  const status = document.getElementById("reservation-filter-status");
  const date = document.getElementById("reservation-filter-date");

  if (user) user.value = "";
  if (restaurant) restaurant.value = "";
  if (status) status.value = "";
  if (date) date.value = "";

  renderActiveTab();
}

function restoreReservationFilterValues() {
  const previous = window.__reservationFilters || {};

  const user = document.getElementById("reservation-filter-user");
  const restaurant = document.getElementById("reservation-filter-restaurant");
  const status = document.getElementById("reservation-filter-status");
  const date = document.getElementById("reservation-filter-date");

  if (user && previous.user) user.value = previous.user;
  if (restaurant && previous.restaurant) restaurant.value = previous.restaurant;
  if (status && previous.status) status.value = previous.status;
  if (date && previous.date) date.value = previous.date;

  [user, restaurant, status, date].forEach((el) => {
    el?.addEventListener("change", saveReservationFiltersState);
  });
}

function saveReservationFiltersState() {
  window.__reservationFilters = {
    user: document.getElementById("reservation-filter-user")?.value ?? "",
    restaurant: document.getElementById("reservation-filter-restaurant")?.value ?? "",
    status: document.getElementById("reservation-filter-status")?.value ?? "",
    date: document.getElementById("reservation-filter-date")?.value ?? "",
  };
}

function getFilteredRestaurantsForTables() {
  const restaurantFilter = document.getElementById("table-filter-restaurant")?.value?.trim() ?? "";
  const userFilter = document.getElementById("table-filter-user")?.value?.trim().toLowerCase() ?? "";
  const dateFilter = document.getElementById("table-filter-date")?.value ?? "";

  return state.restaurants.filter((restaurant) => {
    const restaurantId = String(restaurant.restaurantId ?? restaurant.id);

    if (restaurantFilter && restaurantId !== restaurantFilter) {
      return false;
    }

    const restaurantTables = state.tables.filter(
      (t) => String(t.restaurantId) === restaurantId
    );

    if (!userFilter && !dateFilter) {
      return restaurantTables.length > 0;
    }

    return restaurantTables.some((table) => {
      const tableId = table.tableId ?? table.id;
      return getFilteredReservationsForTable(tableId).length > 0;
    });
  });
}

function getFilteredReservationsForTable(tableId) {
  const userFilter = document.getElementById("table-filter-user")?.value?.trim().toLowerCase() ?? "";
  const dateFilter = document.getElementById("table-filter-date")?.value ?? "";

  return state.reservations
    .filter((r) => String(r.tableId) === String(tableId))
    .filter((r) => {
      const user = String(r.username ?? r.userName ?? "").toLowerCase();
      const rawDate = r.reservationDateTime ?? r.reservationDate ?? r.date ?? "";
      const normalizedDate = normalizeDateOnly(rawDate);

      const matchesUser = !userFilter || user === userFilter;
      const matchesDate = !dateFilter || normalizedDate === dateFilter;

      return matchesUser && matchesDate;
    })
    .sort((a, b) => {
      const dateA = new Date(a.reservationDateTime ?? a.reservationDate ?? a.date ?? 0).getTime();
      const dateB = new Date(b.reservationDateTime ?? b.reservationDate ?? b.date ?? 0).getTime();
      return dateA - dateB;
    });
}

function resetTableFilters() {
  const restaurant = document.getElementById("table-filter-restaurant");
  const user = document.getElementById("table-filter-user");
  const date = document.getElementById("table-filter-date");

  if (restaurant) restaurant.value = "";
  if (user) user.value = "";
  if (date) date.value = "";

  renderActiveTab();
}

function restoreTableFilterValues() {
  const previous = window.__tableFilters || {};

  const restaurant = document.getElementById("table-filter-restaurant");
  const user = document.getElementById("table-filter-user");
  const date = document.getElementById("table-filter-date");

  if (restaurant && previous.restaurant) restaurant.value = previous.restaurant;
  if (user && previous.user) user.value = previous.user;
  if (date && previous.date) date.value = previous.date;

  [restaurant, user, date].forEach((el) => {
    el?.addEventListener("change", saveTableFiltersState);
  });
}

function saveTableFiltersState() {
  window.__tableFilters = {
    restaurant: document.getElementById("table-filter-restaurant")?.value ?? "",
    user: document.getElementById("table-filter-user")?.value ?? "",
    date: document.getElementById("table-filter-date")?.value ?? "",
  };
}

let restaurantAdminMap = null;
let restaurantAdminMarker = null;
let restaurantAdminGeocoder = null;

function initializeRestaurantAdminMap() {
  if (typeof window.google === "undefined" || !window.google.maps) {
    return;
  }

  initRestaurantAdminMap();
}

function initRestaurantAdminMap(lat = 45.815, lng = 15.9819) {
  const mapElement = document.getElementById("restaurant-admin-map");
  if (!mapElement || typeof window.google === "undefined" || !window.google.maps) {
    return;
  }

  const center = { lat, lng };

  restaurantAdminMap = new google.maps.Map(mapElement, {
    center,
    zoom: 7,
  });

  restaurantAdminGeocoder = new google.maps.Geocoder();

  restaurantAdminMarker = new google.maps.Marker({
    position: center,
    map: restaurantAdminMap,
    draggable: true,
  });

  restaurantAdminMap.addListener("click", (event) => {
    const clickedLat = event.latLng.lat();
    const clickedLng = event.latLng.lng();

    setRestaurantCoordinates(clickedLat, clickedLng);
    restaurantAdminMarker.setPosition({ lat: clickedLat, lng: clickedLng });
    reverseGeocodeRestaurant(clickedLat, clickedLng);
  });

  restaurantAdminMarker.addListener("dragend", (event) => {
    const draggedLat = event.latLng.lat();
    const draggedLng = event.latLng.lng();

    setRestaurantCoordinates(draggedLat, draggedLng);
    reverseGeocodeRestaurant(draggedLat, draggedLng);
  });

  setRestaurantCoordinates(lat, lng);
}

function setRestaurantCoordinates(lat, lng) {
  document.getElementById("restaurant-latitude").value = lat;
  document.getElementById("restaurant-longitude").value = lng;
  document.getElementById("restaurant-latitude-preview").value = lat.toFixed(6);
  document.getElementById("restaurant-longitude-preview").value = lng.toFixed(6);
}

function reverseGeocodeRestaurant(lat, lng) {
  if (!restaurantAdminGeocoder) return;

  restaurantAdminGeocoder.geocode(
    { location: { lat, lng } },
    (results, status) => {
      if (status !== "OK" || !results || !results.length) {
        return;
      }

      const best = results[0];
      const cityComponent = best.address_components?.find((component) =>
        component.types.includes("locality")
      );

      document.getElementById("restaurant-address").value = best.formatted_address ?? "";
      if (cityComponent) {
        document.getElementById("restaurant-city").value = cityComponent.long_name ?? "";
      }
    }
  );
}
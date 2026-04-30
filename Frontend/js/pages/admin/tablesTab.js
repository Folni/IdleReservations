import {
  createTable,
  deleteTable,
  updateTable,
} from "../../api/tablesApi.js";
import { state } from "./state.js";
import { refreshTables } from "./data.js";
import {
  getFilteredReservationsForTable,
  getFilteredRestaurantsForTables,
  getRestaurantName,
} from "./selectors.js";
import { escapeAttr, escapeHtml, formatDateTime } from "./utils.js";
import { notify } from "./ui.js";

let rerenderAdmin = () => {};

export function renderTablesTab(container, onRerender) {
  rerenderAdmin = onRerender;

  const tableOptions = state.tables
    .map((table) => {
      const id = table.tableId ?? table.id;
      const restaurantName = getRestaurantName(table.restaurantId);
      return `<option value="${escapeAttr(id)}">${escapeHtml(`${restaurantName} - ${table.seats} mjesta`)}</option>`;
    })
    .join("");

  const restaurantOptions = state.restaurants
    .map((restaurant) => {
      const id = restaurant.restaurantId ?? restaurant.id;
      const name = restaurant.name ?? `Restaurant ${id}`;
      return `<option value="${escapeAttr(id)}">${escapeHtml(name)}</option>`;
    })
    .join("");

  const uniqueUsers = [
    ...new Set(
      state.reservations
        .map((reservation) => reservation.username ?? reservation.userName ?? "")
        .filter(Boolean)
    ),
  ].sort((a, b) => a.localeCompare(b));

  const userOptions = uniqueUsers
    .map((user) => `<option value="${escapeAttr(user)}">${escapeHtml(user)}</option>`)
    .join("");

  const filteredRestaurants = getFilteredRestaurantsForTables();

  const groupedRestaurantsHtml = filteredRestaurants
    .map((restaurant) => {
      const restaurantId = restaurant.restaurantId ?? restaurant.id;
      const restaurantName = restaurant.name ?? "Nepoznato";

      const restaurantTables = state.tables.filter(
        (table) => String(table.restaurantId) === String(restaurantId)
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
                          <div><strong>Korisnik:</strong> ${escapeHtml(user)}</div>
                          <div><strong>Datum:</strong> ${escapeHtml(date)}</div>
                          <div><strong>Osobe:</strong> ${escapeHtml(reservation.partySize ?? "-")}</div>
                          <div><strong>Status:</strong> ${escapeHtml(status)}</div>
                        </div>
                      `;
                    })
                    .join("")
                : `<div class="text-muted">Nema rezervacija za ovaj stol.</div>`;

              return `
                <div class="border rounded p-3 mb-3">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <strong>Stol:</strong> ${escapeHtml(seats)} mjesta
                    </div>
                    <div class="d-flex gap-2">
                      <button class="btn btn-sm btn-warning edit-table-btn"
                        data-id="${escapeAttr(tableId)}"
                        data-restaurantid="${escapeAttr(table.restaurantId)}"
                        data-seats="${escapeAttr(seats)}">
                        Uredi
                      </button>
                      <button class="btn btn-sm btn-danger delete-table-btn" data-id="${escapeAttr(tableId)}">
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

  bindTableEvents(container);
  applyTableFilterValues();
}

function bindTableEvents(container) {
  document.getElementById("table-form")?.addEventListener("submit", handleTableSubmit);
  document.getElementById("table-reset-btn")?.addEventListener("click", resetTableForm);

  document.getElementById("existing-table-select")?.addEventListener("change", (event) => {
    const selectedId = event.target.value;
    const table = state.tables.find((item) => String(item.tableId ?? item.id) === String(selectedId));
    if (!table) return;

    document.getElementById("table-id").value = table.tableId ?? table.id;
    document.getElementById("table-restaurant-id").value = table.restaurantId;
    document.getElementById("table-seats").value = table.seats;
  });

  document.getElementById("table-filter-restaurant")?.addEventListener("change", (event) => {
    state.tableFilters.restaurant = event.target.value;
    rerenderAdmin();
  });

  document.getElementById("table-filter-user")?.addEventListener("change", (event) => {
    state.tableFilters.user = event.target.value;
    rerenderAdmin();
  });

  document.getElementById("table-filter-date")?.addEventListener("change", (event) => {
    state.tableFilters.date = event.target.value;
    rerenderAdmin();
  });

  document.getElementById("table-filters-reset-btn")?.addEventListener("click", resetTableFilters);

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
      if (!confirm("Obrisati stol?")) return;

      try {
        await deleteTable(id);
        notify("Stol obrisan", "success");
        await refreshTables();
        rerenderAdmin();
      } catch (error) {
        notify(error.message || "Greška pri brisanju stola", "error");
      }
    });
  });
}

async function handleTableSubmit(event) {
  event.preventDefault();

  const id = document.getElementById("table-id").value.trim();
  const restaurantId = document.getElementById("table-restaurant-id").value.trim();
  const seats = document.getElementById("table-seats").value.trim();

  if (!restaurantId) {
    notify("Restoran je obavezan", "error");
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
    rerenderAdmin();
  } catch (error) {
    notify(error.message || "Greška pri spremanju stola", "error");
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

function resetTableFilters() {
  state.tableFilters = {
    restaurant: "",
    user: "",
    date: "",
  };

  rerenderAdmin();
}

function applyTableFilterValues() {
  const restaurant = document.getElementById("table-filter-restaurant");
  const user = document.getElementById("table-filter-user");
  const date = document.getElementById("table-filter-date");

  if (restaurant) restaurant.value = state.tableFilters.restaurant;
  if (user) user.value = state.tableFilters.user;
  if (date) date.value = state.tableFilters.date;
}

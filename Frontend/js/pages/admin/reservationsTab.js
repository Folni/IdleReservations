import {
  cancelReservation,
  updateReservation,
  updateReservationStatus,
} from "../../api/reservationsApi.js";
import { state } from "./state.js";
import { refreshReservations } from "./data.js";
import {
  getFilteredReservations,
  getRestaurantName,
  getTableLabel,
} from "./selectors.js";
import {
  escapeAttr,
  escapeHtml,
  formatDateTime,
  toDatetimeLocalValue,
} from "./utils.js";
import { notify } from "./ui.js";

let rerenderAdmin = () => {};

export function renderReservationsTab(container, onRerender) {
  rerenderAdmin = onRerender;

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

  const filteredReservations = getFilteredReservations();

  const rows = filteredReservations
    .map((reservation) => {
      const id = reservation.reservationId ?? reservation.id ?? "-";
      const userId = reservation.userId ?? "";
      const user = reservation.username ?? reservation.userName ?? "-";
      const restaurantId = reservation.restaurantId ?? "";
      const restaurantName = reservation.restaurantName ?? getRestaurantName(restaurantId);
      const tableId = reservation.tableId ?? "";
      const tableLabel = reservation.seats
        ? `${restaurantName} - ${reservation.seats} mjesta`
        : getTableLabel(tableId);
      const date =
        reservation.reservationDateTime ??
        reservation.reservationDate ??
        reservation.date ??
        "-";
      const persons =
        reservation.partySize ??
        reservation.numberOfGuests ??
        reservation.guests ??
        reservation.persons ??
        "-";
      const status = reservation.status ?? "Active";

      return `
        <tr>
          <td>${escapeHtml(user)}</td>
          <td>${escapeHtml(restaurantName)}</td>
          <td>${escapeHtml(tableLabel)}</td>
          <td>${escapeHtml(formatDateTime(date))}</td>
          <td>${escapeHtml(persons)}</td>
          <td>
            <select class="form-select form-select-sm reservation-status-select" data-id="${escapeAttr(id)}">
              <option value="Active" ${String(status).toLowerCase() === "active" ? "selected" : ""}>Active</option>
              <option value="Confirmed" ${String(status).toLowerCase() === "confirmed" ? "selected" : ""}>Confirmed</option>
              <option value="Pending" ${String(status).toLowerCase() === "pending" ? "selected" : ""}>Pending</option>
              <option value="Cancelled" ${String(status).toLowerCase() === "cancelled" ? "selected" : ""}>Cancelled</option>
            </select>
          </td>
          <td class="d-flex gap-2">
            <button
              class="btn btn-sm btn-warning edit-reservation-btn"
              data-id="${escapeAttr(id)}"
              data-userid="${escapeAttr(userId)}"
              data-restaurantid="${escapeAttr(restaurantId)}"
              data-tableid="${escapeAttr(tableId)}"
              data-datetime="${escapeAttr(date)}"
              data-persons="${escapeAttr(persons)}">
              Uredi
            </button>
            <button class="btn btn-sm btn-danger cancel-reservation-btn" data-id="${escapeAttr(id)}">
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

  bindReservationEvents(container);
  applyReservationFilterValues();
}

function bindReservationEvents(container) {
  document.getElementById("reservation-form")?.addEventListener("submit", handleReservationSubmit);
  document.getElementById("reservation-reset-btn")?.addEventListener("click", resetReservationForm);
  document
    .getElementById("reservation-restaurant-id")
    ?.addEventListener("change", handleReservationRestaurantChange);

  document.getElementById("reservation-filter-user")?.addEventListener("change", (event) => {
    state.reservationFilters.user = event.target.value;
    rerenderAdmin();
  });

  document.getElementById("reservation-filter-restaurant")?.addEventListener("change", (event) => {
    state.reservationFilters.restaurant = event.target.value;
    rerenderAdmin();
  });

  document.getElementById("reservation-filter-status")?.addEventListener("change", (event) => {
    state.reservationFilters.status = event.target.value;
    rerenderAdmin();
  });

  document.getElementById("reservation-filter-date")?.addEventListener("change", (event) => {
    state.reservationFilters.date = event.target.value;
    rerenderAdmin();
  });

  document.getElementById("reservation-filters-reset-btn")?.addEventListener("click", resetReservationFilters);

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
      if (!confirm("Otkaži rezervaciju?")) return;

      try {
        await cancelReservation(id);
        notify("Rezervacija otkazana", "success");
        await refreshReservations();
        rerenderAdmin();
      } catch (error) {
        notify(error.message || "Greška pri otkazivanju rezervacije", "error");
      }
    });
  });

  container.querySelectorAll(".reservation-status-select").forEach((select) => {
    select.addEventListener("change", async (event) => {
      const id = event.target.dataset.id;
      const status = event.target.value;

      try {
        await updateReservationStatus(id, status);
        notify("Status rezervacije ažuriran", "success");
        await refreshReservations();
        rerenderAdmin();
      } catch (error) {
        notify(error.message || "Greška pri ažuriranju statusa", "error");
      }
    });
  });
}

async function handleReservationSubmit(event) {
  event.preventDefault();

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
    rerenderAdmin();
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
    (table) => String(table.restaurantId) === String(restaurantId)
  );

  const options = filteredTables
    .map((table) => {
      const id = table.tableId ?? table.id;
      const selected = String(id) === String(selectedTableId) ? "selected" : "";
      return `<option value="${escapeAttr(id)}" ${selected}>${escapeHtml(table.seats)} mjesta</option>`;
    })
    .join("");

  reservationTableSelect.innerHTML = `
    <option value="">Odaberi stol</option>
    ${options}
  `;
}

function resetReservationFilters() {
  state.reservationFilters = {
    user: "",
    restaurant: "",
    status: "",
    date: "",
  };

  rerenderAdmin();
}

function applyReservationFilterValues() {
  const user = document.getElementById("reservation-filter-user");
  const restaurant = document.getElementById("reservation-filter-restaurant");
  const status = document.getElementById("reservation-filter-status");
  const date = document.getElementById("reservation-filter-date");

  if (user) user.value = state.reservationFilters.user;
  if (restaurant) restaurant.value = state.reservationFilters.restaurant;
  if (status) status.value = state.reservationFilters.status;
  if (date) date.value = state.reservationFilters.date;
}

export function renderAdminReservationsTable(reservations) {
  if (!reservations || reservations.length === 0) {
    return `
      <div class="empty-state-card">
        <h3>Nema rezervacija</h3>
        <p>Trenutno nema podataka za administratorski prikaz.</p>
      </div>
    `;
  }

  const rows = reservations.map((reservation) => {
    return `
      <tr>
        <td>${reservation.reservationId ?? "-"}</td>
        <td>${reservation.userId ?? "-"}</td>
        <td>${reservation.restaurantId ?? "-"}</td>
        <td>${reservation.tableId ?? "-"}</td>
        <td>${formatDateTime(reservation.reservationDateTime)}</td>
        <td>${reservation.partySize ?? "-"}</td>
        <td>${reservation.status ?? "-"}</td>
        <td>
          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-outline-primary edit-btn"
              data-id="${reservation.reservationId}">
              Uredi
            </button>
            <button class="btn btn-sm btn-outline-danger cancel-btn"
              data-id="${reservation.reservationId}">
              Otkaži
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  return `
    <div class="reservations-card">
      <div class="reservations-card-header">
        <div>
          <p class="section-kicker mb-2">ADMIN PREGLED</p>
          <h2 class="mb-0">CRUD tablica rezervacija</h2>
        </div>
        <span class="reservations-count">${reservations.length} ukupno</span>
      </div>

      <div class="table-responsive">
        <table class="table reservations-table align-middle mb-0">
          <thead>
            <tr>
              <th>ID</th>
              <th>Korisnik</th>
              <th>Restoran</th>
              <th>Stol</th>
              <th>Datum i vrijeme</th>
              <th>Broj osoba</th>
              <th>Status</th>
              <th>Akcije</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function formatDateTime(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("hr-HR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}
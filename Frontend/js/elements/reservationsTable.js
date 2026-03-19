export function renderReservationsTable(reservations) {
  if (!reservations || reservations.length === 0) {
    return `
      <div class="empty-state-card">
        <h3>Nema rezervacija</h3>
        <p>Trenutno nema dostupnih podataka za prikaz.</p>
      </div>
    `;
  }

  const rows = reservations.map((reservation) => {
    const statusClass = getStatusClass(reservation.status);

    return `
      <tr>
        <td>${reservation.restaurantName ?? "-"}</td>
        <td>${reservation.tableLabel ?? "-"}</td>
        <td>${formatDateTime(reservation.reservationDateTime)}</td>
        <td>${reservation.partySize ?? "-"}</td>
        <td>
          <span class="status-badge ${statusClass}">
            ${reservation.status ?? "-"}
          </span>
        </td>
      </tr>
    `;
  }).join("");

  return `
    <div class="reservations-card">
      <div class="reservations-card-header">
        <div>
          <p class="section-kicker mb-2">MOJE REZERVACIJE</p>
          <h2 class="mb-0">Pregled rezervacija</h2>
        </div>
        <span class="reservations-count">${reservations.length} ukupno</span>
      </div>

      <div class="table-responsive">
        <table class="table reservations-table align-middle mb-0">
          <thead>
            <tr>
              <th>Restoran</th>
              <th>Stol</th>
              <th>Datum i vrijeme</th>
              <th>Broj osoba</th>
              <th>Status</th>
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

function getStatusClass(status) {
  const normalized = (status || "").toLowerCase();

  if (normalized === "confirmed" || normalized === "potvrđena") {
    return "status-confirmed";
  }

  if (normalized === "pending" || normalized === "na čekanju") {
    return "status-pending";
  }

  if (normalized === "cancelled" || normalized === "otkazana") {
    return "status-cancelled";
  }

  return "status-default";
}
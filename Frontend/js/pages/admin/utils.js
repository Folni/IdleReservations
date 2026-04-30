export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function escapeAttr(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function formatDateTime(value) {
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

export function toDatetimeLocalValue(value) {
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

export function normalizeDateOnly(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getReservationDateValue(reservation) {
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

export function getReservationUserName(reservation) {
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

import { state } from "./state.js";
import { getReservationDateValue, normalizeDateOnly } from "./utils.js";

function getId(value, keys) {
  for (const key of keys) {
    if (value?.[key] !== undefined && value?.[key] !== null) {
      return value[key];
    }
  }
  return null;
}

function getReservationTableId(reservation) {
  return (
    reservation.tableId ??
    reservation.TableId ??
    reservation.tableID ??
    reservation.table?.tableId ??
    reservation.table?.id ??
    null
  );
}

function getReservationRestaurantId(reservation) {
  return (
    reservation.restaurantId ??
    reservation.RestaurantId ??
    reservation.restaurantID ??
    reservation.restaurant?.restaurantId ??
    reservation.restaurant?.id ??
    null
  );
}

function getReservationUser(reservation) {
  return String(
    reservation.username ??
      reservation.userName ??
      reservation.UserName ??
      reservation.email ??
      reservation.user?.username ??
      reservation.user?.userName ??
      reservation.user?.email ??
      ""
  ).toLowerCase();
}

function getReservationStatus(reservation) {
  return String(reservation.status ?? reservation.Status ?? "").toLowerCase();
}

export function getRestaurantName(id) {
  const restaurant = state.restaurants.find((item) => {
    const restaurantId = getId(item, ["restaurantId", "id", "RestaurantId"]);
    return String(restaurantId) === String(id);
  });

  return restaurant ? restaurant.name : "Nepoznato";
}

export function getTableLabel(tableId) {
  const table = state.tables.find((item) => {
    const id = getId(item, ["tableId", "id", "TableId"]);
    return String(id) === String(tableId);
  });

  if (!table) return "Nepoznato";

  const restaurantName = getRestaurantName(table.restaurantId ?? table.RestaurantId);
  return `${restaurantName} - ${table.seats ?? table.Seats ?? "-"} mjesta`;
}

export function getFilteredReservations() {
  const userFilter = state.reservationFilters.user.trim().toLowerCase();
  const restaurantFilter = state.reservationFilters.restaurant.trim();
  const statusFilter = state.reservationFilters.status.trim().toLowerCase();
  const dateFilter = state.reservationFilters.date;

  return state.reservations.filter((reservation) => {
    const user = getReservationUser(reservation);
    const restaurantId = String(getReservationRestaurantId(reservation) ?? "");
    const status = getReservationStatus(reservation);
    const normalizedDate = normalizeDateOnly(getReservationDateValue(reservation));

    const matchesUser = !userFilter || user === userFilter;
    const matchesRestaurant = !restaurantFilter || restaurantId === restaurantFilter;
    const matchesStatus = !statusFilter || status === statusFilter;
    const matchesDate = !dateFilter || normalizedDate === dateFilter;

    return matchesUser && matchesRestaurant && matchesStatus && matchesDate;
  });
}

export function getFilteredRestaurantsForTables() {
  const restaurantFilter = state.tableFilters.restaurant.trim();
  const userFilter = state.tableFilters.user.trim().toLowerCase();
  const dateFilter = state.tableFilters.date;

  return state.restaurants.filter((restaurant) => {
    const restaurantId = String(restaurant.restaurantId ?? restaurant.id ?? restaurant.RestaurantId);

    if (restaurantFilter && restaurantId !== restaurantFilter) {
      return false;
    }

    const restaurantTables = state.tables.filter((table) =>
      String(table.restaurantId ?? table.RestaurantId) === restaurantId
    );

    if (!userFilter && !dateFilter) {
      return restaurantTables.length > 0;
    }

    return restaurantTables.some((table) => {
      const tableId = table.tableId ?? table.id ?? table.TableId;
      return getFilteredReservationsForTable(tableId).length > 0;
    });
  });
}

export function getFilteredReservationsForTable(tableId) {
  const userFilter = state.tableFilters.user.trim().toLowerCase();
  const dateFilter = state.tableFilters.date;

  return state.reservations
    .filter((reservation) => String(getReservationTableId(reservation)) === String(tableId))
    .filter((reservation) => {
      const user = getReservationUser(reservation);
      const normalizedDate = normalizeDateOnly(getReservationDateValue(reservation));

      const matchesUser = !userFilter || user === userFilter;
      const matchesDate = !dateFilter || normalizedDate === dateFilter;

      return matchesUser && matchesDate;
    })
    .sort((a, b) => {
      const dateA = new Date(getReservationDateValue(a) ?? 0).getTime();
      const dateB = new Date(getReservationDateValue(b) ?? 0).getTime();
      return dateA - dateB;
    });
}

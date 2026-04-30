import { getAllReservations } from "../../api/reservationsApi.js";
import { getAllRestaurants } from "../../api/restaurantsApi.js";
import { getAllTables } from "../../api/tablesApi.js";
import { state } from "./state.js";
import { notify } from "./ui.js";

function normalizeList(data) {
  return Array.isArray(data) ? data : [];
}

function getErrorMessage(error, fallback) {
  return error?.message || fallback;
}

async function loadResource(label, loader) {
  try {
    return await loader();
  } catch (error) {
    console.error(`Greška pri dohvaćanju: ${label}`, error);
    notify(getErrorMessage(error, `Greška pri dohvaćanju: ${label}`), "error");
    return [];
  }
}

export async function loadAllData() {
  const [reservations, restaurants, tables] = await Promise.all([
    loadResource("rezervacije", getAllReservations),
    loadResource("restorani", getAllRestaurants),
    loadResource("stolovi", getAllTables),
  ]);

  state.reservations = normalizeList(reservations);
  state.restaurants = normalizeList(restaurants);
  state.tables = normalizeList(tables);
}

export async function refreshReservations() {
  const data = await getAllReservations();
  state.reservations = normalizeList(data);
}

export async function refreshRestaurants() {
  const data = await getAllRestaurants();
  state.restaurants = normalizeList(data);
}

export async function refreshTables() {
  const data = await getAllTables();
  state.tables = normalizeList(data);
}

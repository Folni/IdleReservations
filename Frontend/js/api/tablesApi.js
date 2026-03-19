import { API_CONFIG } from "./config.js";

const BASE_URL = API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.TABLES;

// get all
export async function getAllTables() {
  const response = await fetch(BASE_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch tables");
  }

  return await response.json();
}

// get by id
export async function getTableById(id) {
  const response = await fetch(`${BASE_URL}/${id}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch table ${id}`);
  }

  return await response.json();
}

// get by restaurant id
export async function getTablesByRestaurant(restaurantId) {
  const response = await fetch(`${BASE_URL}/restaurant/${restaurantId}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch tables for restaurant ${restaurantId}`);
  }

  return await response.json();
}

// create
export async function createTable(data) {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create table");
  }

  return await response.text(); // backend vraća string
}

// update
export async function updateTable(id, data) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to update table ${id}`);
  }

  return await response.text(); // backend vraća string
}

// delete
export async function deleteTable(id) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Failed to delete table ${id}`);
  }

  return await response.text(); // backend vraća string
}
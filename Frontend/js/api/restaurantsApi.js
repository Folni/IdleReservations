import { API_CONFIG } from "./config.js";

const BASE_URL = API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.RESTAURANTS;

// get all
export async function getAllRestaurants() {
  const response = await fetch(BASE_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch restaurants");
  }

  return await response.json();
}

// get by id
export async function getRestaurantById(id) {
  const response = await fetch(`${BASE_URL}/${id}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch restaurant ${id}`);
  }

  return await response.json();
}

// create
export async function createRestaurant(data) {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create restaurant");
  }

  return await response.text(); // backend vraća string
}

// update
export async function updateRestaurant(id, data) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to update restaurant ${id}`);
  }

  return await response.text(); // backend vraća string
}

// delete
export async function deleteRestaurant(id) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Failed to delete restaurant ${id}`);
  }

  return await response.text(); // backend vraća string
}
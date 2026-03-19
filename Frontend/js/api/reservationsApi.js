import { API_CONFIG } from "./config.js";

const BASE_URL =
  API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.RESERVATIONS;

  //get all 
  export async function getAllReservations(){

    const respone = await fetch(BASE_URL);

    if (!respone.ok) {
        throw new Error("Failed to fetch reservations");
        
    }

    return await respone.json();
  }

//get by id

export async function getReservationById(id) {
  const response = await fetch(`${BASE_URL}/${id}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch reservation ${id}`);
  }

  return await response.json();
}

// create by id
export async function createReservation(data) {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create reservation");
  }

  return await response.text(); // backend returns string
}

export async function updateReservation(id, data) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to update reservation ${id}`);
  }

  return await response.text();
}

//delete by id 
export async function cancelReservation(id) {
  const response = await fetch(`${BASE_URL}/cancel/${id}`, {
    method: "PUT",
  });

  if (!response.ok) {
    throw new Error(`Failed to cancel reservation ${id}`);
  }

  return await response.text();
}

export async function updateReservationStatus(id, status) {
  const response = await fetch(`${BASE_URL}/${id}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update reservation status ${id}`);
  }

  return await response.text();
}
import { API_CONFIG } from "./config.js";

const BASE_URL = API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.NOTIFICATIONS;

// GET /api/notifications/user/{userId}
export async function getNotificationsByUser(userId) {
  const response = await fetch(`${BASE_URL}/user/${userId}`);

  const result = await parseResponse(response);

  if (!response.ok) {
    throw new Error(extractErrorMessage(result, "Neuspješno dohvaćanje notifikacija."));
  }

  return result;
}

// POST /api/notifications
export async function createNotification(data) {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await parseResponse(response);

  if (!response.ok) {
    throw new Error(extractErrorMessage(result, "Neuspješno kreiranje notifikacije."));
  }

  return result;
}

// PUT /api/notifications/read/{id}
export async function markNotificationAsRead(id) {
  const response = await fetch(`${BASE_URL}/read/${id}`, {
    method: "PUT",
  });

  const result = await parseResponse(response);

  if (!response.ok) {
    throw new Error(extractErrorMessage(result, "Neuspješno označavanje notifikacije kao pročitane."));
  }

  return result;
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type");

  if (contentType && contentType.includes("application/json")) {
    return await response.json();
  }

  return await response.text();
}

function extractErrorMessage(result, fallbackMessage) {
  if (!result) return fallbackMessage;

  if (typeof result === "string" && result.trim()) {
    return result;
  }

  if (result.title) {
    return result.title;
  }

  if (result.message) {
    return result.message;
  }

  if (result.errors) {
    const firstKey = Object.keys(result.errors)[0];
    if (firstKey && result.errors[firstKey]?.length) {
      return result.errors[firstKey][0];
    }
  }

  return fallbackMessage;
}
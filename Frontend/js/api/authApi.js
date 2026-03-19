import { API_CONFIG } from "./config.js";

const BASE_URL = API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.AUTH;

// register
export async function registerUser(data) {
  const response = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await parseResponse(response);

  if (!response.ok) {
    throw new Error(extractErrorMessage(result, "Neuspješna registracija."));
  }

  return result;
}

// login
export async function loginUser(data) {
  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await parseResponse(response);

  if (!response.ok) {
    throw new Error(extractErrorMessage(result, "Neuspješna prijava."));
  }

  return result;
}

// change-password
export async function changePassword(data) {
  const response = await fetch(`${BASE_URL}/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await parseResponse(response);

  if (!response.ok) {
    throw new Error(extractErrorMessage(result, "Neuspješna promjena lozinke."));
  }

  return result;
}

// promote
export async function promoteUser(data) {
  const response = await fetch(`${BASE_URL}/promote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await parseResponse(response);

  if (!response.ok) {
    throw new Error(extractErrorMessage(result, "Neuspješno promoviranje korisnika."));
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
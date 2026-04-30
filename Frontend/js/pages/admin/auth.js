export function isAdmin() {
  const token = localStorage.getItem("authToken");
  if (!token) return false;

  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return false;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=");
    const payload = JSON.parse(atob(padded));

    const role =
      payload.role ||
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      payload["Role"];

    return role === "Admin" || role === "admin";
  } catch (error) {
    return false;
  }
}

export function renderUnauthorized(container) {
  if (!container) return;

  container.innerHTML = `
    <div class="card p-4">
      <h2>Pristup odbijen</h2>
      <p>Samo administratori mogu pristupiti ovom panelu.</p>
    </div>
  `;

  setTimeout(() => {
    window.location.href = "./auth.html";
  }, 1500);
}

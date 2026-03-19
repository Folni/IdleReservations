import { parseJwt } from "../utils/jwt.js";

window.logoutUser = function () {
  localStorage.removeItem("authToken");
  window.location.href = "./index.html";
};

export function renderNav() {
  const token = localStorage.getItem("authToken");

  let authSection = `
    <li class="nav-item">
      <a class="nav-link custom-link" href="./auth.html">Prijava</a>
    </li>
  `;

  let adminLink = "";
  let reservationsLink = "";

  if (token) {
    const payload = parseJwt(token);

    const username =
      payload?.unique_name ||
      payload?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ||
      payload?.sub ||
      "User";

    const role =
      payload?.role ||
      payload?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      "";

    reservationsLink = `
      <li class="nav-item">
        <a class="nav-link custom-link" href="./reservations.html">Reservations</a>
      </li>
    `;

    if (role === "Admin") {
      adminLink = `
        <li class="nav-item">
          <a class="nav-link custom-link" href="./admin.html">Admin panel</a>
        </li>
      `;
    }

    authSection = `
      <li class="nav-item">
        <a class="nav-link custom-link" href="./profile.html">${username}${role ? ` (${role})` : ""}</a>
      </li>
      <li class="nav-item">
        <button type="button" class="nav-logout-btn" onclick="logoutUser()">Odjava</button>
      </li>
    `;
  }

  return `
    <nav class="navbar navbar-expand-lg custom-navbar">
      <div class="container">
        <a class="navbar-brand custom-brand" href="./index.html">IdleReservations</a>

        <div class="collapse navbar-collapse justify-content-end">
          <ul class="navbar-nav align-items-center gap-2">
            <li class="nav-item">
              <a class="nav-link custom-link" href="./index.html">Home</a>
            </li>
            <li class="nav-item">
                <a class="nav-link custom-link" href="./locations.html">Locations</a>
            </li>

            ${reservationsLink}
            ${adminLink}
            ${authSection}
          </ul>
        </div>
      </div>
    </nav>
  `;
}
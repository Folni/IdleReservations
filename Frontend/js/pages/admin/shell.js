import { state } from "./state.js";

export function renderShell(container, { onTabChange, onRefresh }) {
  if (!container) return;

  container.innerHTML = `
    <div class="admin-panel">
      <div class="admin-tabs mb-4">
        <button class="btn btn-outline-dark admin-tab" data-tab="reservations">Rezervacije</button>
        <button class="btn btn-outline-dark admin-tab" data-tab="restaurants">Restorani</button>
        <button class="btn btn-outline-dark admin-tab" data-tab="tables">Stolovi</button>
        <button class="btn btn-outline-dark" id="refresh-admin-btn">Osvježi</button>
      </div>

      <div id="admin-stats" class="mb-4"></div>
      <div id="admin-tab-content"></div>
    </div>
  `;

  document.querySelectorAll(".admin-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.activeTab = btn.dataset.tab;
      onTabChange();
    });
  });

  document.getElementById("refresh-admin-btn")?.addEventListener("click", onRefresh);
}

export function renderStats() {
  const stats = document.getElementById("admin-stats");
  if (!stats) return;

  stats.innerHTML = `
    <div class="row g-3">
      <div class="col-md-4">
        <div class="card p-3">
          <h6>Rezervacije</h6>
          <strong>${state.reservations.length}</strong>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card p-3">
          <h6>Restorani</h6>
          <strong>${state.restaurants.length}</strong>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card p-3">
          <h6>Stolovi</h6>
          <strong>${state.tables.length}</strong>
        </div>
      </div>
    </div>
  `;
}

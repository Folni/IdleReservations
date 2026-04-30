import { renderNav } from "../elements/nav.js";
import { renderFooter } from "../elements/footer.js";
import { state } from "./admin/state.js";
import { isAdmin, renderUnauthorized } from "./admin/auth.js";
import { loadAllData } from "./admin/data.js";
import { renderShell, renderStats } from "./admin/shell.js";
import { renderReservationsTab } from "./admin/reservationsTab.js";
import { renderRestaurantsTab } from "./admin/restaurantsTab.js";
import { renderTablesTab } from "./admin/tablesTab.js";
import { notify } from "./admin/ui.js";

const nav = document.getElementById("nav");
const footer = document.getElementById("footer");
const adminContent = document.getElementById("admin-content");
const addReservationBtn = document.getElementById("add-reservation-btn");

if (nav) nav.innerHTML = renderNav();
if (footer) footer.innerHTML = renderFooter();

document.addEventListener("DOMContentLoaded", init);

async function init() {
  if (!adminContent) {
    console.error("Nedostaje element #admin-content u admin.html");
    return;
  }

  if (!isAdmin()) {
    renderUnauthorized(adminContent);
    return;
  }

  bindGlobalEvents();

  renderShell(adminContent, {
    onTabChange: renderActiveTab,
    onRefresh: async () => {
      await loadAllData();
      renderActiveTab();
      notify("Podaci osvježeni", "success");
    },
  });

  await loadAllData();
  renderActiveTab();
}

function bindGlobalEvents() {
  addReservationBtn?.addEventListener("click", () => {
    window.location.href = "./reservations.html";
  });
}

function renderActiveTab() {
  renderStats();

  const container = document.getElementById("admin-tab-content");
  if (!container) return;

  document.querySelectorAll(".admin-tab").forEach((btn) => {
    btn.classList.toggle("btn-dark", btn.dataset.tab === state.activeTab);
    btn.classList.toggle("btn-outline-dark", btn.dataset.tab !== state.activeTab);
  });

  if (state.activeTab === "reservations") {
    renderReservationsTab(container, renderActiveTab);
    return;
  }

  if (state.activeTab === "restaurants") {
    renderRestaurantsTab(container, renderActiveTab);
    return;
  }

  if (state.activeTab === "tables") {
    renderTablesTab(container, renderActiveTab);
  }
}

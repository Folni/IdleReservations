import {
  createRestaurant,
  deleteRestaurant,
  updateRestaurant,
} from "../../api/restaurantsApi.js";
import { state } from "./state.js";
import { refreshRestaurants, refreshTables } from "./data.js";
import { escapeAttr, escapeHtml } from "./utils.js";
import { notify } from "./ui.js";
import {
  initializeRestaurantAdminMap,
  initRestaurantAdminMap,
} from "./restaurantMap.js";

let rerenderAdmin = () => {};

export function renderRestaurantsTab(container, onRerender) {
  rerenderAdmin = onRerender;

  const rows = state.restaurants
    .map((restaurant) => {
      const id = restaurant.restaurantId ?? restaurant.id ?? "";
      const name = restaurant.name ?? "";
      const address = restaurant.address ?? "";
      const city = restaurant.city ?? "";
      const latitude = restaurant.latitude ?? "";
      const longitude = restaurant.longitude ?? "";
      const workingHours = restaurant.workingHours ?? "";

      return `
        <tr>
          <td>${escapeHtml(name)}</td>
          <td>${escapeHtml(address)}</td>
          <td>${escapeHtml(city)}</td>
          <td>${escapeHtml(latitude)}</td>
          <td>${escapeHtml(longitude)}</td>
          <td>${escapeHtml(workingHours)}</td>
          <td class="d-flex gap-2">
            <button class="btn btn-sm btn-warning edit-restaurant-btn"
              data-id="${escapeAttr(id)}"
              data-name="${escapeAttr(name)}"
              data-address="${escapeAttr(address)}"
              data-city="${escapeAttr(city)}"
              data-latitude="${escapeAttr(latitude)}"
              data-longitude="${escapeAttr(longitude)}"
              data-workinghours="${escapeAttr(workingHours)}">
              Uredi
            </button>
            <button class="btn btn-sm btn-danger delete-restaurant-btn" data-id="${escapeAttr(id)}">
              Obriši
            </button>
          </td>
        </tr>
      `;
    })
    .join("");

  container.innerHTML = `
    <div class="row g-4 mb-4">
      <div class="col-lg-7">
        <div class="card p-4 h-100">
          <h3 class="mb-3">Dodaj / uredi restoran</h3>

          <form id="restaurant-form" class="row g-3">
            <input type="hidden" id="restaurant-id" />
            <input type="hidden" id="restaurant-latitude" />
            <input type="hidden" id="restaurant-longitude" />

            <div class="col-md-6">
              <label class="form-label">Naziv</label>
              <input type="text" class="form-control" id="restaurant-name" required />
            </div>

            <div class="col-md-6">
              <label class="form-label">Grad</label>
              <input type="text" class="form-control" id="restaurant-city" required />
            </div>

            <div class="col-12">
              <label class="form-label">Adresa</label>
              <input type="text" class="form-control" id="restaurant-address" required />
            </div>

            <div class="col-md-6">
              <label class="form-label">Radno vrijeme</label>
              <input type="text" class="form-control" id="restaurant-working-hours" placeholder="08:00 - 23:00" />
            </div>

            <div class="col-md-3">
              <label class="form-label">Latitude</label>
              <input type="text" class="form-control" id="restaurant-latitude-preview" readonly />
            </div>

            <div class="col-md-3">
              <label class="form-label">Longitude</label>
              <input type="text" class="form-control" id="restaurant-longitude-preview" readonly />
            </div>

            <div class="col-12 d-flex gap-2">
              <button type="submit" class="btn btn-primary-custom">Spremi</button>
              <button type="button" class="btn btn-secondary" id="restaurant-reset-btn">Reset</button>
            </div>
          </form>
        </div>
      </div>

      <div class="col-lg-5">
        <div class="card p-4 h-100">
          <h3 class="mb-3">Odaberi lokaciju na karti</h3>
          <div id="restaurant-admin-map" style="width: 100%; height: 420px; border-radius: 12px;"></div>
          <small class="text-muted mt-2 d-block">
            Klikni na kartu za automatsko popunjavanje adrese, grada i koordinata.
          </small>
        </div>
      </div>
    </div>

    <div class="card p-4">
      <h3 class="mb-3">Popis restorana</h3>

      ${
        state.restaurants.length === 0
          ? `<p>Nema restorana.</p>`
          : `
            <div class="table-responsive">
              <table class="table table-striped align-middle">
                <thead>
                  <tr>
                    <th>Naziv</th>
                    <th>Adresa</th>
                    <th>Grad</th>
                    <th>Lat</th>
                    <th>Lng</th>
                    <th>Radno vrijeme</th>
                    <th>Akcije</th>
                  </tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>
            </div>
          `
      }
    </div>
  `;

  bindRestaurantEvents(container);
  initializeRestaurantAdminMap();
}

function bindRestaurantEvents(container) {
  document.getElementById("restaurant-form")?.addEventListener("submit", handleRestaurantSubmit);
  document.getElementById("restaurant-reset-btn")?.addEventListener("click", resetRestaurantForm);

  container.querySelectorAll(".edit-restaurant-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.getElementById("restaurant-id").value = btn.dataset.id;
      document.getElementById("restaurant-name").value = btn.dataset.name;
      document.getElementById("restaurant-address").value = btn.dataset.address;
      document.getElementById("restaurant-city").value = btn.dataset.city;
      document.getElementById("restaurant-latitude").value = btn.dataset.latitude;
      document.getElementById("restaurant-longitude").value = btn.dataset.longitude;
      document.getElementById("restaurant-latitude-preview").value = btn.dataset.latitude;
      document.getElementById("restaurant-longitude-preview").value = btn.dataset.longitude;
      document.getElementById("restaurant-working-hours").value = btn.dataset.workinghours;

      initRestaurantAdminMap(Number(btn.dataset.latitude), Number(btn.dataset.longitude));
    });
  });

  container.querySelectorAll(".delete-restaurant-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      if (!confirm("Obrisati restoran?")) return;

      try {
        await deleteRestaurant(id);
        notify("Restoran obrisan", "success");
        await refreshRestaurants();
        await refreshTables();
        rerenderAdmin();
      } catch (error) {
        notify(error.message || "Greška pri brisanju restorana", "error");
      }
    });
  });
}

async function handleRestaurantSubmit(event) {
  event.preventDefault();

  const id = document.getElementById("restaurant-id").value.trim();
  const name = document.getElementById("restaurant-name").value.trim();
  const address = document.getElementById("restaurant-address").value.trim();
  const city = document.getElementById("restaurant-city").value.trim();
  const latitude = document.getElementById("restaurant-latitude").value.trim();
  const longitude = document.getElementById("restaurant-longitude").value.trim();
  const workingHours = document.getElementById("restaurant-working-hours").value.trim();

  if (!name || name.length < 2) {
    notify("Naziv restorana mora imati barem 2 znaka", "error");
    return;
  }

  if (!address) {
    notify("Adresa je obavezna", "error");
    return;
  }

  if (!city) {
    notify("Grad je obavezan", "error");
    return;
  }

  if (!latitude || !longitude) {
    notify("Odaberi lokaciju restorana na karti", "error");
    return;
  }

  const payload = {
    name,
    address,
    city,
    latitude: Number(latitude),
    longitude: Number(longitude),
    workingHours,
  };

  try {
    if (id) {
      await updateRestaurant(id, payload);
      notify("Restoran ažuriran", "success");
    } else {
      await createRestaurant(payload);
      notify("Restoran dodan", "success");
    }

    resetRestaurantForm();
    await refreshRestaurants();
    rerenderAdmin();
  } catch (error) {
    notify(error.message || "Greška pri spremanju restorana", "error");
  }
}

function resetRestaurantForm() {
  document.getElementById("restaurant-id").value = "";
  document.getElementById("restaurant-name").value = "";
  document.getElementById("restaurant-address").value = "";
  document.getElementById("restaurant-city").value = "";
  document.getElementById("restaurant-latitude").value = "";
  document.getElementById("restaurant-longitude").value = "";
  document.getElementById("restaurant-latitude-preview").value = "";
  document.getElementById("restaurant-longitude-preview").value = "";
  document.getElementById("restaurant-working-hours").value = "";

  initRestaurantAdminMap();
}

let restaurantAdminMap = null;
let restaurantAdminMarker = null;
let restaurantAdminGeocoder = null;

export function initializeRestaurantAdminMap() {
  if (typeof window.google === "undefined" || !window.google.maps) {
    return;
  }

  initRestaurantAdminMap();
}

export function initRestaurantAdminMap(lat = 45.815, lng = 15.9819) {
  const mapElement = document.getElementById("restaurant-admin-map");
  if (!mapElement || typeof window.google === "undefined" || !window.google.maps) {
    return;
  }

  const center = { lat, lng };

  restaurantAdminMap = new window.google.maps.Map(mapElement, {
    center,
    zoom: 7,
  });

  restaurantAdminGeocoder = new window.google.maps.Geocoder();

  restaurantAdminMarker = new window.google.maps.Marker({
    position: center,
    map: restaurantAdminMap,
    draggable: true,
  });

  restaurantAdminMap.addListener("click", (event) => {
    const clickedLat = event.latLng.lat();
    const clickedLng = event.latLng.lng();

    setRestaurantCoordinates(clickedLat, clickedLng);
    restaurantAdminMarker.setPosition({ lat: clickedLat, lng: clickedLng });
    reverseGeocodeRestaurant(clickedLat, clickedLng);
  });

  restaurantAdminMarker.addListener("dragend", (event) => {
    const draggedLat = event.latLng.lat();
    const draggedLng = event.latLng.lng();

    setRestaurantCoordinates(draggedLat, draggedLng);
    reverseGeocodeRestaurant(draggedLat, draggedLng);
  });

  setRestaurantCoordinates(lat, lng);
}

function setRestaurantCoordinates(lat, lng) {
  document.getElementById("restaurant-latitude").value = lat;
  document.getElementById("restaurant-longitude").value = lng;
  document.getElementById("restaurant-latitude-preview").value = Number(lat).toFixed(6);
  document.getElementById("restaurant-longitude-preview").value = Number(lng).toFixed(6);
}

function reverseGeocodeRestaurant(lat, lng) {
  if (!restaurantAdminGeocoder) return;

  restaurantAdminGeocoder.geocode({ location: { lat, lng } }, (results, status) => {
    if (status !== "OK" || !results || !results.length) {
      return;
    }

    const best = results[0];
    const cityComponent = best.address_components?.find((component) =>
      component.types.includes("locality")
    );

    document.getElementById("restaurant-address").value = best.formatted_address ?? "";
    if (cityComponent) {
      document.getElementById("restaurant-city").value = cityComponent.long_name ?? "";
    }
  });
}

export function initToastContainer() {
  if (document.getElementById("toast-container")) return;

  const container = document.createElement("div");
  container.id = "toast-container";
  container.className = "toast-container position-fixed top-0 end-0 p-3";
  container.style.zIndex = "9999";

  document.body.appendChild(container);
}

export function showToast(message, type = "info", delay = 3000) {
  initToastContainer();

  const container = document.getElementById("toast-container");
  const toastId = `toast-${Date.now()}`;

  const bgClass = getToastClass(type);
  const icon = getToastIcon(type);

  const toastWrapper = document.createElement("div");
  toastWrapper.innerHTML = `
    <div id="${toastId}" class="toast align-items-center text-white ${bgClass} border-0" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="${delay}">
      <div class="d-flex">
        <div class="toast-body">
          <span class="me-2">${icon}</span>
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  `;

  const toastElement = toastWrapper.firstElementChild;
  container.appendChild(toastElement);

  const toast = new bootstrap.Toast(toastElement);
  toast.show();

  toastElement.addEventListener("hidden.bs.toast", () => {
    toastElement.remove();
  });
}

function getToastClass(type) {
  switch (type) {
    case "success":
      return "bg-success";
    case "error":
      return "bg-danger";
    case "warning":
      return "bg-warning text-dark";
    case "info":
    default:
      return "bg-primary";
  }
}

function getToastIcon(type) {
  switch (type) {
    case "success":
      return "✅";
    case "error":
      return "❌";
    case "warning":
      return "⚠️";
    case "info":
    default:
      return "ℹ️";
  }
}
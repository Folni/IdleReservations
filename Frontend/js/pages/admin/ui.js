import { showToast } from "../../elements/toast.js";

export function notify(message, type = "info") {
  if (typeof showToast === "function") {
    showToast(message, type);
  } else {
    alert(message);
  }
}

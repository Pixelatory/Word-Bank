export function clearFormInputs(container) {
  container.querySelectorAll("input, select, textarea").forEach(el => {
    switch (el.type) {
      case "radio":
      case "checkbox":
        el.checked = false;
        break;
      default:
        el.value = "";
    }
  });
}

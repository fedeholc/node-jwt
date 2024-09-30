/**
 * @param {HTMLElement | Document} parent
 */
export function cleanInputs(parent) {
  let inputs = parent.querySelectorAll("input");
  inputs.forEach((input) => {
    input.value = "";
  });
}

/**
 * @param {HTMLElement} element
 */
export function vibrate(element) {
  element.classList.add("vibrate");
  setTimeout(() => {
    element.classList.remove("vibrate");
  }, 300);
}
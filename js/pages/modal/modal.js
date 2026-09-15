let dom = (selector) => {
  return document.querySelector(selector);
};

let openModal = (modalId) => {
  let modal = dom(`#${modalId}`);

  if (!modal) return;

  modal.hidden = false;
  document.body.classList.add("modal-open");
};

let closeModal = (modalId) => {
  let modal = dom(`#${modalId}`);

  if (!modal) return;

  modal.hidden = true;
  document.body.classList.remove("modal-open");
};

window.openModal = openModal;
window.closeModal = closeModal;

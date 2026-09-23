let dom = (selector) => {
  return document.querySelector(selector);
};
window.openModal = (modalId) => {
  let modal = dom(`#${modalId}`);
  if (!modal) return;
  modal.hidden = false;
  document.body.classList.add("modal-open");
};
window.closeModal = (modalId) => {
  let modal = dom(`#${modalId}`);

  if (!modal) return;

  modal.hidden = true;
  document.body.classList.remove("modal-open");
};
// window.openModal = openModal;
// window.closeModal = closeModal;

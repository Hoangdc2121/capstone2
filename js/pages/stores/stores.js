import {
  getStore,
  addStore,
  updateStore,
  deleteStore,
} from "../../services/storeService.js";

import { paginate } from "../../utils/pagination.js";

// DOM
let dom = (selector) => {
  return document.querySelector(selector);
};

// Trạng thái cửa hàng
let stores = [];
let filteredStores = [];
let currentPage = 1;
let pageSize = 10;
let formMode = "create";
let editingStoreId = null;

// Cấu hình hình ảnh
const STORE_IMAGE_PREFIX = "https://apistore.cybersoft.edu.vn/images/";
const STORE_PLACEHOLDER = "https://placehold.co/80x80?text=No+Image";

// XỬ LÝ URL ẢNH
let cleanStoreImageUrl = (image) => {
  let imageUrl = String(image || "").trim();

  // Xử lý URL bị API nối sai:
  // /images/https://images.unsplash.com/...
  while (imageUrl.startsWith(STORE_IMAGE_PREFIX + "http")) {
    imageUrl = imageUrl.replace(STORE_IMAGE_PREFIX, "");
  }
  return imageUrl;
};

let getStoreImageUrl = (image) => {
  let imageUrl = cleanStoreImageUrl(image);
  if (!imageUrl || imageUrl.toLowerCase() === "string") {
    return STORE_PLACEHOLDER;
  }
  // URL đầy đủ
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  // API chỉ trả tên file
  return STORE_IMAGE_PREFIX + imageUrl;
};

// MỞ MODAL THÊM CỬA HÀNG
window.openCreateStoreModal = () => {
  formMode = "create";
  editingStoreId = null;
  resetStoreForm();
  dom("#storeModalTitle").textContent = "THÊM CỬA HÀNG";
  dom("#btnSubmitStore span").textContent = "Thêm cửa hàng";
  window.openModal("storeModal");
};

// RENDER DANH SÁCH CỬA HÀNG
let renderStores = () => {
  let storeTableBody = dom("#storeTableBody");
  if (!storeTableBody) {
    console.error("Không tìm thấy #storeTableBody");
    return;
  }
  let pagination = paginate(filteredStores, currentPage, pageSize);
  let content = pagination.currentItems
    .map((item, index) => {
      let {
        id,
        name,
        alias,
        latitude,
        longtitude,
        description,
        image,
        deleted,
      } = item;
      let storeImage = getStoreImageUrl(image);
      let isDeleted = deleted === true || deleted === "true" || deleted === 1;
      let statusText = isDeleted ? "Ngừng hoạt động" : "Đang hoạt động";
      let statusClass = isDeleted ? "inactive" : "active";
      return `
        <tr>
          <td>
            ${pagination.startIndex + index + 1}
          </td>
          <td>
            <div class="store-info">
              <img
                src="${storeImage}"
                alt="${name || "Cửa hàng"}"
                class="store-image"
                onerror="
                  this.onerror = null;
                  this.src = '${STORE_PLACEHOLDER}';
                "
              />
              <div class="store-info-content">
                <strong class="store-name">
                  ${name || "Chưa có tên"}
                </strong>
                <span class="store-alias">
                  ${alias || "Chưa có alias"}
                </span>
              </div>
            </div>
          </td>
          <td>
            <p class="store-address">
              ${description || "Chưa có địa chỉ"}
            </p>
          </td>
          <td>
            <span class="store-coordinate">
              ${latitude || "—"}
            </span>
          </td>
          <td>
            <span class="store-coordinate">
              ${longtitude || "—"}
            </span>
          </td>
          <td>
            <span
              class="store-status-badge ${statusClass}"
            >
              ${statusText}
            </span>
          </td>
          <td>
            <div class="store-actions">
              <button
                type="button"
                class="action-button-edit"
                aria-label="Sửa cửa hàng"
                onclick="editStore(${id})"
              >
                <i class="fa-solid fa-pen"></i>
              </button>
              <button
                type="button"
                class="action-button-delete"
                aria-label="Xóa cửa hàng"
                onclick="handleDeleteStore(${id})"
              >
                <i class="fa-regular fa-trash-can"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
  if (pagination.totalItems === 0) {
    content = `
      <tr>
        <td
          colspan="7"
          class="table-empty"
        >
          Không có cửa hàng nào.
        </td>
      </tr>
    `;
  }
  storeTableBody.innerHTML = content;
  renderStorePagination(pagination);
};

// RENDER PHÂN TRANG

let renderStorePagination = (pagination) => {
  let paginationInfo = dom("#storePagination");
  let previousButton = dom("#previousPage");
  let nextButton = dom("#nextPage");
  if (paginationInfo) {
    paginationInfo.innerHTML = `
      Hiển thị ${pagination.startItem} -
      ${pagination.endItem}
      của ${pagination.totalItems}
      cửa hàng
    `;
  }
  if (previousButton) {
    previousButton.disabled = currentPage <= 1;
  }
  if (nextButton) {
    nextButton.disabled =
      pagination.totalPages === 0 || currentPage >= pagination.totalPages;
  }
};

// Trang trước
window.previousPage = () => {
  if (currentPage <= 1) {
    return;
  }
  currentPage--;
  renderStores();
};

// Trang tiếp theo
window.nextPage = () => {
  let pagination = paginate(filteredStores, currentPage, pageSize);
  if (currentPage >= pagination.totalPages) {
    return;
  }
  currentPage++;
  renderStores();
};

// TÌM KIẾM CỬA HÀNG
window.filterStores = () => {
  let searchValue = dom("#searchstore").value.trim().toLowerCase();
  filteredStores = stores.filter((item) => {
    let storeName = String(item.name || "").toLowerCase();
    let storeAlias = String(item.alias || "").toLowerCase();
    let storeDescription = String(item.description || "").toLowerCase();
    let storeId = String(item.id || "").toLowerCase();
    let storeLatitude = String(item.latitude || "").toLowerCase();
    let storeLongtitude = String(item.longtitude || "").toLowerCase();
    return (
      storeName.includes(searchValue) ||
      storeAlias.includes(searchValue) ||
      storeDescription.includes(searchValue) ||
      storeId.includes(searchValue) ||
      storeLatitude.includes(searchValue) ||
      storeLongtitude.includes(searchValue)
    );
  });

  currentPage = 1;
  renderStores();
};

// TRẠNG THÁI TOGGLE
window.changeStoreStatus = () => {
  let storeActive = dom("#storeActive");
  let storeStatusText = dom("#storeStatusText");
  if (!storeActive || !storeStatusText) {
    return;
  }
  if (storeActive.checked) {
    storeStatusText.textContent = "Đang hoạt động";
    storeStatusText.classList.remove("inactive");
  } else {
    storeStatusText.textContent = "Ngừng hoạt động";
    storeStatusText.classList.add("inactive");
  }
};

// XEM TRƯỚC ẢNH
window.previewStoreImage = () => {
  let imageUrl = cleanStoreImageUrl(dom("#storeImage").value);

  let previewImage = dom("#storePreviewImage");

  let placeholder = dom("#storeImagePlaceholder");

  if (!previewImage || !placeholder) {
    return;
  }

  if (!imageUrl) {
    previewImage.removeAttribute("src");
    previewImage.style.display = "none";

    placeholder.style.display = "flex";

    return;
  }

  previewImage.onload = () => {
    previewImage.style.display = "block";
    placeholder.style.display = "none";
  };

  previewImage.onerror = () => {
    previewImage.removeAttribute("src");
    previewImage.style.display = "none";

    placeholder.style.display = "flex";
  };

  previewImage.src = getStoreImageUrl(imageUrl);
};

// TẢI LẠI DANH SÁCH
let reloadStores = async (preserveSearch = true) => {
  stores = await getStore();
  if (!Array.isArray(stores)) {
    stores = [];
  }
  if (preserveSearch) {
    window.filterStores();
    return;
  }
  let searchInput = dom("#searchstore");
  if (searchInput) {
    searchInput.value = "";
  }
  filteredStores = [...stores];
  currentPage = 1;
  renderStores();
};

// RESET FORM
let resetStoreForm = () => {
  let storeForm = dom("#storeForm");

  if (storeForm) {
    storeForm.reset();
  }

  let storeActive = dom("#storeActive");

  if (storeActive) {
    storeActive.checked = true;
  }

  let storeStatusText = dom("#storeStatusText");

  if (storeStatusText) {
    storeStatusText.textContent = "Đang hoạt động";

    storeStatusText.classList.remove("inactive");
  }

  let previewImage = dom("#storePreviewImage");

  let placeholder = dom("#storeImagePlaceholder");

  if (previewImage) {
    previewImage.removeAttribute("src");
    previewImage.style.display = "none";
  }

  if (placeholder) {
    placeholder.style.display = "flex";
  }
};

// SUBMIT THÊM HOẶC CHỈNH SỬA

window.handleSubmitStore = async (event) => {
  event.preventDefault();
  let isUpdating = formMode === "update";
  let payload = {
    id: isUpdating ? Number(editingStoreId) : 0,
    name: dom("#storeName").value.trim(),
    alias: dom("#storeAlias").value.trim(),
    latitude: dom("#storeLatitude").value.trim(),
    longtitude: dom("#storeLongitude").value.trim(),
    description: dom("#storeDescription").value.trim(),
    image: cleanStoreImageUrl(dom("#storeImage").value),
    deleted: !dom("#storeActive").checked,
  };
  if (
    !payload.name ||
    !payload.alias ||
    !payload.latitude ||
    !payload.longtitude
  ) {
    alert("Vui lòng nhập đầy đủ tên, alias, vĩ độ và kinh độ!");
    return;
  }
  let confirmMessage = isUpdating
    ? `Bạn có chắc muốn cập nhật cửa hàng "${payload.name}" không?`
    : `Bạn có chắc muốn thêm cửa hàng "${payload.name}" không?`;
  let isConfirmed = window.confirm(confirmMessage);
  if (!isConfirmed) {
    return;
  }

  // console.log("👉 Payload gửi API:", payload);
  let submitButton = dom("#btnSubmitStore");
  try {
    submitButton.disabled = true;
    if (isUpdating) {
      await updateStore(payload);
    } else {
      await addStore(payload);
    }
    await reloadStores(false);
    resetStoreForm();
    formMode = "create";
    editingStoreId = null;
    window.closeModal("storeModal");
    alert(
      isUpdating
        ? "Cập nhật cửa hàng thành công!"
        : "Thêm cửa hàng thành công!",
    );
  } catch (err) {
    console.error("👉 Lỗi lưu cửa hàng:", err.response?.data || err);
    console.log("👉 Payload:", payload);
    console.log("👉 Status:", err.response?.status);
    alert(
      err.response?.data?.content ||
        err.response?.data?.message ||
        err.message ||
        (isUpdating
          ? "Cập nhật cửa hàng thất bại!"
          : "Thêm cửa hàng thất bại!"),
    );
  } finally {
    submitButton.disabled = false;
  }
};

// MỞ MODAL CHỈNH SỬA
window.editStore = (storeId) => {
  let store = stores.find((item) => {
    return Number(item.id) === Number(storeId);
  });
  if (!store) {
    alert("Không tìm thấy cửa hàng!");
    return;
  }
  resetStoreForm();
  formMode = "update";
  editingStoreId = Number(store.id);
  dom("#storeModalTitle").textContent = "CHỈNH SỬA CỬA HÀNG";
  dom("#btnSubmitStore span").textContent = "Lưu thay đổi";
  dom("#storeName").value = store.name || "";
  dom("#storeAlias").value = store.alias || "";
  dom("#storeLatitude").value = store.latitude || "";
  dom("#storeLongitude").value = store.longtitude || "";
  dom("#storeDescription").value = store.description || "";
  dom("#storeImage").value = cleanStoreImageUrl(store.image);
  dom("#storeActive").checked = store.deleted !== true;
  window.changeStoreStatus();
  window.previewStoreImage();
  console.log("👉 Cửa hàng đang chỉnh sửa:", store);
  window.openModal("storeModal");
};

// XÓA CỬA HÀNG
window.handleDeleteStore = async (storeId) => {
  let store = stores.find((item) => {
    return Number(item.id) === Number(storeId);
  });
  let storeName = store?.name || `ID ${storeId}`;
  let isConfirmed = window.confirm(
    `Bạn có chắc muốn xóa cửa hàng "${storeName}" không?`,
  );
  if (!isConfirmed) {
    return;
  }
  try {
    await deleteStore(storeId);
    await reloadStores(true);
    alert("Xóa cửa hàng thành công!");
  } catch (err) {
    console.error("👉 Lỗi xóa cửa hàng:", err.response?.data || err);
    alert(
      err.response?.data?.content ||
        err.response?.data?.message ||
        err.message ||
        "Xóa cửa hàng thất bại!",
    );
  }
};

// KHỞI TẠO TRANG
let initStore = async () => {
  try {
    await reloadStores(false);
  } catch (err) {
    console.error("👉 Lỗi tải danh sách:", err);
    stores = [];
    filteredStores = [];
    renderStores();
  }
};

initStore();

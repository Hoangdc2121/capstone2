import { getStore, addStore } from "../../services/storeService.js";

// Danh sách cửa hàng
let stores = [];

// DOM helper
let dom = (selector) => {
  return document.querySelector(selector);
};

// ================================
// HÌNH ẢNH
// ================================

const STORE_IMAGE_PREFIX = "https://apistore.cybersoft.edu.vn/images/";

const STORE_PLACEHOLDER =
  "https://placehold.co/80x80/f5f5f5/737373?text=No+Image";

let getStoreImageUrl = (image) => {
  let imageUrl = String(image || "").trim();

  // Không có hình hoặc API trả chuỗi mặc định
  if (imageUrl === "" || imageUrl.toLowerCase() === "string") {
    return STORE_PLACEHOLDER;
  }

  // API nối sai đường dẫn:
  // /images/https://images.unsplash.com/...
  while (imageUrl.startsWith(STORE_IMAGE_PREFIX + "http")) {
    imageUrl = imageUrl.replace(STORE_IMAGE_PREFIX, "");
  }

  // URL đầy đủ
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  // API chỉ trả tên file
  return STORE_IMAGE_PREFIX + imageUrl;
};

// ================================
// MỞ MODAL THÊM CỬA HÀNG
// ================================

window.openCreateStoreModal = () => {
  let storeForm = dom("#storeForm");
  let submitText = dom("#btnSubmitStore span");
  let storeActive = dom("#storeActive");

  storeForm.reset();

  // Trạng thái mặc định: đang hoạt động
  storeActive.checked = true;

  submitText.textContent = "Thêm cửa hàng";

  window.openModal("storeModal");
};

// ================================
// RENDER DANH SÁCH CỬA HÀNG
// ================================

let renderStore = (data) => {
  let storeTableBody = dom("#storeTableBody");

  if (!storeTableBody) {
    console.error("Không tìm thấy #storeTableBody");

    return;
  }

  if (!Array.isArray(data) || data.length === 0) {
    storeTableBody.innerHTML = `
      <tr>
        <td colspan="7" class="table-empty">
          Không có cửa hàng nào.
        </td>
      </tr>
    `;

    return;
  }

  let content = data
    .map((item, index) => {
      let imageUrl = getStoreImageUrl(item.image);

      let statusText = item.deleted ? "Ngừng hoạt động" : "Đang hoạt động";

      let statusClass = item.deleted ? "inactive" : "active";

      return `
        <tr>
          <td>${index + 1}</td>

          <td>
            <div class="store-info">
              <img
                src="${imageUrl}"
                alt="${item.name || "Cửa hàng"}"
                class="store-image"
                onerror="
                  this.onerror = null;
                  this.src = '${STORE_PLACEHOLDER}';
                "
              />

              <div class="store-info-content">
                <strong class="store-name">
                  ${item.name || "Chưa có tên"}
                </strong>

                <span class="store-alias">
                  ${item.alias || "Chưa có alias"}
                </span>
              </div>
            </div>
          </td>

          <td>
            <p class="store-address">
              ${item.description || "Chưa có địa chỉ"}
            </p>
          </td>

          <td>
            <span class="store-coordinate">
              ${item.latitude || "—"}
            </span>
          </td>

          <td>
            <span class="store-coordinate">
              ${item.longtitude || "—"}
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
                aria-label="Chỉnh sửa cửa hàng"
                onclick="openEditStoreModal(${item.id})"
              >
                <i class="fa-solid fa-pen"></i>
              </button>

              <button
                type="button"
                class="action-button-delete"
                aria-label="Xóa cửa hàng"
                onclick="handleDeleteStore(${item.id})"
              >
                <i class="fa-regular fa-trash-can"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");

  storeTableBody.innerHTML = content;
};

// ================================
// LẤY VÀ RENDER DANH SÁCH
// ================================

let initStore = async () => {
  try {
    stores = await getStore();

    console.log("👉 Danh sách cửa hàng:", stores);

    renderStore(stores);
  } catch (err) {
    console.log("👉 Lỗi tải danh sách cửa hàng:", err);

    stores = [];

    renderStore(stores);
  }
};

// ================================
// THÊM CỬA HÀNG
// ================================

window.handleSubmitStore = async (event) => {
  event.preventDefault();

  let name = dom("#storeName").value.trim();
  let alias = dom("#storeAlias").value.trim();
  let latitude = dom("#storeLatitude").value.trim();
  let longtitude = dom("#storeLongitude").value.trim();

  let description = dom("#storeDescription").value.trim();

  let image = dom("#storeImage").value.trim();
  let storeActive = dom("#storeActive").checked;

  // Kiểm tra thông tin bắt buộc
  if (!name || !alias || !latitude || !longtitude) {
    alert("Vui lòng nhập đầy đủ tên, alias, vĩ độ và kinh độ!");

    return;
  }

  let storeData = {
    id: 0,
    name,
    alias,
    latitude,

    // API sử dụng tên longtitude
    longtitude,

    description,
    image,

    // Toggle bật = hoạt động = deleted false
    deleted: !storeActive,
  };

  console.log("👉 Dữ liệu chuẩn bị thêm:", storeData);

  let submitButton = dom("#btnSubmitStore");

  try {
    // Chặn bấm submit nhiều lần
    submitButton.disabled = true;

    let response = await addStore(storeData);

    console.log("👉 Kết quả thêm cửa hàng:", response);

    alert("Thêm cửa hàng thành công!");

    dom("#storeForm").reset();

    window.closeModal("storeModal");

    // Lấy lại danh sách mới nhất
    await initStore();
  } catch (err) {
    console.error("👉 Toàn bộ lỗi:", err);
    console.log("👉 Status:", err.response?.status);
    console.log("👉 Data lỗi:", err.response?.data);

    let errorMessage =
      err.response?.data?.message ||
      err.response?.data?.content ||
      "Thêm cửa hàng thất bại!";

    alert(errorMessage);
  } finally {
    submitButton.disabled = false;
  }
};

// ================================
// KHỞI TẠO TRANG
// ================================

initStore();

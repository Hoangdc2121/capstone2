// import { ProductType } from "../../models/ProductType.js";
import {
  getCategories,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../services/productService.js";
import { paginate } from "../../utils/pagination.js";
let dom = (sel) => {
  return document.querySelector(sel);
};

// trạng thái sản phẩm
let products = [];
let currentPage = 1;
let pageSize = 10;
let filteredProducts = [];
let categories = [];
let selectedRelatedProductIds = [];
let formMode = "create";
let editingProductId = null;

// mở modal
window.openCreateProductModal = () => {
  formMode = "create";
  editingProductId = null;

  resetProductForm();

  dom("#productModalTitle").textContent = "THÊM SẢN PHẨM";
  dom("#btnSubmitProduct span").textContent = "Thêm sản phẩm";

  window.openModal("productModal");
};

// Lấy các size đang có class active
let getSelectedSizes = () => {
  return Array.from(
    document.querySelectorAll("#productForm .size-option.active"),
  ).map((button) => {
    return Number(button.dataset.size);
  });
};

// Lấy các category đang có class active
let getSelectedCategories = () => {
  return Array.from(
    document.querySelectorAll("#productCategoryList .category-option.active"),
  ).map((button) => {
    return {
      id: button.dataset.id,
      category: button.dataset.category,
    };
  });
};

let parseProductCategories = (categoryData) => {
  try {
    if (typeof categoryData === "string") {
      return JSON.parse(categoryData);
    }
    return Array.isArray(categoryData) ? categoryData : [];
  } catch (error) {
    console.error("Categories không đúng định dạng:", categoryData);

    return [];
  }
};

function renderProducts() {
  const pagination = paginate(filteredProducts, currentPage, pageSize);
  let content = pagination.currentItems
    .map((item, index) => {
      let {
        id,
        name,
        image,
        imgLink,
        categories: productCategories,
        price,
        shortDescription,
        description,
      } = item;
      let productImage = imgLink || image || "./images/product-placeholder.png";
      let parsedCategories = parseProductCategories(productCategories);
      let productCategory = parsedCategories?.[0]?.category || "Chưa phân loại";
      let productDescription =
        shortDescription || description || "Chưa có mô tả";
      return `
            <tr>
            <td>
                ${pagination.startIndex + index + 1}
            </td>

            <td>
                <img
                src="${productImage}"
                alt="${name}"
                class="product-image"
                />
            </td>

            <td>
                <p class="product-name">
                ${name}
                </p>
            </td>

            <td>
                <span class="category-badge">
                ${productCategory}
                </span>
            </td>

            <td>
                ${Number(price).toLocaleString("vi-VN")} ₫
            </td>
            <td>
                <p class="product-short-description">
                ${productDescription}
                </p>
            </td>
            <td>
                <div class="product-actions">
                <button
                    type="button"
                    class="action-button-edit"
                    aria-label="Sửa sản phẩm"
                    onclick="editProduct(${id})"
                >
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button
                    type="button"
                    class="action-button-delete"
                    aria-label="Xóa sản phẩm"
                    onclick="handleDeleteProduct(${id})"
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
                <td colspan="7">
                Không có sản phẩm nào.
                </td>
            </tr>
        `;
  }
  dom("#productTableBody").innerHTML = content;
  renderPagination(pagination);
}

// render phẩn loại sản phẩm
let renderCategories = () => {
  let content = categories
    .filter((item) => !item.deleted)
    .map((item) => {
      let { id, category } = item;
      return `
            <option value="${id}">
                ${category}
            </option>
        `;
    })
    .join("");
  dom("#categoryFilter").innerHTML = `
        <option value="">Tất cả phân loại</option>
        ${content}
    `;
};

// render thông tin và trạng thái nút pagination
let renderPagination = (pagination) => {
  let previousButton = dom("#previousPage");
  let nextButton = dom("#nextPage");
  dom("#productPagination").innerHTML = `
        Hiển thị ${pagination.startItem} - ${pagination.endItem}
        của ${pagination.totalItems} sản phẩm
    `;
  previousButton.disabled = currentPage <= 1;
  nextButton.disabled =
    pagination.totalPages === 0 || currentPage >= pagination.totalPages;
};
// chuyển đế trang tiếp theo
window.previousPage = () => {
  if (currentPage <= 1) {
    return;
  }
  currentPage--;
  renderProducts();
};

// chuyển về trang trước
window.nextPage = () => {
  let pagination = paginate(filteredProducts, currentPage, pageSize);
  if (currentPage >= pagination.totalPages) {
    return;
  }
  currentPage++;
  renderProducts();
};

// lọc or search
window.filterProducts = () => {
  let searchValue = dom("#searchProduct").value.trim().toLowerCase();
  let selectedCategoryId = dom("#categoryFilter").value;
  filteredProducts = products.filter((item) => {
    let productName = String(item.name || "").toLowerCase();
    let productId = String(item.id || "").toLowerCase();
    let productCategories = parseProductCategories(item.categories);
    let matchedSearch =
      productName.includes(searchValue) || productId.includes(searchValue);
    let matchedCategory =
      selectedCategoryId === "" ||
      productCategories.some((categoryItem) => {
        return (
          String(categoryItem.id).toUpperCase() ===
            String(selectedCategoryId).toUpperCase() ||
          String(categoryItem.category).toUpperCase() ===
            String(selectedCategoryId).toUpperCase()
        );
      });
    return matchedSearch && matchedCategory;
  });
  currentPage = 1;
  renderProducts();
};

// thêm sản phẩm
// hàm chọn size
window.toggleSize = (button) => {
  button.classList.toggle("active");
  let selectedSizes = getSelectedSizes();
  dom("#productSizes").value = JSON.stringify(selectedSizes);
  dom("#selectedSizeInfo").innerHTML =
    selectedSizes.length > 0
      ? `Đã chọn: ${selectedSizes.join(", ")}`
      : "Chưa chọn kích thước.";
};

// Chuyển size dạng mảng hoặc chuỗi từ API thành mảng số hợp lệ
let parseProductSizes = (sizeData) => {
  if (Array.isArray(sizeData)) {
    return sizeData.map(Number).filter(Number.isFinite);
  }
  if (typeof sizeData === "string") {
    try {
      let parsedData = JSON.parse(sizeData);
      if (Array.isArray(parsedData)) {
        return parsedData.map(Number).filter(Number.isFinite);
      }
    } catch (error) {
      return sizeData
        .replaceAll("[", "")
        .replaceAll("]", "")
        .split(",")
        .map(Number)
        .filter(Number.isFinite);
    }
  }

  return [];
};

// hàm renderformsizes
let renderFormSizes = () => {
  let allSizes = products.flatMap((product) => {
    let sizeValues = parseProductSizes(product.size);
    let sizesValues = parseProductSizes(product.sizes);
    return [...sizeValues, ...sizesValues];
  });
  let uniqueSizes = [...new Set(allSizes)].sort((a, b) => {
    return a - b;
  });
  let content = uniqueSizes
    .map((size) => {
      return `
        <button
          type="button"
          class="size-option"
          data-size="${size}"
          onclick="toggleSize(this)"
        >
          ${size}
        </button>
      `;
    })
    .join("");
  let productSizeList = dom("#productSizeList");
  if (productSizeList) {
    productSizeList.innerHTML = content;
  }
};

// hàm lấy loại
window.toggleCategory = (button) => {
  button.classList.toggle("active");
  let selectedCategories = getSelectedCategories();
  let categoryNames = selectedCategories.map((item) => item.category);
  let selectedCategoryInfo = dom("#selectedCategoryInfo");
  if (selectedCategoryInfo) {
    selectedCategoryInfo.innerHTML =
      categoryNames.length > 0
        ? `Đã chọn: ${categoryNames.join(", ")}`
        : "Chưa chọn phân loại.";
  }
};

// render loại
let renderFormCategories = () => {
  let content = categories
    .filter((item) => !item.deleted)
    .map((item) => {
      let { id, category } = item;
      return `
         <button
          type="button"
          class="category-option"
          data-id="${id}"
          data-category="${category}"
          onclick="toggleCategory(this)"
        >
          <i class="fa-solid fa-check"></i>
          <span>${category}</span>
        </button>
      `;
    })
    .join("");
  dom("#productCategoryList").innerHTML = content;
};

// tìm sản phẩm liên quan
window.searchRelatedProducts = () => {
  let keyword = dom("#relatedProductSearch").value.trim().toLowerCase();
  if (keyword === "") {
    dom("#relatedProductResults").innerHTML = "";
    return;
  }
  let results = products.filter((item) => {
    let productName = String(item.name || "").toLowerCase();
    let productId = String(item.id);
    let matchedSearch =
      productName.includes(keyword) || productId.includes(keyword);
    let hasSelected = selectedRelatedProductIds.some((id) => {
      return Number(id) === Number(item.id);
    });
    return matchedSearch && !hasSelected;
  });
  dom("#relatedProductResults").innerHTML = results
    .map((item) => {
      let { id, name, image, imgLink, price } = item;
      let productImage = image || imgLink || "./images/product-placeholder.png";
      return `
            <button
                type="button"
                class="related-item"
                data-id="${id}"
                onclick="selectRelatedProduct(this)"
            >
            <img
                src="${productImage}"
                alt="${name}"
                class="related-product-image"
            />
            <span class="related-item-content">
                <strong>${name}</strong>
                <small>
                ID: ${id} ·
                ${Number(price).toLocaleString("vi-VN")} ₫
                </small>
            </span>
            </button>
        `;
    })
    .join("");
};

// chọn sản phẩm
window.selectRelatedProduct = (button) => {
  let productId = Number(button.dataset.id);
  if (!selectedRelatedProductIds.includes(productId)) {
    selectedRelatedProductIds.push(productId);
  }
  dom("#relatedProductSearch").value = "";
  dom("#relatedProductResults").innerHTML = "";
  renderSelectedRelatedProducts();
};

// render chọn sản phẩm liên quan
let renderSelectedRelatedProducts = () => {
  let selectedProducts = products.filter((item) => {
    return selectedRelatedProductIds.some((id) => {
      return Number(id) === Number(item.id);
    });
  });
  dom("#selectedRelatedProducts").innerHTML = selectedProducts
    .map((item) => {
      let { id, name, image, imgLink, price } = item;
      let productImage = image || imgLink || "./images/product-placeholder.png";
      return `
        <div class="selected-product-item">
            <div class="selected-product-info">
              <img src="${productImage}" alt="${name}" />

              <div class="selected-product-content">
                <strong>${name}</strong>

                <small>
                  ID: ${id} ·
                  ${Number(price).toLocaleString("vi-VN")} ₫
                </small>
              </div>
            </div>

            <button
              type="button"
              class="remove-related-product"
              data-id="${id}"
              onclick="removeRelatedProduct(this)"
              aria-label="Bỏ sản phẩm liên quan"
            >
              <i class="fa-solid fa-xmark"></i>
            </button>
        </div>
    `;
    })
    .join("");
};

// bỏ sản phẩm liên quan đã chọn
window.removeRelatedProduct = (button) => {
  let productId = Number(button.dataset.id);
  selectedRelatedProductIds = selectedRelatedProductIds.filter((id) => {
    return Number(id) !== productId;
  });
  renderSelectedRelatedProducts();
};

// gắn hình ảnh
window.previewProductImage = () => {
  let imageUrl = dom("#productImage").value.trim();
  let imgLinkUrl = dom("#productImgLink").value.trim();
  let previewImage = dom("#productPreviewImage");
  let placeholder = dom("#productImagePlaceholder");
  // Ưu tiên trường image
  let previewUrl = imageUrl || imgLinkUrl;
  if (previewUrl === "") {
    previewImage.removeAttribute("src");
    previewImage.hidden = true;
    placeholder.hidden = false;
    return;
  }
  previewImage.onload = () => {
    previewImage.hidden = false;
    placeholder.hidden = true;
  };
  previewImage.onerror = () => {
    previewImage.removeAttribute("src");
    previewImage.hidden = true;
    placeholder.hidden = false;
  };
  previewImage.src = previewUrl;
};

// hàm tải lại sản phẩm
let reloadProducts = async (preserveFilters = true) => {
  products = await getProducts();
  categories = await getCategories();
  if (!Array.isArray(products)) {
    products = [];
  }
  if (!Array.isArray(categories)) {
    categories = [];
  }
  renderFormSizes();
  renderCategories();
  renderFormCategories();
  if (preserveFilters) {
    window.filterProducts();
    return;
  }
  dom("#searchProduct").value = "";
  dom("#categoryFilter").value = "";
  filteredProducts = [...products];
  currentPage = 1;
  renderProducts();
};

// hàm reset
let resetProductForm = () => {
  dom("#productForm").reset();
  document
    .querySelectorAll("#productForm .size-option.active")
    .forEach((button) => {
      button.classList.remove("active");
    });
  document
    .querySelectorAll("#productForm .category-option.active")
    .forEach((button) => {
      button.classList.remove("active");
    });
  selectedRelatedProductIds = [];
  let relatedSearch = dom("#relatedProductSearch");
  let relatedResults = dom("#relatedProductResults");
  if (relatedSearch) {
    relatedSearch.value = "";
  }
  if (relatedResults) {
    relatedResults.innerHTML = "";
  }
  renderSelectedRelatedProducts();
  let selectedSizeInfo = dom("#selectedSizeInfo");
  let selectedCategoryInfo = dom("#selectedCategoryInfo");
  if (selectedSizeInfo) {
    selectedSizeInfo.innerHTML = "Chưa chọn kích thước.";
  }
  if (selectedCategoryInfo) {
    selectedCategoryInfo.innerHTML = "Chưa chọn phân loại.";
  }
  let previewImage = dom("#productPreviewImage");
  let placeholder = dom("#productImagePlaceholder");
  if (previewImage) {
    previewImage.removeAttribute("src");
    previewImage.hidden = true;
  }
  if (placeholder) {
    placeholder.hidden = false;
  }
};

// hàm submit
window.handleSubmitProduct = async (event) => {
  event.preventDefault();
  let selectedSizes = getSelectedSizes();
  let selectedCategories = getSelectedCategories();
  let isUpdating = formMode === "update";
  let payload = {
    id: formMode === "update" ? editingProductId : 0,
    name: dom("#productName").value.trim(),
    alias: dom("#productAlias").value.trim(),
    price: Number(dom("#productPrice").value),
    description: dom("#productDescription").value.trim(),
    size: selectedSizes,
    sizes: selectedSizes.join(","),
    shortDescription: dom("#productShortDescription").value.trim(),
    quantity: Number(dom("#productQuantity").value),
    categories: selectedCategories,
    relatedProducts: selectedRelatedProductIds.map(Number),
    image: dom("#productImage").value.trim(),
    imgLink: dom("#productImgLink").value.trim(),
  };
  let confirmMessage = isUpdating
    ? `Bạn có chắc muốn cập nhật sản phẩm "${payload.name}" không?`
    : `Bạn có chắc muốn thêm sản phẩm "${payload.name}" không?`;
  let isConfirmed = confirm(confirmMessage);
  if (!isConfirmed) {
    return;
  }
  console.log("👉 Payload gửi lên API:", payload);
  try {
    if (isUpdating) {
      await updateProduct(payload);
    } else {
      await createProduct(payload);
    }
    await reloadProducts(false);
    resetProductForm();
    window.closeModal("productModal");
    alert(
      isUpdating
        ? "Cập nhật sản phẩm thành công!"
        : "Thêm sản phẩm thành công!",
    );
  } catch (err) {
    alert(
      formMode === "update"
        ? "Cập nhật sản phẩm thất bại!"
        : "Thêm sản phẩm thất bại!",
    );
    console.error("👉 Lỗi lưu sản phẩm:", err.response?.data || err);
  }
};

// hàm chỉnh sửa, mở modal sửa
window.editProduct = (productId) => {
  let product = products.find((item) => Number(item.id) === Number(productId));
  if (!product) {
    alert("Không tìm thấy sản phẩm!");
    return;
  }
  resetProductForm();
  formMode = "update";
  editingProductId = Number(product.id);
  dom("#productModalTitle").textContent = "CHỈNH SỬA SẢN PHẨM";
  dom("#btnSubmitProduct span").textContent = "Lưu thay đổi";
  dom("#productName").value = product.name || "";
  dom("#productAlias").value = product.alias || "";
  dom("#productPrice").value = product.price || 0;
  dom("#productQuantity").value = product.quantity || 0;
  dom("#productShortDescription").value = product.shortDescription || "";
  dom("#productDescription").value = product.description || "";
  dom("#productImage").value = product.image || "";
  dom("#productImgLink").value = product.imgLink || "";
  fillProductSize(product);
  fillProductCategories(product);
  fillRelatedProducts(product);
  window.previewProductImage();
  window.openModal("productModal");
};

// hàm lấy lại kích thước cho phần chỉnh sửa
let fillProductSize = (product) => {
  let productSizes = [];
  if (Array.isArray(product.sizes)) {
    productSizes = product.sizes.map(Number);
  } else if (Array.isArray(product.size)) {
    productSizes = product.size.map(Number);
  } else {
    productSizes = parseProductSizes(product.sizes || product.size);
  }
  document.querySelectorAll("#productForm .size-option").forEach((button) => {
    let buttonSize = Number(button.dataset.size);
    button.classList.toggle("active", productSizes.includes(buttonSize));
  });
  dom("#productSizes").value = JSON.stringify(productSizes);
  let selectedSizeInfo = dom("#selectedSizeInfo");
  if (selectedSizeInfo) {
    selectedSizeInfo.textContent =
      productSizes.length > 0
        ? `Đã chọn: ${productSizes.join(", ")}`
        : "Chưa chọn kích thước.";
  }
  console.log("👉 Size lấy được:", productSizes);
};

// hàm lấy loại sản phẩm cho phần chỉnh sửa
let fillProductCategories = (product) => {
  let productCategories = parseProductCategories(product.categories);
  document
    .querySelectorAll("#productCategoryList .category-option")
    .forEach((button) => {
      let isSelected = productCategories.some((category) => {
        return (
          String(category.id).toUpperCase() ===
          String(button.dataset.id).toUpperCase()
        );
      });

      button.classList.toggle("active", isSelected);
    });
  let categoryNames = productCategories.map((item) => {
    return item.category;
  });
  let selectedCategoryInfo = dom("#selectedCategoryInfo");
  if (selectedCategoryInfo) {
    selectedCategoryInfo.textContent =
      categoryNames.length > 0
        ? `Đã chọn: ${categoryNames.join(", ")}`
        : "Chưa chọn phân loại.";
  }
};

// hàm lấy sản phẩm liên quan
let fillRelatedProducts = (product) => {
  let relatedProducts = parseProductCategories(product.relatedProducts);
  selectedRelatedProductIds = relatedProducts
    .map((item) => {
      if (typeof item === "object" && item !== null) {
        return Number(item.id);
      }
      return Number(item);
    })
    .filter(Number.isFinite);
  renderSelectedRelatedProducts();
};

// hàm xóa sản phẩm
window.handleDeleteProduct = async (productId) => {
  let product = products.find((item) => {
    return Number(item.id) === Number(productId);
  });
  let productName = product?.name || `ID ${productId}`;
  let isConfirmed = confirm(
    `Bạn có chắc muốn xóa sản phẩm "${productName}" Không?`,
  );
  if (!isConfirmed) {
    return;
  }
  try {
    await deleteProduct(productId);
    // Xóa xong vẫn giữ search và category hiện tại
    await reloadProducts(true);
    alert("Xóa sản phẩm thành công!");
  } catch (err) {
    alert("Xóa sản phẩm thất bại!");
    console.error("👉 Lỗi xóa sản phẩm:", err.response?.data || err);
  }
};

let initAdmin = async () => {
  try {
    products = await getProducts();
    categories = await getCategories();
    if (!Array.isArray(products)) {
      products = [];
    }
    if (!Array.isArray(categories)) {
      categories = [];
    }
    filteredProducts = [...products];
    currentPage = 1;
    renderFormSizes();
    renderSelectedRelatedProducts();
    renderFormCategories();
    renderCategories();
    renderProducts();
  } catch (err) {
    console.log("👉 error", err);
    products = [];
    filteredProducts = [];
    categories = [];
    renderFormSizes();
    renderSelectedRelatedProducts();
    renderFormCategories();
    renderCategories();
    renderProducts();
  }
};
initAdmin();

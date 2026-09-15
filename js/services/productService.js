import { PRODUCT_URL, CATEGORIES_URL } from "../config.js";
import { CategoryType } from "../models/CategoryType.js";
import { ProductType } from "../models/ProductType.js";

// lấy tất cả sản phẩm
export async function getProducts() {
  try {
    const res = await axios.get(PRODUCT_URL);
    const data = res.data.content;
    console.log("👉 Sản phẩm:", data);
    return data.map((item) => new ProductType(item));
  } catch (err) {
    console.log("👉 error", err);
  }
}
getProducts();

// phân loại sản phẩm
export async function getCategories() {
  try {
    const res = await axios.get(CATEGORIES_URL);
    const data = res.data.content || res.data;
    // console.log("👉 Danh sách phân loại", data);
    return data.map((item) => new CategoryType(item));
  } catch (err) {
    console.log("👉 error", err);
  }
}
getCategories();

// thêm mới sản phẩm
export async function createProduct(payload) {
  try {
    const res = await axios.post(PRODUCT_URL, payload);
    return res.data;
  } catch (err) {
    console.log("👉 error", err);
  }
}
// createProduct();

// chỉnh sửa sản phẩm
export async function updateProduct(payload) {
  try {
    const res = await axios.put(PRODUCT_URL, payload);
    console.log("👉 chỉnh sửa sản phẩm:", res);
    return res.data;
  } catch (err) {
    console.log("👉 error", err);
  }
}

// xóa sản phẩm
export async function deleteProduct(productId) {
  try {
    const res = await axios.delete(`${PRODUCT_URL}/${productId}`);
    console.log("👉 Kết quả DELETE:", res.data);
    return res.data;
  } catch (err) {
    console.log("👉 error", err);
  }
}

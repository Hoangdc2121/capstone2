import { STORE_URL } from "../config.js";
import { StoreType } from "../models/StoreType.js";

// Lấy tất cả cửa hàng
export async function getStore() {
  try {
    const res = await axios.get(`${STORE_URL}/getAll`);
    const data = res.data.content || [];
    console.log("👉 Dữ liệu API Store:", data);
    return data.map((item) => new StoreType(item));
  } catch (err) {
    console.error("👉 Lỗi lấy danh sách cửa hàng:", err);
    throw err;
  }
}

// Thêm cửa hàng
export async function addStore(storeData) {
  try {
    const res = await axios.post(STORE_URL, storeData);
    return res.data;
  } catch (err) {
    console.log("👉 Lỗi thêm cửa hàng:", err);
    throw err;
  }
}

// chỉnh sửa
export async function updateStore(storeData) {
  try {
    const res = await axios.put(STORE_URL, storeData);
    console.log("👉 Cập nhật thành công:", res.data);
    return res.data;
  } catch (err) {
    console.error("👉 Lỗi cập nhật:", err);
    throw err;
  }
}

// Xóa cửa hàng
export async function deleteStore(storeId) {
  try {
    const res = await axios.delete(`${STORE_URL}/${storeId}`);
    return res.data;
  } catch (err) {
    console.log("👉 Lỗi xóa cửa hàng:", err);
    throw err;
  }
}

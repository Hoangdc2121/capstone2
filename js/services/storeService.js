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
    console.log("👉 URL thêm cửa hàng:", STORE_URL);
    console.log("👉 Payload thêm cửa hàng:", storeData);
    const res = await axios.post(STORE_URL, storeData);
    console.log("👉 Thêm cửa hàng thành công:", res.data);
    return res.data;
  } catch (err) {
    console.log("👉 Lỗi thêm cửa hàng:", err);
    console.log("👉 Status:", err.response?.status);
    console.log("👉 Data lỗi:", err.response?.data);
    throw err;
  }
}

// chỉnh sửa
export async function updateStore(storeData) {
  try {
    console.log("👉 Dữ liệu gửi cập nhật:", storeData);
    console.log("👉 URL cập nhật:", STORE_URL);
    const res = await axios.put(STORE_URL, storeData);
    console.log("👉 Cập nhật thành công:", res.data);
    return res.data;
  } catch (err) {
    console.error("👉 Lỗi cập nhật:", err);
    console.log("👉 Request URL:", err.config?.url);
    console.log("👉 Status:", err.response?.status);
    console.log("👉 Data:", err.response?.data);
    throw err;
  }
}

// Xóa cửa hàng
export async function deleteStore(storeId) {
  try {
    const res = await axios.delete(`${STORE_URL}/${storeId}`);
    console.log("👉 Xóa cửa hàng thành công:", res.data);
    return res.data;
  } catch (err) {
    console.log("👉 Lỗi xóa cửa hàng:", err);
    console.log("👉 Status:", err.response?.status);
    console.log("👉 Data lỗi:", err.response?.data);
    throw err;
  }
}

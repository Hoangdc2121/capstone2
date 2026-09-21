import { STORE_URL } from "../config.js";
import { StoreType } from "../models/StoreType.js";

// Lấy tất cả cửa hàng
export async function getStore() {
  try {
    const res = await axios.get(`${STORE_URL}/getAll`);

    const data = res.data.content || res.data;

    console.log("👉 Danh sách cửa hàng:", data);

    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((item) => {
      return new StoreType(item);
    });
  } catch (err) {
    console.log("👉 Lỗi lấy cửa hàng:", err);
    console.log("👉 Data lỗi:", err.response?.data);

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

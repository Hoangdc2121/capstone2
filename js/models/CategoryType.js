export class CategoryType {
  constructor(data = {}) {
    this.id = data.id || "";
    this.category = data.category || "";
    this.alias = data.alias || "";
    this.deleted = data.deleted ?? false;

    this.categoryParent = this.parseJsonArray(data.categoryParent);

    this.categoryChild = this.parseJsonArray(data.categoryChild);

    this.productList = this.parseJsonArray(data.productList);
  }
  parseJsonArray(value) {
    try {
      if (Array.isArray(value)) {
        return value;
      }
      if (typeof value === "string") {
        return JSON.parse(value);
      }
      return [];
    } catch (error) {
      console.error("Dữ liệu không hợp lệ", value);
      return [];
    }
  }
}

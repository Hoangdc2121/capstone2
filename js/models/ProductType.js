export class ProductType {
  constructor(data = {}) {
    this.id = data.id;
    this.name = data.name;
    this.alias = data.alias;
    this.price = data.price;
    this.description = data.description;
    this.size = data.size;
    this.shortDescription = data.shortDescription;
    this.sizes = data.sizes;
    this.quantity = data.quantity;
    this.image = data.image;
    this.imgLink = data.imgLink;
    this.feature = data.feature;
    this.relatedProducts = data.relatedProducts;
    this.categories = data.categories;
  }
}

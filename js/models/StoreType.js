export class StoreType {
  constructor(data = {}) {
    this.id = data.id;
    this.name = data.name;
    this.alias = data.alias;
    this.latitude = data.latitude;
    this.longtitude = data.longtitude;
    this.description = data.description;
    this.image = data.image;
  }
}

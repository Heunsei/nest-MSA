export class DeliveryAddressEntity {
  name: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;

  constructor(param: DeliveryAddressEntity) {
    this.name = param.name;
    this.street = param.street;
    this.city = param.city;
    this.postalCode = param.postalCode;
    this.country = param.postalCode;
  }
}

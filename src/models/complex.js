import { Location } from './location.js'

export class Complex {
  constructor({
    idComplex,
    nameComplex,
    addressComplex,
    idLocation,
    idAdmin = null,
    location = null,
    admin = null,
    courts = []
  }) {
    this.idComplex = idComplex
    this.nameComplex = nameComplex
    this.addressComplex = addressComplex
    this.idLocation = idLocation
    this.idAdmin = idAdmin
    this.location = location ? Location.fromDTO(location) : null
    this.admin = admin
    this.courts = courts
  }

  static fromDTO(dto) {
    return new Complex(dto)
  }

  static fromList(dtos = []) {
    return dtos.map(Complex.fromDTO)
  }

  get locationName() {
    return this.location?.nomLocation ?? null
  }

  // "Rosario Sport Center (Rosario)": para los select, donde el nombre solo puede repetirse entre localidades
  get label() {
    return this.locationName ? `${this.nameComplex} (${this.locationName})` : this.nameComplex
  }

  get hasAdmin() {
    return this.idAdmin !== null && this.idAdmin !== undefined
  }

  toPayload() {
    return {
      nameComplex: this.nameComplex,
      addressComplex: this.addressComplex,
      idLocation: this.idLocation,
      idAdmin: this.idAdmin
    }
  }
}

export default Complex

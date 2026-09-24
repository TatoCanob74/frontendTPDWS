export class Location {
  constructor({ idLocation, nameCountry, nomLocation }) {
    this.idLocation = idLocation
    this.nameCountry = nameCountry
    this.nomLocation = nomLocation
  }

  static fromDTO(dto) {
    return new Location(dto)
  }

  static fromList(dtos = []) {
    return dtos.map(Location.fromDTO)
  }

  toPayload() {
    return {
      nameCountry: this.nameCountry,
      nomLocation: this.nomLocation
    }
  }
}

export default Location

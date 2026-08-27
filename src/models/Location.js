/**
 * Localidad (sede/país donde hay canchas).
 */
export class Location {
  constructor({ idLocation, nameCountry, nomLocation }) {
    this.idLocation = idLocation
    this.nameCountry = nameCountry
    this.nomLocation = nomLocation
  }

  /** Factory Method: construye una instancia desde la respuesta cruda del backend. */
  static fromDTO(dto) {
    return new Location(dto)
  }

  static fromList(dtos = []) {
    return dtos.map(Location.fromDTO)
  }

  /** Los campos que espera el backend al crear o editar. Nunca manda el id. */
  toPayload() {
    return {
      nameCountry: this.nameCountry,
      nomLocation: this.nomLocation
    }
  }
}

export default Location

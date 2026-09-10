import { formatCurrency } from '../utils/currency.js'

/**
 * Servicio adicional (ofrecido junto con la reserva de una cancha).
 */
export class Service {
  constructor({ idService, nameService, priceService, descriptionService }) {
    this.idService = idService
    this.nameService = nameService
    this.priceService = priceService
    this.descriptionService = descriptionService
  }

  /** Factory Method: construye una instancia desde la respuesta cruda del backend. */
  static fromDTO(dto) {
    return new Service(dto)
  }

  static fromList(dtos = []) {
    return dtos.map(Service.fromDTO)
  }

  /** "5000" → "$5.000" */
  get formattedPrice() {
    return formatCurrency(this.priceService)
  }

  /** Los campos que espera el backend al crear o editar. Nunca manda el id. */
  toPayload() {
    return {
      nameService: this.nameService,
      priceService: this.priceService,
      descriptionService: this.descriptionService
    }
  }
}

export default Service

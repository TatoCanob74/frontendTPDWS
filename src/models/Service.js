import { formatCurrency } from '../utils/currency.js'

export class Service {
  constructor({ idService, nameService, priceService, descriptionService }) {
    this.idService = idService
    this.nameService = nameService
    this.priceService = priceService
    this.descriptionService = descriptionService
  }

  static fromDTO(dto) {
    return new Service(dto)
  }

  static fromList(dtos = []) {
    return dtos.map(Service.fromDTO)
  }

  get formattedPrice() {
    return formatCurrency(this.priceService)
  }

  toPayload() {
    return {
      nameService: this.nameService,
      priceService: this.priceService,
      descriptionService: this.descriptionService
    }
  }
}

export default Service

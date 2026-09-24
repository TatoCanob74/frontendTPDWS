import { Horary } from './horary.js'
import { formatCurrency } from '../utils/currency.js'

export const COURT_TYPES = [
  { value: 'FUTBOL', label: 'Fútbol', icon: '⚽' },
  { value: 'TENIS', label: 'Tenis', icon: '🎾' },
  { value: 'PADEL', label: 'Pádel', icon: '🏓' }
]

export class Court {
  constructor({
    idCourt,
    typeCourt,
    nameCourt,
    hourlyPrice,
    stateCourt,
    capacityPlayers,
    idLocateCourt,
    horaries = [],
    location = null
  }) {
    this.idCourt = idCourt
    this.typeCourt = typeCourt
    this.nameCourt = nameCourt
    this.hourlyPrice = hourlyPrice
    this.stateCourt = stateCourt
    this.capacityPlayers = capacityPlayers
    this.idLocateCourt = idLocateCourt
    this.horaries = Horary.fromList(horaries)
    this.location = location
  }

  static fromDTO(dto) {
    return new Court(dto)
  }

  static fromList(dtos = []) {
    return dtos.map(Court.fromDTO)
  }

  get isAvailable() {
    return this.stateCourt === 'DISPONIBLE'
  }

  get typeLabel() {
    return COURT_TYPES.find((t) => t.value === this.typeCourt)?.label ?? this.typeCourt
  }

  get typeIcon() {
    return COURT_TYPES.find((t) => t.value === this.typeCourt)?.icon ?? ''
  }

  get formattedPrice() {
    return formatCurrency(this.hourlyPrice)
  }

  get locationName() {
    return this.location?.nomLocation ?? null
  }

  horariesForDay(day) {
    return this.horaries
      .filter((h) => h.day === day)
      .map((h) =>
        Horary.fromDTO({ ...h, courtName: this.nameCourt, hourlyPrice: this.hourlyPrice })
      )
  }

  toPayload() {
    return {
      typeCourt: this.typeCourt,
      nameCourt: this.nameCourt,
      hourlyPrice: this.hourlyPrice,
      capacityPlayers: this.capacityPlayers,
      idLocateCourt: this.idLocateCourt
    }
  }
}

export default Court

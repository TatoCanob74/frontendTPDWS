import { Horary } from './horary.js'
import { Complex } from './complex.js'
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
    idComplex,
    complex = null,
    horaries = []
  }) {
    this.idCourt = idCourt
    this.typeCourt = typeCourt
    this.nameCourt = nameCourt
    this.hourlyPrice = hourlyPrice
    this.stateCourt = stateCourt
    this.capacityPlayers = capacityPlayers
    this.idComplex = idComplex
    this.complex = complex ? Complex.fromDTO(complex) : null
    this.horaries = Horary.fromList(horaries)
  }

  // La cancha ya no guarda su localidad: la hereda del complejo. Estos dos getters
  // mantienen la misma "forma" que antes, así las pantallas del cliente no cambian.
  get location() {
    return this.complex?.location ?? null
  }

  get idLocateCourt() {
    return this.complex?.idLocation ?? null
  }

  get complexName() {
    return this.complex?.nameComplex ?? null
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
        Horary.fromDTO({ ...h, courtName: this.nameCourt, hourlyPrice: this.hourlyPrice, complexName: this.complexName })
      )
  }

  toPayload() {
    return {
      typeCourt: this.typeCourt,
      nameCourt: this.nameCourt,
      hourlyPrice: this.hourlyPrice,
      capacityPlayers: this.capacityPlayers,
      idComplex: this.idComplex
    }
  }
}

export default Court

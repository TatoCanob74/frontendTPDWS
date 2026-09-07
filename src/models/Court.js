import { Horary } from './Horary.js'

/** Tipos de cancha del enum del backend, con su etiqueta e ícono para la UI. */
export const COURT_TYPES = [
  { value: 'FUTBOL', label: 'Fútbol', icon: '⚽' },
  { value: 'TENIS', label: 'Tenis', icon: '🎾' },
  { value: 'PADEL', label: 'Pádel', icon: '🏓' }
]

const currency = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0
})

/**
 * Cancha.
 *
 * `GET /canchas/verCanchas` devuelve cada cancha con sus horarios anidados bajo
 * la clave "Horarios" (el alias de la asociación en el backend).
 */
export class Court {
  constructor({
    idCourt,
    typeCourt,
    nameCourt,
    hourlyPrice,
    stateCourt,
    capacityPlayers,
    idLocateCourt,
    Horarios = [],
    Localidad = null
  }) {
    this.idCourt = idCourt
    this.typeCourt = typeCourt
    this.nameCourt = nameCourt
    this.hourlyPrice = hourlyPrice
    this.stateCourt = stateCourt
    this.capacityPlayers = capacityPlayers
    this.idLocateCourt = idLocateCourt
    this.horaries = Horary.fromList(Horarios)
    this.location = Localidad
  }

  /** Factory Method: construye una instancia desde la respuesta cruda del backend. */
  static fromDTO(dto) {
    return new Court(dto)
  }

  static fromList(dtos = []) {
    return dtos.map(Court.fromDTO)
  }

  get isAvailable() {
    return this.stateCourt === 'DISPONIBLE'
  }

  /** "FUTBOL" → "Fútbol" */
  get typeLabel() {
    return COURT_TYPES.find((t) => t.value === this.typeCourt)?.label ?? this.typeCourt
  }

  get typeIcon() {
    return COURT_TYPES.find((t) => t.value === this.typeCourt)?.icon ?? ''
  }

  /** "28000.00" → "$28.000" */
  get formattedPrice() {
    return currency.format(Number(this.hourlyPrice))
  }

  /** Nombre de la sede, si el backend lo incluyó en la respuesta. */
  get locationName() {
    return this.location?.nomLocation ?? null
  }

  /**
   * Horarios de esta cancha para un día concreto ('Lunes', 'Martes', …).
   * Se les adjunta el nombre de la cancha para poder distinguir en pantalla dos
   * franjas de la misma hora pertenecientes a canchas diferentes.
   */
  horariesForDay(day) {
    return this.horaries
      .filter((h) => h.day === day)
      .map((h) => Horary.fromDTO({ ...h, courtName: this.nameCourt }))
  }

  /** Los campos que espera el backend al crear o editar. Nunca manda el id. */
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

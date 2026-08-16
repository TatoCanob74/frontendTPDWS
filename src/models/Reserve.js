import { Court } from './Court.js'
import { Horary } from './Horary.js'

const currency = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0
})

/**
 * Reserva.
 *
 * `Cancha` y `Horarios` solo vienen cuando el endpoint las incluye; por eso
 * todos los getters que dependen de ellas toleran que falten.
 */
export class Reserve {
  constructor({
    idReserve,
    dateReserve,
    totalAmount,
    stateReserva,
    paymentId,
    paymentStatus,
    idUser,
    idCourt,
    idHorary,
    Cancha = null,
    Horario = null,
    Servicios = []
  }) {
    this.idReserve = idReserve
    this.dateReserve = dateReserve
    this.totalAmount = totalAmount
    this.stateReserva = stateReserva
    this.paymentId = paymentId
    this.paymentStatus = paymentStatus
    this.idUser = idUser
    this.idCourt = idCourt
    this.idHorary = idHorary
    this.court = Cancha ? Court.fromDTO(Cancha) : null
    this.horary = Horario ? Horary.fromDTO(Horario) : null
    this.services = Servicios
  }

  /** Factory Method: construye una instancia desde la respuesta cruda del backend. */
  static fromDTO(dto) {
    return new Reserve(dto)
  }

  static fromList(dtos = []) {
    return dtos.map(Reserve.fromDTO)
  }

  get formattedAmount() {
    return currency.format(Number(this.totalAmount))
  }

  get isPending() {
    return this.stateReserva === 'pendiente'
  }

  get isPaid() {
    return this.stateReserva === 'confirmada'
  }

  get isCancelled() {
    return this.stateReserva === 'cancelada'
  }

  /** Solo las reservas pendientes se pueden cancelar (el backend además exige 6 h de anticipación). */
  get canBeCancelled() {
    return this.isPending
  }

  /** "Fútbol" si el endpoint incluyó la cancha; si no, null. */
  get courtLabel() {
    return this.court?.typeLabel ?? null
  }

  /** "18:00 - 19:00" si el endpoint incluyó el horario; si no, null. */
  get scheduleLabel() {
    return this.horary?.label ?? null
  }
}

export default Reserve

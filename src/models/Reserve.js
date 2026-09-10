import { Court } from './Court.js'
import { Horary } from './Horary.js'
import { formatCurrency } from '../utils/currency.js'

/** Estados de pago que devuelve MercadoPago, con su texto para la UI. */
const PAYMENT_LABELS = {
  approved: 'Pago aprobado',
  authorized: 'Pago autorizado',
  in_process: 'Pago en revisión',
  in_mediation: 'Pago en disputa',
  pending: 'Pago pendiente',
  rejected: 'Pago rechazado',
  cancelled: 'Pago cancelado',
  refunded: 'Pago devuelto',
  charged_back: 'Pago con contracargo'
}

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
    return formatCurrency(this.totalAmount)
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

  /** "Pago aprobado" si ya hubo un intento de pago; null si todavía no se pagó. */
  get paymentLabel() {
    if (!this.paymentStatus) return null
    return PAYMENT_LABELS[this.paymentStatus] ?? `Pago: ${this.paymentStatus}`
  }

  /** Una reserva pendiente sin pago aprobado se puede (re)pagar. */
  get canBePaid() {
    return this.isPending && this.paymentStatus !== 'approved'
  }
}

export default Reserve

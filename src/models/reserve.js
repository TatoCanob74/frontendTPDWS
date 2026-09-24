import { Court } from './court.js'
import { Horary } from './horary.js'
import { formatCurrency } from '../utils/currency.js'

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
    court = null,
    horary = null,
    services = []
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
    this.court = court ? Court.fromDTO(court) : null
    this.horary = horary ? Horary.fromDTO(horary) : null
    this.services = services
  }

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

  get canBeCancelled() {
    return this.isPending
  }

  get courtLabel() {
    return this.court?.typeLabel ?? null
  }

  get scheduleLabel() {
    return this.horary?.label ?? null
  }

  get paymentLabel() {
    if (!this.paymentStatus) return null
    return PAYMENT_LABELS[this.paymentStatus] ?? `Pago: ${this.paymentStatus}`
  }

  get canBePaid() {
    return this.isPending && this.paymentStatus !== 'approved'
  }
}

export default Reserve

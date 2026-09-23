import { Court } from './Court.js'
import { Horary } from './Horary.js'
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

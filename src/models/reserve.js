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

// Igual que en el backend (pagoController): quien paga en efectivo deja una seña online
export const DEPOSIT_PERCENT = 25

// Igual que en el backend: una reserva pendiente sin pagar vence pasado este plazo
export const PAYMENT_WINDOW_MINUTES = 30

const timeFormatter = new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit' })

export function depositFor(totalAmount) {
  return Math.ceil((Number(totalAmount) * DEPOSIT_PERCENT) / 100)
}

export class Reserve {
  constructor({
    idReserve,
    dateReserve,
    totalAmount,
    stateReserva,
    paymentId,
    paymentStatus,
    paymentMethod = 'MERCADO_PAGO',
    depositAmount = null,
    cashPaidAt = null,
    createdReserve = null,
    idUser,
    idCourt,
    idHorary,
    court = null,
    horary = null,
    services = [],
    user = null
  }) {
    this.idReserve = idReserve
    this.dateReserve = dateReserve
    this.totalAmount = totalAmount
    this.stateReserva = stateReserva
    this.paymentId = paymentId
    this.paymentStatus = paymentStatus
    this.paymentMethod = paymentMethod
    this.depositAmount = depositAmount
    this.cashPaidAt = cashPaidAt
    this.createdReserve = createdReserve
    this.idUser = idUser
    this.idCourt = idCourt
    this.idHorary = idHorary
    this.court = court ? Court.fromDTO(court) : null
    this.horary = horary ? Horary.fromDTO(horary) : null
    this.services = services
    // Solo lo trae el detalle (GET /reservas/:id): quién hizo la reserva
    this.user = user
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

  get isAbsent() {
    return this.stateReserva === 'ausente'
  }

  get isExpired() {
    return this.stateReserva === 'vencida'
  }

  // Hasta cuándo se puede pagar una reserva pendiente (null si no se sabe cuándo se creó)
  get paymentDeadline() {
    if (!this.createdReserve) return null
    const created = new Date(this.createdReserve)
    if (Number.isNaN(created.getTime())) return null
    return new Date(created.getTime() + PAYMENT_WINDOW_MINUTES * 60 * 1000)
  }

  get isPaymentWindowOver() {
    return Boolean(this.paymentDeadline) && this.paymentDeadline <= new Date()
  }

  get paymentDeadlineLabel() {
    return this.paymentDeadline ? timeFormatter.format(this.paymentDeadline) : null
  }

  get isCash() {
    return this.paymentMethod === 'EFECTIVO'
  }

  get paymentMethodLabel() {
    return this.isCash ? 'Efectivo (con seña)' : 'Mercado Pago'
  }

  // Lo que falta cobrar en el complejo: solo en una reserva señada que todavía no se saldó
  get balance() {
    if (!this.isCash || !this.isPaid || this.cashPaidAt) return 0
    return Number(this.totalAmount) - Number(this.depositAmount ?? 0)
  }

  get hasBalance() {
    return this.balance > 0
  }

  get formattedDeposit() {
    return formatCurrency(this.depositAmount ?? depositFor(this.totalAmount))
  }

  get formattedBalance() {
    return formatCurrency(this.balance)
  }

  get isCashPaid() {
    return this.isCash && Boolean(this.cashPaidAt)
  }

  get isFullyPaid() {
    return this.isPaid && !this.hasBalance
  }

  // Estado a mostrar: una reserva confirmada que todavía debe el resto se ve como "señada"
  get stateLabel() {
    return this.hasBalance ? 'señada' : this.stateReserva
  }

  get stateClass() {
    return this.hasBalance ? 'senada' : this.stateReserva
  }

  get canRegisterCash() {
    return this.hasBalance
  }

  get canMarkAbsent() {
    return this.hasBalance
  }

  get canBeCancelled() {
    return this.isPending
  }

  get courtLabel() {
    return this.court?.typeLabel ?? null
  }

  get complexName() {
  return this.court?.complexName ?? null
  }

  get clientName() {
    if (!this.user) return null
    return `${this.user.nameUser ?? ''} ${this.user.surnameUser ?? ''}`.trim()
  }

  get scheduleLabel() {
    return this.horary?.label ?? null
  }

  get paymentLabel() {
    if (!this.paymentStatus) return null
    return PAYMENT_LABELS[this.paymentStatus] ?? `Pago: ${this.paymentStatus}`
  }

  get canBePaid() {
    return this.isPending && this.paymentStatus !== 'approved' && !this.isPaymentWindowOver
  }
}

export default Reserve

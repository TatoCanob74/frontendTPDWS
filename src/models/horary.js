import { formatCurrency } from '../utils/currency.js'

export const DAYS = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo'
]

export const SHIFTS = [
  { value: 'manana', label: 'Mañana', from: '06:00', to: '12:00' },
  { value: 'tarde', label: 'Tarde', from: '12:00', to: '18:00' },
  { value: 'noche', label: 'Noche', from: '18:00', to: '23:59' }
]

export function findShift(value) {
  return SHIFTS.find((shift) => shift.value === value) ?? null
}

export class Horary {
  constructor({ idHorary, idCourt, startTime, endTime, day, courtName = null, hourlyPrice = null }) {
    this.idHorary = idHorary
    this.idCourt = idCourt
    this.startTime = startTime
    this.endTime = endTime
    this.day = day
    this.courtName = courtName
    this.hourlyPrice = hourlyPrice
  }

  static fromDTO(dto) {
    return new Horary(dto)
  }

  static fromList(dtos = []) {
    return dtos.map(Horary.fromDTO)
  }

  static formatTime(time) {
    return typeof time === 'string' ? time.slice(0, 5) : time
  }

  get start() {
    return Horary.formatTime(this.startTime)
  }

  get end() {
    return Horary.formatTime(this.endTime)
  }

  get label() {
    return `${this.start} - ${this.end}`
  }

  get formattedPrice() {
    return this.hourlyPrice == null ? '' : formatCurrency(this.hourlyPrice)
  }

  matchesShift(shiftValue) {
    const shift = findShift(shiftValue)
    if (!shift) return true
    return this.start >= shift.from && this.start < shift.to
  }
}

export default Horary

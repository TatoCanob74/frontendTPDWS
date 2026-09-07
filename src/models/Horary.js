/**
 * Horario de una cancha.
 *
 * El backend devuelve las horas como "HH:MM:SS" (tipo TIME de MySQL) y el día
 * como un string del enum ('Lunes', 'Martes', …). Esta clase se encarga de
 * presentarlos, para que las pantallas no tengan que recortar strings a mano.
 */
/** Dias del enum del backend. El orden y los acentos tienen que coincidir exacto. */
export const DAYS = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo'
]

/**
 * Franjas horarias para filtrar los listados de horarios, que enseguida se
 * vuelven demasiado largos para elegir a ojo.
 *
 * El rango es [from, to): se compara contra la hora de inicio del horario. Los
 * límites coinciden con los que acepta `GET /horarios?from=&to=` del backend,
 * así que la misma franja sirve para filtrar en el cliente o en el servidor.
 */
export const SHIFTS = [
  { value: 'manana', label: 'Mañana', from: '06:00', to: '12:00' },
  { value: 'tarde', label: 'Tarde', from: '12:00', to: '18:00' },
  { value: 'noche', label: 'Noche', from: '18:00', to: '23:59' }
]

/** Busca una franja por su valor. Devuelve null para "todas". */
export function findShift(value) {
  return SHIFTS.find((shift) => shift.value === value) ?? null
}

export class Horary {
  constructor({ idHorary, idCourt, startTime, endTime, day, courtName = null }) {
    this.idHorary = idHorary
    this.idCourt = idCourt
    this.startTime = startTime
    this.endTime = endTime
    this.day = day
    // Nombre de la cancha a la que pertenece el horario. Solo lo completan las
    // pantallas que arman el horario a partir de una cancha (ver
    // Court.horariesForDay): en un mismo día y sede puede haber dos franjas de
    // "10:00" de canchas distintas, y sin esto son indistinguibles en pantalla.
    this.courtName = courtName
  }

  /** Factory Method: construye una instancia desde la respuesta cruda del backend. */
  static fromDTO(dto) {
    return new Horary(dto)
  }

  static fromList(dtos = []) {
    return dtos.map(Horary.fromDTO)
  }

  /** "18:00:00" → "18:00" */
  static formatTime(time) {
    return typeof time === 'string' ? time.slice(0, 5) : time
  }

  get start() {
    return Horary.formatTime(this.startTime)
  }

  get end() {
    return Horary.formatTime(this.endTime)
  }

  /** "18:00 - 19:00" */
  get label() {
    return `${this.start} - ${this.end}`
  }

  /** ¿Empieza dentro de la franja? Sin franja ('' o desconocida) entra siempre. */
  matchesShift(shiftValue) {
    const shift = findShift(shiftValue)
    if (!shift) return true
    return this.start >= shift.from && this.start < shift.to
  }
}

export default Horary

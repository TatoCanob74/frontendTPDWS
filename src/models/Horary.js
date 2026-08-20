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

export class Horary {
  constructor({ idHorary, idCourt, startTime, endTime, day }) {
    this.idHorary = idHorary
    this.idCourt = idCourt
    this.startTime = startTime
    this.endTime = endTime
    this.day = day
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
}

export default Horary

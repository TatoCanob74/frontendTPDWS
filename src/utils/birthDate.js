/**
 * Reglas de la fecha de nacimiento.
 *
 * Son las mismas que aplica el backend en `src/utils/birthDate.js`: acá se
 * repiten para poder avisarle al usuario mientras completa el formulario, sin
 * esperar el 400 del servidor. La validación que manda sigue siendo la del
 * backend; esta es solo la primera barrera.
 *
 * El `<input type="date">` trabaja con "aaaa-mm-dd" y el backend guarda
 * "dd/mm/aaaa", así que la conversión entre los dos formatos también vive acá.
 */

const ISO_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/
const BACKEND_REGEX = /^(\d{2})\/(\d{2})\/(\d{4})$/

export const MIN_AGE = 16
export const MAX_AGE = 120

/** "2004-07-24" → Date, o null si no es una fecha real del calendario. */
function parseIso(isoDate) {
  const match = ISO_REGEX.exec(String(isoDate ?? '').trim())
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])

  const date = new Date(year, month - 1, day)

  // El constructor "corrige" fechas inexistentes (31/02 pasa a 03/03), así que
  // se compara el resultado contra lo ingresado para descartarlas.
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null
  }

  return date
}

/** Fecha de hoy sin hora, para comparar contra la fecha de nacimiento. */
function today() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

function toIso(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

/** "2004-07-24" → "24/07/2004" (el formato que guarda el backend). */
export function toBackendDate(isoDate) {
  const match = ISO_REGEX.exec(String(isoDate ?? '').trim())
  if (!match) return ''
  return `${match[3]}/${match[2]}/${match[1]}`
}

/** "24/07/2004" → "2004-07-24" (el que entiende el `<input type="date">`). */
export function fromBackendDate(value) {
  const match = BACKEND_REGEX.exec(String(value ?? '').trim())
  if (!match) return ''
  return `${match[3]}-${match[2]}-${match[1]}`
}

/** Años cumplidos al día de hoy, o null si la fecha no es válida. */
export function ageFromIso(isoDate) {
  const birthDate = parseIso(isoDate)
  if (!birthDate) return null

  const hoy = today()
  let age = hoy.getFullYear() - birthDate.getFullYear()

  const cumpleTodaviaNoPaso =
    hoy.getMonth() < birthDate.getMonth() ||
    (hoy.getMonth() === birthDate.getMonth() && hoy.getDate() < birthDate.getDate())

  if (cumpleTodaviaNoPaso) age -= 1

  return age
}

/**
 * Última fecha de nacimiento que cumple la edad mínima.
 * Se usa como `max` del input para que el calendario ni siquiera ofrezca
 * fechas futuras o de alguien demasiado chico.
 */
export function maxBirthDateIso() {
  const hoy = today()
  return toIso(new Date(hoy.getFullYear() - MIN_AGE, hoy.getMonth(), hoy.getDate()))
}

/** Primera fecha razonable, para acotar el calendario por abajo. */
export function minBirthDateIso() {
  const hoy = today()
  return toIso(new Date(hoy.getFullYear() - MAX_AGE, hoy.getMonth(), hoy.getDate()))
}

/** Devuelve el mensaje de error a mostrar, o null si la fecha es válida. */
export function validateBirthDate(isoDate) {
  if (!isoDate) {
    return 'Ingresá tu fecha de nacimiento.'
  }

  const birthDate = parseIso(isoDate)
  if (!birthDate) {
    return 'La fecha de nacimiento no es válida.'
  }

  if (birthDate > today()) {
    return 'La fecha de nacimiento no puede ser una fecha futura.'
  }

  const age = ageFromIso(isoDate)

  if (age < MIN_AGE) {
    return `Tenés que tener al menos ${MIN_AGE} años.`
  }

  if (age > MAX_AGE) {
    return 'Revisá la fecha de nacimiento: el año ingresado no es válido.'
  }

  return null
}

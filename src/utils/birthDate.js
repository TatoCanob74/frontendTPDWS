const ISO_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/
const BACKEND_REGEX = /^(\d{2})\/(\d{2})\/(\d{4})$/

export const MIN_AGE = 16
export const MAX_AGE = 120

function parseIso(isoDate) {
  const match = ISO_REGEX.exec(String(isoDate ?? '').trim())
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])

  const date = new Date(year, month - 1, day)

  // new Date() corrige las fechas que no existen (31/02 -> 03/03)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null
  }

  return date
}

function today() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

function toIso(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function toBackendDate(isoDate) {
  const match = ISO_REGEX.exec(String(isoDate ?? '').trim())
  if (!match) return ''
  return `${match[3]}/${match[2]}/${match[1]}`
}

export function fromBackendDate(value) {
  const match = BACKEND_REGEX.exec(String(value ?? '').trim())
  if (!match) return ''
  return `${match[3]}-${match[2]}-${match[1]}`
}

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

export function maxBirthDateIso() {
  const hoy = today()
  return toIso(new Date(hoy.getFullYear() - MIN_AGE, hoy.getMonth(), hoy.getDate()))
}

export function minBirthDateIso() {
  const hoy = today()
  return toIso(new Date(hoy.getFullYear() - MAX_AGE, hoy.getMonth(), hoy.getDate()))
}

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

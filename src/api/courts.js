import { client } from './client'

// Estos endpoints todavía no existen en el backend (ver plan / TODO backend).
// Se dejan armados contra el contrato esperado para que sea plug-and-play
// cuando se agreguen las rutas GET /courts, /locations y /horarios.

export function getCourts({ typeCourt, idLocateCourt } = {}) {
  return client.get('/courts', { params: { typeCourt, idLocateCourt } }).then((r) => r.data)
}

export function getLocations() {
  return client.get('/locations').then((r) => r.data)
}

export function getHorarios({ typeCourt, idLocateCourt, day }) {
  return client.get('/horarios', { params: { typeCourt, idLocateCourt, day } }).then((r) => r.data)
}

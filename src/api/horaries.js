import { client, emptyOn404 } from './client'
import { Horary } from '../models/Horary'

// Rutas reales del backend:
//   GET    /horarios?idCourt=&day=&from=&to=   listado   (público)
//   POST   /horarios                 crear     (admin)
//   PUT    /horarios/:id             editar    (admin)
//   DELETE /horarios/:id             eliminar  (admin)

/**
 * Horarios configurados, opcionalmente filtrados por cancha, día y franja.
 * `from`/`to` acotan por hora de inicio ("HH:MM"), con `to` exclusivo.
 */
export function getHoraries({ idCourt, day, from, to } = {}) {
  return emptyOn404(
    client.get('/horarios', { params: { idCourt, day, from, to } }).then((r) => r.data)
  ).then(Horary.fromList)
}

export function createHorary(payload) {
  return client.post('/horarios', payload).then((r) => Horary.fromDTO(r.data))
}

/**
 * Edita un horario.
 * El backend responde 409 si el horario ya tiene reservas, para no dejarlas
 * apuntando a una franja distinta de la que se reservó.
 */
export function updateHorary(idHorary, payload) {
  return client.put(`/horarios/${idHorary}`, payload).then((r) => r.data)
}

/** Elimina un horario. El backend responde 409 si tiene reservas asociadas. */
export function deleteHorary(idHorary) {
  return client.delete(`/horarios/${idHorary}`).then((r) => r.data)
}

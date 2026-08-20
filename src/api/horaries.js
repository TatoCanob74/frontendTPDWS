import { client, emptyOn404 } from './client'
import { Horary } from '../models/Horary'

// Rutas reales del backend:
//   GET    /horarios?idCourt=&day=   listado   (público)
//   POST   /horarios                 crear     (admin)
//   PUT    /horarios/:id             editar    (admin)
//   DELETE /horarios/:id             eliminar  (admin)

/** Horarios configurados, opcionalmente filtrados por cancha y/o día. */
export function getHoraries({ idCourt, day } = {}) {
  return emptyOn404(
    client.get('/horarios', { params: { idCourt, day } }).then((r) => r.data)
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

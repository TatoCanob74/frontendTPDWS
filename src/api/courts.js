import { client, emptyOn404 } from './client'
import { Court } from '../models/Court'
import { getLocations } from './locations'

export { getLocations }

// Rutas reales del backend (rama de Francisco):
//   GET    /canchas/verCanchas   listado con horarios anidados (requiere token)
//   GET    /seeCourts            listado para el panel admin
//   POST   /canchas              crear            (admin)
//   PUT    /canchas/:id          editar           (admin)
//   PATCH  /canchas/:id/estado   alternar estado  (admin)
//   DELETE /canchas/:id          eliminar         (admin)
// Ver api/locations.js para las sedes (`/localidades`).

/**
 * Canchas disponibles, con sus horarios.
 *
 * El backend filtra por `typeCourt` pero todavía no por sede, así que el filtro
 * por `idLocateCourt` se aplica acá. Si más adelante el backend lo soporta,
 * alcanza con pasarlo como parámetro y borrar el filtro del cliente.
 */
export function getCourts({ typeCourt, idLocateCourt } = {}) {
  return emptyOn404(
    client.get('/canchas/verCanchas', { params: { typeCourt } }).then((r) => r.data)
  ).then((data) => {
    const courts = Court.fromList(data)
    if (!idLocateCourt) return courts
    return courts.filter((c) => String(c.idLocateCourt) === String(idLocateCourt))
  })
}

/** Listado de canchas para el panel de administración. */
export function getCourtsForAdmin() {
  return emptyOn404(client.get('/seeCourts').then((r) => r.data)).then(Court.fromList)
}

export function createCourt(payload) {
  return client.post('/canchas', payload).then((r) => Court.fromDTO(r.data))
}

export function updateCourt(idCourt, payload) {
  return client.put(`/canchas/${idCourt}`, payload).then((r) => r.data)
}

/** Alterna DISPONIBLE ↔ OCUPADO. El backend decide el nuevo estado. */
export function toggleCourtState(idCourt) {
  return client.patch(`/canchas/${idCourt}/estado`).then((r) => r.data)
}

export function deleteCourt(idCourt) {
  return client.delete(`/canchas/${idCourt}`).then((r) => r.data)
}

/**
 * Horarios disponibles para un deporte, sede y día.
 *
 * `GET /horarios` del backend filtra por `idCourt`, pero el formulario de reserva
 * razona en términos de deporte + sede. Como `/canchas/verCanchas` ya devuelve
 * cada cancha con sus horarios anidados, se resuelve con una sola llamada y el
 * filtro por día se hace acá.
 *
 * El formulario de reserva ya no la usa (se trae las canchas del deporte una
 * sola vez y filtra en memoria, para poder avisar qué sedes y qué días tienen
 * disponibilidad); se mantiene para consultas puntuales de un solo día.
 */
export function getHorarios({ typeCourt, idLocateCourt, day }) {
  return getCourts({ typeCourt, idLocateCourt }).then((courts) =>
    courts.flatMap((court) => court.horariesForDay(day))
  )
}

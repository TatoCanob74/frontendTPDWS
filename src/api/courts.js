import { client, emptyOn404 } from './client'
import { Court } from '../models/Court'
import { getLocations } from './locations'

export { getLocations }

export function getCourts({ typeCourt, idLocateCourt } = {}) {
  return emptyOn404(
    client.get('/canchas/verCanchas', { params: { typeCourt } }).then((r) => r.data)
  ).then((data) => {
    const courts = Court.fromList(data)
    if (!idLocateCourt) return courts
    return courts.filter((c) => String(c.idLocateCourt) === String(idLocateCourt))
  })
}

export function getCourtsForAdmin() {
  return emptyOn404(client.get('/seeCourts').then((r) => r.data)).then(Court.fromList)
}

export function createCourt(payload) {
  return client.post('/canchas', payload).then((r) => Court.fromDTO(r.data))
}

export function updateCourt(idCourt, payload) {
  return client.put(`/canchas/${idCourt}`, payload).then((r) => r.data)
}

export function toggleCourtState(idCourt) {
  return client.patch(`/canchas/${idCourt}/estado`).then((r) => r.data)
}

export function deleteCourt(idCourt) {
  return client.delete(`/canchas/${idCourt}`).then((r) => r.data)
}

export function getHorarios({ typeCourt, idLocateCourt, day }) {
  return getCourts({ typeCourt, idLocateCourt }).then((courts) =>
    courts.flatMap((court) => court.horariesForDay(day))
  )
}

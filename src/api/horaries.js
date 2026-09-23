import { client, emptyOn404 } from './client'
import { Horary } from '../models/Horary'

export function getHoraries({ idCourt, day, from, to } = {}) {
  return emptyOn404(
    client.get('/horarios', { params: { idCourt, day, from, to } }).then((r) => r.data)
  ).then(Horary.fromList)
}

export function createHorary(payload) {
  return client.post('/horarios', payload).then((r) => Horary.fromDTO(r.data))
}

export function updateHorary(idHorary, payload) {
  return client.put(`/horarios/${idHorary}`, payload).then((r) => r.data)
}

export function deleteHorary(idHorary) {
  return client.delete(`/horarios/${idHorary}`).then((r) => r.data)
}

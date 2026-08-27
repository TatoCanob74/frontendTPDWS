import { client, emptyOn404 } from './client'
import { Location } from '../models/Location'

// Rutas reales del backend:
//   GET    /localidades      listado                    (público)
//   POST   /localidades      crear                       (admin)
//   PUT    /localidades/:id  editar                      (admin)
//   DELETE /localidades/:id  eliminar                     (admin)

export function getLocations() {
  return emptyOn404(client.get('/localidades').then((r) => r.data)).then(Location.fromList)
}

export function createLocation(payload) {
  return client.post('/localidades', payload).then((r) => Location.fromDTO(r.data))
}

export function updateLocation(idLocation, payload) {
  return client.put(`/localidades/${idLocation}`, payload).then((r) => r.data)
}

export function deleteLocation(idLocation) {
  return client.delete(`/localidades/${idLocation}`).then((r) => r.data)
}

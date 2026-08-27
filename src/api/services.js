import { client, emptyOn404 } from './client'
import { Service } from '../models/Service'

// Rutas reales del backend (rama de Francisco):
//   GET    /servicios       listado (público)
//   POST   /servicios       crear    (admin)
//   PUT    /servicios/:id   editar   (admin)
//   DELETE /servicios/:id   eliminar (admin)

export function getServices() {
  return emptyOn404(client.get('/servicios').then((r) => r.data)).then(Service.fromList)
}

export function createService(payload) {
  return client.post('/servicios', payload).then((r) => Service.fromDTO(r.data))
}

export function updateService(idService, payload) {
  return client.put(`/servicios/${idService}`, payload).then((r) => r.data)
}

export function deleteService(idService) {
  return client.delete(`/servicios/${idService}`).then((r) => r.data)
}

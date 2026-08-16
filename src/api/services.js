import { client, emptyOn404 } from './client'

// Rutas reales del backend (rama de Francisco):
//   GET    /servicios       listado (público)
//   POST   /servicios       crear    (admin)
//   PUT    /servicios/:id   editar   (admin)
//   DELETE /servicios/:id   eliminar (admin)

export function getServices() {
  return emptyOn404(client.get('/servicios').then((r) => r.data))
}

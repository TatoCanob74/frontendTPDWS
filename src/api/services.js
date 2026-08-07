import { client } from './client'

// TODO backend: no existe todavía GET /services.
export function getServices() {
  return client.get('/services').then((r) => r.data)
}

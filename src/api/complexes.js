import { client, emptyOn404 } from './client'
import { Complex } from '../models/complex'

export function getComplexes({ idLocation } = {}) {
  return emptyOn404(client.get('/complejos', { params: { idLocation } }).then((r) => r.data)).then(
    Complex.fromList
  )
}

// El complejo que administra el usuario logueado; null si no tiene ninguno asignado
export function getMyComplex() {
  return client
    .get('/mi-complejo')
    .then((r) => Complex.fromDTO(r.data))
    .catch((error) => {
      if (error.response?.status === 404) return null
      throw error
    })
}

export function createComplex(payload) {
  return client.post('/complejos', payload).then((r) => Complex.fromDTO(r.data))
}

export function updateComplex(idComplex, payload) {
  return client.put(`/complejos/${idComplex}`, payload).then((r) => r.data)
}

export function deleteComplex(idComplex) {
  return client.delete(`/complejos/${idComplex}`).then((r) => r.data)
}

import { useCallback, useEffect, useState } from 'react'
import {
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation
} from '../../api/locations'
import LocationForm from '../../components/locationForm/LocationForm'
import ConfirmDialog from '../../components/confirmDialog/ConfirmDialog'

/** ABM de localidades: listar, crear, editar y eliminar. */
export default function LocationsTab() {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)

  // null = no se está editando nada; una Location = edición; 'new' = alta
  const [editing, setEditing] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)

  // Localidad pendiente de confirmación de borrado (null = diálogo cerrado)
  const [confirmingDelete, setConfirmingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const loadLocations = useCallback(() => {
    return getLocations()
      .then((data) => {
        setLocations(data)
        setError(null)
      })
      .catch(() => setError('No pudimos cargar las localidades.'))
  }, [])

  useEffect(() => {
    loadLocations().finally(() => setLoading(false))
  }, [loadLocations])

  function messageFrom(err, fallback) {
    return err.response?.data?.error || err.response?.data?.message || fallback
  }

  async function handleSubmit(payload) {
    setSubmitting(true)
    setFormError(null)
    try {
      if (editing === 'new') {
        await createLocation(payload)
        setNotice('Localidad creada correctamente.')
      } else {
        await updateLocation(editing.idLocation, payload)
        setNotice('Localidad actualizada correctamente.')
      }
      await loadLocations()
      setEditing(null)
    } catch (err) {
      setFormError(messageFrom(err, 'No pudimos guardar la localidad.'))
    } finally {
      setSubmitting(false)
    }
  }

  /** Se ejecuta cuando el usuario confirma en el diálogo, no al apretar "Eliminar". */
  async function handleDeleteConfirmed() {
    if (!confirmingDelete) return

    setDeleting(true)
    setNotice(null)
    try {
      await deleteLocation(confirmingDelete.idLocation)
      setNotice('Localidad eliminada correctamente.')
      await loadLocations()
    } catch (err) {
      // El backend responde 409 si la localidad tiene canchas asociadas
      setError(messageFrom(err, 'No pudimos eliminar la localidad.'))
    } finally {
      setDeleting(false)
      setConfirmingDelete(null)
    }
  }

  if (loading) return <p className="hint">Cargando localidades…</p>

  if (editing) {
    return (
      <LocationForm
        key={editing === 'new' ? 'new' : editing.idLocation}
        location={editing === 'new' ? null : editing}
        submitting={submitting}
        error={formError}
        onSubmit={handleSubmit}
        onCancel={() => {
          setEditing(null)
          setFormError(null)
        }}
      />
    )
  }

  return (
    <>
      <div className="admin-actions">
        <button className="btn btn--primary" type="button" onClick={() => setEditing('new')}>
          Nueva localidad
        </button>
      </div>

      {notice && <div className="alert" role="status">{notice}</div>}
      {error && <div className="alert alert--error" role="alert">{error}</div>}

      {locations.length === 0 ? (
        <p className="hint">No hay localidades cargadas todavía.</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th><th>Localidad</th><th>País</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((location) => (
                <tr key={location.idLocation}>
                  <td>{location.idLocation}</td>
                  <td>{location.nomLocation}</td>
                  <td>{location.nameCountry}</td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn--sm" type="button" onClick={() => setEditing(location)}>
                        Editar
                      </button>
                      <button
                        className="btn btn--sm btn--danger"
                        type="button"
                        onClick={() => {
                          setError(null)
                          setConfirmingDelete(location)
                        }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirmingDelete)}
        tone="danger"
        title="Eliminar localidad"
        message={
          confirmingDelete
            ? `Vas a eliminar la localidad "${confirmingDelete.nomLocation}". Esta acción no se puede deshacer.`
            : ''
        }
        confirmLabel="Sí, eliminar"
        cancelLabel="Volver"
        busy={deleting}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setConfirmingDelete(null)}
      />
    </>
  )
}

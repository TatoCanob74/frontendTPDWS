import { useCallback, useEffect, useState } from 'react'
import {
  getCourtsForAdmin,
  createCourt,
  updateCourt,
  toggleCourtState,
  deleteCourt,
  getLocations
} from '../../api/courts'
import CourtForm from '../../components/courtForm/CourtForm'
import ConfirmDialog from '../../components/confirmDialog/ConfirmDialog'

/** ABM de canchas: listar, crear, editar, habilitar/deshabilitar y eliminar. */
export default function CourtsTab() {
  const [courts, setCourts] = useState([])
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)

  // null = no se está editando nada; una Court = edición; 'new' = alta
  const [editing, setEditing] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)

  // Cancha pendiente de confirmación de borrado (null = diálogo cerrado)
  const [confirmingDelete, setConfirmingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const loadCourts = useCallback(() => {
    return getCourtsForAdmin()
      .then((data) => {
        setCourts(data)
        setError(null)
      })
      .catch(() => setError('No pudimos cargar las canchas.'))
  }, [])

  useEffect(() => {
    Promise.all([
      loadCourts(),
      getLocations()
        .then(setLocations)
        .catch(() => setLocations([]))
    ]).finally(() => setLoading(false))
  }, [loadCourts])

  function messageFrom(err, fallback) {
    return err.response?.data?.error || err.response?.data?.message || fallback
  }

  async function handleSubmit(payload) {
    setSubmitting(true)
    setFormError(null)
    try {
      if (editing === 'new') {
        await createCourt(payload)
        setNotice('Cancha creada correctamente.')
      } else {
        await updateCourt(editing.idCourt, payload)
        setNotice('Cancha actualizada correctamente.')
      }
      await loadCourts()
      setEditing(null)
    } catch (err) {
      setFormError(messageFrom(err, 'No pudimos guardar la cancha.'))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleToggle(court) {
    setNotice(null)
    try {
      const result = await toggleCourtState(court.idCourt)
      setNotice(result.message ?? 'Estado actualizado.')
      await loadCourts()
    } catch (err) {
      setError(messageFrom(err, 'No pudimos cambiar el estado de la cancha.'))
    }
  }

  /** Se ejecuta cuando el usuario confirma en el diálogo, no al apretar "Eliminar". */
  async function handleDeleteConfirmed() {
    if (!confirmingDelete) return

    setDeleting(true)
    setNotice(null)
    try {
      await deleteCourt(confirmingDelete.idCourt)
      setNotice('Cancha eliminada correctamente.')
      await loadCourts()
    } catch (err) {
      // El backend responde 409 si la cancha tiene horarios asociados
      setError(messageFrom(err, 'No pudimos eliminar la cancha.'))
    } finally {
      setDeleting(false)
      setConfirmingDelete(null)
    }
  }

  if (loading) return <p className="hint">Cargando canchas…</p>

  if (editing) {
    return (
      <CourtForm
        key={editing === 'new' ? 'new' : editing.idCourt}
        court={editing === 'new' ? null : editing}
        locations={locations}
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
          Nueva cancha
        </button>
      </div>

      {notice && <div className="alert" role="status">{notice}</div>}
      {error && <div className="alert alert--error" role="alert">{error}</div>}

      {courts.length === 0 ? (
        <p className="hint">No hay canchas cargadas todavía.</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th><th>Nombre</th><th>Deporte</th><th>Precio</th>
                <th>Capacidad</th><th>Estado</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {courts.map((court) => (
                <tr key={court.idCourt}>
                  <td>{court.idCourt}</td>
                  <td>{court.nameCourt}</td>
                  <td>{court.typeIcon} {court.typeLabel}</td>
                  <td>{court.formattedPrice}</td>
                  <td>{court.capacityPlayers}</td>
                  <td>
                    <span className={`status-pill status-pill--${court.isAvailable ? 'confirmada' : 'cancelada'}`}>
                      {court.stateCourt}
                    </span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn--sm" type="button" onClick={() => setEditing(court)}>
                        Editar
                      </button>
                      <button className="btn btn--sm" type="button" onClick={() => handleToggle(court)}>
                        {court.isAvailable ? 'Deshabilitar' : 'Habilitar'}
                      </button>
                      <button
                        className="btn btn--sm btn--danger"
                        type="button"
                        onClick={() => {
                          setError(null)
                          setConfirmingDelete(court)
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
        title="Eliminar cancha"
        message={
          confirmingDelete
            ? `Vas a eliminar la cancha "${confirmingDelete.nameCourt}". Esta acción no se puede deshacer.`
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

import { useCallback, useEffect, useState } from 'react'
import {
  getServices,
  createService,
  updateService,
  deleteService
} from '../../api/services'
import ServiceForm from '../../components/serviceForm/ServiceForm'
import ConfirmDialog from '../../components/confirmDialog/ConfirmDialog'

/** ABM de servicios adicionales: listar, crear, editar y eliminar. */
export default function ServicesTab() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)

  // null = no se está editando nada; un Service = edición; 'new' = alta
  const [editing, setEditing] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)

  // Servicio pendiente de confirmación de borrado (null = diálogo cerrado)
  const [confirmingDelete, setConfirmingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const loadServices = useCallback(() => {
    return getServices()
      .then((data) => {
        setServices(data)
        setError(null)
      })
      .catch(() => setError('No pudimos cargar los servicios.'))
  }, [])

  useEffect(() => {
    loadServices().finally(() => setLoading(false))
  }, [loadServices])

  function messageFrom(err, fallback) {
    return err.response?.data?.error || err.response?.data?.message || fallback
  }

  async function handleSubmit(payload) {
    setSubmitting(true)
    setFormError(null)
    try {
      if (editing === 'new') {
        await createService(payload)
        setNotice('Servicio creado correctamente.')
      } else {
        await updateService(editing.idService, payload)
        setNotice('Servicio actualizado correctamente.')
      }
      await loadServices()
      setEditing(null)
    } catch (err) {
      setFormError(messageFrom(err, 'No pudimos guardar el servicio.'))
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
      await deleteService(confirmingDelete.idService)
      setNotice('Servicio eliminado correctamente.')
      await loadServices()
    } catch (err) {
      // El backend responde 409 si el servicio está asociado a reservas existentes
      setError(messageFrom(err, 'No pudimos eliminar el servicio.'))
    } finally {
      setDeleting(false)
      setConfirmingDelete(null)
    }
  }

  if (loading) return <p className="hint">Cargando servicios…</p>

  if (editing) {
    return (
      <ServiceForm
        key={editing === 'new' ? 'new' : editing.idService}
        service={editing === 'new' ? null : editing}
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
          Nuevo servicio
        </button>
      </div>

      {notice && <div className="alert" role="status">{notice}</div>}
      {error && <div className="alert alert--error" role="alert">{error}</div>}

      {services.length === 0 ? (
        <p className="hint">No hay servicios cargados todavía.</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th><th>Nombre</th><th>Descripción</th><th>Precio</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.idService}>
                  <td>{service.idService}</td>
                  <td>{service.nameService}</td>
                  <td>{service.descriptionService}</td>
                  <td>{service.formattedPrice}</td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn--sm" type="button" onClick={() => setEditing(service)}>
                        Editar
                      </button>
                      <button
                        className="btn btn--sm btn--danger"
                        type="button"
                        onClick={() => {
                          setError(null)
                          setConfirmingDelete(service)
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
        title="Eliminar servicio"
        message={
          confirmingDelete
            ? `Vas a eliminar el servicio "${confirmingDelete.nameService}". Esta acción no se puede deshacer.`
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

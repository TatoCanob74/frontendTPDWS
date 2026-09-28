import { useCallback, useEffect, useState } from 'react'
import { getComplexes, createComplex, updateComplex, deleteComplex } from '../../api/complexes'
import { getLocations } from '../../api/locations'
import { getAdmins } from '../../api/admin'
import ComplexForm from '../../components/complexForm/ComplexForm'
import ConfirmDialog from '../../components/confirmDialog/ConfirmDialog'

function messageFrom(err, fallback) {
  return err.response?.data?.error || err.response?.data?.message || fallback
}

// Solo superadmin: alta, baja y modificación de complejos, y asignación de su administrador
export default function ComplexesTab() {
  const [complexes, setComplexes] = useState([])
  const [locations, setLocations] = useState([])
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)
  const [editing, setEditing] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)
  const [confirmingDelete, setConfirmingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // GET /complejos es público y no expone quién administra cada complejo; ese dato sale
  // de GET /admins (cada admin trae su managedComplex), así que se cruzan las dos listas.
  const loadData = useCallback(() => {
    return Promise.all([getComplexes(), getAdmins()])
      .then(([complexList, adminList]) => {
        const adminByComplex = new Map(
          adminList
            .filter((a) => a.managedComplex)
            .map((a) => [a.managedComplex.idComplex, a])
        )
        complexList.forEach((cx) => {
          const admin = adminByComplex.get(cx.idComplex)
          cx.admin = admin ?? null
          cx.idAdmin = admin?.idUser ?? null
        })
        setComplexes(complexList)
        setAdmins(adminList)
        setError(null)
      })
      .catch(() => setError('No pudimos cargar los complejos.'))
  }, [])

  useEffect(() => {
    Promise.all([
      loadData(),
      getLocations()
        .then(setLocations)
        .catch(() => setLocations([]))
    ]).finally(() => setLoading(false))
  }, [loadData])

  async function handleSubmit(payload) {
    setSubmitting(true)
    setFormError(null)
    try {
      if (editing === 'new') {
        await createComplex(payload)
        setNotice('Complejo creado correctamente.')
      } else {
        await updateComplex(editing.idComplex, payload)
        setNotice('Complejo actualizado correctamente.')
      }
      await loadData()
      setEditing(null)
    } catch (err) {
      setFormError(messageFrom(err, 'No pudimos guardar el complejo.'))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteConfirmed() {
    if (!confirmingDelete) return

    setDeleting(true)
    setNotice(null)
    try {
      await deleteComplex(confirmingDelete.idComplex)
      setNotice('Complejo eliminado correctamente.')
      await loadData()
    } catch (err) {
      setError(messageFrom(err, 'No pudimos eliminar el complejo.'))
    } finally {
      setDeleting(false)
      setConfirmingDelete(null)
    }
  }

  if (loading) return <p className="hint">Cargando complejos…</p>

  if (editing) {
    return (
      <ComplexForm
        key={editing === 'new' ? 'new' : editing.idComplex}
        complex={editing === 'new' ? null : editing}
        locations={locations}
        admins={admins}
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
          Nuevo complejo
        </button>
      </div>

      {notice && <div className="alert" role="status">{notice}</div>}
      {error && <div className="alert alert--error" role="alert">{error}</div>}

      {complexes.length === 0 ? (
        <p className="hint">No hay complejos cargados todavía.</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th><th>Nombre</th><th>Dirección</th><th>Localidad</th><th>Administrador</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {complexes.map((cx) => (
                <tr key={cx.idComplex}>
                  <td>{cx.idComplex}</td>
                  <td>{cx.nameComplex}</td>
                  <td>{cx.addressComplex}</td>
                  <td>{cx.locationName ?? <span className="hint">sin localidad</span>}</td>
                  <td>
                    {cx.admin
                      ? cx.admin.fullName
                      : <span className="status-pill status-pill--pendiente">sin asignar</span>}
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn--sm" type="button" onClick={() => setEditing(cx)}>
                        Editar
                      </button>
                      <button
                        className="btn btn--sm btn--danger"
                        type="button"
                        onClick={() => {
                          setError(null)
                          setConfirmingDelete(cx)
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
        title="Eliminar complejo"
        message={
          confirmingDelete
            ? `Vas a eliminar el complejo "${confirmingDelete.nameComplex}". Si tiene canchas, el backend va a rechazar el borrado. Esta acción no se puede deshacer.`
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

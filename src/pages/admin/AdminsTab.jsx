import { useCallback, useEffect, useState } from 'react'
import { getAdmins, createAdmin, updateUserState, deleteUser } from '../../api/admin'
import { getComplexes } from '../../api/complexes'
import AdminForm from '../../components/adminForm/AdminForm'
import ConfirmDialog from '../../components/confirmDialog/ConfirmDialog'

function messageFrom(err, fallback) {
  return err.response?.data?.error || err.response?.data?.message || fallback
}

// Solo superadmin: los administradores de cada complejo
export default function AdminsTab() {
  const [admins, setAdmins] = useState([])
  const [complexes, setComplexes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)
  const [creating, setCreating] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)
  const [togglingId, setTogglingId] = useState(null)
  const [confirmingDelete, setConfirmingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const loadData = useCallback(() => {
    return Promise.all([getAdmins(), getComplexes()])
      .then(([adminList, complexList]) => {
        // Se marca qué complejos ya tienen admin, para ofrecer solo los libres en el alta
        const adminIdByComplex = new Map(
          adminList.filter((a) => a.managedComplex).map((a) => [a.managedComplex.idComplex, a.idUser])
        )
        complexList.forEach((cx) => {
          cx.idAdmin = adminIdByComplex.get(cx.idComplex) ?? null
        })
        setAdmins(adminList)
        setComplexes(complexList)
        setError(null)
      })
      .catch(() => setError('No pudimos cargar los administradores.'))
  }, [])

  useEffect(() => {
    loadData().finally(() => setLoading(false))
  }, [loadData])

  async function handleCreate(payload) {
    setSubmitting(true)
    setFormError(null)
    try {
      await createAdmin(payload)
      setNotice('Administrador creado correctamente.')
      await loadData()
      setCreating(false)
    } catch (err) {
      setFormError(messageFrom(err, 'No pudimos crear el administrador.'))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleToggle(admin) {
    setNotice(null)
    setTogglingId(admin.idUser)
    try {
      const result = await updateUserState(admin.idUser)
      setNotice(result.message ?? 'Estado actualizado.')
      await loadData()
    } catch (err) {
      setError(messageFrom(err, 'No pudimos cambiar el estado del administrador.'))
    } finally {
      setTogglingId(null)
    }
  }

  async function handleDeleteConfirmed() {
    if (!confirmingDelete) return

    setDeleting(true)
    setNotice(null)
    try {
      await deleteUser(confirmingDelete.idUser)
      setNotice('Administrador eliminado correctamente.')
      await loadData()
    } catch (err) {
      setError(messageFrom(err, 'No pudimos eliminar el administrador.'))
    } finally {
      setDeleting(false)
      setConfirmingDelete(null)
    }
  }

  if (loading) return <p className="hint">Cargando administradores…</p>

  if (creating) {
    return (
      <AdminForm
        complexes={complexes}
        submitting={submitting}
        error={formError}
        onSubmit={handleCreate}
        onCancel={() => {
          setCreating(false)
          setFormError(null)
        }}
      />
    )
  }

  return (
    <>
      <div className="admin-actions">
        <button className="btn btn--primary" type="button" onClick={() => setCreating(true)}>
          Nuevo administrador
        </button>
      </div>

      <p className="hint" style={{ marginBottom: 16 }}>
        Para cambiar el complejo de un administrador, editá el complejo en la pestaña Complejos.
      </p>

      {notice && <div className="alert" role="status">{notice}</div>}
      {error && <div className="alert alert--error" role="alert">{error}</div>}

      {admins.length === 0 ? (
        <p className="hint">No hay administradores de complejo todavía.</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th><th>Nombre</th><th>Email</th><th>Complejo</th><th>Estado</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.idUser}>
                  <td>{a.idUser}</td>
                  <td>{a.fullName}</td>
                  <td>{a.emailUser}</td>
                  <td>
                    {a.managedComplex
                      ? a.managedComplex.nameComplex
                      : <span className="status-pill status-pill--pendiente">sin asignar</span>}
                  </td>
                  <td>
                    <span className={`status-pill status-pill--${a.isActive ? 'confirmada' : 'cancelada'}`}>
                      {a.stateUser}
                    </span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="btn btn--sm"
                        type="button"
                        disabled={togglingId === a.idUser}
                        onClick={() => handleToggle(a)}
                      >
                        {a.isActive ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        className="btn btn--sm btn--danger"
                        type="button"
                        onClick={() => {
                          setError(null)
                          setConfirmingDelete(a)
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
        title="Eliminar administrador"
        message={
          confirmingDelete
            ? `Vas a eliminar a "${confirmingDelete.fullName}".` +
              (confirmingDelete.managedComplex
                ? ` Administra "${confirmingDelete.managedComplex.nameComplex}": desasignalo primero desde Complejos o el backend va a rechazar el borrado.`
                : '') +
              ' Esta acción no se puede deshacer.'
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

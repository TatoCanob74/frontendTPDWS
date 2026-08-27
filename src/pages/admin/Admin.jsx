import { useCallback, useEffect, useState } from 'react'
import {
  getUsers,
  updateUserState,
  deleteUser,
  getReserves,
  updateReserveState,
  deleteReserve
} from '../../api/admin'
import CourtsTab from './CourtsTab'
import HorariesTab from './HorariesTab'
import LocationsTab from './LocationsTab'
import ServicesTab from './ServicesTab'
import ConfirmDialog from '../../components/confirmDialog/ConfirmDialog'

function messageFrom(err, fallback) {
  return err.response?.data?.error || err.response?.data?.message || fallback
}

function UsersTab() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)

  // idUser cuyo toggle de estado está en curso (null = ninguno)
  const [togglingId, setTogglingId] = useState(null)

  // Usuario pendiente de confirmación de borrado (null = diálogo cerrado)
  const [confirmingDelete, setConfirmingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const loadUsers = useCallback(() => {
    return getUsers()
      .then((data) => {
        setUsers(data)
        setError(null)
      })
      .catch(() => setError('No pudimos cargar los usuarios.'))
  }, [])

  useEffect(() => {
    loadUsers().finally(() => setLoading(false))
  }, [loadUsers])

  async function handleToggle(user) {
    setNotice(null)
    setTogglingId(user.idUser)
    try {
      const result = await updateUserState(user.idUser)
      setNotice(result.message ?? 'Estado actualizado.')
      await loadUsers()
    } catch (err) {
      setError(messageFrom(err, 'No pudimos cambiar el estado del usuario.'))
    } finally {
      setTogglingId(null)
    }
  }

  /** Se ejecuta cuando el usuario confirma en el diálogo, no al apretar "Eliminar". */
  async function handleDeleteConfirmed() {
    if (!confirmingDelete) return

    setDeleting(true)
    setNotice(null)
    try {
      await deleteUser(confirmingDelete.idUser)
      setNotice('Usuario eliminado correctamente.')
      await loadUsers()
    } catch (err) {
      // El backend responde 409 si el usuario tiene reservas asociadas
      setError(messageFrom(err, 'No pudimos eliminar el usuario.'))
    } finally {
      setDeleting(false)
      setConfirmingDelete(null)
    }
  }

  if (loading) return <p className="hint">Cargando usuarios…</p>

  return (
    <>
      {notice && <div className="alert" role="status">{notice}</div>}
      {error && <div className="alert alert--error" role="alert">{error}</div>}

      {users.length === 0 ? (
        <p className="hint">No hay clientes registrados todavía.</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th><th>Nombre</th><th>Apellido</th><th>Alias</th><th>Email</th>
                <th>Estado</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.idUser}>
                  <td>{u.idUser}</td>
                  <td>{u.nameUser}</td>
                  <td>{u.surnameUser}</td>
                  <td>{u.aliasUser}</td>
                  <td>{u.emailUser}</td>
                  <td>
                    <span className={`status-pill status-pill--${u.stateUser === 'ACTIVO' ? 'confirmada' : 'cancelada'}`}>
                      {u.stateUser}
                    </span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="btn btn--sm"
                        type="button"
                        disabled={togglingId === u.idUser}
                        onClick={() => handleToggle(u)}
                      >
                        {u.stateUser === 'ACTIVO' ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        className="btn btn--sm btn--danger"
                        type="button"
                        onClick={() => {
                          setError(null)
                          setConfirmingDelete(u)
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
        title="Eliminar usuario"
        message={
          confirmingDelete
            ? `Vas a eliminar a "${confirmingDelete.nameUser} ${confirmingDelete.surnameUser}". Esta acción no se puede deshacer.`
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

function ReservesTab() {
  const [stateReserva, setStateReserva] = useState('')
  const [dateReserve, setDateReserve] = useState('')
  const filterKey = `${stateReserva}|${dateReserve}`

  // Se guarda junto con la "clave" de filtros que la originó, para derivar
  // loading/error comparando esa clave contra los filtros actuales.
  const [result, setResult] = useState({ key: null, reserves: [], error: null })
  const [notice, setNotice] = useState(null)

  // idReserve cuyo cambio de estado está en curso (null = ninguno)
  const [updatingId, setUpdatingId] = useState(null)

  // Reserva pendiente de confirmación de borrado (null = diálogo cerrado)
  const [confirmingDelete, setConfirmingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetchReserves = useCallback(() => {
    return getReserves({ stateReserva: stateReserva || undefined, dateReserve: dateReserve || undefined })
  }, [stateReserva, dateReserve])

  const applyResult = useCallback((data) => setResult({ key: filterKey, reserves: data, error: null }), [filterKey])

  const applyError = useCallback(
    (err) => {
      if (err.response?.status === 404) {
        setResult({ key: filterKey, reserves: [], error: null })
      } else {
        setResult({ key: filterKey, reserves: [], error: 'No pudimos cargar las reservas.' })
      }
    },
    [filterKey]
  )

  useEffect(() => {
    let ignore = false
    fetchReserves()
      .then((data) => {
        if (!ignore) applyResult(data)
      })
      .catch((err) => {
        if (!ignore) applyError(err)
      })
    return () => {
      ignore = true
    }
  }, [fetchReserves, applyResult, applyError])

  function reload() {
    return fetchReserves().then(applyResult).catch(applyError)
  }

  async function handleChangeState(reserve, newState) {
    if (newState === reserve.stateReserva) return
    setNotice(null)
    setUpdatingId(reserve.idReserve)
    try {
      const res = await updateReserveState(reserve.idReserve, newState)
      setNotice(res.message ?? 'Estado actualizado.')
      await reload()
    } catch (err) {
      setResult((prev) => ({ ...prev, error: messageFrom(err, 'No pudimos actualizar el estado de la reserva.') }))
    } finally {
      setUpdatingId(null)
    }
  }

  /** Se ejecuta cuando el admin confirma en el diálogo, no al apretar "Eliminar". */
  async function handleDeleteConfirmed() {
    if (!confirmingDelete) return

    setDeleting(true)
    setNotice(null)
    try {
      await deleteReserve(confirmingDelete.idReserve)
      setNotice('Reserva eliminada correctamente.')
      await reload()
    } catch (err) {
      setResult((prev) => ({ ...prev, error: messageFrom(err, 'No pudimos eliminar la reserva.') }))
    } finally {
      setDeleting(false)
      setConfirmingDelete(null)
    }
  }

  const loading = result.key !== filterKey
  const reserves = result.key === filterKey ? result.reserves : []
  const error = result.key === filterKey ? result.error : null

  return (
    <>
      <div className="field__row" style={{ marginBottom: 20 }}>
        <div className="field">
          <label className="field__label" htmlFor="filtro-estado">Estado</label>
          <select className="input" id="filtro-estado" value={stateReserva} onChange={(e) => setStateReserva(e.target.value)}>
            <option value="">Todos</option>
            <option value="pendiente">Pendiente</option>
            <option value="confirmada">Confirmada</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
        <div className="field">
          <label className="field__label" htmlFor="filtro-fecha">Fecha</label>
          <input className="input" type="date" id="filtro-fecha" value={dateReserve} onChange={(e) => setDateReserve(e.target.value)} />
        </div>
      </div>

      {notice && <div className="alert" role="status">{notice}</div>}
      {loading && <p className="hint">Cargando reservas…</p>}
      {!loading && error && <div className="alert alert--error" role="alert">{error}</div>}
      {!loading && !error && reserves.length === 0 && <p className="hint">No hay reservas para ese filtro.</p>}
      {!loading && !error && reserves.length > 0 && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th><th>Fecha</th><th>Cancha</th><th>Horario</th><th>Monto</th><th>Estado</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reserves.map((r) => (
                <tr key={r.idReserve}>
                  <td>{r.idReserve}</td>
                  <td>{r.dateReserve}</td>
                  <td>{r.court ? `${r.court.typeIcon} ${r.court.nameCourt}` : `Cancha #${r.idCourt}`}</td>
                  <td>{r.horary ? `${r.horary.day} ${r.horary.label}` : `Horario #${r.idHorary}`}</td>
                  <td>{r.formattedAmount}</td>
                  <td>
                    <span className={`status-pill status-pill--${r.stateReserva}`}>{r.stateReserva}</span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <select
                        className="input"
                        value={r.stateReserva}
                        disabled={updatingId === r.idReserve}
                        onChange={(e) => handleChangeState(r, e.target.value)}
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="confirmada">Confirmada</option>
                        <option value="cancelada">Cancelada</option>
                      </select>
                      <button
                        className="btn btn--sm btn--danger"
                        type="button"
                        onClick={() => {
                          setResult((prev) => ({ ...prev, error: null }))
                          setConfirmingDelete(r)
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
        title="Eliminar reserva"
        message={
          confirmingDelete
            ? `Vas a eliminar la reserva #${confirmingDelete.idReserve} del ${confirmingDelete.dateReserve}.` +
              (confirmingDelete.paymentId
                ? ' Tiene un pago asociado, así que el backend va a rechazar el borrado.'
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

export default function Admin() {
  const [tab, setTab] = useState('canchas')

  return (
    <section className="section shell">
      <div className="section-head">
        <span className="eyebrow">Panel</span>
        <h2>Administración</h2>
        <p>Gestioná canchas, horarios, localidades, servicios, usuarios y reservas de CanchaYa.</p>
      </div>

      <div className="tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'canchas'} onClick={() => setTab('canchas')}>Canchas</button>
        <button type="button" role="tab" aria-selected={tab === 'horarios'} onClick={() => setTab('horarios')}>Horarios</button>
        <button type="button" role="tab" aria-selected={tab === 'localidades'} onClick={() => setTab('localidades')}>Localidades</button>
        <button type="button" role="tab" aria-selected={tab === 'servicios'} onClick={() => setTab('servicios')}>Servicios</button>
        <button type="button" role="tab" aria-selected={tab === 'usuarios'} onClick={() => setTab('usuarios')}>Usuarios</button>
        <button type="button" role="tab" aria-selected={tab === 'reservas'} onClick={() => setTab('reservas')}>Reservas</button>
      </div>

      {tab === 'canchas' && <CourtsTab />}
      {tab === 'horarios' && <HorariesTab />}
      {tab === 'localidades' && <LocationsTab />}
      {tab === 'servicios' && <ServicesTab />}
      {tab === 'usuarios' && <UsersTab />}
      {tab === 'reservas' && <ReservesTab />}
    </section>
  )
}

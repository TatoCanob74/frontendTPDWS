import { useEffect, useState } from 'react'
import { getUsers, getReserves } from '../../api/admin'

function formatMoney(amount) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount)
}

function UsersTab() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch(() => setError('No pudimos cargar los usuarios.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="hint">Cargando usuarios…</p>
  if (error) return <div className="alert alert--error">{error}</div>
  if (users.length === 0) return <p className="hint">No hay clientes registrados todavía.</p>

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th><th>Nombre</th><th>Apellido</th><th>Alias</th><th>Email</th>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ReservesTab() {
  const [stateReserva, setStateReserva] = useState('')
  const [dateReserve, setDateReserve] = useState('')
  const filterKey = `${stateReserva}|${dateReserve}`

  // Se guarda junto con la "clave" de filtros que la originó, para derivar
  // loading/error comparando esa clave contra los filtros actuales.
  const [result, setResult] = useState({ key: null, reserves: [], error: null })

  useEffect(() => {
    let ignore = false
    getReserves({ stateReserva: stateReserva || undefined, dateReserve: dateReserve || undefined })
      .then((data) => {
        if (!ignore) setResult({ key: filterKey, reserves: data, error: null })
      })
      .catch((err) => {
        if (ignore) return
        if (err.response?.status === 404) {
          setResult({ key: filterKey, reserves: [], error: null })
        } else {
          setResult({ key: filterKey, reserves: [], error: 'No pudimos cargar las reservas.' })
        }
      })
    return () => {
      ignore = true
    }
  }, [filterKey, stateReserva, dateReserve])

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

      {loading && <p className="hint">Cargando reservas…</p>}
      {!loading && error && <div className="alert alert--error">{error}</div>}
      {!loading && !error && reserves.length === 0 && <p className="hint">No hay reservas para ese filtro.</p>}
      {!loading && !error && reserves.length > 0 && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th><th>Fecha</th><th>Cancha</th><th>Horario</th><th>Monto</th><th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {reserves.map((r) => (
                <tr key={r.idReserve}>
                  <td>{r.idReserve}</td>
                  <td>{r.dateReserve}</td>
                  <td>{r.idCourt}</td>
                  <td>{r.idHorary}</td>
                  <td>{formatMoney(r.totalAmount)}</td>
                  <td><span className={`status-pill status-pill--${r.stateReserva}`}>{r.stateReserva}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

export default function Admin() {
  const [tab, setTab] = useState('usuarios')

  return (
    <section className="section shell">
      <div className="section-head">
        <span className="eyebrow">Panel</span>
        <h2>Administración</h2>
        <p>Gestioná usuarios y reservas de CanchaYa.</p>
      </div>

      <div className="tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'usuarios'} onClick={() => setTab('usuarios')}>Usuarios</button>
        <button type="button" role="tab" aria-selected={tab === 'reservas'} onClick={() => setTab('reservas')}>Reservas</button>
      </div>

      {tab === 'usuarios' ? <UsersTab /> : <ReservesTab />}
    </section>
  )
}

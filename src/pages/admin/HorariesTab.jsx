import { useEffect, useState } from 'react'
import { getHoraries, createHorary, updateHorary, deleteHorary } from '../../api/horaries'
import { getCourtsForAdmin } from '../../api/courts'
import { DAYS, SHIFTS, findShift } from '../../models/Horary'
import HoraryForm from '../../components/horaryForm/HoraryForm'
import ConfirmDialog from '../../components/confirmDialog/ConfirmDialog'

/**
 * ABM de horarios: las franjas en las que cada cancha se puede reservar.
 *
 * Sin esta pantalla, una cancha con horarios cargados no se puede eliminar
 * nunca desde la aplicación, porque el backend bloquea el borrado mientras
 * queden franjas asociadas.
 */
export default function HorariesTab() {
  const [courts, setCourts] = useState([])

  // Filtros del listado
  const [filterCourt, setFilterCourt] = useState('')
  const [filterDay, setFilterDay] = useState('')
  const [filterShift, setFilterShift] = useState('')

  // Se incrementa después de cada alta/edición/baja para forzar la recarga.
  const [reloadToken, setReloadToken] = useState(0)
  const filterKey = `${filterCourt}|${filterDay}|${filterShift}|${reloadToken}`

  // El resultado se guarda junto con la "clave" del pedido que lo originó, para
  // derivar loading y error comparando esa clave contra los filtros actuales.
  const [result, setResult] = useState({ key: null, horaries: [], error: null })

  // null = no se edita nada; un Horary = edición; 'new' = alta
  const [editing, setEditing] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)

  const [confirmingDelete, setConfirmingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Errores de una acción (por ej. el 409 al eliminar), distintos de los de carga.
  const [actionError, setActionError] = useState(null)
  const [notice, setNotice] = useState(null)

  useEffect(() => {
    getCourtsForAdmin()
      .then(setCourts)
      .catch(() => setCourts([]))
  }, [])

  useEffect(() => {
    let ignore = false
    // La franja se traduce a from/to y la resuelve el backend, para no traer
    // todos los horarios de la cancha y descartarlos acá.
    const shift = findShift(filterShift)

    getHoraries({
      idCourt: filterCourt || undefined,
      day: filterDay || undefined,
      from: shift?.from,
      to: shift?.to
    })
      .then((data) => {
        if (!ignore) setResult({ key: filterKey, horaries: data, error: null })
      })
      .catch(() => {
        if (!ignore) {
          setResult({ key: filterKey, horaries: [], error: 'No pudimos cargar los horarios.' })
        }
      })
    return () => {
      ignore = true
    }
  }, [filterKey, filterCourt, filterDay, filterShift])

  const loading = result.key !== filterKey
  const horaries = result.key === filterKey ? result.horaries : []
  const loadError = result.key === filterKey ? result.error : null

  function messageFrom(err, fallback) {
    return err.response?.data?.error || err.response?.data?.message || fallback
  }

  function reload() {
    setReloadToken((t) => t + 1)
  }

  /** "2" -> "Futbol 5 - Cancha A". Si la cancha ya no está, muestra el id. */
  function courtName(idCourt) {
    const court = courts.find((c) => String(c.idCourt) === String(idCourt))
    return court ? court.nameCourt : `Cancha #${idCourt}`
  }

  async function handleSubmit(payload) {
    setSubmitting(true)
    setFormError(null)
    try {
      if (editing === 'new') {
        await createHorary(payload)
        setNotice('Horario creado correctamente.')
      } else {
        await updateHorary(editing.idHorary, payload)
        setNotice('Horario actualizado correctamente.')
      }
      setEditing(null)
      reload()
    } catch (err) {
      // 409 si se superpone con otro, o si ya tiene reservas asociadas
      setFormError(messageFrom(err, 'No pudimos guardar el horario.'))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteConfirmed() {
    if (!confirmingDelete) return

    setDeleting(true)
    setNotice(null)
    try {
      await deleteHorary(confirmingDelete.idHorary)
      setNotice('Horario eliminado correctamente.')
      reload()
    } catch (err) {
      // El backend responde 409 si el horario tiene reservas
      setActionError(messageFrom(err, 'No pudimos eliminar el horario.'))
    } finally {
      setDeleting(false)
      setConfirmingDelete(null)
    }
  }

  if (editing) {
    return (
      <HoraryForm
        key={editing === 'new' ? 'new' : editing.idHorary}
        horary={editing === 'new' ? null : editing}
        courts={courts}
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
        <button
          className="btn btn--primary"
          type="button"
          disabled={courts.length === 0}
          onClick={() => setEditing('new')}
        >
          Nuevo horario
        </button>
      </div>

      {courts.length === 0 && (
        <p className="hint">Cargá al menos una cancha antes de definir horarios.</p>
      )}

      <div className="filters">
        <div className="field">
          <label className="field__label" htmlFor="filtro-cancha">Cancha</label>
          <select
            className="input"
            id="filtro-cancha"
            value={filterCourt}
            onChange={(e) => setFilterCourt(e.target.value)}
          >
            <option value="">Todas</option>
            {courts.map((c) => (
              <option key={c.idCourt} value={c.idCourt}>{c.nameCourt}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label className="field__label" htmlFor="filtro-dia">Día</label>
          <select
            className="input"
            id="filtro-dia"
            value={filterDay}
            onChange={(e) => setFilterDay(e.target.value)}
          >
            <option value="">Todos</option>
            {DAYS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label className="field__label" htmlFor="filtro-turno">Turno</label>
          <select
            className="input"
            id="filtro-turno"
            value={filterShift}
            onChange={(e) => setFilterShift(e.target.value)}
          >
            <option value="">Todos</option>
            {SHIFTS.map((s) => (
              <option key={s.value} value={s.value}>{`${s.label} (${s.from} a ${s.to})`}</option>
            ))}
          </select>
        </div>
      </div>

      {notice && <div className="alert" role="status">{notice}</div>}
      {actionError && <div className="alert alert--error" role="alert">{actionError}</div>}

      {loading && <p className="hint">Cargando horarios…</p>}
      {!loading && loadError && <div className="alert alert--error" role="alert">{loadError}</div>}

      {!loading && !loadError && horaries.length === 0 && (
        <p className="hint">No hay horarios para ese filtro.</p>
      )}

      {!loading && !loadError && horaries.length > 0 && (
        <p className="hint">{`${horaries.length} horario(s) para el filtro actual.`}</p>
      )}

      {!loading && !loadError && horaries.length > 0 && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th><th>Cancha</th><th>Día</th><th>Horario</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {horaries.map((h) => (
                <tr key={h.idHorary}>
                  <td>{h.idHorary}</td>
                  <td>{courtName(h.idCourt)}</td>
                  <td>{h.day}</td>
                  <td>{h.label}</td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn--sm" type="button" onClick={() => setEditing(h)}>
                        Editar
                      </button>
                      <button
                        className="btn btn--sm btn--danger"
                        type="button"
                        onClick={() => {
                          setActionError(null)
                          setConfirmingDelete(h)
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
        title="Eliminar horario"
        message={
          confirmingDelete
            ? `Vas a eliminar el horario del ${confirmingDelete.day} de ${confirmingDelete.label} en ${courtName(confirmingDelete.idCourt)}. Esta acción no se puede deshacer.`
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

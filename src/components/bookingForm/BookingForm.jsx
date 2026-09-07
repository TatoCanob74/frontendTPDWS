import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getHorarios, getLocations } from '../../api/courts'
import { getServices } from '../../api/services'
import { createReserve, createPaymentPreference } from '../../api/reserves'
import { SHIFTS } from '../../models/Horary'

const SPORTS = [
  { value: 'futbol', label: 'Fútbol', icon: '⚽' },
  { value: 'tenis', label: 'Tenis', icon: '🎾' },
  { value: 'padel', label: 'Pádel', icon: '🏓' }
]

const DAY_BY_INDEX = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function dayOfWeek(isoDate) {
  const d = new Date(`${isoDate}T12:00:00`)
  return DAY_BY_INDEX[d.getDay()]
}

export default function BookingForm() {
  const [params] = useSearchParams()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [sport, setSport] = useState(params.get('deporte') || 'futbol')
  const [date, setDate] = useState(todayIso())
  const [idLocateCourt, setIdLocateCourt] = useState('')
  const [idHorary, setIdHorary] = useState(null)
  const [selectedServices, setSelectedServices] = useState([])

  // Franja horaria del filtro ('' = todas). Una sede con varias canchas devuelve
  // decenas de horarios para un mismo día; sin filtro son inelegibles a ojo.
  const [shift, setShift] = useState('')

  const [locations, setLocations] = useState([])
  const [locationsError, setLocationsError] = useState(false)
  const [services, setServices] = useState([])

  // Se guarda junto con la "clave" del pedido que la originó, para poder derivar
  // el estado de carga comparando esa clave contra la selección actual (sin
  // necesidad de resetear nada manualmente dentro del efecto).
  const [horariosResult, setHorariosResult] = useState({ key: null, data: [], error: false })

  const [status, setStatus] = useState(null) // { type: 'error' | 'success', message }
  const [submitting, setSubmitting] = useState(false)

  const day = useMemo(() => dayOfWeek(date), [date])
  const horariosKey = sport && idLocateCourt && date ? `${sport}|${idLocateCourt}|${date}` : null

  useEffect(() => {
    getLocations()
      .then(setLocations)
      .catch(() => setLocationsError(true))
    getServices()
      .then(setServices)
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!horariosKey) return
    let ignore = false
    getHorarios({ typeCourt: sport.toUpperCase(), idLocateCourt, day })
      .then((data) => {
        if (!ignore) setHorariosResult({ key: horariosKey, data, error: false })
      })
      .catch(() => {
        if (!ignore) setHorariosResult({ key: horariosKey, data: [], error: true })
      })
    return () => {
      ignore = true
    }
  }, [horariosKey, sport, idLocateCourt, day])

  const horariosLoading = Boolean(horariosKey) && horariosResult.key !== horariosKey
  const horarios = horariosResult.key === horariosKey ? horariosResult.data : []
  const horariosError = horariosResult.key === horariosKey && horariosResult.error

  const visibleHorarios = horarios.filter((h) => h.matchesShift(shift))

  // Se declara acá, junto al resto de los valores derivados y ANTES de las
  // funciones que la usan (toggleShift y handleSubmit). Estando declarada
  // después, cualquier llamada durante el render rompía con
  // "Cannot access 'selectedHorario' before initialization".
  const selectedHorario = horarios.find((h) => h.idHorary === idHorary)

  /** Alterna la franja. Volver a tocar la franja activa vuelve a "todas". */
  function toggleShift(value) {
    const next = shift === value ? '' : value
    setShift(next)

    // Si el horario elegido queda fuera del filtro, se deselecciona: no puede
    // quedar seleccionado algo que el usuario ya no ve en pantalla.
    if (selectedHorario && !selectedHorario.matchesShift(next)) {
      setIdHorary(null)
    }
  }

  function toggleService(idService) {
    setSelectedServices((prev) =>
      prev.includes(idService) ? prev.filter((id) => id !== idService) : [...prev, idService]
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus(null)

    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/canchas' } } })
      return
    }
    if (!selectedHorario) {
      setStatus({ type: 'error', message: 'Elegí un horario para continuar.' })
      return
    }

    setSubmitting(true)
    try {
      const { reserve } = await createReserve({
        typeCourt: sport.toUpperCase(),
        idLocateCourt,
        dateReserve: date,
        day,
        idHorary: selectedHorario.idHorary,
        services: selectedServices
      })
      const { init_point } = await createPaymentPreference(reserve.idReserve)
      window.location.assign(init_point)
    } catch (err) {
      setStatus({
        type: 'error',
        // El backend manda unos errores bajo `error` (reserva) y otros bajo
        // `message` (pago), así que se contemplan los dos: leyendo solo
        // `message` los motivos reales de rechazo quedaban invisibles.
        message:
          err.response?.data?.error ||
          err.response?.data?.message ||
          'No pudimos completar la reserva. Probá de nuevo.'
      })
      setSubmitting(false)
    }
  }


  return (
    <form className="booking" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <span className="field__label" id="lbl-deporte">Deporte</span>
        <div className="sports-tabs" role="group" aria-labelledby="lbl-deporte">
          {SPORTS.map((s) => (
            <button
              key={s.value}
              type="button"
              className="chip"
              aria-pressed={sport === s.value}
              onClick={() => setSport(s.value)}
            >
              <span aria-hidden="true">{s.icon}</span>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="field__row">
        <div className="field">
          <label className="field__label" htmlFor="idLocateCourt">Sede</label>
          <select
            className="input"
            id="idLocateCourt"
            value={idLocateCourt}
            onChange={(e) => setIdLocateCourt(e.target.value)}
          >
            <option value="">Elegí una sede</option>
            {locations.map((loc) => (
              <option key={loc.idLocation} value={loc.idLocation}>{loc.nomLocation}</option>
            ))}
          </select>
          {locationsError && <p className="hint">Las sedes todavía no están disponibles.</p>}
        </div>
        <div className="field">
          <label className="field__label" htmlFor="fecha">Fecha</label>
          <input
            className="input"
            type="date"
            id="fecha"
            min={todayIso()}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      <div className="field">
        <span className="field__label" id="lbl-horario">Horario ({day})</span>

        <div className="sports-tabs" role="group" aria-label="Filtrar por turno">
          <button type="button" className="chip" aria-pressed={shift === ''} onClick={() => setShift('')}>
            Todos
          </button>
          {SHIFTS.map((s) => (
            <button
              key={s.value}
              type="button"
              className="chip"
              aria-pressed={shift === s.value}
              onClick={() => toggleShift(s.value)}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="slots" role="group" aria-labelledby="lbl-horario">
          {visibleHorarios.map((h) => (
            <button
              key={h.idHorary}
              type="button"
              className="chip slot"
              aria-pressed={idHorary === h.idHorary}
              aria-label={h.courtName ? `${h.start}, ${h.courtName}` : h.start}
              onClick={() => setIdHorary(h.idHorary)}
            >
              {h.start}
              {h.courtName && <small className="slot__court">{h.courtName}</small>}
            </button>
          ))}
        </div>
        {!idLocateCourt && <p className="hint">Elegí una sede para ver los horarios.</p>}
        {idLocateCourt && horariosLoading && <p className="hint">Buscando horarios…</p>}
        {idLocateCourt && !horariosLoading && horariosError && (
          <p className="hint">Los horarios todavía no están disponibles.</p>
        )}
        {idLocateCourt && !horariosLoading && !horariosError && horarios.length === 0 && (
          <p className="hint">No hay horarios para ese deporte, sede y día.</p>
        )}
        {idLocateCourt && !horariosLoading && !horariosError && horarios.length > 0 && visibleHorarios.length === 0 && (
          <p className="hint">No hay horarios en ese turno. Probá con otro.</p>
        )}
        {visibleHorarios.length > 0 && (
          <p className="hint">{`${visibleHorarios.length} horario(s) disponible(s).`}</p>
        )}
      </div>

      {services.length > 0 && (
        <div className="field">
          <span className="field__label" id="lbl-servicios">Servicios adicionales</span>
          <div className="slots" role="group" aria-labelledby="lbl-servicios">
            {services.map((s) => (
              <button
                key={s.idService}
                type="button"
                className="chip slot"
                aria-pressed={selectedServices.includes(s.idService)}
                onClick={() => toggleService(s.idService)}
              >
                {s.nameService}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="booking__foot">
        <div className="summary">
          <span className="summary__label">Tu reserva</span>
          <span className="summary__value">
            {SPORTS.find((s) => s.value === sport)?.label} · {date} · {day}
            {selectedHorario
              ? ` · ${selectedHorario.label}${selectedHorario.courtName ? ` · ${selectedHorario.courtName}` : ''}`
              : ' · elegí un horario'}
          </span>
        </div>
        <button className="btn btn--primary" type="submit" disabled={submitting}>
          {submitting ? 'Procesando…' : isAuthenticated ? 'Confirmar y pagar' : 'Ingresá para reservar'}
        </button>
      </div>

      {status && (
        <div className={`alert ${status.type === 'error' ? 'alert--error' : ''}`} role="status">
          {status.message}
        </div>
      )}
    </form>
  )
}

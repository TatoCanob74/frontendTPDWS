import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getCourts, getLocations } from '../../api/courts'
import { getServices } from '../../api/services'
import { createReserve, createPaymentPreference } from '../../api/reserves'
import { DAYS, SHIFTS } from '../../models/horary'
import { formatCurrency } from '../../utils/currency'

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
  if (!isoDate) return null
  const d = new Date(`${isoDate}T12:00:00`)
  return Number.isNaN(d.getTime()) ? null : DAY_BY_INDEX[d.getDay()]
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
  const [shift, setShift] = useState('')
  const [locations, setLocations] = useState([])
  const [locationsError, setLocationsError] = useState(false)
  const [services, setServices] = useState([])
  const [courtsResult, setCourtsResult] = useState({ key: null, data: [], error: false })
  const [status, setStatus] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const day = useMemo(() => dayOfWeek(date), [date])

  useEffect(() => {
    getLocations()
      .then(setLocations)
      .catch(() => setLocationsError(true))
    getServices()
      .then(setServices)
      .catch(() => {})
  }, [])

  useEffect(() => {
    let ignore = false
    getCourts({ typeCourt: sport.toUpperCase() })
      .then((data) => {
        if (!ignore) setCourtsResult({ key: sport, data, error: false })
      })
      .catch(() => {
        if (!ignore) setCourtsResult({ key: sport, data: [], error: true })
      })
    return () => {
      ignore = true
    }
  }, [sport])

  const courtsLoading = courtsResult.key !== sport
  const courtsError = courtsResult.key === sport && courtsResult.error

  const courts = useMemo(
    () => (courtsResult.key === sport ? courtsResult.data : []),
    [courtsResult, sport]
  )

  const sportLabel = SPORTS.find((s) => s.value === sport)?.label.toLowerCase() ?? sport

  const locationHasSport = useCallback(
    (idLocation) => courts.some((c) => String(c.idLocateCourt) === String(idLocation)),
    [courts]
  )

  const courtsInLocation = useMemo(
    () => courts.filter((c) => String(c.idLocateCourt) === String(idLocateCourt)),
    [courts, idLocateCourt]
  )

  const horarios = useMemo(
    () => (day ? courtsInLocation.flatMap((c) => c.horariesForDay(day)) : []),
    [courtsInLocation, day]
  )

  const daysWithSlots = useMemo(
    () => DAYS.filter((d) => courtsInLocation.some((c) => c.horariesForDay(d).length > 0)),
    [courtsInLocation]
  )

  const locationsWithSport = useMemo(
    () => locations.filter((loc) => locationHasSport(loc.idLocation)),
    [locations, locationHasSport]
  )

  const ready = Boolean(idLocateCourt) && Boolean(day) && !courtsLoading && !courtsError

  const visibleHorarios = horarios.filter((h) => h.matchesShift(shift))

  const selectedHorario = horarios.find((h) => h.idHorary === idHorary)

  const chosenServices = useMemo(
    () => services.filter((s) => selectedServices.includes(s.idService)),
    [services, selectedServices]
  )

  const total = useMemo(() => {
    if (!selectedHorario || selectedHorario.hourlyPrice == null) return null
    return chosenServices.reduce(
      (acc, s) => acc + Number(s.priceService),
      Number(selectedHorario.hourlyPrice)
    )
  }, [selectedHorario, chosenServices])

  function toggleShift(value) {
    const next = shift === value ? '' : value
    setShift(next)

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
      const { init_point, autoReturn } = await createPaymentPreference(reserve.idReserve)

      if (autoReturn) {
        window.location.assign(init_point)
        return
      }

      // Sin back_urls MercadoPago no puede devolver al usuario: se abre el
      // checkout en otra pestaña y esta queda esperando el resultado
      const checkout = window.open(init_point, '_blank')
      if (!checkout) {
        window.location.assign(init_point)
        return
      }
      checkout.opener = null
      navigate(`/pago/pendiente?reserva=${reserve.idReserve}&esperando=1`)
    } catch (err) {
      setStatus({
        type: 'error',
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
            {locations.map((loc) => {
              const hasSport = courtsLoading || locationHasSport(loc.idLocation)
              return (
                <option key={loc.idLocation} value={loc.idLocation}>
                  {loc.nomLocation}
                  {hasSport ? '' : ` — sin canchas de ${sportLabel}`}
                </option>
              )
            })}
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
        <span className="field__label" id="lbl-horario">
          Horario{day ? ` (${day})` : ''}
        </span>

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
              aria-label={[h.start, h.courtName, h.formattedPrice].filter(Boolean).join(', ')}
              onClick={() => setIdHorary(h.idHorary === idHorary ? null : h.idHorary)}
            >
              {h.start}
              {h.courtName && <small className="slot__court">{h.courtName}</small>}
              {h.formattedPrice && <small className="slot__price">{h.formattedPrice}</small>}
            </button>
          ))}
        </div>
        {!idLocateCourt && <p className="hint">Elegí una sede para ver los horarios.</p>}
        {idLocateCourt && !day && <p className="hint">Elegí una fecha para ver los horarios.</p>}
        {idLocateCourt && day && courtsLoading && <p className="hint">Buscando horarios…</p>}
        {idLocateCourt && day && !courtsLoading && courtsError && (
          <p className="hint">Los horarios todavía no están disponibles.</p>
        )}

        {ready && courtsInLocation.length === 0 && (
          <p className="hint">
            {`Esta sede no tiene canchas de ${sportLabel}.`}
            {locationsWithSport.length > 0 &&
              ` Sí hay en: ${locationsWithSport.map((l) => l.nomLocation).join(', ')}.`}
          </p>
        )}
        {ready && courtsInLocation.length > 0 && horarios.length === 0 && (
          <p className="hint">
            {`No hay horarios de ${sportLabel} en esta sede los ${day.toLowerCase()}.`}
            {daysWithSlots.length > 0 && ` Días con turnos: ${daysWithSlots.join(', ')}.`}
          </p>
        )}
        {ready && horarios.length > 0 && visibleHorarios.length === 0 && (
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
                aria-label={`${s.nameService}, ${s.formattedPrice}`}
                onClick={() => toggleService(s.idService)}
              >
                {s.nameService}
                <small className="slot__price">+{s.formattedPrice}</small>
              </button>
            ))}
          </div>
        </div>
      )}

      {total !== null && (
        <div className="field">
          <span className="field__label" id="lbl-detalle">Detalle</span>
          <div className="detail-list" aria-labelledby="lbl-detalle">
            <div className="detail-list__row">
              <span>
                Cancha{selectedHorario.courtName ? ` · ${selectedHorario.courtName}` : ''}
                {' · '}
                {selectedHorario.label}
              </span>
              <span className="detail-list__value">{selectedHorario.formattedPrice}</span>
            </div>
            {chosenServices.map((s) => (
              <div className="detail-list__row" key={s.idService}>
                <span>{s.nameService}</span>
                <span className="detail-list__value">{s.formattedPrice}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="booking__foot">
        <div className="summary">
          <span className="summary__label">Tu reserva</span>
          <span className="summary__value">
            {[SPORTS.find((s) => s.value === sport)?.label, date, day].filter(Boolean).join(' · ')}
            {selectedHorario
              ? ` · ${selectedHorario.label}${selectedHorario.courtName ? ` · ${selectedHorario.courtName}` : ''}`
              : ' · elegí un horario'}
          </span>
        </div>
        <div className="summary summary--total">
          <span className="summary__label">Total a pagar</span>
          <span className="summary__value summary__value--total">
            {total !== null ? formatCurrency(total) : '—'}
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

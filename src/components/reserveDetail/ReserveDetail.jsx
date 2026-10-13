export default function ReserveDetail({ reserve }) {
  if (!reserve) return null

  const rows = [
    ['Cliente', reserve.clientName],
    ['Email', reserve.user?.emailUser],
    ['Deporte', reserve.courtLabel],
    ['Cancha', reserve.court?.nameCourt],
    ['Sede', reserve.court?.locationName],
    ['Complejo', reserve.court?.complexName],
    ['Fecha', reserve.dateReserve],
    ['Horario', reserve.scheduleLabel]
  ].filter(([, value]) => Boolean(value))

  const services = reserve.services ?? []

  return (
    <div className="detail-list">
      {rows.map(([label, value]) => (
        <div className="detail-list__row" key={label}>
          <span>{label}</span>
          <span className="detail-list__value">{value}</span>
        </div>
      ))}

      {services.length > 0 && (
        <div className="detail-list__row">
          <span>Servicios</span>
          <span className="detail-list__value">
            {services.map((s) => s.nameService).join(', ')}
          </span>
        </div>
      )}

      <div className="detail-list__row detail-list__row--total">
        <span>{reserve.isPaid ? 'Total pagado' : 'Total'}</span>
        <span className="detail-list__value">{reserve.formattedAmount}</span>
      </div>
    </div>
  )
}

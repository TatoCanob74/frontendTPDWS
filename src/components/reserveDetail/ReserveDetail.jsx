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

      <div className="detail-list__row">
        <span>Forma de pago</span>
        <span className="detail-list__value">{reserve.paymentMethodLabel}</span>
      </div>

      {reserve.isCash && reserve.isPaid && (
        <div className="detail-list__row">
          <span>Seña pagada</span>
          <span className="detail-list__value">{reserve.formattedDeposit}</span>
        </div>
      )}

      {reserve.hasBalance && (
        <div className="detail-list__row">
          <span>Resta pagar en efectivo</span>
          <span className="detail-list__value">{reserve.formattedBalance}</span>
        </div>
      )}

      {reserve.isCashPaid && (
        <div className="detail-list__row">
          <span>Saldo en efectivo</span>
          <span className="detail-list__value">Pagado</span>
        </div>
      )}

      <div className="detail-list__row detail-list__row--total">
        <span>{reserve.isFullyPaid ? 'Total pagado' : 'Total'}</span>
        <span className="detail-list__value">{reserve.formattedAmount}</span>
      </div>
    </div>
  )
}

import BookingForm from '../../components/bookingForm/BookingForm'

export default function Canchas() {
  return (
    <section className="section shell">
      <div className="section-head">
        <span className="eyebrow">Disponibilidad</span>
        <h2>Consultá y reservá</h2>
        <p>Elegí deporte, sede, fecha y horario. Te confirmamos al instante.</p>
      </div>
      <BookingForm />
    </section>
  )
}

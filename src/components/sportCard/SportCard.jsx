import { Link } from 'react-router-dom'

export default function SportCard({ sport, icon, name, desc, feats, className = '' }) {
  return (
    <article className={`card card--${sport} ${className}`} data-reveal>
      <div className="card__icon" aria-hidden="true">{icon}</div>
      <h3>{name}</h3>
      <p className="card__desc">{desc}</p>
      <ul className="card__feats">
        {feats.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
      <div className="card__foot">
        {/* Sin precio: cada cancha tiene su propia tarifa por hora, así que un
            número fijo acá desinformaba. El precio real se ve al elegir el
            horario en el formulario de reserva. */}
        <Link className="btn btn--sm card__cta" to={`/canchas?deporte=${sport}`}>Reservar</Link>
      </div>
    </article>
  )
}

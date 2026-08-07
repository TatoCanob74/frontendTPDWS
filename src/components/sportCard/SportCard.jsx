import { Link } from 'react-router-dom'

export default function SportCard({ sport, icon, name, desc, feats, price, className = '' }) {
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
        <span className="card__price">{price}<small> / hora</small></span>
        <Link className="btn btn--sm card__cta" to={`/canchas?deporte=${sport}`}>Reservar</Link>
      </div>
    </article>
  )
}

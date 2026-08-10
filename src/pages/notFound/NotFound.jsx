import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="section shell">
      <div className="section-head">
        <span className="eyebrow">Error 404</span>
        <h2>No encontramos esta página</h2>
        <p>El link puede estar roto o la página se movió de lugar.</p>
      </div>

      <div className="booking" style={{ maxWidth: 560, textAlign: 'center', gap: 18 }}>
        <Link className="btn btn--primary" to="/">Volver al inicio</Link>
      </div>
    </section>
  )
}

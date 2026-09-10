import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useHeroParticles } from '../../hooks/useHeroParticles'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import SportCard from '../../components/sportCard/SportCard'

const SPORTS = [
  {
    sport: 'futbol',
    icon: '⚽',
    name: 'Fútbol',
    desc: 'Canchas de fútbol 5 y 7 con césped sintético de última generación.',
    feats: ['Césped sintético FIFA Quality', 'Iluminación LED nocturna']
  },
  {
    sport: 'tenis',
    icon: '🎾',
    name: 'Tenis',
    desc: 'Polvo de ladrillo y superficie rápida, mantenidas a diario.',
    feats: ['Polvo de ladrillo profesional', 'Alquiler de raquetas']
  },
  {
    sport: 'padel',
    icon: '🏓',
    name: 'Pádel',
    desc: 'Canchas panorámicas de cristal templado, techadas y climatizadas.',
    feats: ['Paredes de cristal panorámicas', 'Techadas: jugá con lluvia']
  }
]

const STEPS = [
  { icon: '📅', title: 'Elegí fecha y deporte', text: 'Mirá la disponibilidad en tiempo real y encontrá el horario que mejor te quede.' },
  { icon: '💳', title: 'Confirmá tu reserva', text: 'Asegurá tu cancha con una seña online. Sin llamadas, sin vueltas.' },
  { icon: '🏆', title: 'Vení a jugar', text: 'Mostrá tu código de reserva en recepción y entrá directo a la cancha.' }
]

export default function Home() {
  const canvasRef = useRef(null)
  useHeroParticles(canvasRef)
  useScrollReveal()

  return (
    <>
      <section className="hero">
        <canvas ref={canvasRef} id="particles" aria-hidden="true" />
        <div className="hero__court" aria-hidden="true">
          <div className="hero__circle hero__circle--lg" />
          <div className="hero__circle hero__circle--sm" />
          <div className="hero__midline" />
        </div>

        <div className="hero__content">
          <span className="badge" data-reveal>
            <span className="badge__dot" aria-hidden="true" />
            Fútbol · Tenis · Pádel
          </span>
          <h1 data-reveal>Tu cancha lista,<br />cuando vos quieras</h1>
          <p className="hero__sub" data-reveal>
            Reservá canchas de fútbol, tenis y pádel en segundos.
            Disponibilidad en tiempo real, sin llamadas ni esperas.
          </p>
          <div className="hero__actions" data-reveal>
            <Link className="btn btn--light" to="/canchas">Reservar cancha</Link>
            <a className="btn btn--ghost" href="#deportes">Ver deportes</a>
          </div>
          <div className="hero__stats" data-reveal>
            <div className="stat"><div className="stat__num">24</div><div className="stat__label">canchas disponibles</div></div>
            <div className="stat__sep" aria-hidden="true" />
            <div className="stat"><div className="stat__num">7–23h</div><div className="stat__label">todos los días</div></div>
            <div className="stat__sep" aria-hidden="true" />
            <div className="stat"><div className="stat__num">+5.000</div><div className="stat__label">reservas al mes</div></div>
          </div>
        </div>
      </section>

      <section className="section shell" id="deportes">
        <div className="section-head" data-reveal>
          <span className="eyebrow">Deportes</span>
          <h2>Elegí tu cancha</h2>
          <p>Superficies profesionales, iluminación LED y vestuarios incluidos en todas las sedes.</p>
        </div>

        <div className="cards">
          {SPORTS.map((s) => (
            <SportCard key={s.sport} {...s} />
          ))}
        </div>
      </section>

      <section className="section section--alt" id="como-funciona">
        <div className="shell">
          <div className="section-head" data-reveal>
            <span className="eyebrow">Cómo funciona</span>
            <h2>Reservá en 3 pasos</h2>
            <p>De la idea al partido en menos de un minuto.</p>
          </div>

          <div className="steps">
            {STEPS.map((step, i) => (
              <div className="step" data-reveal key={step.title}>
                <span className="step__num">{i + 1}</span>
                <div className="step__icon" aria-hidden="true">{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

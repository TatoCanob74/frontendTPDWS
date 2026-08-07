export default function Footer() {
  return (
    <footer className="footer">
      <div className="shell footer__grid">
        <div className="footer__col">
          <div className="brand">
            <span className="brand__mark" aria-hidden="true">C</span>
            <span className="brand__name">CanchaYa</span>
          </div>
          <p className="footer__about">Alquiler de canchas de fútbol, tenis y pádel. Jugá donde y cuando quieras.</p>
        </div>
        <div className="footer__col">
          <h4>Contacto</h4>
          <span>📍 Av. del Deporte 1234, Buenos Aires</span>
          <span>📞 +54 11 5555-0123</span>
          <span>✉️ hola@canchaya.com</span>
        </div>
        <div className="footer__col">
          <h4>Horarios</h4>
          <span>Lunes a viernes · 7:00 – 23:00</span>
          <span>Sábados y domingos · 8:00 – 23:00</span>
          <span>Feriados · 9:00 – 21:00</span>
        </div>
        <div className="footer__col">
          <h4>Seguinos</h4>
          <div className="socials">
            <a className="social" href="#" aria-label="Instagram">IG</a>
            <a className="social" href="#" aria-label="Facebook">FB</a>
            <a className="social" href="#" aria-label="X">X</a>
            <a className="social" href="#" aria-label="WhatsApp">WA</a>
          </div>
        </div>
      </div>
      <div className="shell footer__bottom">
        <span>© {new Date().getFullYear()} CanchaYa. Todos los derechos reservados.</span>
        <span>Hecho con pasión por el deporte 🏆</span>
      </div>
    </footer>
  )
}

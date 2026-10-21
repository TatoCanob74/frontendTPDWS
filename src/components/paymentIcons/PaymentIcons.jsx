// Íconos de las formas de pago. Son SVG en línea para no sumar una librería de íconos
// y toman el color del texto del botón (currentColor).

export function BanknoteIcon(props) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  )
}

export function MercadoPagoIcon(props) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <ellipse cx="12" cy="12" rx="10" ry="7" />
      <path d="M6.5 12.5l2.5-2 2 1.5 2-1.5 2 1.5 2.5-2" />
    </svg>
  )
}

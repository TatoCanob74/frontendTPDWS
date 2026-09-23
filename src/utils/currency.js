const formatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0
})

export function formatCurrency(value) {
  const number = Number(value)
  return Number.isFinite(number) ? formatter.format(number) : ''
}

export default formatCurrency

const formatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0
})

/**
 * "28000.00" → "$28.000"
 *
 * El backend devuelve los precios como DECIMAL, que Sequelize entrega como
 * string, así que siempre hay que pasarlos por Number antes de formatear.
 */
export function formatCurrency(value) {
  const number = Number(value)
  return Number.isFinite(number) ? formatter.format(number) : ''
}

export default formatCurrency

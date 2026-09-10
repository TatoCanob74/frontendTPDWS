import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

vi.mock('../../api/reserves', () => ({
  getPaymentStatus: vi.fn(),
  confirmPayment: vi.fn()
}))

import PagoPendiente from './PagoPendiente'
import { getPaymentStatus } from '../../api/reserves'

import { Reserve } from '../../models/Reserve'

const PENDIENTE = Reserve.fromDTO({
  idReserve: 12, stateReserva: 'pendiente', paymentStatus: null, paymentId: null, totalAmount: '6500.00'
})

// Forma real de GET /reserves/:id/pago: la reserva con cancha, horario y servicios.
const CONFIRMADA = Reserve.fromDTO({
  idReserve: 12,
  stateReserva: 'confirmada',
  paymentStatus: 'approved',
  paymentId: '177183867195',
  dateReserve: '2026-09-11',
  totalAmount: '6500.00',
  Cancha: {
    idCourt: 6, typeCourt: 'PADEL', nameCourt: 'Punto Cordobes', hourlyPrice: '6500.00',
    Localidad: { idLocation: 3, nomLocation: 'Cordoba' }
  },
  Horario: { idHorary: 13, startTime: '20:00:00', endTime: '21:00:00', day: 'Viernes' },
  Servicios: [{ idService: 1, nameService: 'Parrilla', priceService: '100.00' }]
})

function renderPage(search) {
  return render(
    <MemoryRouter initialEntries={[`/pago/pendiente${search}`]}>
      <Routes><Route path="/pago/pendiente" element={<PagoPendiente />} /></Routes>
    </MemoryRouter>
  )
}

beforeEach(() => vi.clearAllMocks())
afterEach(() => vi.useRealTimers())

describe('PagoPendiente esperando en otra pestaña', () => {
  it('al volver el foco reconsulta y muestra el pago confirmado', async () => {
    // Primera consulta: todavía pendiente. Segunda (al volver el foco): aprobada.
    getPaymentStatus.mockResolvedValueOnce(PENDIENTE).mockResolvedValue(CONFIRMADA)

    renderPage('?reserva=12&esperando=1')

    await screen.findByText(/Estado actual: pendiente/)
    expect(screen.getByRole('heading', { name: 'Esperando tu pago' })).toBeInTheDocument()
    expect(getPaymentStatus).toHaveBeenCalledTimes(1)

    // El usuario vuelve de la pestaña de MercadoPago.
    await act(async () => { window.dispatchEvent(new Event('focus')) })

    await waitFor(() => expect(screen.getByText('Pago aprobado · Reserva confirmada')).toBeInTheDocument())
    expect(getPaymentStatus).toHaveBeenCalledTimes(2)
  })

  it('al confirmarse muestra el detalle de la reserva antes de ir a Mis reservas', async () => {
    getPaymentStatus.mockResolvedValue(CONFIRMADA)
    renderPage('?reserva=12&esperando=1')

    await screen.findByRole('heading', { name: '¡Reserva confirmada!' })
    expect(screen.getByText('Pago aprobado · Reserva confirmada')).toBeInTheDocument()

    // Los datos de la reserva, que antes no se mostraban en ningún lado.
    for (const dato of ['Pádel', 'Punto Cordobes', 'Cordoba', '2026-09-11', '20:00 - 21:00', 'Parrilla']) {
      expect(screen.getByText(dato)).toBeInTheDocument()
    }
    expect(screen.getByText('Total pagado')).toBeInTheDocument()
    expect(screen.getByText(/6\.500/)).toBeInTheDocument()

    // Y sigue estando el camino a la pantalla que ya existía.
    expect(screen.getByRole('link', { name: 'Ver mis reservas' })).toBeInTheDocument()
  })

  it('deja de consultar una vez resuelto el pago', async () => {
    getPaymentStatus.mockResolvedValue(CONFIRMADA)
    renderPage('?reserva=12&esperando=1')

    await screen.findByText('Pago aprobado · Reserva confirmada')
    const llamadas = getPaymentStatus.mock.calls.length

    await act(async () => { window.dispatchEvent(new Event('focus')) })
    expect(getPaymentStatus).toHaveBeenCalledTimes(llamadas)
  })

  it('el estado pendiente no se muestra como error mientras se espera', async () => {
    getPaymentStatus.mockResolvedValue(PENDIENTE)
    renderPage('?reserva=12&esperando=1')

    const alerta = (await screen.findByText(/Estado actual: pendiente/)).closest('.alert')
    expect(alerta).not.toHaveClass('alert--error')
  })
})

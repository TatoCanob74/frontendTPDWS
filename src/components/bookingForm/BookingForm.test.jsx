import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { Court } from '../../models/Court'
import { Service } from '../../models/Service'

vi.mock('../../api/courts', () => ({
  getLocations: vi.fn(),
  getCourts: vi.fn()
}))
vi.mock('../../api/services', () => ({ getServices: vi.fn() }))
vi.mock('../../api/reserves', () => ({
  createReserve: vi.fn(),
  createPaymentPreference: vi.fn()
}))
vi.mock('../../hooks/useAuth', () => ({ useAuth: () => ({ isAuthenticated: true }) }))

import BookingForm from './BookingForm'
import { getLocations, getCourts } from '../../api/courts'
import { getServices } from '../../api/services'

// Forma real de `GET /canchas/verCanchas?typeCourt=FUTBOL`: los horarios vienen
// anidados bajo "Horarios" y el precio por hora como string decimal.
const CAMPUS_ROSARIO = {
  idCourt: 1,
  typeCourt: 'FUTBOL',
  nameCourt: 'Campus Rosario',
  hourlyPrice: '5000.00',
  stateCourt: 'DISPONIBLE',
  capacityPlayers: 10,
  idLocateCourt: 1,
  Horarios: [
    { idHorary: 1, startTime: '10:00:00', endTime: '11:00:00', day: 'Martes' },
    { idHorary: 39, startTime: '19:00:00', endTime: '20:00:00', day: 'Jueves' }
  ],
  Localidad: { idLocation: 1, nomLocation: 'Rosario' }
}

const LOCATIONS = [
  { idLocation: 1, nomLocation: 'Rosario' },
  { idLocation: 3, nomLocation: 'Cordoba' }
]

beforeEach(() => {
  vi.clearAllMocks()
  getLocations.mockResolvedValue(LOCATIONS)
  getServices.mockResolvedValue(
    Service.fromList([{ idService: 1, nameService: 'Parrilla', priceService: '3000.00' }])
  )
  // Solo hay canchas de fútbol, y solo en Rosario.
  getCourts.mockImplementation(({ typeCourt }) =>
    Promise.resolve(typeCourt === 'FUTBOL' ? Court.fromList([CAMPUS_ROSARIO]) : [])
  )
})

function renderForm() {
  return render(
    <MemoryRouter>
      <BookingForm />
    </MemoryRouter>
  )
}

/** Elige sede y fecha, que es el punto de partida de casi todos los casos. */
async function pick(user, { sede, fecha }) {
  await screen.findByRole('option', { name: /Rosario/ })
  await user.selectOptions(screen.getByLabelText('Sede'), sede)
  await user.clear(screen.getByLabelText('Fecha'))
  await user.type(screen.getByLabelText('Fecha'), fecha)
}

describe('BookingForm', () => {
  it('lista los horarios del día con su precio', async () => {
    const user = userEvent.setup()
    renderForm()
    await pick(user, { sede: '1', fecha: '2026-09-10' }) // jueves

    const slot = await screen.findByRole('button', { name: /19:00/ })
    expect(slot).toHaveTextContent('Campus Rosario')
    expect(slot).toHaveTextContent(/5\.000/)
  })

  it('muestra el total antes de confirmar, sumando los servicios elegidos', async () => {
    const user = userEvent.setup()
    renderForm()
    await pick(user, { sede: '1', fecha: '2026-09-10' })

    await user.click(await screen.findByRole('button', { name: /19:00/ }))
    const total = () => screen.getByText('Total a pagar').nextSibling.textContent

    await waitFor(() => expect(total()).toMatch(/5\.000/))
    await user.click(screen.getByRole('button', { name: /Parrilla/ }))
    await waitFor(() => expect(total()).toMatch(/8\.000/))
  })

  it('cuando el día elegido no tiene turnos, dice cuáles sí los tienen', async () => {
    const user = userEvent.setup()
    renderForm()
    await pick(user, { sede: '1', fecha: '2026-09-09' }) // miércoles: sin turnos

    const hint = await screen.findByText(/No hay horarios de fútbol/)
    expect(hint).toHaveTextContent('Días con turnos: Martes, Jueves')
  })

  it('cuando la sede no tiene el deporte, sugiere las sedes que sí lo tienen', async () => {
    const user = userEvent.setup()
    renderForm()
    await pick(user, { sede: '3', fecha: '2026-09-10' }) // Cordoba: sin fútbol

    const hint = await screen.findByText(/Esta sede no tiene canchas de fútbol/)
    expect(hint).toHaveTextContent('Sí hay en: Rosario')
  })

  it('marca en el desplegable las sedes sin canchas del deporte elegido', async () => {
    renderForm()
    expect(await screen.findByRole('option', { name: /Cordoba — sin canchas de fútbol/ })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Rosario' })).toBeInTheDocument()
  })
})

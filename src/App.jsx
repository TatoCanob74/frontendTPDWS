import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/layout/Layout'
import PrivateRoute from './routes/PrivateRoute'
import AdminRoute from './routes/AdminRoute'
import Home from './pages/home/Home'
import Login from './pages/login/Login'
import Register from './pages/register/Register'
import Canchas from './pages/canchas/Canchas'
import Reservas from './pages/reservas/Reservas'
import Admin from './pages/admin/Admin'
import PagoExito from './pages/pago/PagoExito'
import PagoError from './pages/pago/PagoError'
import PagoPendiente from './pages/pago/PagoPendiente'

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/canchas" element={<Canchas />} />
            <Route path="/pago/exito" element={<PagoExito />} />
            <Route path="/pago/error" element={<PagoError />} />
            <Route path="/pago/pendiente" element={<PagoPendiente />} />

            <Route element={<PrivateRoute />}>
              <Route path="/reservas" element={<Reservas />} />
            </Route>

            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<Admin />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App

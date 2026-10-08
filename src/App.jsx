import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/layout/Layout'
import PrivateRoute from './routes/PrivateRoute'
import AdminRoute from './routes/AdminRoute'
import Home from './pages/home/Home'
import Login from './pages/login/Login'
import Register from './pages/register/Register'
import VerifyEmail from './pages/verifyEmail/VerifyEmail'
import ForgotPassword from './pages/forgotPassword/ForgotPassword'
import ResetPassword from './pages/resetPassword/ResetPassword'
import Canchas from './pages/canchas/Canchas'
import Reservas from './pages/reservas/Reservas'
import Perfil from './pages/perfil/Perfil'
import Admin from './pages/admin/Admin'
import PagoExito from './pages/pago/PagoExito'
import PagoError from './pages/pago/PagoError'
import PagoPendiente from './pages/pago/PagoPendiente'
import NotFound from './pages/notFound/NotFound'

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verifyemail" element={<VerifyEmail />} />
            <Route path="/forgotpassword" element={<ForgotPassword />} />
            <Route path="/resetpassword" element={<ResetPassword />} />
            <Route path="/canchas" element={<Canchas />} />
            <Route path="/pago/exito" element={<PagoExito />} />
            <Route path="/pago/error" element={<PagoError />} />
            <Route path="/pago/pendiente" element={<PagoPendiente />} />

            <Route element={<PrivateRoute />}>
              <Route path="/reservas" element={<Reservas />} />
              <Route path="/perfil" element={<Perfil />} />
            </Route>

            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<Admin />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App

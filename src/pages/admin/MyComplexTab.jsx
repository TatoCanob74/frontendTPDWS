import { useState } from 'react'
import { updateComplex } from '../../api/complexes'
import ComplexForm from '../../components/complexForm/ComplexForm'

function messageFrom(err, fallback) {
  return err.response?.data?.error || err.response?.data?.message || fallback
}

// Solo admin de complejo: los datos de su complejo. Puede cambiar nombre y dirección;
// la localidad y quién lo administra los decide el superadmin.
// complex viene de Admin.jsx y onUpdated le pide que lo vuelva a cargar.
export default function MyComplexTab({ complex, onUpdated }) {
  const [editing, setEditing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)
  const [notice, setNotice] = useState(null)

  async function handleSubmit(payload) {
    setSubmitting(true)
    setFormError(null)
    try {
      await updateComplex(complex.idComplex, payload)
      await onUpdated()
      setNotice('Datos del complejo actualizados.')
      setEditing(false)
    } catch (err) {
      setFormError(messageFrom(err, 'No pudimos guardar los cambios.'))
    } finally {
      setSubmitting(false)
    }
  }

  if (editing) {
    return (
      <ComplexForm
        complex={complex}
        restricted
        submitting={submitting}
        error={formError}
        onSubmit={handleSubmit}
        onCancel={() => {
          setEditing(false)
          setFormError(null)
        }}
      />
    )
  }

  return (
    <>
      {notice && <div className="alert" role="status">{notice}</div>}

      <div className="booking">
        <h3>{complex.nameComplex}</h3>

        <div className="field__row">
          <div className="summary">
            <span className="summary__label">Dirección</span>
            <span className="summary__value">{complex.addressComplex}</span>
          </div>
          <div className="summary">
            <span className="summary__label">Localidad</span>
            <span className="summary__value">
              {complex.location ? `${complex.location.nomLocation}, ${complex.location.nameCountry}` : '—'}
            </span>
          </div>
        </div>

        <div className="summary">
          <span className="summary__label">Canchas</span>
          <span className="summary__value">{complex.courts.length}</span>
        </div>

        <div className="booking__foot">
          <p className="hint">Para cambiar la localidad del complejo, contactá al superadministrador.</p>
          <button className="btn btn--primary" type="button" onClick={() => setEditing(true)}>
            Editar datos
          </button>
        </div>
      </div>
    </>
  )
}

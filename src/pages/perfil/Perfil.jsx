import { useEffect, useState } from 'react'
import { getMyProfile, updateMyProfile } from '../../api/users'
import { User } from '../../models/User'
import { maxBirthDateIso, minBirthDateIso, validateBirthDate } from '../../utils/birthDate'

const emptyForm = {
  nameUser: '',
  surnameUser: '',
  aliasUser: '',
  birthDateIso: ''
}

/** Perfil del usuario logueado: ver los datos de la cuenta y editarlos. */
export default function Perfil() {
  const [user, setUser] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  // Se pasa a true recién cuando el usuario toca "Editar", así la pantalla
  // arranca mostrando los datos y no un formulario abierto.
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)

  useEffect(() => {
    getMyProfile()
      .then((data) => {
        setUser(data)
        setForm({
          nameUser: data.nameUser ?? '',
          surnameUser: data.surnameUser ?? '',
          aliasUser: data.aliasUser ?? '',
          birthDateIso: data.birthDateIso
        })
      })
      .catch(() => setLoadError('No pudimos cargar tu perfil. Probá de nuevo en un rato.'))
      .finally(() => setLoading(false))
  }, [])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function startEditing() {
    setNotice(null)
    setError(null)
    setEditing(true)
  }

  /** Descarta los cambios y vuelve a mostrar lo que está guardado. */
  function cancelEditing() {
    setForm({
      nameUser: user.nameUser ?? '',
      surnameUser: user.surnameUser ?? '',
      aliasUser: user.aliasUser ?? '',
      birthDateIso: user.birthDateIso
    })
    setError(null)
    setEditing(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setNotice(null)

    if (!form.nameUser.trim() || !form.surnameUser.trim() || !form.aliasUser.trim()) {
      setError('Nombre, apellido y alias son obligatorios.')
      return
    }

    const birthDateError = validateBirthDate(form.birthDateIso)
    if (birthDateError) {
      setError(birthDateError)
      return
    }

    setSaving(true)
    try {
      const { user: updated } = await updateMyProfile(User.toPayload(form))
      setUser(User.fromDTO(updated))
      setNotice('Perfil actualizado correctamente.')
      setEditing(false)
    } catch (err) {
      setError(err.response?.data?.error || 'No pudimos guardar los cambios. Probá de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="section shell">
      <div className="section-head">
        <span className="eyebrow">Tu cuenta</span>
        <h2>Mi perfil</h2>
        <p>Revisá y actualizá los datos de tu cuenta de CanchaYa.</p>
      </div>

      {loading && <p className="hint">Cargando perfil…</p>}
      {!loading && loadError && <div className="alert alert--error" role="alert">{loadError}</div>}

      {!loading && !loadError && user && (
        <form className="booking" style={{ maxWidth: 640 }} onSubmit={handleSubmit} noValidate>
          {notice && <div className="alert" role="status">{notice}</div>}
          {error && <div className="alert alert--error" role="alert">{error}</div>}

          <div className="field">
            <span className="field__label">Email</span>
            <input className="input" value={user.emailUser} disabled readOnly />
            <p className="hint">El email identifica tu cuenta y no se puede cambiar.</p>
          </div>

          <div className="field__row">
            <div className="field">
              <label className="field__label" htmlFor="nameUser">Nombre</label>
              <input
                className="input"
                id="nameUser"
                name="nameUser"
                disabled={!editing}
                value={form.nameUser}
                onChange={handleChange}
              />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="surnameUser">Apellido</label>
              <input
                className="input"
                id="surnameUser"
                name="surnameUser"
                disabled={!editing}
                value={form.surnameUser}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="field__row">
            <div className="field">
              <label className="field__label" htmlFor="aliasUser">Alias</label>
              <input
                className="input"
                id="aliasUser"
                name="aliasUser"
                disabled={!editing}
                value={form.aliasUser}
                onChange={handleChange}
              />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="birthDateIso">Fecha de nacimiento</label>
              <input
                className="input"
                type="date"
                id="birthDateIso"
                name="birthDateIso"
                min={minBirthDateIso()}
                max={maxBirthDateIso()}
                disabled={!editing}
                value={form.birthDateIso}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="booking__foot">
            <div className="summary">
              <span className="summary__label">Tipo de cuenta</span>
              <span className="summary__value">{user.isAdmin ? 'Administrador' : 'Cliente'}</span>
            </div>

            {editing ? (
              <div className="row-actions">
                <button className="btn btn--outline" type="button" disabled={saving} onClick={cancelEditing}>
                  Cancelar
                </button>
                <button className="btn btn--primary" type="submit" disabled={saving}>
                  {saving ? 'Guardando…' : 'Guardar cambios'}
                </button>
              </div>
            ) : (
              <button className="btn btn--primary" type="button" onClick={startEditing}>
                Editar perfil
              </button>
            )}
          </div>
        </form>
      )}
    </section>
  )
}

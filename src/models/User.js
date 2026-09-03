import { fromBackendDate, toBackendDate } from '../utils/birthDate'

/**
 * Usuario logueado.
 *
 * El backend guarda la fecha de nacimiento como "dd/mm/aaaa"; esta clase la
 * expone también en el formato del `<input type="date">` para que la pantalla
 * de perfil no tenga que dar vuelta strings a mano.
 */
export class User {
  constructor({ idUser, nameUser, surnameUser, aliasUser, emailUser, dateUser, typeUser, stateUser }) {
    this.idUser = idUser
    this.nameUser = nameUser
    this.surnameUser = surnameUser
    this.aliasUser = aliasUser
    this.emailUser = emailUser
    this.dateUser = dateUser
    this.typeUser = typeUser
    this.stateUser = stateUser
  }

  /** Factory Method: construye una instancia desde la respuesta cruda del backend. */
  static fromDTO(dto) {
    return new User(dto)
  }

  get fullName() {
    return `${this.nameUser ?? ''} ${this.surnameUser ?? ''}`.trim()
  }

  get isAdmin() {
    return this.typeUser === 'ADMIN'
  }

  /** "24/07/2004" → "2004-07-24", que es lo que espera el input de fecha. */
  get birthDateIso() {
    return fromBackendDate(this.dateUser)
  }

  /** Los campos que acepta `PUT /usuarios/me`, con la fecha ya convertida. */
  static toPayload({ nameUser, surnameUser, aliasUser, birthDateIso }) {
    return {
      nameUser: nameUser.trim(),
      surnameUser: surnameUser.trim(),
      aliasUser: aliasUser.trim(),
      dateUser: toBackendDate(birthDateIso)
    }
  }
}

export default User

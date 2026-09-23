import { fromBackendDate, toBackendDate } from '../utils/birthDate'

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

  static fromDTO(dto) {
    return new User(dto)
  }

  get fullName() {
    return `${this.nameUser ?? ''} ${this.surnameUser ?? ''}`.trim()
  }

  get isAdmin() {
    return this.typeUser === 'ADMIN'
  }

  get birthDateIso() {
    return fromBackendDate(this.dateUser)
  }

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

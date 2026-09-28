import { fromBackendDate, toBackendDate } from '../utils/birthDate'
import { isAdminRole, isSuperAdminRole, ROLE_LABELS } from '../utils/roles'

export class User {
  constructor({ idUser, nameUser, surnameUser, aliasUser, emailUser, dateUser, typeUser, stateUser, managedComplex = null }) {
    this.idUser = idUser
    this.nameUser = nameUser
    this.surnameUser = surnameUser
    this.aliasUser = aliasUser
    this.emailUser = emailUser
    this.dateUser = dateUser
    this.typeUser = typeUser
    this.stateUser = stateUser
    // Solo lo trae GET /admins: el complejo que administra (o null)
    this.managedComplex = managedComplex
  }

  static fromDTO(dto) {
    return new User(dto)
  }

  static fromList(dtos = []) {
    return dtos.map(User.fromDTO)
  }

  get fullName() {
    return `${this.nameUser ?? ''} ${this.surnameUser ?? ''}`.trim()
  }

  get isAdmin() {
    return isAdminRole(this.typeUser)
  }

  get isSuperAdmin() {
    return isSuperAdminRole(this.typeUser)
  }

  get roleLabel() {
    return ROLE_LABELS[this.typeUser] ?? this.typeUser
  }

  get isActive() {
    return this.stateUser === 'ACTIVO'
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

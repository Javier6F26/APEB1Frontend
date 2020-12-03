export interface User {
  userName?: string
  token?: string
  authenticated?: boolean
  lastSignIn?: Date
  displayName: string
  email: string
  phoneNumber: string
  photoUrl: string
  permScope: PermMatrix
}

export interface PermMatrix {
  users: PermCRUD
  invent: PermCRUD
  services: PermCRUD
}

export interface PermCRUD {
  create: boolean,
  list: boolean,
  modify: boolean,
  delete: boolean
}

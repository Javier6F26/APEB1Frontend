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
  role: string
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

export const adminPerMatrix: PermMatrix = {
  users: {create: true, list: true, modify: true, delete: true},
  invent: {create: true, list: true, modify: true, delete: true},
  services: {create: true, list: true, modify: true, delete: true}
}


export const accountingPerMatrix: PermMatrix = {
  users: {create: true, list: true, modify: true, delete: false},
  invent: {create: true, list: true, modify: true, delete: false},
  services: {create: false, list: true, modify: true, delete: true}
}

export const operatorPerMatrix: PermMatrix = {
  users: {create: false, list: true, modify: false, delete: false},
  invent: {create: true, list: true, modify: false, delete: false},
  services: {create: true, list: true, modify: false, delete: false}
}

export const secretaryPerMatrix: PermMatrix = {
  users: {create: false, list: false, modify: false, delete: false},
  invent: {create: false, list: false, modify: false, delete: false},
  services: {create: true, list: true, modify: false, delete: false}
}


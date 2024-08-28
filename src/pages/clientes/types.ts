// types.ts
export interface Usuario {
  IdUsuario: number
  Nombre: string
  Apellidos: string
  CorreoElectronico: string
  EstadoUsuario: string
  TipoDocumento: string
  NumeroDocumento: string
  FechaNacimiento: string
}

export interface Cliente {
  IdCliente: number
  Nombre: string
  Apellidos: string
  TipoDocumento: string
  NumeroDocumento: string
  CorreoElectronico: string
  Contrasena: string
  IdRol: number
  EstadoUsuario: string
  FechaNacimiento: string
  Direccion: string
  Telefono: string
  Usuario: Usuario
  IdUsuarioCliente: number
}

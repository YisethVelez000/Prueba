export type Usuario = {
  IdUsuario?: number
  Nombre: string
  Apellidos: string
  CorreoElectronico: string
  TipoDocumento: string
  NumeroDocumento: string
  Contrasena?: string
  IdRol: number
  EstadoUsuario: string
  FechaNacimiento?: string
  FechaFinalizacion?: string
  FechaInicio?: string
}

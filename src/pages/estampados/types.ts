export type Ubicaciones = {
  IdUbicacion: number
  Ubicacion: string
}

export type Estampado = {
  IdEstampado: number
  TipoEstampado: string
  PrecioEstampado: number
  EstadoEstampado: string
  UbicacionEstampado: number[] // Cambiar de string a number[]
  Largo: number
  Ancho: number
  Alto: number
}

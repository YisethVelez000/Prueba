/* eslint-disable prettier/prettier */

export type PedidosVentas = {
  NumeroPedido: number
  TotalPedido: number
  EstadoPedido?: string
  DireccionEnvio: string
  FechaPedido: string
  FechaEntrega: string
  FormaPago: string
  ComprobantePago?: string
  MotivoRechazo?: string
  FechaYhoraEstimada?: string
  EstadoVenta?: string
  IdCliente?: number
  // Cliente: Cliente
}

// Define el tipo Usuario
export interface Usuario {
  FechaNacimiento: string
  idRol: number
  IdUsuario: number
  IdUsuarioCliente: number
  Nombre: string
  Apellidos: string
  CorreoElectronico: string
  EstadoUsuario: string
  NumeroDocumento: string
  TipoDocumento: string
  Cliente: Cliente //Relacion Con Cliente
}

// Define el tipo Cliente
export type Cliente = {
  IdCliente: number
  Direccion: string
  Telefono: string
  IdUsuarioCliente: number
  Usuario: Usuario // Relación con Usuario
}

export type Insumo = {
  IdInsumo: number
  NombreInsumo?: string
  CantidadInsumo?: number
  Iva?: number
  EstadoInsumo?: string
  Agotado?: string
  IdMedida?: number
  IdInsumoCompra?: number // Agregamos la propiedad IdInsumoCompra
  medidas_has_insumo?: {
    IdMedida: number
    UnidadMedida: string
  }
  UnidadMedida?: string
  seleccionado?: boolean
}

export type Proveedor = {
  IdProveedor?: number
  NombreProveedor: string
  Nit: string
  NombreContacto: string
  ApellidoContacto: string
  TelefonoEmpresa: string
  Direccion: string
  CorreoElectronico: string
  EstadoProveedor?: string
  seleccionado?: boolean // Agregar la propiedad seleccionado
}

export type Compra = {
  IdCompra?: number
  FechaCompra: Date
  Recibo: string
  Anulada?: string
  ImagenRecibo: string
  PrecioTotalCompra: number
  MotivoAnulacion?: string
  IdProveedor: number
  Insumos: Insumo[]
}

export type InsumoCompra = {
  IdInsumoCompra: number // Identificador único para la relación entre la compra y el insumo
  IdInsumo: number // Identificador del insumo
  IdCompra: number // Identificador de la compra
  CantidadCompra: number // Cantidad del insumo comprada en esta compra específica
  PrecioUnitario: number
  PrecioTotal: number
  NombreInsumo?: string
  insumo?: Insumo // Precio unitario del insumo en esta compra específica
}

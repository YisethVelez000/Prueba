/* eslint-disable prettier/prettier */
export type Insumo = {
  IdInsumo: number
  NombreInsumo: string
  CantidadInsumo: number
  Iva?: number
  EstadoInsumo: string
  Agotado: string
  IdMedida?: number
}

// Define una interfaz para el tipo de datos de las medidas
export interface medidas_has_insumo {
  IdMedida: number
  UnidadMedida: string
}

// medidas_has_insumo?: {
//   IdMedida: number
//   UnidadMedida: string
// }
// UnidadMedida?: string
// seleccionado?: boolean

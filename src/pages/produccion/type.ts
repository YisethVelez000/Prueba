export interface OrdenProduccion {
  NumeroOrdenProduccion: number
  FechaEstimada: string
  EsProduccionInterna: string
  Produccion_Has_Producto?: Produccion_Has_Producto[]
  Estampado: Estampado[]
  EstadoOrden: string
  Terciarias: Terciarias[]
}

export interface Produccion_Has_Producto {
  IdProducto: number
  Cantidad: number
  Talla: SimplifiedTalla // Usando la talla simplificada
  Color: Color // Usando el tipo Color
}

export interface Estampado {
  IdEstampado: number
  IdProducto: number
  IdUbicacion: number
  Cantidad: number
  Talla: SimplifiedTalla // Usando la talla simplificada
  Color: Color // Usando el tipo Color
}

export interface Terciarias {
  IdTerciaria: number
  ValorAPagar: number
}

// Interfaces importadas desde FichaTecnica para la relación de colores, tallas, e imágenes
export enum TallaEnum {
  XS = 'XS',
  S = 'S',
  M = 'M',
  L = 'L',
  XL = 'XL',
  XXL = 'XXL',
}

export interface Color {
  IdColor: number
  Color: string
}

export interface Talla {
  IdTalla: number
  Talla: TallaEnum
  Largo: number
  Ancho: number
  Hombro: number
  LargoManga: number
}

type SimplifiedTalla = Omit<Talla, 'Largo' | 'Ancho' | 'Hombro' | 'LargoManga'>

export interface Imagen {
  IdImagen?: number
  imagen?: string
  url?: string
}

export interface UploadedImage {
  file: File
  IdImagen?: number
  imagen?: string
  Imagen: Imagen
}

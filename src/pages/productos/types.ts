/* eslint-disable prettier/prettier */
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

export interface Estampado {
  IdEstampado: number
  TipoEstampado: string
}
export interface FichaTecnica {
  IdFichaTecnica?: number
  NombreProducto?: string
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

export interface Producto {
  data?: {
    IdProducto: number
    NombreProductoCatalago: string
    FechaRegistro: Date
    PrecioProducto: number
    Personalizable: string
    EstadoProducto: string
    Producto_has_Colores: { IdProductoColor: number; Color: { IdColor: number; Color: string } }[]
    Producto_has_Tallas: { IdProductosTallas: number; Talla: { IdTalla: number; Talla: TallaEnum } }[]
    Producto_Has_Imagens: { IdProductoImagen: number; Imagen: { IdImagen: number; imagen: string } }[]
    EstampadoProductos: { IdEstampadoProducto: number; Estampado: { IdEstampado: number; TipoEstampado: string } }[]
  } | null
  IdProducto: number
  NombreProductoCatalogo: string
  FechaRegistro: string
  PrecioProducto: number
  Personalizable: string
  EstadoProducto: string
  IdFichaTecnica: number
  Producto_has_Colores: ProductoColor[]
  Producto_has_Tallas: ProductoTalla[]
  Producto_Has_Imagens: ProductoImagen[]
  EstampadoProductos: EstampadoProducto[]
  cantidad?: number
}

export interface ProductoColor {
  IdProductoColor: number
  Color: Color
}

export interface ProductoTalla {
  IdProductosTallas: number
  Talla: SimplifiedTalla
}

export interface ProductoImagen {
  IdProductoImagen: number
  Imagen: Imagen
}

export interface EstampadoProducto {
  IdEstampadoProducto: number
  TipoEstampado: Estampado
}

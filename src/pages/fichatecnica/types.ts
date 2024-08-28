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
  file: File // El archivo de imagen
  IdImagen?: number // El ID de la imagen (opcional, se puede establecer cuando se obtiene del backend)
  imagen?: string
  Imagen: Imagen
  // La URL de la imagen (opcional, se puede establecer cuando se obtiene del backend)
}

export interface FichaTecnica {
  data?: {
    IdFichaTecnica: number
    NombreProducto: string
    EstadoFicha: string
    Ficha_Has_Colores: { IdFichaColor: number; Color: { IdColor: number; Color: string } }[]
    Ficha_Has_Tallas: { IdFichaTalla: number; Talla: { IdTalla: number; Talla: TallaEnum } }[]
    Ficha_Has_Imagens: { IdFichaTecnicaImagen: number; Imagen: { IdImagen: number; imagen: string } }[]
  } | null
  IdFichaTecnica: number
  NombreProducto: string
  EstadoFicha: string
  Ficha_Has_Colores: FichaColor[]
  Ficha_Has_Tallas: FichaTalla[]
  Ficha_Has_Imagens: FichaImagen[]
}

export interface FichaColor {
  IdFichaColor: number
  Color: Color
}

export interface FichaTalla {
  IdFichaTalla: number
  Talla: SimplifiedTalla
}

export interface FichaImagen {
  IdFichaTecnicaImagen: number
  Imagen: Imagen
}

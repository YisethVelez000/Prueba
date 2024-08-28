// Definición de las interfaces según las tablas de la base de datos

export interface DetalleEstampadoVenta {
  IdDetalleEstampado: number
  IdPedidoVenta: number
  IdEstampado: number
  TipoEstampado: string
  Ubicacion: string
  ImagenEstampado: string
}

export interface DetalleVentas {
  IdPedidoProducto: number
  IdProducto: number
  Color: string
  Talla: string
  Cantidad: number
  PrecioUnitario: number
  PrecioTotal: number
  IdPedidosVentas: number
}

export interface Imagen {
  url: string
}

// Estructura de un Producto con estampados y detalles asociados
export interface ProductoConEstampados {
  IdProducto: number
  NombreProducto: string
  ImagenProducto: string
  Color: string
  Talla: string
  Cantidad: number
  PrecioUnitario: number
  PrecioTotal: number
  Estampados: DetalleEstampadoVenta[]
}

// Estado del carrito en la aplicación
export interface CarritoState {
  cartProducts: ProductoConEstampados[]
}

import { sleep } from '../../services/utils'
import { Color, Producto, Talla } from './../../pages/productos/types'
import usersDb from './users-db.json'
import axios from 'axios'

//const { init: notify } = useToast();
// Datos quemados
export const productos = usersDb as unknown as Producto[]

// Simulate API calls

export type Pagination = {
  page: number
  perPage: number
  total: number
}

export type Sorting = {
  sortBy: keyof Producto | undefined
  sortingOrder: 'asc' | 'desc' | null
}

export type Filters = {
  isActive: boolean
  search: string
}

export const ListarProducto = async (filters: Partial<Filters & Pagination & Sorting>) => {
  try {
    // Realizar la solicitud GET a la API
    const response = await axios.get('https://apinodedvp.onrender.com/productos', { params: filters })
    const data: Producto[] = response.data

    // Aplicar filtro de búsqueda si se proporciona
    let filteredData = data
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filteredData = data.filter((producto: Producto) => {
        return (
          producto.NombreProductoCatalogo.toLowerCase().includes(searchTerm),
          producto.PrecioProducto.toLocaleString().includes(searchTerm)
        )
      })
    }

    // Aplicar filtro de estado
    if (filters.isActive !== undefined) {
      filteredData = filteredData.filter((producto: Producto) => {
        return producto.EstadoProducto === (filters.isActive ? 'Activo' : 'Inactivo')
      })
    }

    // Calcular la paginación y devolver los datos filtrados
    const totalRegistros = filteredData.length
    const registrosPorPagina = filters.perPage || 10
    const paginaActual = filters.page || 1

    const startIndex = (paginaActual - 1) * registrosPorPagina
    const endIndex = Math.min(startIndex + registrosPorPagina, totalRegistros)
    const registrosPagina = filteredData.slice(startIndex, endIndex)

    const pagination: Pagination = {
      page: paginaActual,
      perPage: registrosPorPagina,
      total: totalRegistros,
    }

    return { data: registrosPagina, pagination }
  } catch (error) {
    console.error('Error al listar productos:', error)
    throw error
  }
}

export const ObtenerColores = async () => {
  try {
    const response = await axios.get('https://apinodedvp.onrender.com/colores/listarColores')
    return response.data
  } catch (error) {
    console.error('Error al obtener los colores:', error)
    throw error
  }
}

export const ObtenerEstampados = async () => {
  try {
    const response = await axios.get('https://apinodedvp.onrender.com/estampados')
    return response.data
  } catch (error) {
    console.error('Error al obtener los estampados:', error)
    throw error
  }
}

export const ObtenerFichaTecnica = async () => {
  try {
    const response = await axios.get('https://apinodedvp.onrender.com/fichaTecnica')
    return response.data
  } catch (error) {
    console.error('Error al obtener las fichas tecnicas:', error)
    throw error
  }
}

export const ObtenerTallas = async () => {
  try {
    const response = await axios.get('https://apinodedvp.onrender.com/talla/listarTalla')
    if (response.data && Array.isArray(response.data)) {
      // Mapear el arreglo de respuesta para extraer solo el atributo 'Talla'
      return response.data.map((talla: any) => talla.Talla)
    } else {
      throw new Error('La respuesta de la API no es un array válido')
    }
  } catch (error) {
    console.error('Error al obtener las tallas:', error)
    throw error
  }
}

export const EditarProducto = async (producto: Producto) => {
  try {
    if (!producto || producto.IdProducto === undefined) {
      throw new Error('Producto inválido o faltan datos')
    }

    await sleep(1000)
    const response = await axios.put(`https://apinodedvp.onrender.com/productos/${producto.IdProducto}`, producto)

    if (response.status !== 200) {
      throw new Error('Error al editar la ficha')
    }

    const index = productos.findIndex((u) => u.IdProducto === producto.IdProducto)
    if (index !== -1) {
      productos[index] = producto
    }
  } catch (error) {
    console.error('Error al editar el producto:', error)
    throw error
  }
}

const API_URL = 'https://apinodedvp.onrender.com/productos'
export const ObtenerProductoPorId = async (IdProducto: string): Promise<Producto> => {
  try {
    console.log('ID del producto:', IdProducto)

    // Convertir el IdFicha de string a number
    const id = parseInt(IdProducto)
    console.log('ID del producto convertido:', id)

    const response = await axios.get<Producto>(`${API_URL}/${IdProducto}`)
    return response.data
  } catch (error) {
    console.error('Error al obtener el producto por ID:', error)
    throw error
  }
}

// Ajusta la URL según sea necesario
const API_URL2 = 'https://apinodedvp.onrender.com/estampados'
// Función para obtener un estampado con sus ubicaciones
export const ObtenerEstampadoConUbicaciones = async (IdEstampado: number) => {
  try {
    const response = await axios.get(`${API_URL2}/${IdEstampado}`)
    return response.data
  } catch (error) {
    console.error('Error al obtener el estampado con ubicaciones:', error)
    throw error // Lanza el error para que pueda ser manejado en la función que llama
  }
}

export const EliminarProducto = async (producto: Producto, productos: Producto[]): Promise<void> => {
  try {
    if (!producto || producto.IdProducto === undefined) {
      throw new Error('Producto inválido o faltan datos')
    }

    // Realiza la solicitud DELETE al servidor
    const response = await axios.delete(`https://apinodedvp.onrender.com/productos/${producto.IdProducto}`)

    // Verifica si la eliminación fue exitosa
    if (response.status === 200) {
      // Elimina la ficha de la lista local
      const index = productos.findIndex((p) => p.IdProducto === producto.IdProducto)
      if (index !== -1) {
        productos.splice(index, 1)
      }
    } else {
      throw new Error('Error al eliminar el producto')
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      switch (error.response.status) {
        case 400:
          throw new Error('No se puede eliminar el producto porque está asociado a otra tabla')
        case 404:
          throw new Error('Producto no encontrado')
        default:
          throw new Error('Error al eliminar el producto')
      }
    } else {
      console.error('Error al eliminar el producto:', error)
      throw error
    }
  }
}
// Ajusta la ruta según tus tipos definidos

export async function AgregarProducto(
  producto: Omit<Producto, 'IdProducto'>,
  colores: Color[],
  tallas: Talla[],
  imagenes: File[],
): Promise<Producto> {
  try {
    const formData = new FormData()
    const ProductoConColores = {
      ...producto,
      ProductoHasColores: colores.map((color) => ({
        Color: { IdColor: color.IdColor },
      })),
      ProductoHasTallas: tallas.map((talla) => ({
        Talla: {
          IdTalla: talla.IdTalla,
          Talla: talla.Talla,
        },
      })),
    }

    formData.append('producto', JSON.stringify(ProductoConColores))

    imagenes.forEach((imagen) => {
      formData.append('imagenes', imagen)
    })

    // Log the FormData entries
    console.log('Contenido de FormData antes de enviar:')
    for (const [key, value] of formData.entries()) {
      console.log(key, value)
    }

    const response = await axios.post<Producto>('https://apinodedvp.onrender.com/productos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    if (response.status !== 201) {
      throw new Error('Error al agregar la ficha')
    }

    return response.data
  } catch (error) {
    console.error('Error al agregar el producto:', error)
    throw error
  }
}

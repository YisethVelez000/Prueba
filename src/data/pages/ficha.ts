import { sleep } from '../../services/utils'
import { Color, FichaTecnica, Talla } from './../../pages/fichatecnica/types'
import usersDb from './users-db.json'
import axios from 'axios'

// Datos quemados
export const fichas = usersDb as unknown as FichaTecnica[]

export type Pagination = {
  page: number
  perPage: number
  total: number
}

// export type Sorting = {
//   sortBy: keyof FichaTecnica | undefined
//   sortingOrder: 'asc' | 'desc' | null
// }

export type Filters = {
  isActive: string
  search: string
}

export const ListarFicha = async (pagination: Pagination, filters: Partial<Filters>) => {
  try {
    // Realizar la solicitud GET a la API con los parámetros de filtros, paginación y ordenamiento
    const response = await axios.get('https://apinodedvp.onrender.com/fichatecnica', { params: filters })
    let data = response.data
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      data = data.filter(
        (ficha: FichaTecnica) =>
          ficha.NombreProducto.toLowerCase().includes(searchTerm) ||
          ficha.EstadoFicha.toLowerCase().includes(searchTerm),
      )
    }

    // Calcular la paginación y devolver los datos filtrados
    const totalRegistros = data.length
    const registrosPorPagina = pagination.perPage
    const paginaActual = pagination.page

    const startIndex = (paginaActual - 1) * registrosPorPagina
    const endIndex = Math.min(startIndex + registrosPorPagina, totalRegistros)
    const registrosPagina = data.slice(startIndex, endIndex)

    const newPagination: Pagination = {
      page: paginaActual,
      perPage: registrosPorPagina,
      total: totalRegistros,
    }

    return { data: registrosPagina, pagination: newPagination }
  } catch (error) {
    console.error('Error al listar fichas técnicas:', error)
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

export const EditarFicha = async (ficha: FichaTecnica) => {
  try {
    if (!ficha || ficha.IdFichaTecnica === undefined) {
      throw new Error('Ficha inválida o faltan datos')
    }

    await sleep(1000)
    const response = await axios.put(`https://apinodedvp.onrender.com/fichaTecnica/${ficha.IdFichaTecnica}`, ficha)

    if (response.status !== 200) {
      throw new Error('Error al editar la ficha')
    }

    const index = fichas.findIndex((u) => u.IdFichaTecnica === ficha.IdFichaTecnica)
    if (index !== -1) {
      fichas[index] = ficha
    }
  } catch (error) {
    console.error('Error al editar la ficha:', error)
    throw error
  }
}

export const ObtenerFichaPorId = async (IdFichaTecnica: string): Promise<FichaTecnica> => {
  try {
    // Realizar la petición HTTP para obtener la ficha técnica por su ID
    const response = await axios.get<FichaTecnica>(`https://apinodedvp.onrender.com/fichaTecnica/${IdFichaTecnica}`)

    // Extraer los datos de la respuesta
    const fichaTecnica = response.data
    console.log('Datos de la ficha técnica recibidos:', fichaTecnica) // Añade este console.log para verificar

    return fichaTecnica
  } catch (error) {
    console.error('Error al obtener la ficha por ID:', error)
    throw error
  }
}

export const EliminarFicha = async (ficha: FichaTecnica): Promise<void> => {
  try {
    if (!ficha || ficha.IdFichaTecnica === undefined) {
      throw new Error('Ficha inválida o faltan datos')
    }

    await sleep(1000)

    // Realiza la solicitud DELETE al servidor
    const response = await axios.delete(`https://apinodedvp.onrender.com/fichaTecnica/${ficha.IdFichaTecnica}`)

    if (response.status !== 200) {
      throw new Error('Error al eliminar la ficha')
    }

    // Elimina la ficha de la lista local
    const index = fichas.findIndex((u) => u.IdFichaTecnica === ficha.IdFichaTecnica)
    if (index !== -1) {
      fichas.splice(index, 1)
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 409) {
      throw new Error('No se puede eliminar la ficha porque está asociada a otra tabla')
    } else {
      console.error('Error al eliminar la ficha:', error)
      throw error
    }
  }
}

export async function AgregarFicha(
  ficha: Omit<FichaTecnica, 'IdFichaTecnica'>,
  colores: Color[],
  tallas: Talla[],
  imagenes: File[],
): Promise<FichaTecnica> {
  try {
    const formData = new FormData()
    const fichaConColores = {
      ...ficha,
      FichaHasColores: colores.map((color) => ({
        Color: { IdColor: color.IdColor },
      })),
      FichaHasTallas: tallas.map((talla) => ({
        Talla: {
          IdTalla: talla.IdTalla,
          Talla: talla.Talla,
        },
      })),
    }

    formData.append('ficha', JSON.stringify(fichaConColores))

    imagenes.forEach((imagen) => {
      formData.append('imagenes', imagen)
    })
    const response = await axios.post<FichaTecnica>(
      'https://apinodedvp.onrender.com/fichaTecnica/crearficha',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    )

    if (response.status !== 201) {
      throw new Error('Error al agregar la ficha')
    }

    return response.data
  } catch (error) {
    console.error('Error al agregar la ficha:', error)
    throw error
  }
}

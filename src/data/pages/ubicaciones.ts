import { useToast } from 'vuestic-ui/web-components'
import { sleep } from '../../services/utils'
import { Ubicaciones } from './../../pages/ubicaciones/types'
import usersDb from './users-db.json'
import axios from 'axios'
const { init: notify } = useToast()
// Datos quemados
export const ubicaciones = usersDb as unknown as Ubicaciones[]

// Simulate API calls

export type Pagination = {
  page: number
  perPage: number
  total: number
}

export type Sorting = {
  sortBy: keyof Ubicaciones | undefined
  sortingOrder: 'asc' | 'desc' | null
}

export type Filters = {
  isActive: boolean
  search: string
}

export const ListarUbicaciones = async (filters: Partial<Filters & Pagination & Sorting>) => {
  try {
    // Realizar la solicitud GET a la API
    const response = await axios.get('https://apinodedvp.onrender.com/ubicaciones', { params: filters })
    const data: Ubicaciones[] = response.data

    // Aplicar filtro de búsqueda si se proporciona
    let filteredData = data
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase() // Convertir el término de búsqueda a minúsculas para una comparación insensible a mayúsculas y minúsculas
      filteredData = data.filter((ubicacion: Ubicaciones) => {
        // Filtrar por el nombre del ubicacion
        return ubicacion.Ubicacion.toLowerCase().includes(searchTerm)
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
    console.error('Error al listar ubicaciones:', error)
    throw error
  }
}

export const AgregarUbicacion = async (ubicacion: Omit<Ubicaciones, 'IdUbicacion'>) => {
  try {
    console.log('Iniciando proceso para agregar ubicación:', ubicacion)

    // Simula un retraso de 1 segundo
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const response = await fetch('https://apinodedvp.onrender.com/ubicaciones', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ubicacion),
    })

    console.log('Respuesta recibida del servidor:', response)

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Error en la respuesta del servidor:', errorData)
      throw new Error(errorData.message)
    }

    notify({
      message: `${ubicacion.Ubicacion} creado con éxito`,
      color: 'success',
      duration: 7000,
      position: 'top-right',
    })
  } catch (error) {
    console.error('Error al agregar la ubicacion:', error)
    notify({
      message: 'Error al agregar la ubicacion',
      color: 'error',
      duration: 5000,
      position: 'top-right',
    })
    throw error
  }
}

export const EditarUbicacion = async (ubicacion: Ubicaciones) => {
  try {
    if (!ubicacion || ubicacion.IdUbicacion === undefined) {
      throw new Error('Ubicacion inválida o faltan datos')
    }

    await sleep(1000)
    const response = await axios.put(`https://apinodedvp.onrender.com/ubicaciones/${ubicacion.IdUbicacion}`, ubicacion)

    if (response.status !== 200) {
      throw new Error('Error al editar el ubicacion')
    }

    const index = ubicaciones.findIndex((u) => u.IdUbicacion === ubicacion.IdUbicacion)
    if (index !== -1) {
      ubicaciones[index] = ubicacion
    }
  } catch (error) {
    console.error('Error al la ubicacion:', error)
    throw error
  }
}
const API_URL = 'https://apinodedvp.onrender.com/ubicaciones'
export const ObtenerUbicacionPorId = async (IdUbicacion: string): Promise<Ubicaciones> => {
  try {
    console.log('ID de la ubicacion:', IdUbicacion)

    // Convertir el Idubicacion de string a number
    const id = parseInt(IdUbicacion)
    console.log('ID de la ubicacion convertido:', id)

    const response = await axios.get<Ubicaciones>(`${API_URL}/${IdUbicacion}`)
    return response.data
  } catch (error) {
    console.error('Error al obtener la ubicacion por ID:', error)
    throw error
  }
}

export const EliminarUbicacion = async (ubicacion: Ubicaciones): Promise<void> => {
  try {
    if (!ubicacion || ubicacion.IdUbicacion === undefined) {
      throw new Error('Ubicacion inválida o faltan datos')
    }

    await sleep(1000)

    // Realiza la solicitud DELETE al servidor
    const response = await axios.delete(`https://apinodedvp.onrender.com/ubicacion/${ubicacion.IdUbicacion}`)

    if (response.status !== 200) {
      throw new Error('Error al eliminar la ubicacion')
    }

    // Elimina el ubicacion de la lista local
    const index = ubicaciones.findIndex((u) => u.IdUbicacion === ubicacion.IdUbicacion)
    if (index !== -1) {
      ubicaciones.splice(index, 1)
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 409) {
      throw new Error('No se puede eliminar la ubicacion porque está asociada a otra tabla')
    } else {
      console.error('Error al eliminar la ubicacion :', error)
      throw error
    }
  }
}

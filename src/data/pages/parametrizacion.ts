import { useToast } from 'vuestic-ui/web-components'
import { sleep } from '../../services/utils'
import { Parametrizacion } from './../../pages/parametrizacion/types'
import usersDb from './users-db.json'
import axios from 'axios'
const { init: notify } = useToast()
// Datos quemados
export const parametrizaciones = usersDb as unknown as Parametrizacion[]

// Simulate API calls

export type Pagination = {
  page: number
  perPage: number
  total: number
}

export type Sorting = {
  sortBy: keyof Parametrizacion | undefined
  sortingOrder: 'asc' | 'desc' | null
}

export type Filters = {
  isActive: boolean
  search: string
}

export const ListarParametrizacion = async (filters: Partial<Filters & Pagination & Sorting>) => {
  try {
    // Realizar la solicitud GET a la API
    const response = await axios.get('https://apinodedvp.onrender.com/parametrizacion', { params: filters })
    const data: Parametrizacion[] = response.data

    // Aplicar filtro de búsqueda si se proporciona
    let filteredData = data
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filteredData = data.filter((parametrizacion: Parametrizacion) => {
        return parametrizacion.NombreDescuento.toLowerCase().includes(searchTerm)
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
    console.error('Error al listar parametrizaciones:', error)
    throw error
  }
}

export const AgregarParametrizacion = async (parametrizacion: Omit<Parametrizacion, 'IdParametrizacion'>) => {
  try {
    console.log('Iniciando proceso para agregar parametrizacion:', parametrizacion)

    // Simula un retraso de 1 segundo
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const response = await fetch('https://apinodedvp.onrender.com/parametrizacion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(parametrizacion),
    })

    console.log('Respuesta recibida del servidor:', response)

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Error en la respuesta del servidor:', errorData)
      throw new Error(errorData.message)
    }

    notify({
      message: `${parametrizacion.NombreDescuento} creado con éxito`,
      color: 'success',
      duration: 7000,
      position: 'top-right',
    })
  } catch (error) {
    console.error('Error al agregar la parametrizacion:', error)
    notify({
      message: 'Error al agregar la parametrizacion',
      color: 'error',
      duration: 5000,
      position: 'top-right',
    })
    throw error
  }
}

export const EditarParametrizacion = async (parametrizacion: Parametrizacion) => {
  try {
    if (!parametrizacion || parametrizacion.IdParametrizacion === undefined) {
      throw new Error('Parametrizacion inválido o faltan datos')
    }

    await sleep(1000)
    const response = await axios.put(
      `https://apinodedvp.onrender.com/parametrizacion/${parametrizacion.IdParametrizacion}`,
      parametrizacion,
    )

    if (response.status !== 200) {
      throw new Error('Error al editar lac parametrizacion')
    }

    const index = parametrizaciones.findIndex((u) => u.IdParametrizacion === parametrizacion.IdParametrizacion)
    if (index !== -1) {
      parametrizaciones[index] = parametrizacion
    }
  } catch (error) {
    console.error('Error al editar la parametrizacion:', error)
    throw error
  }
}
const API_URL = 'https://apinodedvp.onrender.com/parametrizacion'
export const ObtenerParametrizacionPorId = async (IdParametrizacion: string): Promise<Parametrizacion> => {
  try {
    console.log('ID de la parametrizacion:', IdParametrizacion)

    // Convertir el IdProveedor de string a number
    const id = parseInt(IdParametrizacion)
    console.log('ID de la parametrizacion convertido:', id)

    const response = await axios.get<Parametrizacion>(`${API_URL}/${IdParametrizacion}`)
    return response.data
  } catch (error) {
    console.error('Error al obtener la parametrizacion por ID:', error)
    throw error
  }
}

export const EliminarParametrizacion = async (parametrizacion: Parametrizacion): Promise<void> => {
  try {
    if (!parametrizacion || parametrizacion.IdParametrizacion === undefined) {
      throw new Error('Parametrizacion inválida o faltan datos')
    }

    await sleep(1000)

    // Realiza la solicitud DELETE al servidor
    const response = await axios.delete(
      `https://apinodedvp.onrender.com/parametrizacion/${parametrizacion.IdParametrizacion}`,
    )

    if (response.status !== 200) {
      throw new Error('Error al eliminar la parametrizacion')
    }

    // Elimina el proveedor de la lista local
    const index = parametrizaciones.findIndex((u) => u.IdParametrizacion === parametrizacion.IdParametrizacion)
    if (index !== -1) {
      parametrizaciones.splice(index, 1)
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 409) {
      throw new Error('No se puede eliminar la parametrizacion porque está asociado a otra tabla')
    } else {
      console.error('Error al eliminar la parametrizacion :', error)
      throw error
    }
  }
}

import { useToast } from 'vuestic-ui/web-components'
import { sleep } from '../../services/utils'
import { Estampado, Ubicaciones } from './../../pages/estampados/types'
import usersDb from './users-db.json'
import axios from 'axios'
const { init: notify } = useToast()
// Datos quemados
export const estampados = usersDb as unknown as Estampado[]

// Simulate API calls

export type Pagination = {
  page: number
  perPage: number
  total: number
}

export type Sorting = {
  sortBy: keyof Estampado | undefined
  sortingOrder: 'asc' | 'desc' | null
}

export type Filters = {
  isActive: boolean
  search: string
}

export const ListarEstampados = async (filters: Partial<Filters & Pagination & Sorting>) => {
  try {
    // Realizar la solicitud GET a la API
    const response = await axios.get('https://apinodedvp.onrender.com/estampados', { params: filters })
    const data: Estampado[] = response.data

    // Aplicar filtro de búsqueda si se proporciona
    let filteredData = data
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filteredData = data.filter((estampado: Estampado) => {
        return estampado.TipoEstampado.toLowerCase().includes(searchTerm)
      })
    }

    // Aplicar filtro de estado
    if (filters.isActive !== undefined) {
      filteredData = filteredData.filter((estampado: Estampado) => {
        return estampado.EstadoEstampado === (filters.isActive ? 'Activo' : 'Inactivo')
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
    console.error('Error al listar estampados:', error)
    throw error
  }
}

export const AgregarEstampado = async (estampado: Omit<Estampado, 'IdEstampado'>) => {
  try {
    // Extraer UbicacionEstampado del estampado
    const { UbicacionEstampado, ...restoEstampado } = estampado

    // Realizar la petición POST al backend
    const response = await fetch('https://apinodedvp.onrender.com/estampados', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...restoEstampado, // Enviar el resto de los datos del estampado
        Ubicaciones: UbicacionEstampado, // Enviar UbicacionEstampado como Ubicaciones
      }),
    })

    // Manejar la respuesta del servidor
    if (!response.ok) {
      const errorData = await response.json()
      console.error('Error en la respuesta del servidor:', errorData)
      throw new Error(errorData.message)
    }

    // Notificar éxito al usuario
    const responseData = await response.json()
    console.log('Respuesta recibida del servidor:', responseData)
    notify({
      message: `${restoEstampado.TipoEstampado} creado con éxito`,
      color: 'success',
      duration: 7000,
      position: 'top-right',
    })
  } catch (error) {
    console.error('Error al agregar el estampado:', error)
    notify({
      message: 'Error al agregar el estampado',
      color: 'error',
      duration: 5000,
      position: 'top-right',
    })
    throw error
  }
}

export const EditarEstampado = async (estampado: Estampado) => {
  try {
    if (!estampado || estampado.IdEstampado === undefined) {
      throw new Error('Estampado inválido o faltan datos')
    }

    await sleep(1000)
    const response = await axios.put(`https://apinodedvp.onrender.com/estampados/${estampado.IdEstampado}`, estampado)

    if (response.status !== 200) {
      throw new Error('Error al editar el estampado')
    }

    const index = estampados.findIndex((u) => u.IdEstampado === estampado.IdEstampado)
    if (index !== -1) {
      estampados[index] = estampado
    }
  } catch (error) {
    console.error('Error al editar el estampado:', error)
    throw error
  }
}

const API_URL = 'https://apinodedvp.onrender.com/estampados'
export const ObtenerEstampadoPorId = async (IdEstampado: string): Promise<Estampado> => {
  try {
    console.log('ID del estampado:', IdEstampado)

    // Convertir el IdProveedor de string a number
    const id = parseInt(IdEstampado)
    console.log('ID del estampado convertido:', id)

    const response = await axios.get<Estampado>(`${API_URL}/${IdEstampado}`)
    return response.data
  } catch (error) {
    console.error('Error al obtener el proveedor por ID:', error)
    throw error
  }
}

export const EliminarEstampado = async (estampado: Estampado): Promise<void> => {
  try {
    if (!estampado || estampado.IdEstampado === undefined) {
      throw new Error('Estampado inválido o faltan datos')
    }

    await sleep(1000)

    // Realiza la solicitud DELETE al servidor
    const response = await axios.delete(`https://apinodedvp.onrender.com/estampados/${estampado.IdEstampado}`)

    if (response.status !== 200) {
      throw new Error('Error al eliminar el estampado')
    }

    // Elimina el proveedor de la lista local
    const index = estampados.findIndex((u) => u.IdEstampado === estampado.IdEstampado)
    if (index !== -1) {
      estampados.splice(index, 1)
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 409) {
      throw new Error('No se puede eliminar el estampado porque está asociado a otra tabla')
    } else {
      console.error('Error al eliminar el estampado :', error)
      throw error
    }
  }
}

const API_URL2 = 'https://apinodedvp.onrender.com' // Ajusta la URL base de tu API según corresponda

export const ObtenerUbicaciones = async (): Promise<Ubicaciones[]> => {
  const endpoint = '/ubicaciones' // Ruta específica para obtener ubicaciones
  try {
    const response = await axios.get<Ubicaciones[]>(`${API_URL2}${endpoint}`)
    return response.data // Retorna los datos de ubicaciones
  } catch (error) {
    console.error('Error al obtener las ubicaciones:', error)
    throw error
  }
}

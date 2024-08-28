/* eslint-disable prettier/prettier */
import { useToast } from 'vuestic-ui/web-components'
import { sleep } from '../../services/utils'
import { Insumo, medidas_has_insumo } from './../../pages/insumos/types'
import usersDb from './users-db.json'
import axios from 'axios'
const { init: notify } = useToast()
// Datos quemados
export const insumos = usersDb as unknown as Insumo[]

// Simulate API calls

export type Pagination = {
  page: number
  perPage: number
  total: number
}

export type Sorting = {
  sortBy: keyof Insumo | undefined
  sortingOrder: 'asc' | 'desc' | null
}

export type Filters = {
  isActive: boolean
  search: string
}

// Función para listar las medidas desde la API
// En tu insumos.ts o donde definas ListarMedidas
export const ListarMedidas = async (): Promise<{ IdMedida: number; UnidadMedida: string }[]> => {
  try {
    console.log('Llamando a la API de medidas...')
    const response = await axios.get<medidas_has_insumo[]>('https://apinodedvp.onrender.com/medidasinsumos')
    console.log('Respuesta de la API:', response.data)
    const medidas: { IdMedida: number; UnidadMedida: string }[] = response.data.map((item: medidas_has_insumo) => ({
      IdMedida: item.IdMedida,
      UnidadMedida: item.UnidadMedida,
    }))
    return medidas
  } catch (error) {
    console.error('Error al obtener las medidas:', error)
    throw error
  }
}
export const ListarInsumo = async (filters: Partial<Filters & Pagination & Sorting>) => {
  try {
    // Realizar la solicitud GET a la API
    const response = await axios.get('https://apinodedvp.onrender.com/insumos', { params: filters })
    const data: Insumo[] = response.data

    // Aplicar filtro de búsqueda si se proporciona
    let filteredData = data
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase() // Convertir el término de búsqueda a minúsculas para una comparación insensible a mayúsculas y minúsculas
      filteredData = data.filter((insumo: Insumo) => {
        // Filtrar por el nombre del insumo
        return insumo.NombreInsumo.toLowerCase().includes(searchTerm)
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
    console.error('Error al listar insumos:', error)
    throw error
  }
}

export const AgregarInsumo = async (insumo: Omit<Insumo, 'IdInsumo'>) => {
  try {
    console.log('Iniciando proceso para agregar insumo:', insumo)

    // Simula un retraso de 1 segundo
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const response = await fetch('https://apinodedvp.onrender.com/insumos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(insumo),
    })

    console.log('Respuesta recibida del servidor:', response)

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Error en la respuesta del servidor:', errorData)
      throw new Error(errorData.message)
    }

    notify({
      message: `${insumo.NombreInsumo} creado con éxito`,
      color: 'success',
      duration: 7000,
      position: 'top-right',
    })
  } catch (error) {
    console.error('Error al agregar el insumo:', error)
    notify({
      message: 'Error al agregar el insumo',
      color: 'error',
      duration: 5000,
      position: 'top-right',
    })
    throw error
  }
}

export const EditarInsumo = async (insumo: Insumo) => {
  try {
    if (!insumo || insumo.IdInsumo === undefined || insumo.IdInsumo === null) {
      throw new Error('Insumo inválido o faltan datos')
    }

    await sleep(1000)
    const response = await axios.put(`${API_URL}/${insumo.IdInsumo}`, insumo)

    if (response.status !== 200) {
      throw new Error('Error al editar el insumo')
    }

    const index = insumos.findIndex((u) => u.IdInsumo === insumo.IdInsumo)
    if (index !== -1) {
      insumos[index] = insumo
    }
  } catch (error) {
    console.error('Error al editar el insumo:', error)
    throw error
  }
}
const API_URL = 'https://apinodedvp.onrender.com/insumos'
export const ObtenerInsumoPorId = async (IdInsumo: string): Promise<Insumo> => {
  try {
    console.log('ID del insumo:', IdInsumo)

    // Convertir el IdProveedor de string a number
    const id = parseInt(IdInsumo)
    console.log('ID del insumo convertido:', id)

    const response = await axios.get<Insumo>(`${API_URL}/${IdInsumo}`)
    return response.data
  } catch (error) {
    console.error('Error al obtener el insumo por ID:', error)
    throw error
  }
}

export const EliminarInsumo = async (insumo: Insumo): Promise<void> => {
  try {
    if (!insumo || insumo.IdInsumo === undefined) {
      throw new Error('insumo inválido o faltan datos')
    }

    await sleep(1000)

    // Realiza la solicitud DELETE al servidor
    const response = await axios.delete(`https://apinodedvp.onrender.com/insumos/${insumo.IdInsumo}`)

    if (response.status !== 200) {
      throw new Error('Error al eliminar el insumo')
    }

    // Elimina el insumo de la lista local
    const index = insumos.findIndex((u) => u.IdInsumo === insumo.IdInsumo)
    if (index !== -1) {
      insumos.splice(index, 1)
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 409) {
      throw new Error('No se puede eliminar el insumo porque está asociado a otra tabla')
    } else {
      console.error('Error al eliminar el insumo :', error)
      throw error
    }
  }
}

// Fetch Unidad Medida
export const fetchUnidadMedida = async (IdMedida: number): Promise<medidas_has_insumo> => {
  try {
    const response = await axios.get<medidas_has_insumo>(`https://apinodedvp.onrender.com/medidasinsumos/${IdMedida}`)
    return response.data
  } catch (error) {
    console.error('Error al obtener la unidad de medida:', error)
    throw error
  }
}

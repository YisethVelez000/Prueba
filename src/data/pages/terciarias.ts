import { useToast } from 'vuestic-ui/web-components'
import { sleep } from '../../services/utils'
import { Terciaria } from './../../pages/terciarias/types'
import axios from 'axios'

const { init: notify } = useToast()

// Datos de ejemplo (simulación de una base de datos local)
import usersDb from './users-db.json'
export const terciarias = usersDb as unknown as Terciaria[]

// Tipo para la paginación
export type Pagination = {
  page: number
  perPage: number
  total: number
}

// Tipo para el ordenamiento
export type Sorting = {
  sortBy: keyof Terciaria | undefined
  sortingOrder: 'asc' | 'desc' | null
}

// Tipo para los filtros
export type Filters = {
  isActive: boolean
  search: string
}

// Función para listar terciarias con filtros, paginación y ordenamiento
export const ListarTerciarias = async (pagination: Pagination, filters: Partial<Filters>, sorting: Sorting) => {
  try {
    const params = {
      page: pagination.page,
      perPage: pagination.perPage,
      isActive: filters.isActive,
      search: filters.search,
      sortBy: sorting.sortBy,
      sortingOrder: sorting.sortingOrder,
    }

    // Realizar la solicitud GET a la API
    const response = await axios.get('https://apinodedvp.onrender.com/Terciarias', { params })
    let data = response.data

    // Aplicar filtro de búsqueda si se proporciona
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      data = data.filter(
        (terciaria: Terciaria) =>
          terciaria.NombreEmpresa.toLowerCase().includes(searchTerm) ||
          terciaria.NombreContacto.toLowerCase().includes(searchTerm) ||
          terciaria.Telefono.toLowerCase().includes(searchTerm),
      )
    }

    // Calcular la paginación y devolver los datos filtrados
    const totalRegistros = data.length
    const registrosPorPagina = pagination.perPage
    const paginaActual = pagination.page

    const startIndex = (paginaActual - 1) * registrosPorPagina
    const endIndex = Math.min(startIndex + registrosPorPagina, totalRegistros)
    const registrosPagina = data.slice(startIndex, endIndex)

    const paginatedResult: Pagination = {
      page: paginaActual,
      perPage: registrosPorPagina,
      total: totalRegistros,
    }

    return { data: registrosPagina, pagination: paginatedResult }
  } catch (error) {
    console.error('Error al listar terciarias:', error)
    throw error
  }
}

// Función para agregar una terciaria
export const AgregarTerciaria = async (terciaria: Omit<Terciaria, 'IdEmpresa'>) => {
  try {
    console.log('Iniciando proceso para agregar terciaria:', terciaria)

    // Simular un retraso de 1 segundo
    await sleep(1000)

    const response = await axios.post('https://apinodedvp.onrender.com/Terciarias', terciaria)

    if (!response.data) {
      throw new Error('No se recibieron datos en la respuesta')
    }

    notify({
      message: 'Terciaria creada con éxito',
      color: 'success',
      duration: 7000,
      position: 'top-right',
    })

    // Agregar la nueva terciaria a la lista local (simulación)
    terciarias.push(response.data)
  } catch (error) {
    console.error('Error al agregar la terciaria:', error)
    notify({
      message: 'Error al agregar la terciaria',
      color: 'error',
      duration: 5000,
      position: 'top-right',
    })
    throw error
  }
}

// Función para editar una terciaria
export const EditarTerciaria = async (terciaria: Terciaria) => {
  try {
    if (!terciaria || terciaria.IdEmpresa === undefined) {
      throw new Error('Terciaria inválida o faltan datos')
    }

    await sleep(1000)
    const response = await axios.put(`https://apinodedvp.onrender.com/Terciarias/${terciaria.IdEmpresa}`, terciaria)

    if (response.status !== 200) {
      throw new Error('Error al editar la terciaria')
    }

    // Actualizar la terciaria en la lista local (simulación)
    const index = terciarias.findIndex((u) => u.IdEmpresa === terciaria.IdEmpresa)
    if (index !== -1) {
      terciarias[index] = terciaria
    }

    notify({
      message: 'Empresa Tercia editada con éxito',
      color: 'success',
      duration: 7000,
      position: 'top-right',
    })
  } catch (error) {
    console.error('Error al editar la terciaria:', error)
    notify({
      message: 'Error al editar la terciaria',
      color: 'error',
      duration: 5000,
      position: 'top-right',
    })
    throw error
  }
}

// URL base de la API
const API_URL = 'https://apinodedvp.onrender.com/Terciarias'

// Función para obtener una terciaria por su ID
export const ObtenerTerciariaPorId = async (IdEmpresa: string): Promise<Terciaria> => {
  try {
    // Convertir el IdEmpresa de string a number si es necesario

    const response = await axios.get<Terciaria>(`${API_URL}/${IdEmpresa}`)
    return response.data
  } catch (error) {
    console.error('Error al obtener la terciaria por ID:', error)
    throw error
  }
}

// Función para eliminar una terciaria
export const EliminarTerciaria = async (terciaria: Terciaria): Promise<void> => {
  try {
    if (!terciaria || terciaria.IdEmpresa === undefined) {
      throw new Error('Terciaria inválida o faltan datos')
    }

    await sleep(1000)

    // Realizar la solicitud DELETE a la API
    const response = await axios.delete(`${API_URL}/${terciaria.IdEmpresa}`)

    if (response.status !== 200) {
      throw new Error('Error al eliminar la terciaria')
    }

    // Eliminar la terciaria de la lista local (simulación)
    const index = terciarias.findIndex((u) => u.IdEmpresa === terciaria.IdEmpresa)
    if (index !== -1) {
      terciarias.splice(index, 1)
    }

    notify({
      message: 'Terciaria eliminada con éxito',
      color: 'success',
      duration: 7000,
      position: 'top-right',
    })
  } catch (error) {
    console.error('Error al eliminar la terciaria:', error)
    notify({
      message: 'Error al eliminar la terciaria',
      color: 'error',
      duration: 5000,
      position: 'top-right',
    })
    throw error
  }
}

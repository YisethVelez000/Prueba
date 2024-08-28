import { useToast } from 'vuestic-ui/web-components'
import { sleep } from '../../services/utils'
import { Colores } from './../../pages/colores/types'
import axios from 'axios'

const { init: notify } = useToast()

// Datos de ejemplo (simulación de una base de datos local)
import usersDb from './users-db.json'
export const terciarias = usersDb as unknown as Colores[]

// Tipo para la paginación
export type Pagination = {
  page: number
  perPage: number
  total: number
}

// Tipo para el ordenamiento
export type Sorting = {
  sortBy: keyof Colores | undefined
  sortingOrder: 'asc' | 'desc' | null
}

// Tipo para los filtros
export type Filters = {
  isActive: boolean
  search: string
}

export const ListarColor = async (pagination: Pagination, filters: Partial<Filters>, sorting: Sorting) => {
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
    const response = await axios.get('https://apinodedvp.onrender.com/colores/listarColores', { params })
    let data: Colores[] = response.data.data // Asumiendo que la respuesta tiene un campo 'data'

    // Filtrar objetos con 'Color' nulo
    data = data.filter((color) => color.Color !== null)

    // Aplicar filtro de búsqueda si se proporciona
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      data = data.filter((color) => color.Color.toLowerCase().includes(searchTerm))
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
    console.error('Error al listar los colores:', error)
    throw error
  }
}

// Función para agregar una terciaria
export const AgregarColor = async (color: Omit<Colores, 'IdColor'>) => {
  try {
    // Simular un retraso de 1 segundo
    await sleep(1000)

    const response = await axios.post('https://apinodedvp.onrender.com/colores/CrearColor', color)

    if (!response.data) {
      throw new Error('No se recibieron datos en la respuesta')
    }

    notify({
      message: 'Color creado con éxito',
      color: 'success',
      duration: 7000,
      position: 'top-right',
    })

    // Agregar el nuevo color a la lista local (simulación)
    // No necesario si el servidor devuelve el color creado con su IdColor
    // terciarias.push(response.data);
  } catch (error) {
    console.error('Error al agregar el color:', error)
    notify({
      message: 'Error al agregar el color',
      color: 'error',
      duration: 5000,
      position: 'top-right',
    })
    throw error
  }
}

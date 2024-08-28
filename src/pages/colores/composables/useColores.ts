import { Ref, ref, unref, watch } from 'vue'
import { Colores } from '../types'
import { watchIgnorable } from '@vueuse/core'
import { AgregarColor, ListarColor, Filters, Pagination, Sorting } from '../../../data/pages/colores'

// Funciones para crear referencias iniciales
const makePaginationRef = () => ref<Pagination>({ page: 1, perPage: 10, total: 0 })
const makeSortingRef = () => ref<Sorting>({ sortBy: 'Color', sortingOrder: null })
const makeFiltersRef = () => ref<Partial<Filters>>({ isActive: true, search: '' })

export const useColores = (options?: {
  pagination?: Ref<Pagination>
  sorting?: Ref<Sorting>
  filters?: Ref<Partial<Filters>>
}) => {
  // Variables reactivas
  const isLoading = ref(false)
  const colores = ref<Colores[]>([])

  // Desestructuración de opciones o uso de valores por defecto
  const { filters = makeFiltersRef(), sorting = makeSortingRef(), pagination = makePaginationRef() } = options || {}

  // Función para cargar los colores
  const fetch = async () => {
    isLoading.value = true
    try {
      // Llamada a la función ListarColor con los parámetros desreferenciados
      const { data, pagination: newPagination } = await ListarColor(unref(pagination), unref(filters), unref(sorting))

      // Asignar los datos de colores y actualizar la paginación
      colores.value = data
      ignoreUpdates(() => {
        pagination.value = newPagination
      })
    } catch (error) {
      console.error('Error al listar los colores:', error)
    } finally {
      isLoading.value = false
    }
  }

  // Configuración de watch para actualizar cuando cambien los filtros o la paginación
  const { ignoreUpdates } = watchIgnorable([pagination, sorting], fetch, { deep: true })

  // Watch para los filtros, resetea la paginación y llama a fetch
  watch(
    filters,
    () => {
      pagination.value.page = 1 // Resetear a la primera página cuando cambian los filtros
      fetch()
    },
    { deep: true },
  )

  // Llamar fetch inicialmente para cargar los datos al iniciar
  fetch()

  // Retornar las variables y funciones que se utilizarán en el componente
  return {
    isLoading,
    filters,
    sorting,
    pagination,
    colores,
    fetch,

    async AgregarColor(color: Omit<Colores, 'IdColor'>) {
      isLoading.value = true
      try {
        await AgregarColor(color)
        await fetch() // Actualizar la lista después de agregar un color nuevo
      } catch (error) {
        console.error('Error al agregar el color:', error)
      } finally {
        isLoading.value = false
      }
    },

    // Otras funciones o métodos que puedas necesitar para manipular los colores
  }
}

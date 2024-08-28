import { Ref, ref, unref, watch } from 'vue'
import {
  ListarFicha,
  EditarFicha,
  AgregarFicha as AgregarFichaAPI,
  EliminarFicha,
  ObtenerTallas,
  Filters,
  Pagination,
  Sorting,
} from '../../../data/pages/ficha'
import { FichaTecnica, Talla, Color } from '../types'
import { watchIgnorable } from '@vueuse/core'

const makePaginationRef = () => ref<Pagination>({ page: 1, perPage: 10, total: 0 })
const makeSortingRef = () => ref<Sorting>({ sortBy: 'NombreProducto', sortingOrder: null })
const makeFiltersRef = () => ref<Partial<Filters>>({ isActive: 'Activo', search: '' })

export const useFichas = (options?: {
  pagination?: Ref<Pagination>
  sorting?: Ref<Sorting>
  filters?: Ref<Partial<Filters>>
}) => {
  const isLoading = ref(false)
  const ficha = ref<FichaTecnica[]>([])
  const colores = ref<Color[]>([])
  const tallas = ref<Talla[]>([]) // Referencia para almacenar las tallas
  const uploadedImages = ref<File[]>([]) // Añade una referencia para las imágenes subidas

  const { filters = makeFiltersRef(), sorting = makeSortingRef(), pagination = makePaginationRef() } = options || {}

  const fetch = async () => {
    isLoading.value = true
    try {
      const { data, pagination: newPagination } = await ListarFicha(unref(pagination), unref(filters), unref(sorting))
      ficha.value = data
      ignoreUpdates(() => {
        pagination.value = newPagination
      })
    } catch (error) {
      console.error('Error al obtener las fichas técnicas:', error)
    } finally {
      isLoading.value = false
    }
  }

  const fetchTallas = async () => {
    try {
      const data = await ObtenerTallas() // Llamada a la función para obtener tallas desde la API
      tallas.value = data
    } catch (error) {
      console.error('Error al obtener las tallas:', error) // Manejo del error
    }
  }

  const { ignoreUpdates } = watchIgnorable([pagination, sorting], fetch, { deep: true })

  watch(
    filters,
    () => {
      // Reset pagination to first page when filters changed
      pagination.value.page = 1
      fetch()
    },
    { deep: true },
  )

  fetch()

  fetchTallas() // Llamar a la función para obtener tallas al inicializar el hook

  return {
    isLoading,
    filters,
    sorting,
    pagination,
    ficha,
    colores,
    tallas, // Retornar las tallas para usarlas en los componentes
    fetch,
    async AgregarFicha(ficha: Omit<FichaTecnica, 'IdFichaTecnica'>) {
      isLoading.value = true
      try {
        await AgregarFichaAPI(ficha, colores.value, tallas.value, uploadedImages.value)
        await fetch()
      } catch (error) {
        console.error('Error al agregar la ficha:', error)
      } finally {
        isLoading.value = false
      }
    },
    async EditarFicha(ficha: FichaTecnica) {
      isLoading.value = true
      try {
        await EditarFicha(ficha)
        await fetch()
      } catch (error) {
        console.error('Error al editar la ficha:', error)
      } finally {
        isLoading.value = false
      }
    },
    async EliminarFicha(ficha: FichaTecnica) {
      isLoading.value = true
      try {
        await EliminarFicha(ficha)
        await fetch()
      } catch (error) {
        console.error('Error al eliminar la ficha:', error)
      } finally {
        isLoading.value = false
      }
    },
  }
}

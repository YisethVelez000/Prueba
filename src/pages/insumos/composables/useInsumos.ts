import { Ref, ref, unref, watch } from 'vue'
import {
  ListarInsumo,
  EditarInsumo,
  AgregarInsumo,
  EliminarInsumo,
  ListarMedidas,
  fetchUnidadMedida as fetchUnidadMedidaApi, // Renombrado para evitar conflictos,
  type Filters,
  Pagination,
  Sorting,
} from '../../../data/pages/insumos'
import { Insumo } from '../types'
import { watchIgnorable } from '@vueuse/core'

const makePaginationRef = () => ref<Pagination>({ page: 1, perPage: 10, total: 0 })
const makeSortingRef = () => ref<Sorting>({ sortBy: 'NombreInsumo', sortingOrder: null })
const makeFiltersRef = () => ref<Partial<Filters>>({ isActive: true, search: '' })

export const useInsumos = (options?: {
  pagination?: Ref<Pagination>
  sorting?: Ref<Sorting>
  filters?: Ref<Partial<Filters>>
}) => {
  const isLoading = ref(false)
  const insumo = ref<Insumo[]>([])
  const unidadMedida = ref<string>('')
  const medidas = ref<{ IdMedida: number; UnidadMedida: string }[]>([])

  const { filters = makeFiltersRef(), sorting = makeSortingRef(), pagination = makePaginationRef() } = options || {}

  const cargarMedidas = async () => {
    try {
      console.log('Llamando a ListarMedidas...')
      const data = await ListarMedidas()
      medidas.value = data
      console.log('Medidas cargadas:', medidas.value)
    } catch (error) {
      console.error('Error al cargar las medidas:', error)
    }
  }

  const fetch = async () => {
    isLoading.value = true
    const { data, pagination: newPagination } = await ListarInsumo({
      ...unref(filters),
      ...unref(sorting),
      ...unref(pagination),
    })
    insumo.value = data

    ignoreUpdates(() => {
      pagination.value = newPagination
    })

    isLoading.value = false
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

  const fetchUnidadMedida = async (IdMedida: number) => {
    isLoading.value = true
    try {
      const data = await fetchUnidadMedidaApi(IdMedida)
      unidadMedida.value = data.UnidadMedida || 'Desconocido'
    } catch (error) {
      unidadMedida.value = 'Error al obtener la unidad de medida'
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,

    filters,
    sorting,
    pagination,

    insumo,
    unidadMedida,
    medidas,
    cargarMedidas,
    fetch,

    async AgregarInsumo(insumo: Omit<Insumo, 'IdInsumo'>) {
      isLoading.value = true
      await AgregarInsumo(insumo)
      await fetch()
      isLoading.value = false
    },

    async EditarInsumo(insumo: Insumo) {
      isLoading.value = true
      await EditarInsumo(insumo)
      await fetch()
      isLoading.value = false
    },

    async EliminarInsumo(insumo: Insumo) {
      isLoading.value = true
      await EliminarInsumo(insumo)
      await fetch()
      isLoading.value = false
    },
    fetchUnidadMedida,
  }
}

import { Ref, ref, unref, watch } from 'vue'
import {
  ListarParametrizacion,
  EditarParametrizacion,
  AgregarParametrizacion,
  EliminarParametrizacion,
  type Filters,
  Pagination,
  Sorting,
} from '../../../data/pages/parametrizacion'
import { Parametrizacion } from '../types'
import { watchIgnorable } from '@vueuse/core'

const makePaginationRef = () => ref<Pagination>({ page: 1, perPage: 10, total: 0 })
const makeSortingRef = () => ref<Sorting>({ sortBy: 'NombreDescuento', sortingOrder: null })
const makeFiltersRef = () => ref<Partial<Filters>>({ isActive: true, search: '' })

export const useParametrizacion = (options?: {
  pagination?: Ref<Pagination>
  sorting?: Ref<Sorting>
  filters?: Ref<Partial<Filters>>
}) => {
  const isLoading = ref(false)
  const parametrizacion = ref<Parametrizacion[]>([])

  const { filters = makeFiltersRef(), sorting = makeSortingRef(), pagination = makePaginationRef() } = options || {}

  const fetch = async () => {
    isLoading.value = true
    const { data, pagination: newPagination } = await ListarParametrizacion({
      ...unref(filters),
      ...unref(sorting),
      ...unref(pagination),
    })
    parametrizacion.value = data

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

  return {
    isLoading,

    filters,
    sorting,
    pagination,

    parametrizacion,

    fetch,

    async AgregarParametrizacion(parametrizacion: Omit<Parametrizacion, 'IdParametrizacion'>) {
      isLoading.value = true
      await AgregarParametrizacion(parametrizacion)
      await fetch()
      isLoading.value = false
    },

    async EditarParametrizacion(parametrizacion: Parametrizacion) {
      isLoading.value = true
      await EditarParametrizacion(parametrizacion)
      await fetch()
      isLoading.value = false
    },

    async EliminarParametrizacion(parametrizacion: Parametrizacion) {
      isLoading.value = true
      await EliminarParametrizacion(parametrizacion)
      await fetch()
      isLoading.value = false
    },
  }
}

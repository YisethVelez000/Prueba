import { Ref, ref, unref, watch } from 'vue'
import {
  ListarUbicaciones,
  EditarUbicacion,
  AgregarUbicacion,
  EliminarUbicacion,
  type Filters,
  Pagination,
  Sorting,
} from '../../../data/pages/ubicaciones'
import { Ubicaciones } from '../types'
import { watchIgnorable } from '@vueuse/core'

const makePaginationRef = () => ref<Pagination>({ page: 1, perPage: 10, total: 0 })
const makeSortingRef = () => ref<Sorting>({ sortBy: 'Ubicacion', sortingOrder: null })
const makeFiltersRef = () => ref<Partial<Filters>>({ isActive: true, search: '' })

export const useUbicaciones = (options?: {
  pagination?: Ref<Pagination>
  sorting?: Ref<Sorting>
  filters?: Ref<Partial<Filters>>
}) => {
  const isLoading = ref(false)
  const ubicacion = ref<Ubicaciones[]>([])

  const { filters = makeFiltersRef(), sorting = makeSortingRef(), pagination = makePaginationRef() } = options || {}

  const fetch = async () => {
    isLoading.value = true
    const { data, pagination: newPagination } = await ListarUbicaciones({
      ...unref(filters),
      ...unref(sorting),
      ...unref(pagination),
    })
    ubicacion.value = data

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

    ubicacion,

    fetch,

    async AgregarUbicacion(ubicacion: Omit<Ubicaciones, 'IdUbicacion'>) {
      isLoading.value = true
      await AgregarUbicacion(ubicacion)
      await fetch()
      isLoading.value = false
    },

    async EditarUbicacion(ubicacion: Ubicaciones) {
      isLoading.value = true
      await EditarUbicacion(ubicacion)
      await fetch()
      isLoading.value = false
    },

    async EliminarUbicacion(ubicacion: Ubicaciones) {
      isLoading.value = true
      await EliminarUbicacion(ubicacion)
      await fetch()
      isLoading.value = false
    },
  }
}

import { Ref, ref, unref, watch } from 'vue'
import {
  ListarEstampados,
  EditarEstampado,
  AgregarEstampado,
  EliminarEstampado,
  type Filters,
  Pagination,
  Sorting,
} from '../../../data/pages/estampados'
import { Estampado } from '../types'
import { watchIgnorable } from '@vueuse/core'

const makePaginationRef = () => ref<Pagination>({ page: 1, perPage: 10, total: 0 })
const makeSortingRef = () => ref<Sorting>({ sortBy: 'TipoEstampado', sortingOrder: null })
const makeFiltersRef = () => ref<Partial<Filters>>({ isActive: true, search: '' })

export const useEstampados = (options?: {
  pagination?: Ref<Pagination>
  sorting?: Ref<Sorting>
  filters?: Ref<Partial<Filters>>
}) => {
  const isLoading = ref(false)
  const estampado = ref<Estampado[]>([])

  const { filters = makeFiltersRef(), sorting = makeSortingRef(), pagination = makePaginationRef() } = options || {}

  const fetch = async () => {
    isLoading.value = true
    const { data, pagination: newPagination } = await ListarEstampados({
      ...unref(filters),
      ...unref(sorting),
      ...unref(pagination),
    })
    estampado.value = data

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

    estampado,

    fetch,

    async AgregarEstampado(estampado: Omit<Estampado, 'IdEstampado'>) {
      isLoading.value = true
      await AgregarEstampado(estampado)
      await fetch()
      isLoading.value = false
    },

    async EditarEstampado(estampado: Estampado) {
      isLoading.value = true
      await EditarEstampado(estampado)
      await fetch()
      isLoading.value = false
    },

    async EliminarEstampado(estampado: Estampado) {
      isLoading.value = true
      await EliminarEstampado(estampado)
      await fetch()
      isLoading.value = false
    },
  }
}

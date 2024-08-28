import { Ref, ref, unref, watch } from 'vue'
import {
  getClientes,
  updateCliente,
  addCliente,
  removeCliente,
  type Filters,
  Pagination,
  Sorting,
} from '../../../data/pages/clientes'
import { Cliente } from '../types'
import { watchIgnorable } from '@vueuse/core'

const makePaginationRef = () => ref<Pagination>({ page: 1, perPage: 10, total: 0 })
const makeSortingRef = () => ref<Sorting>({ sortBy: 'NumeroDocumento', sortingOrder: null })
const makeFiltersRef = () => ref<Partial<Filters>>({ isActive: 'Activo', search: '' })

export const useCliente = (options?: {
  pagination?: Ref<Pagination>
  sorting?: Ref<Sorting>
  filters?: Ref<Partial<Filters>>
}) => {
  const isLoading = ref(false)
  const clientes = ref<Cliente[]>([])

  const { filters = makeFiltersRef(), sorting = makeSortingRef(), pagination = makePaginationRef() } = options || {}

  const fetch = async () => {
    isLoading.value = true
    const { data, pagination: newPagination } = await getClientes({
      ...unref(filters),
      ...unref(sorting),
      ...unref(pagination),
    })
    clientes.value = data

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

    clientes,

    fetch,

    async addCliente(cliente: Cliente) {
      isLoading.value = true
      await addCliente(cliente)
      await fetch()
      isLoading.value = false
    },

    async updateCliente(cliente: Cliente) {
      isLoading.value = true
      await updateCliente(cliente)
      await fetch()
      isLoading.value = false
    },

    async removeCliente(cliente: Cliente) {
      isLoading.value = true
      await removeCliente(cliente)
      await fetch()
      isLoading.value = false
    },
  }
}

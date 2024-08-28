import { Ref, ref, unref, watch } from 'vue'
import { ListarCompras, AgregarCompras, type Filters, Pagination, Sorting } from '../../../data/pages/compras'
import { Compra } from '../types'
import { watchIgnorable } from '@vueuse/core'

const makePaginationRef = () => ref<Pagination>({ page: 1, perPage: 10, total: 0 })
const makeSortingRef = () => ref<Sorting>({ sortBy: 'Recibo', sortingOrder: null })
const makeFiltersRef = () => ref<Partial<Filters>>({ isActive: true, search: '' })

export const useCompras = (options?: {
  pagination?: Ref<Pagination>
  sorting?: Ref<Sorting>
  filters?: Ref<Partial<Filters>>
}) => {
  const isLoading = ref(false)
  const compras = ref<Compra[]>([])

  const { filters = makeFiltersRef(), sorting = makeSortingRef(), pagination = makePaginationRef() } = options || {}

  const fetch = async () => {
    isLoading.value = true
    const { data, pagination: newPagination } = await ListarCompras({
      ...unref(filters),
      ...unref(sorting),
      ...unref(pagination),
    })
    compras.value = data

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

    compras,

    fetch,

    async add(user: Compra) {
      isLoading.value = true
      await AgregarCompras(user)
      await fetch()
      isLoading.value = false
    },

    //     async update(user: User) {
    //       isLoading.value = true
    //       await updateUser(user)
    //       await fetch()
    //       isLoading.value = false
    //     },

    //     async remove(user: User) {
    //       isLoading.value = true
    //       await removeUser(user)
    //       await fetch()
    //       isLoading.value = false
    //     },
  }
}

import { Ref, ref, unref, watch } from 'vue'
import {
  ListarProveedor,
  EditarProveedor,
  AgregarProveedor,
  EliminarProveedor,
  type Filters,
  Pagination,
  Sorting,
} from '../../../data/pages/proveedores'
import { Proveedor } from '../types'
import { watchIgnorable } from '@vueuse/core'

const makePaginationRef = () => ref<Pagination>({ page: 1, perPage: 10, total: 0 })
const makeSortingRef = () => ref<Sorting>({ sortBy: 'NombreProveedor', sortingOrder: null })
const makeFiltersRef = () => ref<Partial<Filters>>({ isActive: true, search: '' })

export const useProveedores = (options?: {
  pagination?: Ref<Pagination>
  sorting?: Ref<Sorting>
  filters?: Ref<Partial<Filters>>
}) => {
  const isLoading = ref(false)
  const proveedor = ref<Proveedor[]>([])

  const { filters = makeFiltersRef(), sorting = makeSortingRef(), pagination = makePaginationRef() } = options || {}

  const fetch = async () => {
    isLoading.value = true
    const { data, pagination: newPagination } = await ListarProveedor({
      ...unref(filters),
      ...unref(sorting),
      ...unref(pagination),
    })
    proveedor.value = data

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

    proveedor,

    fetch,

    async AgregarProveedor(proveedor: Omit<Proveedor, 'IdProveedor'>) {
      isLoading.value = true
      await AgregarProveedor(proveedor)
      await fetch()
      isLoading.value = false
    },

    async EditarProveedor(proveedor: Proveedor) {
      isLoading.value = true
      await EditarProveedor(proveedor)
      await fetch()
      isLoading.value = false
    },

    async EliminarProveedor(proveedor: Proveedor) {
      isLoading.value = true
      await EliminarProveedor(proveedor)
      await fetch()
      isLoading.value = false
    },
  }
}

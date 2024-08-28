import { Ref, ref, unref, watch } from 'vue'
import { getRoles, updateRol, addRol, removeRol, type Filters, Pagination, Sorting } from '../../../data/pages/roles'
import { Rol } from '../types'
import { watchIgnorable } from '@vueuse/core'

const makePaginationRef = () => ref<Pagination>({ page: 1, perPage: 10, total: 0 })
const makeSortingRef = () => ref<Sorting>({ sortBy: 'Nombre', sortingOrder: null })
const makeFiltersRef = () => ref<Partial<Filters>>({ isActive: true, search: '' })

export const useRoles = (options?: {
  pagination?: Ref<Pagination>
  sorting?: Ref<Sorting>
  filters?: Ref<Partial<Filters>>
}) => {
  const isLoading = ref(false)
  const roles = ref<Rol[]>([])

  const { filters = makeFiltersRef(), sorting = makeSortingRef(), pagination = makePaginationRef() } = options || {}

  const fetch = async () => {
    isLoading.value = true
    const { data, pagination: newPagination } = await getRoles({
      ...unref(filters),
      ...unref(sorting),
      ...unref(pagination),
    })
    roles.value = data

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

    roles,

    fetch,

    async add(rol: Rol) {
      isLoading.value = true
      await addRol(rol)
      await fetch()
      isLoading.value = false
    },

    async update(rol: Rol) {
      isLoading.value = true
      if (rol.IdRol !== undefined) {
        await updateRol(rol.IdRol, rol)
        await fetch()
      } else {
        throw new Error('Rol Id is undefined')
      }
      await fetch()
      isLoading.value = false
    },

    async remove(rol: Rol) {
      isLoading.value = true
      if (rol.IdRol !== undefined) {
        await removeRol(rol.IdRol)
      } else {
        throw new Error('Rol Id is undefined')
      }
      await fetch()
      isLoading.value = false
    },
  }
}

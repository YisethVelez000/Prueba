import { Ref, ref, unref, watch } from 'vue'
import { Terciaria } from '../types'
import { watchIgnorable } from '@vueuse/core'
import {
  AgregarTerciaria,
  EditarTerciaria,
  EliminarTerciaria,
  ListarTerciarias,
  type Filters,
  Pagination,
  Sorting,
} from '../../../data/pages/terciarias'

const makePaginationRef = () => ref<Pagination>({ page: 1, perPage: 10, total: 0 })
const makeSortingRef = () => ref<Sorting>({ sortBy: 'NombreEmpresa', sortingOrder: null })
const makeFiltersRef = () => ref<Partial<Filters>>({ isActive: true, search: '' })

export const useTerciarias = (options?: {
  pagination?: Ref<Pagination>
  sorting?: Ref<Sorting>
  filters?: Ref<Partial<Filters>>
}) => {
  const isLoading = ref(false)
  const terciarias = ref<Terciaria[]>([])

  const { filters = makeFiltersRef(), sorting = makeSortingRef(), pagination = makePaginationRef() } = options || {}

  const fetch = async () => {
    isLoading.value = true
    try {
      const { data, pagination: newPagination } = await ListarTerciarias(
        unref(pagination),
        unref(filters),
        unref(sorting),
      )
      terciarias.value = data
      ignoreUpdates(() => {
        pagination.value = newPagination
      })
    } catch (error) {
      console.error('Error al listar las terciarias:', error)
    } finally {
      isLoading.value = false
    }
  }

  const { ignoreUpdates } = watchIgnorable([pagination, sorting], fetch, { deep: true })

  watch(
    filters,
    () => {
      // Reset pagination to first page when filters change
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
    terciarias,
    fetch,

    async AgregarTerciaria(terciaria: Omit<Terciaria, 'IdEmpresa'>) {
      isLoading.value = true
      try {
        await AgregarTerciaria(terciaria)
        await fetch()
      } catch (error) {
        console.error('Error al agregar la terciaria:', error)
      } finally {
        isLoading.value = false
      }
    },

    async EditarTerciaria(terciaria: Terciaria) {
      isLoading.value = true
      try {
        await EditarTerciaria(terciaria)
        await fetch()
      } catch (error) {
        console.error('Error al editar la terciaria:', error)
      } finally {
        isLoading.value = false
      }
    },

    async EliminarTerciaria(terciaria: Terciaria) {
      isLoading.value = true
      try {
        await EliminarTerciaria(terciaria)
        await fetch()
      } catch (error) {
        console.error('Error al eliminar la terciaria:', error)
      } finally {
        isLoading.value = false
      }
    },
  }
}

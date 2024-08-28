/* eslint-disable prettier/prettier */
import { Ref, ref, unref, watch } from 'vue'
import {
  ListarPedidosVentas,
  EditarPedidosVentas,
  AgregarPedidosVentas,
  EliminarPedidosVentas,
  // obtenerClientePorId,
  obtenerUsuarioPorDocumento,
  type Filters,
  Pagination,
  Sorting,
} from '../../../data/pages/pedidosventas'
import { PedidosVentas, Usuario, Cliente } from '../types'
import { watchIgnorable } from '@vueuse/core'

const makePaginationRef = () => ref<Pagination>({ page: 1, perPage: 10, total: 0 })
const makeSortingRef = () => ref<Sorting>({ sortBy: 'NumeroPedido', sortingOrder: null })
const makeFiltersRef = () => ref<Partial<Filters>>({ isActive: true, search: '' })

export const usePedidosVentas = (options?: {
  pagination?: Ref<Pagination>
  sorting?: Ref<Sorting>
  filters?: Ref<Partial<Filters>>
}) => {
  const isLoading = ref(false)
  const pedidosventas = ref<PedidosVentas[]>([])

  const { filters = makeFiltersRef(), sorting = makeSortingRef(), pagination = makePaginationRef() } = options || {}

  const fetch = async () => {
    isLoading.value = true
    const { data, pagination: newPagination } = await ListarPedidosVentas({
      ...unref(filters),
      ...unref(sorting),
      ...unref(pagination),
    })
    pedidosventas.value = data

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
  const buscarUsuarioPorDocumento = async (
    NumeroDocumento: number,
  ): Promise<{ usuario: Usuario; cliente: Cliente } | null> => {
    try {
      const resultado = await obtenerUsuarioPorDocumento(NumeroDocumento)
      return resultado
    } catch (error) {
      console.error('Error al buscar usuario por documento:', error)
      return null
    }
  }
  return {
    isLoading,

    filters,
    sorting,
    pagination,

    pedidosventas,
    buscarUsuarioPorDocumento,
    fetch,

    async AgregarPedidosVentas(pedidosventas: Omit<PedidosVentas, 'NumeroPedido'>) {
      isLoading.value = true
      await AgregarPedidosVentas(pedidosventas)
      await fetch()
      isLoading.value = false
    },

    async EditarPedidosVentas(pedidosventas: PedidosVentas) {
      isLoading.value = true
      await EditarPedidosVentas(pedidosventas)
      await fetch()
      isLoading.value = false
    },

    async EliminarPedidosVentas(pedidosventas: PedidosVentas) {
      isLoading.value = true
      await EliminarPedidosVentas(pedidosventas)
      await fetch()
      isLoading.value = false
    },
    //  Nueva función para obtener cliente por ID
    // async obtenerClientePorId(IdCliente: number) {
    //   isLoading.value = true
    //   const cliente = await obtenerClientePorId(IdCliente)
    //   isLoading.value = false
    //   return cliente
    // },
  }
}

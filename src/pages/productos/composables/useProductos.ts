import { Ref, ref, unref, watch } from 'vue'
import {
  ListarProducto,
  EditarProducto,
  AgregarProducto as AgregarProductoAPI,
  EliminarProducto,
  ObtenerColores,
  ObtenerTallas,
  Filters,
  Pagination,
  Sorting,
} from '../../../data/pages/productos'
import { Producto, Talla, Color } from '../types'
import { watchIgnorable } from '@vueuse/core'

const makePaginationRef = () => ref<Pagination>({ page: 1, perPage: 10, total: 0 })
const makeSortingRef = () => ref<Sorting>({ sortBy: 'NombreProductoCatalogo', sortingOrder: null })
const makeFiltersRef = () => ref<Partial<Filters>>({ isActive: true, search: '' })

export const useProductos = (options?: {
  pagination?: Ref<Pagination>
  sorting?: Ref<Sorting>
  filters?: Ref<Partial<Filters>>
}) => {
  const isLoading = ref(false)
  const producto = ref<Producto[]>([])
  const colores = ref<Color[]>([])
  const tallas = ref<Talla[]>([]) // Referencia para almacenar las tallas
  const uploadedImages = ref<File[]>([]) // Añade una referencia para las imágenes subidas

  const { filters = makeFiltersRef(), sorting = makeSortingRef(), pagination = makePaginationRef() } = options || {}

  const fetch = async () => {
    isLoading.value = true
    try {
      const { data, pagination: newPagination } = await ListarProducto({
        ...unref(pagination),
        ...unref(filters),
        ...unref(sorting),
      })
      producto.value = data
      ignoreUpdates(() => {
        pagination.value = newPagination
      })
    } catch (error) {
      console.error('Error al obtener los productos:', error)
    } finally {
      isLoading.value = false
    }
  }

  const fetchColores = async () => {
    try {
      const data = await ObtenerColores()
      colores.value = data
    } catch (error) {
      console.error('Error al obtener los colores:', error)
    }
  }

  const fetchTallas = async () => {
    try {
      const data = await ObtenerTallas() // Llamada a la función para obtener tallas desde la API
      tallas.value = data
    } catch (error) {
      console.error('Error al obtener las tallas:', error)
    }
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
  fetchColores()
  fetchTallas() // Llamar a la función para obtener tallas al inicializar el hook

  return {
    isLoading,
    filters,
    sorting,
    pagination,
    producto,
    colores,
    tallas, // Retornar las tallas para usarlas en los componentes
    fetch,
    async AgregarProducto(producto: Omit<Producto, 'IdProducto'>) {
      isLoading.value = true
      try {
        await AgregarProductoAPI(producto, colores.value, tallas.value, uploadedImages.value)
        await fetch()
      } catch (error) {
        console.error('Error al agregar el producto:', error)
      } finally {
        isLoading.value = false
      }
    },
    async EditarProducto(producto: Producto) {
      isLoading.value = true
      try {
        await EditarProducto(producto)
        await fetch()
      } catch (error) {
        console.error('Error al editar el producto:', error)
      } finally {
        isLoading.value = false
      }
    },
    async EliminarProducto(producto: Producto) {
      isLoading.value = true
      try {
        await EliminarProducto(producto)
        await fetch()
      } catch (error) {
        console.error('Error al eliminar el producto:', error)
      } finally {
        isLoading.value = false
      }
    },
  }
}

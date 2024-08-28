import { Compra } from './../../pages/compras/types'
import { useToast } from 'vuestic-ui/web-components'
//este es donde se esta quemando los datos
import axios from 'axios'

// Simulate API calls
const { init: notify } = useToast()

export type Pagination = {
  page: number
  perPage: number
  total: number
}

export type Sorting = {
  sortBy: keyof Compra | undefined
  sortingOrder: 'asc' | 'desc' | null
}

export type Filters = {
  isActive: boolean | null // Permitir null para estado inicial "sin filtro"
  search: string
}

export const ListarCompras = async (
  filters: Partial<Filters & Pagination & Sorting>,
): Promise<{ data: Compra[]; pagination: Pagination }> => {
  try {
    // Si filters.isActive es null, establecer por defecto a false (no anuladas)
    if (filters.isActive === null) {
      filters.isActive = false // Mostrar por defecto las compras no anuladas
    }

    // Obtener datos de la API
    const response = await axios.get('https://apinodedvp.onrender.com/compras', { params: filters })
    let data: Compra[] = response.data
    const filteredData = data
    // Filtrar por anuladas o no anuladas
    if (filters.isActive !== null && filters.isActive !== undefined) {
      data = data.filter((compra) =>
        filters.isActive
          ? compra.Anulada === 'Sí'
          : compra.Anulada !== 'Sí' && (compra.Anulada === null || compra.Anulada === ''),
      )
    }

    // Aplicar filtro de búsqueda
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      data = data.filter(
        (compra) =>
          compra.Recibo.toLowerCase().includes(searchTerm) ||
          compra.FechaCompra.toDateString().includes(searchTerm) ||
          compra.PrecioTotalCompra.toExponential().includes(searchTerm) ||
          // Agrega más condiciones de búsqueda según sea necesario
          false, // Condición válida o elimina esto si no es necesario
      )
    }

    const totalRegistros = filteredData.length
    const registrosPorPagina = filters.perPage || 10
    const paginaActual = filters.page || 1

    const startIndex = (paginaActual - 1) * registrosPorPagina
    const endIndex = Math.min(startIndex + registrosPorPagina, totalRegistros)
    const registrosPagina = filteredData.slice(startIndex, endIndex)

    const pagination: Pagination = {
      page: paginaActual,
      perPage: registrosPorPagina,
      total: totalRegistros,
    }

    return { data: registrosPagina, pagination }
    // Paginación (simulado aquí, ajustar según la respuesta real de la API)
  } catch (error) {
    console.error('Error al listar compras:', error)
    throw error
  }
}

export const AgregarCompras = async (compra: Omit<Compra, 'IdCompra'>) => {
  try {
    // Simular una espera de 1 segundo
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Realizar la llamada a la API para agregar el proveedor
    const response = await fetch('https://apinodedvp.onrender.com/compras', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(compra),
    })

    if (!response.ok) {
      // Si la respuesta no es exitosa, lanzar un error con el mensaje de la API
      const errorData = await response.json()
      throw new Error(errorData.message)
    }
    notify({
      message: `${compra.Recibo} creada con éxito`,
      color: 'success',
      duration: 7000,
      position: 'top-right',
    })

    // Si la respuesta es exitosa, no hay necesidad de hacer nada más aquí
  } catch (error) {
    // Manejar errores, por ejemplo, mostrando un mensaje al usuario
    console.error('Error al agregar la compra:', error)
    throw error // Puedes lanzar el error nuevamente si lo deseas
  }
}
// export const ObtenerCompra = async (idCompra: number): Promise<Compra> => {
//   try {
//     const response = await axios.get(http://localhost:8000/proveedor/${idProveedor});
//     return response.data; // Devuelve los datos del proveedor obtenidos del servidor
//   } catch (error) {
//     console.error('Error al obtener el proveedor:', error);
//     throw error; // Puedes lanzar el error nuevamente si lo deseas
//   }
// };

// export const EditarProveedor = async (proveedor: Proveedor) => {
//   await sleep(1000)
//   const index = proveedores.findIndex((u) => u.IdProveedor === proveedor.IdProveedor)
//   proveedores[index] = proveedor
// }

// export const EliminarProveedor = async (proveedor: Proveedor) => {
//   await sleep(1000)
//   proveedores.splice(
//     proveedores.findIndex((u) => u.IdProveedor === proveedor.IdProveedor),
//     1,
//   )
// }

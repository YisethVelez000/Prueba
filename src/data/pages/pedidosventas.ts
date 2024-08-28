/* eslint-disable prettier/prettier */
import { useToast } from 'vuestic-ui/web-components'
import { sleep } from '../../services/utils'
import { PedidosVentas, Cliente, Usuario } from '../../pages/pedidosventas/types'
import usersDb from './users-db.json'
import axios from 'axios'
const { init: notify } = useToast()
// Datos quemados
export const pedidosventas = usersDb as unknown as PedidosVentas[]

// Simulate API calls

export type Pagination = {
  page: number
  perPage: number
  total: number
}

export type Sorting = {
  sortBy: keyof PedidosVentas | undefined
  sortingOrder: 'asc' | 'desc' | null
}

export type Filters = {
  isActive: boolean
  search: string
}

export const ListarPedidosVentas = async (filters: Partial<Filters & Pagination & Sorting>) => {
  try {
    // Realizar la solicitud GET a la API
    const response = await axios.get('https://apinodedvp.onrender.com/pedidosventas', { params: filters })
    const data: PedidosVentas[] = response.data
    console.log('Respuesta de la API:', data)
    // Aplicar filtro de búsqueda si se proporciona
    let filteredData = data
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase() // Convertir el término de búsqueda a minúsculas para una comparación insensible a mayúsculas y minúsculas
      filteredData = data.filter((pedidosventas: PedidosVentas) => {
        // Convertir NumeroPedido a string y comparar con el término de búsqueda
        return pedidosventas.NumeroPedido.toString().toLowerCase().includes(searchTerm)
      })
    }

    // Verificar que filteredData sea un array antes de paginar
    if (!Array.isArray(filteredData)) {
      throw new Error('Los datos filtrados no son un array')
    }

    // Calcular la paginación y devolver los datos filtrados
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
  } catch (error) {
    console.error('Error al listar pedidos:', error)
    throw error
  }
}

export const AgregarPedidosVentas = async (pedidosventas: Omit<PedidosVentas, 'NumeroPedido'>) => {
  try {
    console.log('Iniciando proceso para agregar el pedido:', pedidosventas)

    // Simula un retraso de 1 segundo
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const response = await fetch('https://apinodedvp.onrender.com/pedidosventas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pedidosventas),
    })

    console.log('Respuesta recibida del servidor:', response)

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Error en la respuesta del servidor:', errorData)
      throw new Error(errorData.message)
    }

    //El servidor devuelve el pedido con NumeroPedido incluido
    const nuevoPedido = (await response.json()) as PedidosVentas

    notify({
      message: `${nuevoPedido.NumeroPedido.toString()} creado con éxito`,
      color: 'success',
      duration: 7000,
      position: 'top-right',
    })
  } catch (error) {
    console.error('Error al agregar el pedido:', error)
    notify({
      message: 'Error al agregar el pedido',
      color: 'error',
      duration: 5000,
      position: 'top-right',
    })
    throw error
  }
}

export const EditarPedidosVentas = async (pedido: PedidosVentas) => {
  try {
    if (!pedido || pedido.NumeroPedido === undefined || pedido.NumeroPedido === null) {
      throw new Error('Pedido inválido o faltan datos')
    }

    const { NumeroPedido, ...pedidoData } = pedido

    // await sleep(1000)
    const response = await axios.put(`https://apinodedvp.onrender.com/pedidosventas/${NumeroPedido}`, pedidoData)

    if (response.status !== 200) {
      throw new Error('Error al editar el Pedido')
    }
    // Encuentra el índice del pedido a actualizar en la lista local
    const index = pedidosventas.findIndex((u) => u.NumeroPedido === pedido.NumeroPedido)
    if (index !== -1) {
      pedidosventas[index] = pedido
    }
    console.log('Pedido editado con éxito:', response.data)
  } catch (error) {
    console.error('Error al editar el pedido:', error)
    throw error
  }
}
const API_URL = 'https://apinodedvp.onrender.com/pedidosventas'

export const ObtenerPedidosVentasPorId = async (NumeroPedido: string): Promise<PedidosVentas> => {
  try {
    console.log('Número del Pedido:', NumeroPedido)

    // Convertir el NumeroPedido de string a number
    const id = parseInt(NumeroPedido, 10)
    if (isNaN(id)) {
      throw new Error('NumeroPedido no es un número válido')
    }
    console.log('Número del pedido convertido:', id)

    const response = await axios.get<PedidosVentas>(`${API_URL}/${id}`)
    return response.data
  } catch (error) {
    console.error('Error al obtener el pedido por ID:', error)
    throw error
  }
}

export const EliminarPedidosVentas = async (pedido: PedidosVentas): Promise<void> => {
  try {
    if (!pedido || pedido.NumeroPedido === undefined) {
      throw new Error('Pedido inválido o faltan datos')
    }

    await sleep(1000)

    // Realiza la solicitud DELETE al servidor
    const response = await axios.delete(`${API_URL}/${pedido.NumeroPedido}`)

    if (response.status !== 200) {
      throw new Error('Error al eliminar el pedido')
    }

    // Elimina el pedido de la lista local
    const index = pedidosventas.findIndex((u) => u.NumeroPedido === pedido.NumeroPedido)
    if (index !== -1) {
      pedidosventas.splice(index, 1)
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 409) {
      throw new Error('No se puede eliminar el pedido porque está asociado a otra tabla')
    } else {
      console.error('Error al eliminar el pedido :', error)
      throw error
    }
  }
}

// Función para obtener un cliente por su ID
export async function ObtenerClientePorId(idCliente: number): Promise<Cliente> {
  try {
    const response = await axios.get<Cliente>(`https://apinodedvp.onrender.com/clientes/listarCliente/${idCliente}`)
    return response.data
  } catch (error) {
    console.error('Error al obtener el cliente por ID:', error)
    throw new Error('Error al obtener el cliente por ID')
  }
}

export async function ObtenerUsuarioPorId(idUsuario: number): Promise<Usuario> {
  try {
    const response = await axios.get<Usuario>(`https://apinodedvp.onrender.com/usuarios/${idUsuario}`)
    return response.data
  } catch (error) {
    console.error('Error al obtener el usuario por ID:', error)
    throw new Error('Error al obtener el usuario por ID')
  }
}

export const obtenerUsuarioPorDocumento = async (
  NumeroDocumento: number,
): Promise<{ usuario: Usuario; cliente: Cliente } | null> => {
  try {
    const response = await fetch(`https://apinodedvp.onrender.com/usuarios/buscar-por-documento/${NumeroDocumento}`)
    if (!response.ok) {
      throw new Error('Error al obtener usuario y cliente')
    }
    const data = await response.json()
    return data as { usuario: Usuario; cliente: Cliente }
  } catch (error) {
    console.error('Error al obtener usuario y cliente:', error)
    return null
  }
}

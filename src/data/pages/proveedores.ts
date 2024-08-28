import { useToast } from 'vuestic-ui/web-components'
import { sleep } from '../../services/utils'
import { Proveedor } from './../../pages/proveedores/types'
import usersDb from './users-db.json'
import axios from 'axios'
const { init: notify } = useToast()
// Datos quemados
export const proveedores = usersDb as unknown as Proveedor[]

// Simulate API calls

export type Pagination = {
  page: number
  perPage: number
  total: number
}

export type Sorting = {
  sortBy: keyof Proveedor | undefined
  sortingOrder: 'asc' | 'desc' | null
}

export type Filters = {
  isActive: boolean
  search: string
}

export const ListarProveedor = async (filters: Partial<Filters & Pagination & Sorting>) => {
  try {
    // Realizar la solicitud GET a la API
    const response = await axios.get('https://apinodedvp.onrender.com/proveedor', { params: filters })
    const data: Proveedor[] = response.data

    // Aplicar filtro de búsqueda si se proporciona
    let filteredData = data
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase() // Convertir el término de búsqueda a minúsculas para una comparación insensible a mayúsculas y minúsculas
      filteredData = data.filter((proveedor: Proveedor) => {
        // Filtrar por el nombre del proveedor
        return proveedor.NombreProveedor.toLowerCase().includes(searchTerm)
      })
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
    console.error('Error al listar proveedores:', error)
    throw error
  }
}

export const AgregarProveedor = async (proveedor: Omit<Proveedor, 'IdProveedor'>) => {
  try {
    console.log('Iniciando proceso para agregar proveedor:', proveedor)

    // Simula un retraso de 1 segundo
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const response = await fetch('https://apinodedvp.onrender.com/proveedor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(proveedor),
    })

    console.log('Respuesta recibida del servidor:', response)

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Error en la respuesta del servidor:', errorData)
      throw new Error(errorData.message)
    }

    notify({
      message: `${proveedor.NombreProveedor} creado con éxito`,
      color: 'success',
      duration: 7000,
      position: 'top-right',
    })
  } catch (error) {
    console.error('Error al agregar el proveedor:', error)
    notify({
      message: 'Error al agregar el proveedor',
      color: 'error',
      duration: 5000,
      position: 'top-right',
    })
    throw error
  }
}

export const EditarProveedor = async (proveedor: Proveedor) => {
  try {
    if (!proveedor || proveedor.IdProveedor === undefined) {
      throw new Error('Proveedor inválido o faltan datos')
    }

    await sleep(1000)
    const response = await axios.put(`https://apinodedvp.onrender.com/proveedor/${proveedor.IdProveedor}`, proveedor)

    if (response.status !== 200) {
      throw new Error('Error al editar el proveedor')
    }

    const index = proveedores.findIndex((u) => u.IdProveedor === proveedor.IdProveedor)
    if (index !== -1) {
      proveedores[index] = proveedor
    }
  } catch (error) {
    console.error('Error al editar el proveedor:', error)
    throw error
  }
}
const API_URL = 'https://apinodedvp.onrender.com/proveedor'
export const ObtenerProveedorPorId = async (IdProveedor: string): Promise<Proveedor> => {
  try {
    console.log('ID del proveedor:', IdProveedor)

    // Convertir el IdProveedor de string a number
    const id = parseInt(IdProveedor)
    console.log('ID del proveedor convertido:', id)

    const response = await axios.get<Proveedor>(`${API_URL}/${IdProveedor}`)
    return response.data
  } catch (error) {
    console.error('Error al obtener el proveedor por ID:', error)
    throw error
  }
}

export const EliminarProveedor = async (proveedor: Proveedor): Promise<void> => {
  try {
    if (!proveedor || proveedor.IdProveedor === undefined) {
      throw new Error('Proveedor inválido o faltan datos')
    }

    await sleep(1000)

    // Realiza la solicitud DELETE al servidor
    const response = await axios.delete(`https://apinodedvp.onrender.com/proveedor/${proveedor.IdProveedor}`)

    if (response.status !== 200) {
      throw new Error('Error al eliminar el proveedor')
    }

    // Elimina el proveedor de la lista local
    const index = proveedores.findIndex((u) => u.IdProveedor === proveedor.IdProveedor)
    if (index !== -1) {
      proveedores.splice(index, 1)
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 409) {
      throw new Error('No se puede eliminar el proveedor porque está asociado a otra tabla')
    } else {
      console.error('Error al eliminar el proveedor :', error)
      throw error
    }
  }
}

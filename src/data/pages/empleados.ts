import { useToast } from 'vuestic-ui/web-components'
import { sleep } from '../../services/utils'
import { Empleado } from './../../pages/empleados/types'
import usersDb from './users-db.json'
import axios from 'axios'
const { init: notify } = useToast()
// Datos quemados
export const empleados = usersDb as unknown as Empleado[]

// Simulate API calls

export type Pagination = {
  page: number
  perPage: number
  total: number
}

export type Sorting = {
  sortBy: keyof Empleado | undefined
  sortingOrder: 'asc' | 'desc' | null
}

export type Filters = {
  isActive: boolean
  search: string
}
export const validateEmail = async (CorreoElectronico: any) => {
  const response = await fetch('https://apinodedvp.onrender.com/usuarios/validateEmail', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      CorreoElectronico: CorreoElectronico,
    }),
  })
  if (response.status === 200) {
    return true
  } else {
    return false
  }
}

export const ListarEmpleado = async (filters: Partial<Filters & Pagination & Sorting>) => {
  try {
    // Realizar la solicitud GET a la API
    const response = await axios.get('https://apinodedvp.onrender.com/empleados/', { params: filters })
    let data = response.data

    // Aplicar filtro de búsqueda si se proporciona
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      console.log('searchTerm:', searchTerm)
      data = data.filter((empleado: Empleado) => {
        console.log('empleado:', empleado)
        const matches =
          (empleado.Nombre && empleado.Nombre.toLowerCase().includes(searchTerm)) ||
          (empleado.Apellidos && empleado.Apellidos.toLowerCase().includes(searchTerm)) ||
          (empleado.CorreoElectronico && empleado.CorreoElectronico.toLowerCase().includes(searchTerm)) ||
          (empleado.TipoDocumento && empleado.TipoDocumento.toLowerCase().includes(searchTerm)) ||
          (empleado.NumeroDocumento && empleado.NumeroDocumento.toLowerCase().includes(searchTerm))
        console.log('matches:', matches)
        return matches !== undefined ? matches : false // Manejar caso de campos undefined
      })
    }

    // Calcular la paginación y devolver los datos filtrados
    const totalRegistros = data.length
    const registrosPorPagina = filters.perPage || 10
    const paginaActual = filters.page || 1
    // const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina);

    const startIndex = (paginaActual - 1) * registrosPorPagina
    const endIndex = Math.min(startIndex + registrosPorPagina, totalRegistros)
    const registrosPagina = data.slice(startIndex, endIndex)

    const pagination: Pagination = {
      page: paginaActual,
      perPage: registrosPorPagina,
      total: totalRegistros,
    }

    console.log('registrosPagina:', registrosPagina)
    return { data: registrosPagina, pagination }
  } catch (error) {
    console.error('Error al listar empleados:', error)
    throw error
  }
}

export const AgregarEmpleado = async (empleado: Omit<Empleado, 'IdEmpleado'>) => {
  try {
    // Enviar solicitud al backend para crear empleado y usuario simultáneamente
    const response = await fetch('https://apinodedvp.onrender.com/empleados/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...empleado,
        // No necesitas incluir Usuario aquí, ya que ya está incluido en el objeto empleado
        FechaNacimiento: empleado.FechaFinalizacion,
        FechaFinalizacion: empleado.FechaFinalizacion,
        Telefono: empleado.Telefono,
      }),
    })

    // Verificar si la solicitud fue exitosa
    if (!response.ok) {
      const errorData = await response.json()
      console.error('Error en la respuesta del servidor al agregar empleado y usuario:', errorData)
      throw new Error('Error al agregar empleado y usuario: ' + errorData.message)
    }

    // Obtener los datos de la respuesta
    const data = await response.json()
    console.log('Datos recibidos del servidor:', data) // Añadido para imprimir la data recibida
    console.log('Empleado y usuario creados con éxito:', data)

    // Mostrar notificación de éxito
    notify({
      message: `Empleado ${empleado.Nombre} creado con éxito`,
      color: 'success',
      duration: 7000,
      position: 'top-right',
    })
  } catch (error) {
    console.error('Error al agregar el empleado y usuario:', error)
    notify({
      message: 'Error al agregar el empleado y usuario',
      color: 'error',
      duration: 5000,
      position: 'top-right',
    })
    throw error
  }
}

export const EditarEmpleado = async (empleado: Empleado) => {
  try {
    if (!empleado || empleado.IdEmpleado === undefined) {
      throw new Error('empleado inválido o faltan datos')
    }

    await sleep(1000)
    const response = await axios.put(`https://apinodedvp.onrender.com/empleados/${empleado.IdEmpleado}`, empleado)

    if (response.status !== 200) {
      throw new Error('Error al editar el empleado')
    }

    const index = empleados.findIndex((u) => u.IdEmpleado === empleado.IdEmpleado)
    if (index !== -1) {
      empleados[index] = empleado
    }
  } catch (error) {
    console.error('Error al editar el empleado:', error)
    throw error
  }
}
const API_URL = 'https://apinodedvp.onrender.com/empleados/'
export const ObtenerEmpleadoPorId = async (IdEmpleado: string): Promise<Empleado> => {
  try {
    console.log('ID del empleado:', IdEmpleado)

    // Convertir el IdEmpleado de string a number
    const id = parseInt(IdEmpleado)
    console.log('ID del empleado convertido:', id)

    const response = await axios.get<Empleado>(`${API_URL}/${IdEmpleado}`)
    return response.data
  } catch (error) {
    console.error('Error al obtener el empleado por ID:', error)
    throw error
  }
}

export const EliminarEmpleado = async (empleado: Empleado): Promise<void> => {
  try {
    if (!empleado || empleado.IdEmpleado === undefined) {
      throw new Error('Empleado inválido o faltan datos')
    }

    await sleep(1000)

    // Realiza la solicitud DELETE al servidor
    const response = await axios.delete(`https://apinodedvp.onrender.com/empleados/${empleado.IdEmpleado}`)

    if (response.status !== 200) {
      throw new Error('Error al eliminar el empleado')
    }

    // Elimina el empleado de la lista local
    const index = empleados.findIndex((u) => u.IdEmpleado === empleado.IdEmpleado)
    if (index !== -1) {
      empleados.splice(index, 1)
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 409) {
      throw new Error('No se puede eliminar el Empleado porque está asociado a otra tabla')
    } else {
      console.error('Error al eliminar el empleado :', error)
      throw error
    }
  }
}

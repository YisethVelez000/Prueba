import axios from 'axios'
import { sleep } from '../../services/utils'
import { Usuario } from './../../pages/users/types'
import usersDb from './users-db.json'
import { useToast } from 'vuestic-ui/web-components'
const { init: notify } = useToast()

export const users = usersDb as Usuario[]

// Simulate API calls

export type Pagination = {
  page: number
  perPage: number
  total: number
}

export type Sorting = {
  sortBy: keyof Usuario | undefined
  sortingOrder: 'asc' | 'desc' | null
}

export type Filters = {
  isActive: string
  search: string
}

//Link del api https://apinodedvp.onrender.com/usuarios/listarUsuarios

export const getUsers = async (filters: Partial<Filters & Pagination & Sorting>) => {
  await sleep(1000)

  // Realizar la solicitud GET a la API
  const response = await axios.get('https://apinodedvp.onrender.com/usuarios/listarUsuarios', { method: 'GET' })
  const data: Usuario[] = response.data

  // Filtrar por el estado si se proporciona
  let filteredData = data
  if (filters.isActive) {
    filteredData = data.filter((user: Usuario) => {
      return user.EstadoUsuario.toLowerCase() === (filters.isActive ?? '').toLowerCase()
    })
  }

  // Aplicar filtro de búsqueda si se proporciona
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase()
    filteredData = filteredData.filter((user: Usuario) => {
      return (
        user.Nombre.toLowerCase().includes(searchTerm) ||
        user.Apellidos.toLowerCase().includes(searchTerm) ||
        user.TipoDocumento.toLowerCase().includes(searchTerm) ||
        user.NumeroDocumento.toLowerCase().includes(searchTerm) ||
        user.CorreoElectronico.toLowerCase().includes(searchTerm) ||
        user.IdRol.toString().toLowerCase().includes(searchTerm) ||
        user.EstadoUsuario.toLowerCase().includes(searchTerm)
      )
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
}

//Link del api https://apinodedvp.onrender.com/usuarios/register
export const addUser = async (user: Usuario) => {
  await sleep(1000)
  // Realizar la solicitud POST a la API por un fetch
  const response = await fetch('https://apinodedvp.onrender.com/usuarios/register', {
    method: 'POST',
    body: JSON.stringify(user),
    headers: {
      'Content-Type': 'application/json',
    },
  })
  if (response.ok) {
    notify({
      title: 'Usuario agregado',
      message: `El usuario ${user.Nombre} ${user.Apellidos}  ha sido agregado correctamente.`,
      color: 'success',
    })
  } else {
    notify({
      title: 'Error',
      message: `Error al agregar el usuario ${user.Nombre} ${user.Apellidos}.`,
      color: 'error',
    })
  }
}

//Link del api https://apinodedvp.onrender.com/usuarios/${user.IdUsuario}
export const updateUser = async (user: Usuario) => {
  await sleep(1000)
  // Realizar la solicitud PUT a la API por un fetch
  const response = await fetch(`https://apinodedvp.onrender.com/usuarios/${user.IdUsuario}`, {
    method: 'PUT',
    body: JSON.stringify(user),
    headers: {
      'Content-Type': 'application/json',
    },
  })
  if (response.ok) {
    notify({
      title: 'Usuario actualizado',
      message: `El usuario ${user.Nombre} ${user.Apellidos}  ha sido actualizado correctamente.`,
      color: 'success',
    })
  } else {
    notify({
      title: 'Error',
      message: `Error al actualizar el usuario ${user.Nombre} ${user.Apellidos}.`,
      color: 'error',
    })
  }
}

export const removeUser = async (user: Usuario) => {
  await sleep(1000)
  // Realizar la solicitud DELETE a la API por un fetch
  const response = await fetch(`https://apinodedvp.onrender.com/usuarios/${user.IdUsuario}`, {
    method: 'DELETE',
  })
  if (response.ok) {
    notify({
      title: 'Usuario eliminado',
      message: `El usuario ${user.Nombre} ${user.Apellidos}  ha sido eliminado correctamente.`,
      color: 'success',
    })
    //Actulizamos el listado de usuarios ejecutando la funcion getUsers en la vista de table Users
  } else {
    notify({
      title: 'Error',
      message: `No se puede eliminar  el usuario ${user.Nombre} ${user.Apellidos} debido a que esta asociado a otro proceso`,
      color: 'error',
    })
  }
}

export const ObtenerUsuarioPorId = async (IdUsuario: string): Promise<Usuario> => {
  try {
    // Realizar la solicitud GET a la AP
    const id = parseInt(IdUsuario)
    console.log('IdUsuario:', id)
    const response = await axios.get(`https://apinodedvp.onrender.com/usuarios/${IdUsuario}`, { method: 'GET' })
    return response.data
  } catch (error) {
    console.error('Error al obtener el usuario:', error)
    throw error
  }
}

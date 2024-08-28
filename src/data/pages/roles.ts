import axios from 'axios'
import { sleep } from '../../services/utils'
import { Rol } from './../../pages/roles/types'
import { useToast } from 'vuestic-ui/web-components'
import router from '../../router'
const { init: notify } = useToast()

export const roles: Rol[] = []

// Simulate API calls
export type Pagination = {
  page: number
  perPage: number
  total: number
}

export type Sorting = {
  sortBy: keyof Rol | undefined
  sortingOrder: 'asc' | 'desc' | null
}

export type Filters = {
  isActive: boolean
  search: string
}

//Link del api https://apinodedvp.onrender.com/roles
export const getRoles = async (filters: Partial<Filters & Pagination & Sorting>) => {
  await sleep(1000)
  //Realizar solicitud a la API
  const response = await axios.get('https://apinodedvp.onrender.com/roles')
  const data: Rol[] = response.data

  //Aplicar filtro de busqueda si se proporciona
  let filteredData = data
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase()
    filteredData = data.filter((roles: Rol) => {
      return roles.Nombre.toLowerCase().includes(searchTerm)
    })
  }

  //Calcular la paginacion y devolver los datos filtrados
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

//Link del api https://apinodedvp.onrender.com/roles
export const addRol = async (roles: Rol) => {
  await sleep(1000)
  //Realizar solicitud a la API por un fetch
  const response = await fetch('https://apinodedvp.onrender.com/roles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(roles),
  })

  if (response.ok) {
    notify({
      title: 'Rol creado',
      message: 'El rol ha sido creado exitosamente',
      color: 'success',
    })
  } else {
    notify({
      title: 'Error',
      message: 'Ha ocurrido un error al crear el rol',
      color: 'error',
    })
  }
}

//Link del api https://apinodedvp.onrender.com/roles
export const updateRol = async (id: number, roles: Rol) => {
  await sleep(1000)
  //Realizar solicitud a la API por un fetch
  const response = await fetch(`https://apinodedvp.onrender.com/roles/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(roles),
  })

  if (response.ok) {
    notify({
      title: 'Rol actualizado',
      message: 'El rol ha sido actualizado exitosamente',
      color: 'success',
    })
    router.push('/roles')
  } else {
    notify({
      title: 'Error',
      message: 'Ha ocurrido un error al actualizar el rol',
      color: 'error',
    })
  }
}

export const removeRol = async (IdRol: number) => {
  await sleep(1000)
  //Realizar solicitud a la API por un fetch
  const response = await fetch(`https://apinodedvp.onrender.com/roles/${IdRol}`, {
    method: 'DELETE',
  })

  if (response.ok) {
    notify({
      title: 'Rol eliminado',
      message: 'El rol ha sido eliminado exitosamente',
      color: 'success',
    })
  } else {
    notify({
      title: 'Error',
      message: 'Ha ocurrido un error al eliminar el rol',
      color: 'error',
    })
  }
}

export const ObtenerRolPorId = async (IdRol: number): Promise<Rol | undefined> => {
  try {
    const response = await axios.get(`https://apinodedvp.onrender.com/roles/${IdRol}`)
    console.log('Respuesta de la API:', response.data) // Verifica la estructura aquí
    return response.data
  } catch (error) {
    console.error('Error al obtener el rol:', error)
    return undefined // O maneja el error de otra manera adecuada
  }
}

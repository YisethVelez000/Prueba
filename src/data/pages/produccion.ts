import { OrdenProduccion } from '../../pages/produccion/type'
import { sleep } from '../../services/utils'
import { useToast } from 'vuestic-ui/web-components'
import router from '../../router'
import axios from 'axios'
const { init: notify } = useToast()

// const produccion: OrdenProduccion[] = []

export type Pagination = {
  page: number
  perPage: number
  total: number
}

export type Sorting = {
  sortBy: keyof OrdenProduccion | undefined
  sortingOrder: 'asc' | 'desc' | null
}

export type Filters = {
  isActive: boolean
  search: string
}

export const getProduccion = async (filters: Partial<Filters & Pagination & Sorting>) => {
  await sleep(1000)
  //Realizar solicitud a la API
  const response = await axios.get('https://apinodedvp.onrender.com/ordenesproduccion')
  const data: OrdenProduccion[] = response.data

  //Aplicar filtro de busqueda si se proporciona
  let filteredData = data
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase()
    filteredData = data.filter((produccion: OrdenProduccion) => {
      return produccion.EstadoOrden.toString().includes(searchTerm)
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

export const addProduccion = async (produccion: OrdenProduccion) => {
  await sleep(1000)
  //Realizar solicitud a la API
  const response = await fetch('https://apinodedvp.onrender.com/ordenesproduccion', {
    method: 'POST',
    body: JSON.stringify(produccion),
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (response.ok) {
    notify({
      title: 'Orden de producción agregada',
      message: 'La orden de producción se ha agregado correctamente',
      color: 'success',
    })
    router.push('/produccion')
  } else {
    notify({
      title: 'Error al agregar la orden de producción',
      message: 'Ocurrió un error al agregar la orden de producción',
      color: 'error',
    })
  }
}

export const updateProduccion = async (produccion: OrdenProduccion) => {
  await sleep(1000)
  //Realizar solicitud a la API
  const response = await fetch(
    `https://apinodedvp.onrender.com/ordenesproduccion/${produccion.NumeroOrdenProduccion}`,
    {
      method: 'PUT',
      body: JSON.stringify(produccion),
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )

  if (response.ok) {
    notify({
      title: 'Orden de producción actualizada',
      message: 'La orden de producción se ha actualizado correctamente',
      color: 'success',
    })
    router.push('/produccion')
  } else {
    notify({
      title: 'Error al actualizar la orden de producción',
      message: 'Ocurrió un error al actualizar la orden de producción',
      color: 'error',
    })
  }
}

export const deleteProduccion = async (produccion: OrdenProduccion) => {
  await sleep(1000)
  //Realizar solicitud a la API
  const response = await fetch(
    `https://apinodedvp.onrender.com/ordenesproduccion/${produccion.NumeroOrdenProduccion}`,
    {
      method: 'DELETE',
    },
  )

  if (response.ok) {
    notify({
      title: 'Orden de producción eliminada',
      message: 'La orden de producción se ha eliminado correctamente',
      color: 'success',
    })
    router.push('/produccion')
  } else {
    notify({
      title: 'Error al eliminar la orden de producción',
      message: 'Ocurrió un error al eliminar la orden de producción',
      color: 'error',
    })
  }
}

export const ObtenerOrdenProduccionPorId = async (id: string) => {
  await sleep(1000)
  //Realizar solicitud a la API
  const response = await axios.get(`https://apinodedvp.onrender.com/ordenesproduccion/${id}`)
  return response.data
}

import { sleep } from '../../services/utils'
import { Cliente } from '../../pages/clientes/types'
import axios from 'axios'
import { useToast } from 'vuestic-ui/web-components'
import router from '../../router'
// Datos de ejemplo (simulación de una base de datos local)
import usersDb from './users-db.json'
const { init: notify } = useToast()
export const clientes = usersDb as unknown as Cliente[]

// Simulate API calls

export type Pagination = {
  page: number
  perPage: number
  total: number
}

export type Sorting = {
  sortBy: keyof Cliente | undefined
  sortingOrder: 'asc' | 'desc' | null
}

export type Filters = {
  isActive: string
  search: string
}

//Link del api https://apinodedvp.onrender.com/clientes/listarClientes
export const getClientes = async (filters: Partial<Filters & Pagination & Sorting>) => {
  await sleep(1000)
  //Realizar la solicitud a la API
  const response = await axios.get('https://apinodedvp.onrender.com/clientes/listarClientes', { method: 'GET' })
  const data: Cliente[] = response.data

  //Aplicar filtro de busqueda si se proporciona
  let filteredData = data
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase()
    filteredData = data.filter((cliente: Cliente) => {
      //Filtrar por nombre, Apellidos, CorreoElectronico, TipoDocumento, NumeroDocumento, Direccion, Telefono
      return (
        cliente.Nombre.toLowerCase().includes(searchTerm) ||
        cliente.Apellidos.toLowerCase().includes(searchTerm) ||
        cliente.CorreoElectronico.toLowerCase().includes(searchTerm) ||
        cliente.TipoDocumento.toLowerCase().includes(searchTerm) ||
        cliente.NumeroDocumento.toLowerCase().includes(searchTerm) ||
        cliente.Direccion.toLowerCase().includes(searchTerm) ||
        cliente.Telefono.toLowerCase().includes(searchTerm)
      )
    })
  }
  //Calcaular la paginación y devolver los datos filtrados
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

export const addCliente = async (cliente: Cliente) => {
  await sleep(1000)
  //Realizar la solicitud a la API por un fetch
  const response = await fetch('https://apinodedvp.onrender.com/clientes/crearCliente', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cliente),
  })
  if (response.ok) {
    notify({
      title: 'Cliente creado',
      message: 'El cliente ' + cliente.Nombre + ' ' + cliente.Apellidos + ' se ha creado correctamente',
      color: 'success',
    })
    //Actualizar la lista de clientes con el nuevo cliente
    router.push({ name: 'clientes' })
  } else {
    notify({
      title: 'Error',
      message: 'Error al crear el cliente',
      color: 'error',
    })
    router.push({ name: 'clientes' })
    //Actualizar la lista de clientes con el nuevo cliente
    clientes.push(cliente)
    getClientes({})
  }
}

//Link del api https://apinodedvp.onrender.com/clientes/editarCliente/:id
export const updateCliente = async (cliente: Cliente) => {
  await sleep(1000)
  //Realizar la solicitud a la API por un fetch
  const response = await fetch(`https://apinodedvp.onrender.com/clientes/editarCliente/${cliente.IdCliente}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cliente),
  })
  if (response.ok) {
    notify({
      title: 'Cliente actualizado',
      message: 'El cliente ' + cliente.Nombre + ' ' + cliente.Apellidos + ' se ha actualizado correctamente',
      color: 'success',
    })
    router.push({ name: 'clientes' })
  } else {
    notify({
      title: 'Error',
      message: 'Error al actualizar el cliente',
      color: 'error',
    })
    router.push({ name: 'clientes' })
  }
  //Actualizar la lista de clientes con el cliente actualizado en la posición correcta
  const index = clientes.findIndex((c) => c.IdCliente === cliente.IdCliente)
  if (index !== -1) {
    clientes[index] = cliente
  }
}

//Link del api https://apinodedvp.onrender.com/clientes/eliminarCliente/:id
export const removeCliente = async (cliente: Cliente) => {
  await sleep(1000)
  // Realizar la solicitud a la API por un fetch
  const response = await fetch(`https://apinodedvp.onrender.com/clientes/eliminarCliente/${cliente.IdCliente}`, {
    method: 'DELETE',
  })
  if (response.ok) {
    notify({
      title: 'Cliente eliminado',
      message: 'El cliente ' + cliente.Nombre + ' ' + cliente.Apellidos + ' se ha eliminado correctamente',
      color: 'success',
    })
  } else {
    notify({
      title: 'Error',
      message: 'No se puede eliminar el cliente porque esta asociado a una venta y/o pedido',
      color: 'error',
    })
  }
}

export const ObtenerClientePorId = async (IdCliente: string): Promise<Cliente> => {
  await sleep(1000)
  //Realizar la solicitud a la API por un fetch
  const response = await fetch(`https://apinodedvp.onrender.com/clientes/listarCliente/${IdCliente}`, {
    method: 'GET',
  })
  if (response.ok) {
    const cliente = await response.json()
    return cliente
  } else {
    notify({
      title: 'Error',
      message: 'Error al obtener el cliente',
      color: 'error',
    })
    return {} as Cliente
  }
}

export const onToggleStatus = async (cliente: Cliente) => {
  //Confirmación de cambio de estado
  const agreed = confirm(`¿Estás seguro de que quieres cambiar el estado de ${cliente.Nombre} ${cliente.Apellidos}?`)

  if (agreed) {
    try {
      const response = await fetch(`https://apinodedvp.onrender.com/clientes/cambiarEstado/${cliente.IdCliente}`, {
        method: 'put',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cliente: {
            EstadoUsuario: cliente.Usuario.EstadoUsuario === 'Activo' ? 'Inactivo' : 'Activo',
          },
        }),
      })

      if (response.ok) {
        //Añadir notificación de éxito
        const message = cliente.EstadoUsuario === 'Activo' ? 'Inactivo' : 'Activo'
        notify({
          title: 'Estado cambiado',
          message: `El estado de ${cliente.Nombre} ${cliente.Apellidos} ha sido cambiado a ${message}`,
          color: 'success',
          duration: 5000,
        })
      } else {
        throw new Error('Error al cambiar el estado')
      }
    } catch (error) {
      console.error('Error al cambiar estado', error)
    }
  }
}

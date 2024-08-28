<script setup lang="ts">
//import { ref } from 'vue'
import UsersTable from './widgets/UsersTable.vue'
import { Usuario } from './types'
import { useUsers } from './composables/useUsers'
//import { useModal, useToast } from 'vuestic-ui'
import router from '../../router'

const { users, isLoading, filters, sorting, pagination } = useUsers()

// const userToEdit = ref<Usuario | null>(null)

const editarUsuario = (user: Usuario) => {
  router.push({
    path: `/users/editar/${user.IdUsuario}`, // Usar un parámetro de ruta dinámico
    params: { id: user.IdUsuario },
    query: { id: user.IdUsuario }, // Pasar el ID del usuario como parámetro
  })
  console.log('Editar usuario', user)
}

//Ver detalles de un usuario
const verDetalles = (user: Usuario) => {
  console.log('Ver detalles', user)
  router.push({
    path: `/users/detalle/${user.IdUsuario}`, // Usar un parámetro de ruta dinámico
    params: { id: user.IdUsuario },
    query: { id: user.IdUsuario },
  })
  console.log('Ver detalles', user)
  console.log('Ver detalles', user.IdUsuario)
}

//Cuando le dan agregar redirigimos a la ventana de agregar usuario users/nuevo
const agregarUsuario = () => {
  router.push('/users/nuevo')
}

// const { init: notify } = useToast()

// const onUserSaved = async (user: Usuario) => {
//   if (userToEdit.value) {
//     await usersApi.update(user)
//     notify({
//       message: `${user.Nombre} ${user.Apellidos} ha sido actualizado`,
//       color: 'success',
//     })
//   } else {
//     usersApi.add(user)
//     notify({
//       message: `${user.Nombre} ${user.Apellidos} ha sido añadido`,
//       color: 'success',
//     })
//   }
// }

// const onUserDelete = async (usuario: Usuario) => {
//   await usersApi.removeUser(usuario)
// }
// const editFormRef = ref()

// const { confirm } = useModal()

// const beforeEditFormModalClose = async (hide: () => unknown) => {
//   if (editFormRef.value.isFormHasUnsavedChanges) {
//     const agreed = await confirm({
//       maxWidth: '380px',
//       message: 'Form has unsaved changes. Are you sure you want to close it?',
//       size: 'small',
//     })
//     if (agreed) {
//       hide()
//     }
//   } else {
//     hide()
//   }
// }
</script>

<template>
  <h1 class="page-title">Usuarios</h1>

  <VaCard>
    <VaCardContent>
      <div class="flex flex-col md:flex-row gap-2 mb-2 justify-between">
        <div class="flex flex-col md:flex-row gap-2 justify-start">
          <VaButtonToggle
            v-model="filters.isActive"
            color="background-element"
            border-color="background-element"
            :options="[
              { label: 'Activo', value: 'Activo' },
              { label: 'Inactivo', value: 'Inactivo' },
            ]"
          />

          <VaInput v-model="filters.search" placeholder="Buscar">
            <template #prependInner>
              <VaIcon name="search" color="secondary" size="small" />
            </template>
          </VaInput>
        </div>
        <VaButton @click="agregarUsuario">Añadir</VaButton>
      </div>
      <UsersTable
        v-model:sort-by="sorting.sortBy"
        v-model:sorting-order="sorting.sortingOrder"
        :users="users"
        :loading="isLoading"
        :pagination="pagination"
        @editUser="editarUsuario"
        @viewDetail="verDetalles"
      />
    </VaCardContent>
  </VaCard>
</template>

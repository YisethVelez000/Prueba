<script setup lang="ts">
import UsersTable from './widgets/RolesTable.vue'
import { Rol } from './types'
import { useRoles } from './composables/useRoles'
import router from '../../router'

const { roles, isLoading, filters, sorting, pagination, ...rolesApi } = useRoles()

const onRolDelete = async (rol: Rol) => {
  await rolesApi.remove(rol)
}
//Creamos una funcion que nos mande a la vista de crear rol
const AgregarRol = async () => {
  router.push('roles/agregar')
}

//Creamos una funcion que nos mande a la vista de editar rol
const EditarRol = (rol: Rol) => {
  router.push({
    path: `roles/editar/${rol.IdRol}`,
    params: { id: rol.IdRol },
    query: { id: rol.IdRol },
  })

  //Imprimimos en consola el id del rol que queremos editar
  console.log('Rol a editar', rol)
}

//Creamos una funcion que nos mande a la vista de ver detalles del rol
const VerDetalleRol = (rol: Rol) => {
  router.push({
    path: `roles/detalle/${rol.IdRol}`,
    params: { id: rol.IdRol },
    query: { id: rol.IdRol },
  })
}
</script>

<template>
  <h1 class="page-title">Roles</h1>

  <VaCard>
    <VaCardContent>
      <div class="flex flex-col md:flex-row gap-2 mb-2 justify-between">
        <div class="flex flex-col md:flex-row gap-2 justify-start">
          <VaInput v-model="filters.search" placeholder="Search">
            <template #prependInner>
              <VaIcon name="search" color="secondary" size="small" />
            </template>
          </VaInput>
        </div>
        <VaButton @click="AgregarRol">Agregar</VaButton>
      </div>

      <UsersTable
        v-model:sort-by="sorting.sortBy"
        v-model:sorting-order="sorting.sortingOrder"
        :roles="roles"
        :users="roles"
        :loading="isLoading"
        :pagination="pagination"
        @editUser="EditarRol"
        @deleteUser="onRolDelete"
        @viewDetails="VerDetalleRol"
      />
    </VaCardContent>
  </VaCard>
</template>

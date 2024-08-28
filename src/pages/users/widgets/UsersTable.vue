<script setup lang="ts">
import { defineVaDataTableColumns, useModal } from 'vuestic-ui'
import { Usuario, Rol } from '../types'
import { useToast } from 'vuestic-ui'
import { PropType, computed, ref, watch } from 'vue'
import { Pagination, removeUser, Sorting } from '../../../data/pages/users'
import { useVModel } from '@vueuse/core'
import { useRouter } from 'vue-router'

// Estado reactivo para roles
const roles = ref<Rol[]>([])

const { init: notify } = useToast()

// Cargar roles desde la API
const loadRoles = async () => {
  try {
    const response = await fetch('https://apinodedvp.onrender.com/roles')
    if (response.ok) {
      roles.value = await response.json()
      console.log('Roles cargados:', roles.value)
    } else {
      console.error('Error al cargar roles:', response.status)
    }
  } catch (error) {
    console.error('Error en la solicitud:', error)
  }
}

// Cargar roles cuando se monta el componente
loadRoles()

const getRol = (IdRol: number) => {
  const rol = roles.value.find((role) => role.IdRol === IdRol)
  return rol ? rol.Nombre : ''
}

const props = defineProps({
  users: {
    type: Array as PropType<Usuario[]>,
    required: true,
  },
  loading: { type: Boolean, default: false },
  pagination: { type: Object as PropType<Pagination>, required: true },
  sortBy: { type: String as PropType<Sorting['sortBy']>, required: true },
  sortingOrder: { type: String as PropType<Sorting['sortingOrder']>, required: true },
})

const emit = defineEmits<{
  (event: 'edit-user', user: Usuario): void
  (event: 'delete-user', user: Usuario): void
  (event: 'update:sortBy', sortBy: Sorting['sortBy']): void
  (event: 'update:sortingOrder', sortingOrder: Sorting['sortingOrder']): void
  (event: 'view-detail', user: Usuario): void
  (event: 'toggle-status', user: Usuario): void
  (event: 'update:pagination', pagination: Pagination): void
}>()

const localPagination = ref({ ...props.pagination })

// Actualizar localPagination cuando props.pagination cambie
watch(
  () => props.pagination,
  (newVal) => {
    localPagination.value = { ...newVal }
  },
  { deep: true },
)

// Función para emitir la actualización de la paginación
const updatePagination = (newPagination: Pagination) => {
  emit('update:pagination', newPagination)
}

const onToggleStatus = async (user: Usuario) => {
  const router = useRouter()

  // Confirmación para cambiar el estado del usuario
  const agreed = await confirm({
    title: 'Cambiar estado',
    message: `¿Estás seguro de que quieres cambiar el estado de ${user.Nombre} ${user.Apellidos}?`,
    okText: 'Cambiar',
    cancelText: 'Cancelar',
    size: 'small',
    maxWidth: '380px',
  })

  if (agreed) {
    try {
      const response = await fetch(`https://apinodedvp.onrender.com/usuarios/${user.IdUsuario}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          EstadoUsuario: user.EstadoUsuario === 'Activo' ? 'Inactivo' : 'Activo',
        }),
      })

      if (response.ok) {
        emit('toggle-status', user)
        console.log('Estado cambiado')

        const message = user.EstadoUsuario === 'Activo' ? 'Inactivo' : 'Activo'
        notify({
          message: `El estado de ${user.Nombre} ${user.Apellidos} ha sido cambiado a ${message}`,
          color: 'success',
        })

        router.push('/users')
      } else {
        console.log('Error al cambiar el estado')
      }
    } catch (error) {
      console.log('Error en la solicitud:', error)
    }
  }
}

const sortByVModel = useVModel(props, 'sortBy', emit)
const sortingOrderVModel = useVModel(props, 'sortingOrder', emit)
const totalPages = computed(() => Math.ceil(localPagination.value.total / localPagination.value.perPage))
const { confirm } = useModal()

const onUserDelete = async (user: Usuario) => {
  const agreed = await confirm({
    title: 'Eliminar usuario',
    message: `¿Estás seguro de que quieres eliminar a ${user.Nombre} ${user.Apellidos}?`,
    okText: 'Eliminar',
    cancelText: 'Cancelar',
    size: 'small',
    maxWidth: '380px',
  })

  if (agreed) {
    try {
      await removeUser(user)
      emit('delete-user', user)
    } catch (error) {
      console.error('Error al eliminar el usuario:', error)
    }
  }
}

const columns = defineVaDataTableColumns([
  { label: 'Nombre', key: 'Nombre', sortable: true },
  { label: 'Apellidos', key: 'Apellidos', sortable: true },
  { label: 'Correo Electrónico', key: 'CorreoElectronico', sortable: true },
  { label: 'Rol', key: 'IdRol', sortable: true },
  { label: 'Estado', key: 'EstadoUsuario', sortable: true },
  { label: 'Acciones', key: 'actions', align: 'right' },
])
</script>

<template>
  <VaDataTable
    v-model:sort-by="sortByVModel"
    v-model:sorting-order="sortingOrderVModel"
    :columns="columns"
    :items="users"
    :loading="props.loading"
  >
    <template #cell(Nombre)="{ rowData }">
      <div class="flex items-center gap-2 max-w-[230px] ellipsis">
        <UserAvatar :user="rowData as Usuario" size="small" />
        {{ rowData.Nombre }}
      </div>
    </template>
    <template #cell(Apellidos)="{ rowData }">
      <div class="flex items-center gap-2 max-w-[230px] ellipsis">
        <UserAvatar :user="rowData as Usuario" size="small" />
        {{ rowData.Apellidos }}
      </div>
    </template>
    <template #cell(CorreoElectronico)="{ rowData }">
      <div class="flex items-center gap-2 max-w-[230px] ellipsis">
        <UserAvatar :user="rowData as Usuario" size="small" />
        {{ rowData.CorreoElectronico }}
      </div>
    </template>
    <template #cell(IdRol)="{ rowData }">
      <div class="flex items-center gap-2 max-w-[230px] ellipsis">
        <UserAvatar :user="rowData as Usuario" size="small" />
        {{ getRol(rowData.IdRol) }}
      </div>
    </template>
    <template #cell(EstadoUsuario)="{ rowData }">
      <VaBadge :color="rowData.EstadoUsuario === 'Activo' ? 'success' : 'danger'">
        {{ rowData.EstadoUsuario }}
      </VaBadge>
    </template>
    <template #cell(actions)="{ rowData }">
      <div class="flex gap-2 justify-end">
        <VaSwitch
          :model-value="rowData.EstadoUsuario === 'Activo'"
          size="small"
          title="Estado"
          @change="() => onToggleStatus(rowData as Usuario)"
        />
        <VaButton
          preset="Warning"
          size="small"
          icon="mso-edit"
          color="warning"
          aria-label="Edit user"
          @click="$emit('edit-user', rowData as Usuario)"
        />
        <VaButton
          preset="info"
          size="small"
          icon="mso-visibility"
          color="primary"
          aria-label="View user detail"
          @click="$emit('view-detail', rowData as Usuario)"
        />
        <VaButton
          preset="primary"
          size="small"
          icon="mso-delete"
          color="danger"
          aria-label="Delete user"
          @click="onUserDelete(rowData as Usuario)"
        />
      </div>
    </template>
  </VaDataTable>

  <div class="flex flex-col-reverse md:flex-row gap-2 justify-between items-center py-2">
    <div>
      <b>{{ props.pagination.total }} results.</b>
      Resultados Por Página
      <VaSelect
        v-model="localPagination.perPage"
        class="!w-20"
        :options="[10, 50, 100]"
        @change="updatePagination({ ...localPagination, perPage: localPagination.perPage })"
      />
    </div>

    <div v-if="totalPages > 1" class="flex">
      <VaButton
        preset="secondary"
        icon="va-arrow-left"
        aria-label="Previous page"
        :disabled="localPagination.page === 1"
        @click="updatePagination({ ...localPagination, page: localPagination.page - 1 })"
      />
      <VaButton
        class="mr-2"
        preset="secondary"
        icon="va-arrow-right"
        aria-label="Next page"
        :disabled="localPagination.page === totalPages"
        @click="updatePagination({ ...localPagination, page: localPagination.page + 1 })"
      />
      <VaPagination
        v-model="localPagination.page"
        buttons-preset="secondary"
        :pages="totalPages"
        :visible-pages="5"
        :boundary-links="false"
        :direction-links="false"
        @change="updatePagination({ ...localPagination, page: $event })"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.va-data-table {
  ::v-deep(.va-data-table__column) {
    text-align: left;
  }
  ::v-deep(.va-data-table__cell) {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>

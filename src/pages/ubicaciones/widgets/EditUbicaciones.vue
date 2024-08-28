<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Ubicaciones } from '../types'
import { ObtenerUbicacionPorId, EditarUbicacion } from '../../../data/pages/ubicaciones'
import { useRouter, useRoute } from 'vue-router'
import { useToast, useModal } from 'vuestic-ui'

const { init: notify } = useToast()
const { confirm } = useModal()

const ubicacion = ref<Ubicaciones>({
  IdUbicacion: -1,
  Ubicacion: '',
  EstadoUbicacion: '',
})

const showSuccessAlert = ref(false)
const router = useRouter()
const route = useRoute()

onMounted(async () => {
  try {
    let idUbicacion = route.params.IdUbicacion
    if (Array.isArray(idUbicacion)) {
      idUbicacion = idUbicacion[0]
    }
    const ubicacionData = await ObtenerUbicacionPorId(idUbicacion)
    ubicacion.value = { ...ubicacionData }
  } catch (error) {
    console.error('Error al cargar los datos de la ubicacion:', error)
  }
})

const onSave = async () => {
  try {
    const agreed = await confirm({
      title: 'Confirmar Edición',
      message: `¿Deseas editar la ubicacion ${ubicacion.value.Ubicacion}?`,
      okText: 'Aceptar',
      cancelText: 'Cancelar',
      size: 'small',
      maxWidth: '380px',
    })

    if (!agreed) {
      notify({
        message: 'Edición cancelada',
        color: 'info',
        duration: 5000,
        position: 'top-right',
      })
      router.push({ name: 'ListarUbicaciones' })
      return
    }

    await EditarUbicacion(ubicacion.value)
    showSuccessAlert.value = true
    notify({
      message: `${ubicacion.value.Ubicacion} editada con éxito`,
      color: 'success',
      duration: 5000,
      position: 'top-right',
    })
    setTimeout(() => router.push('/ubicaciones'), 2000)
  } catch (error) {
    console.error('Error al guardar los cambios de la ubicacion:', error)
    notify({
      message: 'Error al guardar la ubicacion',
      color: 'error',
      duration: 5000,
      position: 'top-right',
    })
  }
}

const onClose = () => {
  router.push('/ubicaciones')
}

const saveButtonLabel = ref('Guardar')
</script>

<template>
  <h2 class="text-xl font-semibold mb-4">Agregar Proveedor</h2>
  <VaCard>
    <VaCardContent>
      <VaForm
        v-slot="{ isValid }"
        ref="add-user-form"
        class="flex-col justify-start items-start gap-4 inline-flex w-full"
      >
        <div class="self-stretch flex-col justify-start items-start gap-4 flex">
          <div class="flex gap-4 flex-col sm:flex-row w-full">
            <VaInput v-model="ubicacion.Ubicacion" label="Nombre Ubicación" class="w-full sm:w-1/2" name="Ubicacion" />
          </div>
          <div class="flex gap-2 flex-col-reverse items-stretch justify-end w-full sm:flex-row sm:items-center">
            <VaButton preset="secondary" color="secondary" @click="onClose">Cancelar</VaButton>
            <VaButton :disabled="!isValid" @click="onSave">{{ saveButtonLabel }}</VaButton>
          </div>
        </div>
      </VaForm>
    </VaCardContent>
  </VaCard>

  <VaNotification
    v-model="showSuccessAlert"
    title="Éxito"
    message="Ubicación guardada exitosamente"
    color="success"
    duration="5000"
    position="top-right"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useForm } from 'vuestic-ui'
import { Ubicaciones } from '../../ubicaciones/types'
import { useRouter } from 'vue-router'
import { AgregarUbicacion } from '../../../data/pages/ubicaciones'

const defaultNuevaUbicacion: Omit<Ubicaciones, 'IdUbicacion'> = {
  Ubicacion: '',
  //EstadoUbicacion: 'Activo',
}

const newUbicacion = ref<Omit<Ubicaciones, 'IdUbicacion'>>({ ...defaultNuevaUbicacion })
const form = useForm('add-user-form')
const router = useRouter()

const emit = defineEmits(['close', 'save'])

const showSuccessAlert = ref(false)

const onSave = async () => {
  if (form.validate()) {
    try {
      await AgregarUbicacion(newUbicacion.value)
      emit('save', newUbicacion.value)
      router.push('/ubicaciones')
      showSuccessAlert.value = true
      hideAlert()
    } catch (error) {
      console.error('Error al guardar la ubicacion:', error)
    }
  }
}

const hideAlert = () => {
  setTimeout(() => {
    showSuccessAlert.value = false
  }, 3000)
}

const onClose = () => {
  router.push('/ubicaciones')
}
</script>

<template>
  <h2 class="text-xl font-semibold mb-4">Agregar Ubicación</h2>
  <VaCard>
    <VaCardContent>
      <VaForm
        v-slot="{ isValid }"
        ref="add-user-form"
        class="flex-col justify-start items-start gap-4 inline-flex w-full"
      >
        <div class="self-stretch flex-col justify-start items-start gap-4 flex">
          <div class="flex gap-4 flex-col sm:flex-row w-full">
            <VaInput
              v-model="newUbicacion.Ubicacion"
              label="Nombre Ubicación"
              class="w-full sm:w-1/2"
              name="Ubicacion"
            />
          </div>
          <!-- Campo de Estado Estampado con valor predeterminado "Activo" -->
          <!-- <div class="flex gap-4 flex-col sm:flex-row w-full">
            <VaInput
              v-model="newUbicacion.EstadoUbicacion"
              label="Estado del Estampado"
              class="w-full sm:w-1/2"
              disabled
            />
          </div> -->
          <div class="flex gap-2 flex-col-reverse items-stretch justify-end w-full sm:flex-row sm:items-center">
            <VaButton preset="secondary" color="secondary" @click="onClose">Cancelar</VaButton>
            <VaButton :disabled="!isValid" @click="onSave">Guardar</VaButton>
          </div>
        </div>
      </VaForm>
    </VaCardContent>
  </VaCard>

  <div v-if="showSuccessAlert" class="alert alert-success" role="alert">¡Proveedor guardado exitosamente!</div>
</template>

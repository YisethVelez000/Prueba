<script setup lang="ts">
import { ref } from 'vue'
import { useForm } from 'vuestic-ui'
import { Colores } from '../types'
import { AgregarColor } from '../../../data/pages/colores'
import { useRouter } from 'vue-router'

const defaultNuevoColor: Omit<Colores, 'IdColor'> = {
  Color: '',
}
const onCancel = () => {
  router.push('/colores')
}

const newColor = ref<Omit<Colores, 'IdColor'>>({ ...defaultNuevoColor })
const form = useForm('add-user-form')
const router = useRouter()

const emit = defineEmits(['close', 'save'])

const showSuccessAlert = ref(false)

const onSave = async () => {
  if (form.validate()) {
    try {
      await AgregarColor(newColor.value)
      emit('save', newColor.value)
      router.push('/colores')
      showSuccessAlert.value = true
      hideAlert()
    } catch (error) {
      console.error('Error al guardar el proveedor:', error)
    }
  }
}

const hideAlert = () => {
  setTimeout(() => {
    showSuccessAlert.value = false
  }, 3000)
}
</script>

<template>
  <h2 class="text-xl font-semibold mb-4">Agregar</h2>
  <VaCard>
    <VaCardContent>
      <VaForm
        v-slot="{ isValid }"
        ref="add-user-form"
        class="flex-col justify-start items-start gap-4 inline-flex w-full"
      >
        <div class="self-stretch flex-col justify-start items-start gap-4 flex">
          <div class="flex gap-4 flex-col sm:flex-row w-full">
            <VaInput v-model="newColor.Color" label="Color" class="w-full sm:w-1/2" name="Color" />
          </div>
          <div class="flex gap-2 flex-col-reverse items-stretch justify-end w-full sm:flex-row sm:items-center">
            <VaButton preset="secondary" color="secondary" @click="onCancel">Cancelar</VaButton>
            <VaButton :disabled="!isValid" @click="onSave">Guardar</VaButton>
          </div>
        </div>
      </VaForm>
    </VaCardContent>
  </VaCard>

  <div v-if="showSuccessAlert" class="alert alert-success" role="alert">¡Proveedor guardado exitosamente!</div>
</template>

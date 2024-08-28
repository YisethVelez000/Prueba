<script setup lang="ts">
import { ref } from 'vue'
import { useForm } from 'vuestic-ui'
import { Parametrizacion } from '../types'
import { AgregarParametrizacion } from '../../../data/pages/parametrizacion'
import { useRouter } from 'vue-router'

const defaultNuevaParametrizacion: Omit<Parametrizacion, 'IdParametrizacion'> = {
  NombreDescuento: '',
  ValorDescuento: 0,
}

const newParametrizacion = ref<Omit<Parametrizacion, 'IdParametrizacion'>>({ ...defaultNuevaParametrizacion })
const form = useForm('add-user-form')
const router = useRouter()

const emit = defineEmits(['close', 'save'])

const showSuccessAlert = ref(false)

const onSave = async () => {
  if (form.validate()) {
    try {
      await AgregarParametrizacion(newParametrizacion.value)
      emit('save', newParametrizacion.value)
      router.push('/parametrizacion')
      showSuccessAlert.value = true
      hideAlert()
    } catch (error) {
      console.error('Error al guardar la parametrizacion:', error)
    }
  }
}

const onClose = () => {
  router.push('/parametrizacion')
}

const hideAlert = () => {
  setTimeout(() => {
    showSuccessAlert.value = false
  }, 3000)
}
</script>

<template>
  <h2 class="text-xl font-semibold mb-4">Agregar Parametrizacion</h2>
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
              v-model="newParametrizacion.NombreDescuento"
              label="Nombre del descuento"
              class="w-full sm:w-1/2"
              :rules="[
                (v) => !!v || 'El campo es obligatorio',
                (v) => /^[A-Za-zÁÉÍÓÚáéíóúüñ\s]+$/.test(v) || 'No se permiten números ni caracteres especiales',
              ]"
              name="NombreDescuento"
            />
            <VaInput
              v-model="newParametrizacion.ValorDescuento"
              label="Valor del descuento"
              class="w-full sm:w-1/2"
              type="number"
              :rules="[
                (v) => !!v || 'El campo es obligatorio',
                (v) => (!isNaN(Number(v)) && Number(v) >= 0) || 'No se permiten valores negativos',
              ]"
              name="ValorDescuento"
            />
          </div>
        </div>
        <div class="flex gap-2 flex-col-reverse items-stretch justify-end w-full sm:flex-row sm:items-center">
          <VaButton preset="secondary" color="secondary" @click="onClose">Cancelar</VaButton>
          <VaButton :disabled="!isValid" @click="onSave">Guardar</VaButton>
        </div>
      </VaForm>
    </VaCardContent>
  </VaCard>

  <div v-if="showSuccessAlert" class="alert alert-success" role="alert">¡Estampado guardado exitosamente!</div>
</template>

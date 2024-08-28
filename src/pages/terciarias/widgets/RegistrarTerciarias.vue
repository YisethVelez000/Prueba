<script setup lang="ts">
import { ref } from 'vue'
import { useForm } from 'vuestic-ui'
import { Terciaria } from '../types'
import { AgregarTerciaria } from '../../../data/pages/terciarias'
import { useRouter } from 'vue-router'

const defaultNuevaTeciaria: Omit<Terciaria, 'IdEmpresa'> = {
  NombreEmpresa: '',
  Apellido: '',
  NombreContacto: '',
  Telefono: '',
  CorreoElectronico: '',
}

const newTerciaria = ref<Omit<Terciaria, 'IdEmpresa'>>({ ...defaultNuevaTeciaria })
const form = useForm('add-user-form')
const router = useRouter()

const emit = defineEmits(['close', 'save'])

const showSuccessAlert = ref(false)
let alertTimer: ReturnType<typeof setTimeout> | null = null

const onSave = async () => {
  if (form.validate()) {
    try {
      await AgregarTerciaria(newTerciaria.value as Terciaria)
      console.log('Empresa Terciaria agregada exitosamente:', newTerciaria.value)
      emit('save', newTerciaria.value)
      router.push('/Terciarias')
      showSuccessAlert.value = true

      // Reiniciamos el temporizador para ocultar la alerta después de 3 segundos
      if (alertTimer) {
        clearTimeout(alertTimer)
      }
      alertTimer = setTimeout(() => {
        showSuccessAlert.value = false
        alertTimer = null
      }, 3000)
    } catch (error) {
      console.error('Error al guardar la empresa Terciaria:', error)
    }
  }
}
const onCancel = () => {
  router.push('/terciarias')
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
            <VaInput
              v-model="newTerciaria.NombreEmpresa"
              label="Nombre Empresa"
              class="w-full sm:w-1/2"
              maxlength="60"
              :rules="[
                (v: any) => !!v || 'El campo es obligatorio',
                (v: string) =>
                  /^[A-ZÁÉÍÓÚ][a-zA-ZáéíóúüñÁÉÍÓÚ\s]{0,60}$/.test(v) || 'El nombre debe empezar con mayúscula',
              ]"
              name="NombreEmpresa"
            />
            <VaInput
              v-model="newTerciaria.Telefono"
              label="Teléfono"
              class="w-full sm:w-1/2"
              type="text"
              maxlength="10"
              :rules="[
                (v: any) => !!v || 'El campo es obligatorio',
                (v: string) => /^\d{10}$/.test(v) || 'El teléfono debe tener 10 dígitos',
              ]"
              name="Telefono"
            />
          </div>
          <div class="flex gap-4 flex-col sm:flex-row w-full">
            <VaInput
              v-model="newTerciaria.NombreContacto"
              label="Nombre Contacto"
              class="w-full sm:w-1/2"
              maxlenth="60"
              :rules="[
                (v: any) => !!v || 'El campo es obligatorio',
                (v: string) =>
                  /^[A-ZÁÉÍÓÚ][a-zA-ZáéíóúüñÁÉÍÓÚ\s]{0,60}$/.test(v) || 'El nombre debe empezar con mayúscula',
              ]"
              name="NombreContacto"
            />
            <VaInput
              v-model="newTerciaria.Apellido"
              label="Apellidos Contacto"
              class="w-full sm:w-1/2"
              maxlength="60"
              :rules="[
                (v: any) => !!v || 'El campo es obligatorio',
                (v: string) =>
                  /^[A-ZÁÉÍÓÚ][a-zA-ZáéíóúüñÁÉÍÓÚ\s]{0,60}$/.test(v) || 'El apellido debe empezar con mayúscula',
              ]"
              name="Apellido"
            />
          </div>
          <div class="flex gap-4 flex-col sm:flex-row w-full">
            <VaInput
              v-model="newTerciaria.CorreoElectronico"
              label="Correo Electrónico"
              class="w-full sm:w-1/2"
              type="email"
              :rules="[
                (v: any) => !!v || 'El campo es obligatorio',
                (v: string) => /^\S+@\S+\.\S+$/.test(v) || 'Formato de correo inválido',
              ]"
              name="CorreoElectronico"
            />
          </div>
          <div class="flex gap-2 flex-col-reverse items-stretch justify-end w-full sm:flex-row sm:items-center">
            <VaButton preset="secondary" color="secondary" @click="onCancel">Cancelar</VaButton>
            <VaButton :disabled="!isValid" @click="onSave">Guardar</VaButton>
          </div>
        </div>
      </VaForm>
    </VaCardContent>
  </VaCard>

  <!-- Alerta de éxito -->
  <div v-if="showSuccessAlert" class="alert alert-success" role="alert">¡Empresa Terciaria guardada exitosamente!</div>
</template>

<style scoped>
/* Estilos personalizados si los necesitas */
</style>

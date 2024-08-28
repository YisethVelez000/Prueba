<script setup lang="ts">
import { ref } from 'vue'
import { useForm } from 'vuestic-ui'
import { Proveedor } from '../types'
import { AgregarProveedor } from '../../../data/pages/proveedores'
import { useRouter } from 'vue-router'

const defaultNuevoProveedor: Omit<Proveedor, 'IdProveedor'> = {
  NombreProveedor: '',
  Nit: '',
  NombreContacto: '',
  ApellidoContacto: '',
  TelefonoEmpresa: '',
  Direccion: '',
  CorreoElectronico: '',
  EstadoProveedor: 'Activo',
}
const onCancel = () => {
  router.push('/proveedores')
}

const newProveedor = ref<Omit<Proveedor, 'IdProveedor'>>({ ...defaultNuevoProveedor })
const form = useForm('add-user-form')
const router = useRouter()

const emit = defineEmits(['close', 'save'])

const showSuccessAlert = ref(false)

const onSave = async () => {
  if (form.validate()) {
    try {
      await AgregarProveedor(newProveedor.value)
      emit('save', newProveedor.value)
      router.push('/proveedores')
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
            <VaInput
              v-model="newProveedor.NombreProveedor"
              label="Nombre Proveedor"
              class="w-full sm:w-1/2"
              maxlength="60"
              :rules="[
                (v: any) => !!v || 'El campo es obligatorio',
                (v: string) =>
                  /^[A-ZÁÉÍÓÚ][a-zA-ZáéíóúüñÁÉÍÓÚ\s]{0,60}$/.test(v) || 'El nombre debe empezar con mayúscula',
              ]"
              name="NombreProveedor"
            />
            <VaInput
              v-model="newProveedor.Nit"
              label="Nit o Documento de identidad"
              class="w-full sm:w-1/2"
              maxlength="10"
              :rules="[
                (v: any) => !!v || 'El campo es obligatorio',
                (v: string) => /^\d{10}$/.test(v) || 'El Nit o Documento  debe tener 10 dígitos',
              ]"
              name="Nit"
            />
          </div>
          <div class="flex gap-4 flex-col sm:flex-row w-full">
            <VaInput
              v-model="newProveedor.NombreContacto"
              label="Nombre Contacto"
              class="w-full sm:w-1/2"
              type="text"
              :rules="[
                (v: any) => !!v || 'El campo es obligatorio',
                (v: string) =>
                  /^[A-ZÁÉÍÓÚ][a-zA-ZáéíóúüñÁÉÍÓÚ\s]{0,60}$/.test(v) ||
                  'El Nombre del Contacto debe empezar con mayúscula',
              ]"
              name="NombreContacto"
            />
            <VaInput
              v-model="newProveedor.ApellidoContacto"
              label="Apellido Contacto"
              class="w-full sm:w-1/2"
              type="text"
              :rules="[
                (v: any) => !!v || 'El campo es obligatorio',
                (v: string) =>
                  /^[A-ZÁÉÍÓÚ][a-zA-ZáéíóúüñÁÉÍÓÚ\s]{0,60}$/.test(v) || 'El Apellido debe empezar con mayúscula',
              ]"
              name="ApellidoContacto"
            />
          </div>
          <div class="flex gap-4 flex-col sm:flex-row w-full">
            <VaInput
              v-model="newProveedor.Direccion"
              label="Dirección"
              class="w-full sm:w-1/2"
              type="text"
              :rules="[(v: any) => !!v || 'El campo es obligatorio']"
              name="Direccion"
            />
            <VaInput
              v-model="newProveedor.TelefonoEmpresa"
              label="Número Contacto"
              class="w-full sm:w-1/2"
              type="text"
              :rules="[
                (v: any) => !!v || 'El campo es obligatorio',
                (v: string) => /^[0-9]{7,10}$/.test(v) || 'El teléfono debe tener entre 7 y 10 dígitos',
              ]"
              name="NumeroContacto"
            />
          </div>
          <div class="flex gap-4 flex-col sm:flex-row w-full">
            <VaInput
              v-model="newProveedor.CorreoElectronico"
              label="Correo Electrónico"
              class="w-full sm:w-1/2"
              type="text"
              :rules="[
                (v: any) => !!v || 'El campo es obligatorio',
                (v: string) => /.+@.+\..+/.test(v) || 'El correo electrónico no es válido',
              ]"
              name="CorreoElectronico"
            />
          </div>
          <div class="flex gap-4 w-full">
            <div class="flex items-center w-1/2 mt-4">
              <VaSelect
                v-model="newProveedor.EstadoProveedor"
                label="Estado"
                class="w-full sm:w-1/2"
                hidden
                :options="['Activo', 'Inactivo']"
                :rules="[(v: any) => !!v || 'El campo es obligatorio']"
                name="EstadoProveedor"
              />
            </div>
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

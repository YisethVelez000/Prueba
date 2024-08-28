<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Proveedor } from '../types'
import { ObtenerProveedorPorId, EditarProveedor } from '../../../data/pages/proveedores'
import { useRouter, useRoute } from 'vue-router'
import { useToast, useModal } from 'vuestic-ui'

const { init: notify } = useToast()
const { confirm } = useModal()

const proveedor = ref<Proveedor>({
  IdProveedor: -1,
  NombreProveedor: '',
  Direccion: '',
  Nit: '',
  TelefonoEmpresa: '',
  NombreContacto: '',
  CorreoElectronico: '',
  ApellidoContacto: '',
  EstadoProveedor: '',
})

const showSuccessAlert = ref(false)
const router = useRouter()
const route = useRoute()

onMounted(async () => {
  try {
    let idProveedor = route.params.IdProveedor
    if (Array.isArray(idProveedor)) {
      idProveedor = idProveedor[0]
    }
    const proveedorData = await ObtenerProveedorPorId(idProveedor)
    proveedor.value = { ...proveedorData }
  } catch (error) {
    console.error('Error al cargar los datos del proveedor:', error)
  }
})

const onSave = async () => {
  try {
    const agreed = await confirm({
      title: 'Confirmar Edición',
      message: `¿Deseas editar el proveedor ${proveedor.value.NombreProveedor}?`,
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
      router.push({ name: 'ListarProveedores' })
      return
    }

    await EditarProveedor(proveedor.value)
    showSuccessAlert.value = true
    notify({
      message: `${proveedor.value.NombreProveedor} editado con éxito`,
      color: 'success',
      duration: 5000,
      position: 'top-right',
    })
    setTimeout(() => router.push('/proveedores'), 2000)
  } catch (error) {
    console.error('Error al guardar los cambios del proveedor:', error)
    notify({
      message: 'Error al guardar el proveedor',
      color: 'error',
      duration: 5000,
      position: 'top-right',
    })
  }
}

const onClose = () => {
  router.push('/proveedores')
}

const saveButtonLabel = ref('Guardar')
</script>

<template>
  <h2 class="text-xl font-semibold mb-4">Editar Proveedor</h2>
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
              v-model="proveedor.NombreProveedor"
              label="Nombre Proveedor"
              class="w-full sm:w-1/2"
              :rules="[
                (v: any) => !!v || 'El campo es obligatorio',
                (v: string) =>
                  /^[A-ZÁÉÍÓÚ][a-zA-ZáéíóúüñÁÉÍÓÚ\s]{0,60}$/.test(v) || 'El nombre debe empezar con mayúscula',
              ]"
              name="NombreProveedor"
            />

            <VaInput
              v-model="proveedor.Nit"
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
              v-model="proveedor.NombreContacto"
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
              v-model="proveedor.ApellidoContacto"
              label="Apellido Contacto"
              class="w-full sm:w-1/2"
              type="text"
              :rules="[(v: any) => !!v || 'El campo es obligatorio']"
              name="ApellidoContacto"
            />
          </div>
          <div class="flex gap-4 flex-col sm:flex-row w-full">
            <VaInput
              v-model="proveedor.Direccion"
              label="Dirección"
              class="w-full sm:w-1/2"
              type="text"
              :rules="[(v: any) => !!v || 'El campo es obligatorio']"
              name="Direccion"
            />

            <VaInput
              v-model="proveedor.TelefonoEmpresa"
              label="Número Contacto"
              class="w-full sm:w-1/2"
              type="text"
              :rules="[(v: any) => !!v || 'El campo es obligatorio']"
              name="NumeroContacto"
            />
          </div>
          <div class="flex gap-4 flex-col sm:flex-row w-full">
            <VaInput
              v-model="proveedor.CorreoElectronico"
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
    message="Proveedor guardado exitosamente"
    color="success"
    duration="5000"
    position="top-right"
  />
</template>

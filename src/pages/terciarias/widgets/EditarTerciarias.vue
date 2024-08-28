<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Terciaria } from '../types' // Asegúrate de importar el tipo correcto
import { ObtenerTerciariaPorId, EditarTerciaria } from '../../../data/pages/terciarias' // Ajusta la importación según la ubicación de tu lógica
import { useRouter, useRoute } from 'vue-router'
import { useToast, useModal } from 'vuestic-ui'

const { init: notify } = useToast()
const { confirm } = useModal()

const terciaria = ref<Terciaria>({
  IdEmpresa: -1,
  NombreEmpresa: '',
  Telefono: '',
  NombreContacto: '',
  CorreoElectronico: '',
  Apellido: '',
})

const router = useRouter()
const route = useRoute()

onMounted(async () => {
  try {
    let idEmpresa = route.params.IdEmpresa
    if (Array.isArray(idEmpresa)) {
      idEmpresa = idEmpresa[0]
    }
    const terciariaData = await ObtenerTerciariaPorId(idEmpresa)
    terciaria.value = { ...terciariaData }
  } catch (error) {
    console.error('Error al cargar los datos de la empresa terciaria:', error)
  }
})

const onSave = async () => {
  try {
    const agreed = await confirm({
      title: 'Confirmar Edición',
      message: `¿Deseas editar la empresa terciaria ${terciaria.value.NombreEmpresa}?`,
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
      router.push({ name: 'ListarTerciarias' }) // Ajusta el nombre de la ruta según tu configuración
      return
    }

    await EditarTerciaria(terciaria.value)

    setTimeout(() => router.push('/terciarias'), 2000) // Ajusta la ruta de redirección según tu configuración
  } catch (error) {
    console.error('Error al guardar los cambios de la empresa terciaria:', error)
    notify({
      message: 'Error al guardar la empresa terciaria',
      color: 'error',
      duration: 5000,
      position: 'top-right',
    })
  }
}

const onClose = () => {
  router.push('/terciarias') // Ajusta la ruta de redirección según tu configuración
}

const saveButtonLabel = ref('Guardar')
</script>
<template>
  <h2 class="text-xl font-semibold mb-4">Editar</h2>
  <VaCard>
    <VaCardContent>
      <VaForm
        v-slot="{ isValid }"
        ref="edit-terciaria-form"
        class="flex-col justify-start items-start gap-4 inline-flex w-full"
      >
        <div class="self-stretch flex-col justify-start items-start gap-4 flex">
          <div class="flex gap-4 flex-col sm:flex-row w-full">
            <VaInput
              v-model="terciaria.NombreEmpresa"
              label="Nombre Empresa"
              class="w-full sm:w-1/2"
              :rules="[
                (v: any) => !!v || 'El campo es obligatorio',
                (v: string) =>
                  /^[A-ZÁÉÍÓÚ][a-zA-ZáéíóúüñÁÉÍÓÚ\s]{0,60}$/.test(v) || 'El nombre debe empezar con mayúscula',
              ]"
              name="NombreEmpresa"
            />
            <VaInput
              v-model="terciaria.Telefono"
              label="Teléfono"
              class="w-full sm:w-1/2"
              type="text"
              :rules="[
                (v: any) => !!v || 'El campo es obligatorio',
                (v: string) => /^\d{10}$/.test(v) || 'El teléfono debe tener 10 dígitos',
              ]"
              name="Telefono"
            />
          </div>
          <div class="flex gap-4 flex-col sm:flex-row w-full">
            <VaInput
              v-model="terciaria.NombreContacto"
              label="Nombre Contacto"
              class="w-full sm:w-1/2"
              type="text"
              maxlenth="60"
              :rules="[
                (v: any) => !!v || 'El campo es obligatorio',
                (v: string) =>
                  /^[A-ZÁÉÍÓÚ][a-zA-ZáéíóúüñÁÉÍÓÚ\s]{0,60}$/.test(v) || 'El nombre debe empezar con mayúscula',
              ]"
              name="NombreContacto"
            />
            <VaInput
              v-model="terciaria.Apellido"
              label="Apellido"
              class="w-full sm:w-1/2"
              type="text"
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
              v-model="terciaria.CorreoElectronico"
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
          <div class="flex gap-4 w-full"></div>
          <div class="flex gap-2 flex-col-reverse items-stretch justify-end w-full sm:flex-row sm:items-center">
            <VaButton preset="secondary" color="secondary" @click="onClose">Cancelar</VaButton>
            <VaButton :disabled="!isValid" @click="onSave">{{ saveButtonLabel }}</VaButton>
          </div>
        </div>
      </VaForm>
    </VaCardContent>
  </VaCard>
</template>

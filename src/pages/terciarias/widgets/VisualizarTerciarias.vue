<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Terciaria } from '../types' // Asegúrate de importar el tipo correcto
import { ObtenerTerciariaPorId } from '../../../data/pages/terciarias' // Ajusta la importación según la ubicación de tu lógica
import { useRouter, useRoute } from 'vue-router'

const terciaria = ref<Terciaria>({
  IdEmpresa: -1,
  NombreEmpresa: '',
  Telefono: '',
  NombreContacto: '',
  CorreoElectronico: '',
  Apellido: '',
})

const showSuccessAlert = ref(false)
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

const onClose = () => {
  router.push('/terciarias') // Ajusta la ruta de redirección según tu configuración
}
</script>
<template>
  <h2 class="text-xl font-semibold mb-4">Visualizar</h2>
  <VaCard>
    <VaCardContent>
      <VaForm ref="edit-terciaria-form" class="flex-col justify-start items-start gap-4 inline-flex w-full">
        <div class="self-stretch flex-col justify-start items-start gap-4 flex">
          <div class="flex gap-4 flex-col sm:flex-row w-full">
            <VaInput
              v-model="terciaria.NombreEmpresa"
              label="Nombre Empresa"
              class="w-full sm:w-1/2"
              name="NombreEmpresa"
              readonly
            />
            <VaInput
              v-model="terciaria.Telefono"
              label="Teléfono"
              class="w-full sm:w-1/2"
              type="text"
              :rules="[(v: any) => !!v || 'El campo es obligatorio']"
              name="Telefono"
              readonly
            />
          </div>
          <div class="flex gap-4 flex-col sm:flex-row w-full">
            <VaInput
              v-model="terciaria.NombreContacto"
              label="Nombre Contacto"
              class="w-full sm:w-1/2"
              type="text"
              :rules="[(v: any) => !!v || 'El campo es obligatorio']"
              name="NombreContacto"
              readonly
            />

            <VaInput
              v-model="terciaria.Apellido"
              label="Apellido"
              class="w-full sm:w-1/2"
              type="text"
              :rules="[(v: any) => !!v || 'El campo es obligatorio']"
              name="Apellido"
              readonly
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
              readonly
            />
          </div>
          <div class="flex gap-4 w-full"></div>
          <div class="flex gap-2 flex-col-reverse items-stretch justify-end w-full sm:flex-row sm:items-center">
            <VaButton preset="secondary" color="secondary" @click="onClose">Cancelar</VaButton>
          </div>
        </div>
      </VaForm>
    </VaCardContent>
  </VaCard>

  <VaNotification
    v-model="showSuccessAlert"
    title="Éxito"
    message="Empresa Terciaria editada exitosamente"
    color="success"
    duration="5000"
    position="top-right"
  />
</template>

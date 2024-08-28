<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Proveedor } from '../types'
import { ObtenerProveedorPorId } from '../../../data/pages/proveedores'
import { useRouter, useRoute } from 'vue-router'

// Variables reactivas
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

// Vue Router
const router = useRouter()
const route = useRoute()

// Obtener y mostrar datos del proveedor al cargar la vista
onMounted(async () => {
  try {
    // Obtener el ID del proveedor de los parámetros de la ruta
    let idProveedor = route.params.IdProveedor
    // Verificar si es una matriz y obtener el primer elemento
    if (Array.isArray(idProveedor)) {
      idProveedor = idProveedor[0]
    }
    // Obtener los datos del proveedor por su ID
    const proveedorData = await ObtenerProveedorPorId(idProveedor)
    // Actualizar los datos del proveedor en el formulario
    proveedor.value = { ...proveedorData }
  } catch (error) {
    console.error('Error al cargar los datos del proveedor:', error)
    // Manejar el error de carga de datos del proveedor, por ejemplo, redirigir a una página de error
  }
})

// Función para cerrar la vista de detalle y volver a la lista de proveedores
const onClose = () => {
  router.push('/proveedores')
}
</script>

<template>
  <h2 class="text-xl font-semibold mb-4">Visualizar Proveedor</h2>
  <VaCard>
    <VaCardContent>
      <VaForm ref="view-user-form" class="flex-col justify-start items-start gap-4 inline-flex w-full">
        <div class="self-stretch flex-col justify-start items-start gap-4 flex">
          <!-- Campos de datos del proveedor -->
          <div class="flex gap-4 flex-col sm:flex-row w-full">
            <VaInput v-model="proveedor.NombreProveedor" label="Nombre Proveedor" class="w-full sm:w-1/2" readonly />
            <VaInput v-model="proveedor.Direccion" label="Dirección" class="w-full sm:w-1/2" readonly />
          </div>
          <!-- Otros campos del proveedor -->
          <div class="flex gap-4 flex-col sm:flex-row w-full">
            <VaInput v-model="proveedor.Nit" label="Nit" class="w-full sm:w-1/2" readonly />
            <VaInput v-model="proveedor.TelefonoEmpresa" label="Número Contacto" class="w-full sm:w-1/2" readonly />
          </div>
          <!-- Otros campos del proveedor -->
          <div class="flex gap-4 flex-col sm:flex-row w-full">
            <VaInput v-model="proveedor.NombreContacto" label="Nombre Contacto" class="w-full sm:w-1/2" readonly />
            <VaInput
              v-model="proveedor.CorreoElectronico"
              label="Correo Electrónico"
              class="w-full sm:w-1/2"
              readonly
            />
          </div>
          <!-- Otros campos del proveedor -->
          <div class="flex gap-4 flex-col sm:flex-row w-full">
            <VaInput v-model="proveedor.ApellidoContacto" label="Apellido Contacto" class="w-full sm:w-1/2" readonly />
          </div>
          <!-- Otros campos del proveedor -->
          <div class="flex gap-4 w-full">
            <div class="flex items-center w-1/2 mt-4">
              <VaSelect
                v-model="proveedor.EstadoProveedor"
                label="Estado"
                class="w-full sm:w-1/2"
                :options="['Activo', 'Inactivo']"
                readonly
              />
            </div>
          </div>
          <!-- Botón de cierre -->
          <div class="flex gap-2 flex-col-reverse items-stretch justify-end w-full sm:flex-row sm:items-center">
            <VaButton preset="secondary" color="secondary" @click="onClose">Cerrar</VaButton>
          </div>
        </div>
      </VaForm>
    </VaCardContent>
  </VaCard>

  <!-- Alerta de éxito -->
  <div v-if="showSuccessAlert" class="alert alert-success" role="alert">¡Proveedor guardado exitosamente!</div>
</template>

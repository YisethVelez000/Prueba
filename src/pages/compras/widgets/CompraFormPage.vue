<template>
  <div>
    <h1>Nueva Compra</h1>
    <VaCard>
      <VaCardContent>
        <VaForm v-slot="{ isValid }" ref="form">
          <!-- Campos de la compra -->
          <div class="flex gap-4 flex-col sm:flex-row w-full">
            <VaInput
              v-model="compra.FechaCompra"
              label="Fecha de la compra"
              class="w-full sm:w-1/2"
              :rules="[validators.required]"
              name="FechaCompra"
              type="date"
            />
            <VaInput
              v-model="compra.Recibo"
              label="Recibo"
              class="w-full sm:w-1/2"
              :rules="[validators.required, validators.noSpaces]"
              name="Recibo"
            />
          </div>
          <!-- Campo para la imagen del recibo -->
          <div class="flex gap-4 flex-col sm:flex-row w-full">
            <label for="ImagenRecibo">Imagen del recibo</label>
            <input id="ImagenRecibo" type="file" @change="onFileChange" />
          </div>

          <!-- Selección de proveedores -->
          <VaInput v-model="searchQueryProveedores" label="Buscar Proveedores" class="w-full" />

          <!-- Resultados de búsqueda de proveedores -->
          <div
            v-if="searchQueryProveedores"
            class="proveedores-container flex flex-col gap-2 max-h-96 overflow-y-auto border p-2 mt-2"
          >
            <template v-for="proveedor in filteredProveedores" :key="proveedor.IdProveedor">
              <div>
                <input v-model="proveedorSeleccionado" type="radio" :value="proveedor" />
                <label>{{ proveedor.NombreProveedor }}</label>
              </div>
            </template>
          </div>
          <div v-if="!proveedorSeleccionado" class="text-red-500">Debe elegir al menos un proveedor</div>

          <!-- Selección de insumos -->
          <VaInput v-model="searchQueryInsumos" label="Buscar Insumos" class="w-full mt-4" />

          <!-- Resultados de búsqueda de insumos -->
          <div
            v-if="searchQueryInsumos"
            class="insumos-container flex flex-col gap-2 max-h-96 overflow-y-auto border p-2 mt-2"
          >
            <template v-for="insumo in filteredInsumos" :key="insumo.IdInsumo">
              <div>
                <VaCheckbox v-model="insumo.seleccionado" :label="insumo.NombreInsumo" @click="toggleInsumo(insumo)" />
              </div>
            </template>
          </div>
          <div v-if="insumosSeleccionados.length === 0" class="text-red-500">Debe elegir al menos un insumo</div>

          <!-- Tabla de insumos seleccionados -->
          <div v-if="insumosSeleccionados.length > 0" class="mt-4">
            <h2>Insumos Seleccionados</h2>
            <table class="table-auto w-full">
              <thead>
                <tr>
                  <th class="px-4 py-2">Nombre Insumo</th>
                  <th class="px-4 py-2">Cantidad Compra</th>
                  <th class="px-4 py-2">Precio Unitario</th>
                  <th class="px-4 py-2">Precio Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="insumo in insumosSeleccionados" :key="insumo.IdInsumo">
                  <td class="px-4 py-2">{{ insumo.NombreInsumo }}</td>
                  <td class="px-4 py-2">
                    <VaInput v-model="insumo.CantidadCompra" type="number" min="0.01" />
                  </td>
                  <td class="px-4 py-2">
                    <VaInput v-model="insumo.PrecioUnitario" type="number" min="0.01" step="0.01" />
                  </td>
                  <td class="px-4 py-2">{{ calcularPrecioTotal(insumo) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mostrar el PrecioTotalCompra -->
          <div v-if="insumosSeleccionados.length > 0" class="flex gap-4 flex-col sm:flex-row w-full mt-4">
            <span><strong>Precio Total de la Compra: </strong>{{ precioTotalCompra }}</span>
          </div>

          <div class="flex gap-2 flex-col-reverse items-stretch justify-end w-full sm:flex-row sm:items-center mt-4">
            <VaButton preset="secondary" color="secondary" @click="cancelar">Cancelar</VaButton>
            <VaButton
              :disabled="!isValid"
              class="va-button-save"
              style="color: white; background-color: green"
              @click="guardarCompra"
              >Guardar</VaButton
            >
          </div>
          <!-- Mostrar la alerta de éxito aquí -->
        </VaForm>
      </VaCardContent>
    </VaCard>
  </div>
  <div v-if="showSuccessAlert" class="alert alert-success" role="alert">¡Compra guardada exitosamente!</div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { VaButton, VaCard, VaCardContent, VaForm, VaInput, VaCheckbox } from 'vuestic-ui'
import { useRouter } from 'vue-router'
import { validators } from '../../../services/utils'
import { Compra, Proveedor, Insumo, InsumoCompra } from '../types'
import axios from 'axios'
import { useToast } from 'vuestic-ui/web-components'

const router = useRouter()
const { init: notify } = useToast()

const defaultNewCompra: Compra = {
  FechaCompra: new Date(), // Inicializar con la fecha actual
  Recibo: '',
  ImagenRecibo: '',
  IdProveedor: 1,
  PrecioTotalCompra: 0,
  Insumos: [],
}

const compra = ref<Compra>({ ...defaultNewCompra })
const proveedores = ref<Proveedor[]>([])
const searchQueryProveedores = ref('')
const proveedorSeleccionado = ref<Proveedor | null>(null)
const showSuccessAlert = ref(false)
const insumos = ref<Insumo[]>([])
const insumosSeleccionados = ref<InsumoCompra[]>([])
const searchQueryInsumos = ref('')
const selectedFile = ref<File | null>(null)

const cancelar = () => {
  router.push('/compras')
}

const obtenerProveedores = async () => {
  try {
    const response = await axios.get('https://apinodedvp.onrender.com/proveedor')
    proveedores.value = response.data.map((proveedor: any) => ({
      IdProveedor: proveedor.IdProveedor,
      NombreProveedor: proveedor.NombreProveedor || 'Proveedor desconocido',
      Nit: proveedor.Nit,
      NombreContacto: proveedor.NombreContacto,
      ApellidoContacto: proveedor.ApellidoContacto,
      TelefonoEmpresa: proveedor.TelefonoEmpresa,
      Direccion: proveedor.Direccion,
      CorreoElectronico: proveedor.CorreoElectronico,
      EstadoProveedor: proveedor.EstadoProveedor,
      seleccionado: false,
    }))
    console.log('Proveedores obtenidos:', proveedores.value)
  } catch (error) {
    console.error('Error al obtener los proveedores:', error)
  }
}

const obtenerInsumos = async () => {
  try {
    const response = await axios.get('https://apinodedvp.onrender.com/insumos')
    insumos.value = response.data.map((insumo: any) => ({
      IdInsumo: insumo.IdInsumo,
      NombreInsumo: insumo.NombreInsumo,
      seleccionado: false,
      CantidadInsumo: insumo.CantidadInsumo,
      PrecioUnitario: insumo.PrecioUnitario,
      EstadoInsumo: insumo.EstadoInsumo,
      Agotado: insumo.Agotado,
      IdMedida: insumo.IdMedida,
      medidas_has_insumo: insumo.medidas_has_insumo,
      UnidadMedida: insumo.UnidadMedida,
    }))
    console.log('Insumos obtenidos:', insumos.value)
  } catch (error) {
    console.error('Error al obtener los insumos:', error)
  }
}

const toggleInsumo = (insumo: Insumo) => {
  if (insumo.seleccionado) {
    insumosSeleccionados.value.push({
      IdInsumoCompra: 0,
      IdInsumo: insumo.IdInsumo,
      IdCompra: 0,
      CantidadCompra: 0,
      PrecioUnitario: 0,
      PrecioTotal: 0,
      NombreInsumo: insumo.NombreInsumo,
    })
  } else {
    const index = insumosSeleccionados.value.findIndex((i) => i.IdInsumo === insumo.IdInsumo)
    if (index !== -1) {
      insumosSeleccionados.value.splice(index, 1)
    }
  }
}

const calcularPrecioTotal = (insumo: InsumoCompra) => {
  return insumo.CantidadCompra * insumo.PrecioUnitario
}

const precioTotalCompra = computed(() => {
  return insumosSeleccionados.value.reduce((total, insumo) => {
    return total + insumo.CantidadCompra * insumo.PrecioUnitario
  }, 0)
})

const filteredProveedores = ref<Proveedor[]>([])
const filteredInsumos = ref<Insumo[]>([])

onMounted(() => {
  obtenerProveedores()
  obtenerInsumos()
})

const form = ref()

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0]
  }
}

const guardarCompra = async () => {
  if (form.value.validate()) {
    try {
      const idProveedor = proveedorSeleccionado.value ? proveedorSeleccionado.value.IdProveedor : -1
      const insumosParaCompra = insumosSeleccionados.value.map((insumo) => ({
        IdInsumoCompra: insumo.IdInsumoCompra,
        IdInsumo: insumo.IdInsumo,
        IdCompra: 0,
        CantidadCompra: insumo.CantidadCompra,
        PrecioUnitario: insumo.PrecioUnitario,
        PrecioTotal: insumo.CantidadCompra * insumo.PrecioUnitario,
      }))

      const formData = new FormData()
      formData.append('FechaCompra', compra.value.FechaCompra.toString())
      formData.append('Recibo', compra.value.Recibo)
      formData.append('ImagenRecibo', selectedFile.value as File)
      formData.append('IdProveedor', idProveedor.toString())
      formData.append('PrecioTotalCompra', precioTotalCompra.value.toString())
      formData.append('Insumos', JSON.stringify(insumosParaCompra))

      const response = await axios.post('https://apinodedvp.onrender.com/compras', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      console.log('Respuesta del servidor:', response.data)

      if (response.status === 201) {
        // Verifica el código de estado 201 para éxito de creación
        showSuccessAlert.value = true
        notify({
          message: response.data.mensaje || 'Compra creada con éxito',
          color: 'success',
          duration: 7000,
          position: 'top-right',
        })

        console.log('Redirigiendo a /compras...')
        router.push('/compras') // Redirige solo en caso de éxito de creación
      } else {
        console.error('Error en la respuesta del servidor:', response.status, response.statusText)
        console.error('Detalles del error:', response.data || 'No se recibieron datos en la respuesta')
      }
    } catch (error: any) {
      console.error('Error en la solicitud:', error)
      console.error('Detalles del error:', error.response ? error.response.data : error.message)
    }
  }
}

watch(searchQueryProveedores, (newValue) => {
  if (newValue) {
    filteredProveedores.value = proveedores.value.filter((proveedor) =>
      proveedor.NombreProveedor.toLowerCase().includes(newValue.toLowerCase()),
    )
  } else {
    filteredProveedores.value = []
  }
})

watch(searchQueryInsumos, (newValue) => {
  if (newValue) {
    filteredInsumos.value = insumos.value.filter((insumo) =>
      insumo.NombreInsumo?.toLowerCase().includes(newValue.toLowerCase()),
    )
  } else {
    filteredInsumos.value = []
  }
})
</script>

<style scoped>
.proveedores-container,
.insumos-container {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #ccc;
  padding: 8px;
  border-radius: 4px;
}
.table-auto {
  width: 100%;
  border-collapse: collapse;
}
.table-auto th,
.table-auto td {
  border: 1px solid #ddd;
  padding: 8px;
}
.table-auto th {
  background-color: #f2f2f2;
  text-align: left;
}
</style>

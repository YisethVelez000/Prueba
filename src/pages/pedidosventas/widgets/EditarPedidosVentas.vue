<!-- eslint-disable prettier/prettier -->
<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import type { PedidosVentas, Cliente, Usuario } from '../types'
import {
  ObtenerPedidosVentasPorId,
  EditarPedidosVentas,
  ObtenerClientePorId,
  ObtenerUsuarioPorId,
} from '../../../data/pages/pedidosventas'
import { useRouter, useRoute } from 'vue-router'
import { useToast, useModal } from 'vuestic-ui'

const { init: notify } = useToast()
const { confirm } = useModal()

const pedido = ref<PedidosVentas>({
  NumeroPedido: -1,
  TotalPedido: 0,
  EstadoPedido: '',
  DireccionEnvio: '',
  FechaPedido: '',
  FechaEntrega: '',
  FormaPago: '',
  ComprobantePago: '',
  MotivoRechazo: '',
  FechaYhoraEstimada: '',
  EstadoVenta: '',
  IdCliente: 0,
})

const cliente = ref<Cliente | null>(null)
const usuario = ref<Usuario | null>(null)

watch(
  () => pedido.value.EstadoPedido,
  (newEstado) => {
    if (newEstado === 'Rechazado') {
      pedido.value.MotivoRechazo = '' // Deja el campo vacío para ser diligenciado
    } else {
      pedido.value.MotivoRechazo = 'N/A' // Asigna automáticamente "N/A"
    }
  },
)

const showSuccessAlert = ref(false)
const router = useRouter()
const route = useRoute()

onMounted(async () => {
  try {
    let numeroPedido = route.params.NumeroPedido
    if (Array.isArray(numeroPedido)) {
      numeroPedido = numeroPedido[0]
    }
    if (numeroPedido) {
      // Obtener los datos del pedido por su ID
      const pedidoData = await ObtenerPedidosVentasPorId(numeroPedido)
      // Actualizar los datos del pedido en el formulario
      pedido.value = { ...pedidoData }

      // Obtener los datos del cliente por su ID
      if (pedidoData.IdCliente) {
        const clienteData = await ObtenerClientePorId(pedidoData.IdCliente)
        cliente.value = clienteData

        // Obtener los datos del usuario por su ID
        if (clienteData.IdUsuarioCliente) {
          const usuarioData = await ObtenerUsuarioPorId(clienteData.IdUsuarioCliente)
          usuario.value = usuarioData
        }
      }
    }
  } catch (error) {
    console.error('Error al cargar los datos del pedido:', error)
  }
})

const onSave = async () => {
  try {
    if (!pedido.value.NumeroPedido || pedido.value.NumeroPedido === -1) {
      throw new Error('Pedido inválido o NumeroPedido faltante')
    }

    const agreed = await confirm({
      title: 'Confirmar Edición',
      message: `¿Deseas editar el pedido ${pedido.value.NumeroPedido}?`,
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
      router.push({ name: 'ListarPedidosVentas' })
      return
    }

    // Validar MotivoRechazo si el EstadoPedido es "Rechazado"
    // if (pedido.value.EstadoPedido === 'Rechazado' && !pedido.value.MotivoRechazo.trim()) {
    //   notify({
    //     message: 'El motivo de rechazo es obligatorio cuando el estado es "Rechazado".',
    //     color: 'error',
    //     duration: 5000,
    //     position: 'top-right',
    //   });
    //   return;
    // } else {
    //   // Si el EstadoPedido no es "Rechazado", establecer MotivoRechazo a "N/A"
    //   pedido.value.MotivoRechazo = 'N/A';
    // }

    await EditarPedidosVentas(pedido.value)
    showSuccessAlert.value = true
    notify({
      message: `${pedido.value.NumeroPedido} editado con éxito`,
      color: 'success',
      duration: 5000,
      position: 'top-right',
    })
    setTimeout(() => router.push('/pedidosventas'), 2000)
  } catch (error) {
    console.error('Error al guardar los cambios del pedido:', error)
    notify({
      message: 'Error al guardar el pedido',
      color: 'error',
      duration: 5000,
      position: 'top-right',
    })
  }
}

const onClose = () => {
  router.push('/pedidosventas')
}

const saveButtonLabel = ref('Guardar')

//Cargar imagen convertirl la URL
// const onFileChange = async (event: Event) => {
//   const target = event.target as HTMLInputElement;
//   const file = target.files?.[0];
//   if (file) {
//     try {
//       const formData = new FormData();
//       formData.append('file', file);

//       // Reemplaza esta URL con la URL de tu endpoint de subida de imágenes
//       const uploadUrl = 'https://apinodedvp.onrender.com/uploadComprobantes';

//       const response = await fetch(uploadUrl, {
//         method: 'POST',
//         body: formData,
//       });

//       if (response.ok) {
//         const data = await response.json();
//         pedido.value.ComprobantePago = data.url; // Asigna la URL de la imagen a ComprobantePago
//       } else {
//         console.error('Error subiendo la imagen');
//       }
//     } catch (error) {
//       console.error('Error en la subida de la imagen:', error);
//     }
//   }
// }

const modalVisible = ref(false) // Estado para controlar la visibilidad de la modal

const openMotivoRechazoModal = () => {
  // pedido.value.MotivoRechazo = '' // Limpiar el motivo de rechazo antes de abrir la modal
  modalVisible.value = true
}

const saveMotivoRechazo = () => {
  // Aquí podrías guardar el motivo de rechazo si es necesario antes de cerrar la modal
  console.log('Motivo de Rechazo guardado:', pedido.value.MotivoRechazo)
  modalVisible.value = false
}

const closeModal = () => {
  modalVisible.value = false
}

// Validación personalizada
// const isValidMotivoRechazo = computed(() => {
//   if (pedido.value.EstadoPedido === 'Rechazado' && !pedido.value.MotivoRechazo.trim()) {
//     return false;
//   }
//   return true;
// });

//validaciones

const totalPedidoRules = computed(() => [(v: string) => !!v || 'El campo es obligatorio'])

const fechaPedidoRules = computed(() => [(v: string) => !!v || 'El campo es obligatorio'])

const estadoPedidoRules = computed(() => [(v: string) => !!v || 'El campo es obligatorio'])

const fechaYhoraEstimadaRules = computed(() => [(v: string) => !!v || 'El campo es obligatorio'])

const direccionEnvioRules = computed(() => [(v: string) => !!v || 'El campo es obligatorio'])

const fechaEntregaRules = computed(() => [(v: string) => !!v || 'El campo es obligatorio'])

const formaPagoRules = computed(() => [(v: string) => !!v || 'El campo es obligatorio'])

// const comprobantePagoRules = computed(() => [
//   (v: string) => !!v || 'El campo es obligatorio'
// ]);

const estadoVentaRules = computed(() => [(v: string) => !!v || 'El campo es obligatorio'])
</script>
<!-- eslint-disable prettier/prettier -->

<template>
  <h2 class="text-xl font-semibold mb-4">Editar Pedido</h2>
  <VaCard>
    <VaCardContent>
      <VaForm
        v-slot="{ isValid }"
        ref="add-user-form"
        class="flex-col justify-start items-start gap-4 inline-flex w-full"
      >
        <div class="flex gap-4 w-full">
          <!-- Columna izquierda (30%) -->
          <div class="w-full sm:w-1/3">
            <h3 class="text-lg font-semibold mb-2">Datos del Cliente</h3>
            <div class="flex mt-5 gap-4 flex-col w-full">
              <VaInput v-if="cliente" v-model="cliente.IdCliente" label="ID del Cliente" class="w-full" readonly />
              <VaInput v-if="usuario" v-model="usuario.Nombre" label="Nombres del Cliente" class="w-full" readonly />
              <VaInput
                v-if="usuario"
                v-model="usuario.Apellidos"
                label="Apellidos del Cliente"
                class="w-full"
                readonly
              />
              <VaInput
                v-if="usuario"
                v-model="usuario.TipoDocumento"
                label="Tipo de documento"
                class="w-full"
                readonly
              />
              <VaInput
                v-if="usuario"
                v-model="usuario.NumeroDocumento"
                label="Número de documento"
                class="w-full"
                readonly
              />
              <VaInput
                v-if="cliente"
                v-model="cliente.Direccion"
                label="Dirección del Cliente"
                class="w-full"
                readonly
              />
              <VaInput v-if="cliente" v-model="cliente.Telefono" label="Teléfono del Cliente" class="w-full" readonly />
              <VaInput
                v-if="usuario"
                v-model="usuario.CorreoElectronico"
                label="Correo electrónico"
                class="w-full"
                readonly
              />
            </div>
          </div>

          <!-- Separador -->
          <div class="w-1/12 border-r border-gray-300 my-auto"></div>

          <!-- Columna derecha (70%) -->
          <div class="w-full sm:w-2/3">
            <h3 class="text-lg font-semibold mb-2">Detalles del Pedido</h3>
            <!-- Aquí van los campos del pedido, producto y demás -->
            <div class="flex gap-4 mt-5 flex-col sm:flex-row w-full">
              <VaInput
                v-model="pedido.TotalPedido"
                label="Total"
                class="w-full sm:w-1/2"
                :rules="totalPedidoRules"
                name="TotalPedido"
                readonly
              />
              <VaInput
                v-model="pedido.FechaPedido"
                label="Fecha del pedido"
                class="w-full sm:w-1/2"
                type="text"
                :rules="fechaPedidoRules"
                name="FechaPedido"
                readonly
              />
            </div>

            <!--segunda parte-->
            <div class="flex gap-4 mt-5 flex-col sm:flex-row w-full">
              <VaSelect
                v-model="pedido.EstadoPedido"
                label="Estado del pedido"
                class="w-full sm:w-1/2"
                :options="['Pendiente', 'Aceptado', 'Rechazado', 'En proceso', 'Pagado']"
                :rules="estadoPedidoRules"
                name="EstadoVenta"
              />

              <VaInput
                v-model="pedido.FechaYhoraEstimada"
                label="Fecha y Hora Estimada"
                class="w-full sm:w-1/2"
                type="datetime-local"
                :rules="fechaYhoraEstimadaRules"
                name="FechaYhoraEstimada"
              />
            </div>

            <!--Tercera parte-->
            <div class="flex gap-4 mt-5 flex-col sm:flex-row w-full">
              <VaInput
                v-model="pedido.DireccionEnvio"
                label="Dirección Envío"
                class="w-full sm:w-1/2"
                :rules="direccionEnvioRules"
                name="DireccionEnvio"
              />
              <VaInput
                v-model="pedido.FechaEntrega"
                label="Fecha de entrega"
                class="w-full sm:w-1/2"
                type="date"
                :rules="fechaEntregaRules"
                name="FechaEntrega"
              />
            </div>

            <!--Cuarta parte-->
            <div class="flex gap-4 mt-5 flex-col sm:flex-row w-full">
              <VaSelect
                v-model="pedido.FormaPago"
                label="Cuenta de banco"
                class="w-full sm:w-1/2"
                :options="['BANCOLOMBIA', 'NEQUI', 'BBVA']"
                :rules="formaPagoRules"
                name="FormaPago"
              />

              <VaSelect
                v-model="pedido.EstadoVenta"
                label="Estado de Venta"
                class="w-full sm:w-1/2"
                :options="['Activo', 'Inactivo']"
                :rules="estadoVentaRules"
                name="EstadoVenta"
              />
            </div>

            <!--Quinta parte-->
            <div class="flex gap-4 mt-2 flex-col sm:flex-row w-full">
              <!-- Botón para abrir la modal de Motivo de Rechazo -->
              <VaButton class="va-button--small" style="height: 5px; margin-top: 17px" @click="openMotivoRechazoModal"
                >Motivo de Rechazo</VaButton
              >

              <!-- Modal para ingresar el motivo de rechazo -->
              <VaModal v-model="modalVisible" title="Motivo de Rechazo" @ok="saveMotivoRechazo" @cancel="closeModal">
                <textarea
                  v-model="pedido.MotivoRechazo"
                  class="w-full h-40"
                  placeholder="Ingrese aquí el motivo de rechazo"
                ></textarea>
              </VaModal>
            </div>

            <!-- Continúa con los demás campos del pedido -->
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="flex gap-4 w-full">
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
    message="Pedido guardado exitosamente"
    color="success"
    duration="5000"
    position="top-right"
  />
</template>
<!-- eslint-disable prettier/prettier -->

<style scoped>
/* Estilos específicos para la línea divisoria */
.border-r {
  height: 100%;
}
</style>

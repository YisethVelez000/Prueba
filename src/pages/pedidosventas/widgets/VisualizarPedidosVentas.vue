<!-- eslint-disable prettier/prettier -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { PedidosVentas, Cliente, Usuario } from '../types' // Cliente, Usuarios
import { ObtenerPedidosVentasPorId, ObtenerClientePorId, ObtenerUsuarioPorId } from '../../../data/pages/pedidosventas'
// import { ObtenerClientesPorId } from '../../../data/pages/clientes'

import { useRouter, useRoute } from 'vue-router'

// Variables reactivas
const pedidos = ref<PedidosVentas>({
  NumeroPedido: -1,
  TotalPedido: -1,
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
const showSuccessAlert = ref(false)

// Vue Router
const router = useRouter()
const route = useRoute()
const modalVisibleComprobante = ref(false) // Estado para la modal de comprobante de pago
const modalVisibleMotivoRechazo = ref(false) // Estado para la modal de motivo de rechazo

// Obtener y mostrar datos del pedido al cargar la vista
onMounted(async () => {
  try {
    // Obtener el ID del proveedor de los parámetros de la ruta
    let numeroPedido = route.params.NumeroPedido
    // Verificar si es una matriz y obtener el primer elemento
    if (Array.isArray(numeroPedido)) {
      numeroPedido = numeroPedido[0]
    }
    // Obtener los datos del pedido por su ID
    const pedidosData = await ObtenerPedidosVentasPorId(numeroPedido)
    // Actualizar los datos del pedido en el formulario
    pedidos.value = { ...pedidosData }

    // Obtener los datos del cliente por su ID
    if (pedidosData.IdCliente) {
      const clienteData = await ObtenerClientePorId(pedidosData.IdCliente)
      cliente.value = clienteData

      // Obtener los datos del usuario por su ID
      if (clienteData.IdUsuarioCliente) {
        const usuarioData = await ObtenerUsuarioPorId(clienteData.IdUsuarioCliente)
        usuario.value = usuarioData
      }
    }
  } catch (error) {
    console.error('Error al cargar los datos del pedido:', error)
    // Manejar el error de carga de datos del pedido, por ejemplo, redirigir a una página de error
  }
})

// Función para cerrar la vista de detalle y volver a la lista de pedidos
const onClose = () => {
  router.push('/pedidosventas')
}

// const closeModalComprobante = () => {
//   modalVisibleComprobante.value = false
// }

const closeModalMotivoRechazo = () => {
  modalVisibleMotivoRechazo.value = false
}

const openModalMotivoRechazo = () => {
  modalVisibleMotivoRechazo.value = true
}
</script>
<!-- eslint-disable prettier/prettier -->

<template>
  <h2 class="text-xl font-semibold mb-4">Visualizar Pedido</h2>
  <VaCard>
    <VaCardContent>
      <VaForm ref="view-user-form" class="flex-col justify-start items-start gap-4 inline-flex w-full">
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

            <label for="comprobante-pago" class="block mt-5 text-primary bold">Comprobante de Pago</label>
            <!-- Mostrar la imagen del comprobante de pago -->
            <img :src="pedidos.ComprobantePago" class="w-full h-auto cursor-pointer" />
          </div>

          <!-- Separador -->
          <div class="w-1/12 border-r border-gray-300 my-auto"></div>

          <!-- Columna derecha (70%) -->
          <div class="w-full sm:w-2/3">
            <h3 class="text-lg font-semibold mb-2">Detalles del Pedido</h3>
            <!-- Aquí van los campos del pedido, producto y demás -->
            <div class="flex gap-4 mt-5 flex-col sm:flex-row w-full">
              <VaInput v-model="pedidos.TotalPedido" label="Total Pedido" class="w-full sm:w-1/2" readonly />
              <VaInput v-model="pedidos.FechaPedido" label="Fecha Pedido" class="w-full sm:w-1/2" readonly />
            </div>

            <!--segunda parte-->
            <div class="flex gap-4 mt-5 flex-col sm:flex-row w-full">
              <VaInput v-model="pedidos.EstadoPedido" label="Estado Pedido" class="w-full sm:w-1/2" readonly />
              <VaInput
                v-model="pedidos.FechaYhoraEstimada"
                label="Fecha y Hora estimada"
                class="w-full sm:w-1/2"
                readonly
              />
            </div>

            <!--Tercera parte-->
            <div class="flex gap-4 mt-5 flex-col sm:flex-row w-full">
              <VaInput v-model="pedidos.DireccionEnvio" label="Dirección Envío" class="w-full sm:w-1/2" readonly />
              <VaInput v-model="pedidos.FechaEntrega" label="Fecha de Entrega" class="w-full sm:w-1/2" readonly />
            </div>

            <!--Cuarta parte-->
            <div class="flex gap-4 mt-5 flex-col sm:flex-row w-full">
              <VaInput v-model="pedidos.FormaPago" label="Cuenta de banco" class="w-full sm:w-1/2" readonly />
              <VaInput v-model="pedidos.EstadoVenta" label="Estado de la venta" class="w-full sm:w-1/2" readonly />
            </div>

            <!--Quinta parte-->
            <div class="flex gap-4 mt-2 flex-col sm:flex-row w-full">
              <!-- Botón para abrir la modal de Motivo de Rechazo -->
              <VaButton class="va-button--small" style="height: 5px; margin-top: 17px" @click="openModalMotivoRechazo"
                >Motivo de Rechazo</VaButton
              >

              <!-- Modal para ingresar el motivo de rechazo -->
              <VaModal v-model="modalVisibleMotivoRechazo" title="Motivo de Rechazo" @cancel="closeModalMotivoRechazo">
                <textarea
                  v-model="pedidos.MotivoRechazo"
                  class="w-full h-40"
                  readonly
                  placeholder="Ingrese aquí el motivo de rechazo"
                ></textarea>
              </VaModal>
            </div>
          </div>
          <!-- Continúa con los demás campos del pedido -->
        </div>
        <!-- Botones de acción -->
        <!-- Botón de cierre -->
        <div class="flex gap-2 flex-col-reverse items-stretch justify-end w-full sm:flex-row sm:items-center">
          <VaButton preset="secondary" color="secondary" @click="onClose">Cerrar</VaButton>
        </div>
      </VaForm>
    </VaCardContent>
  </VaCard>

  <!-- Modal para mostrar la imagen del comprobante -->
  <VaModal v-model="modalVisibleComprobante" title="Comprobante de Pago">
    <img
      :src="`https://apinodedvp.onrender.com/uploads/comprobantes/${pedidos.ComprobantePago}`"
      alt="Comprobante de Pago"
      class="w-full h-auto"
    />
  </VaModal>

  <!-- Alerta de éxito -->
  <div v-if="showSuccessAlert" class="alert alert-success" role="alert">¡Proveedor guardado exitosamente!</div>
</template>

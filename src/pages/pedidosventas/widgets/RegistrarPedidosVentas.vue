<!-- eslint-disable prettier/prettier -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useForm } from 'vuestic-ui'
import { PedidosVentas, Cliente, Usuario } from '../types'
// import { Cliente } from '../types'
import { AgregarPedidosVentas, obtenerUsuarioPorDocumento } from '../../../data/pages/pedidosventas' //obtenerClientePorId
import { useRouter } from 'vue-router'

const defaultNuevoPedido: Omit<PedidosVentas, 'NumeroPedido'> = {
  TotalPedido: 0,
  EstadoPedido: 'Pendiente',
  DireccionEnvio: '',
  FechaPedido: new Date().toISOString().substr(0, 10), // Inicializa con la fecha actual en formato YYYY-MM-DD,
  FechaEntrega: '',
  FormaPago: '',
  MotivoRechazo: '',
  EstadoVenta: 'Inactivo',
}

const newPedido = ref<Omit<PedidosVentas, 'NumeroPedido'>>({ ...defaultNuevoPedido })
const form = useForm('add-user-form')
const router = useRouter()

const emit = defineEmits(['close', 'save'])

const showSuccessAlert = ref(false)
const uploadedComprobante = ref<File | null>(null)

const onSave = async () => {
  if (form.validate()) {
    try {
      // Clona el objeto newPedido y elimina ComprobantePago
      const pedidoSinComprobante = { ...newPedido.value }
      delete pedidoSinComprobante.ComprobantePago

      // Eliminar MotivoRechazo si el pedido no está rechazado
      if (pedidoSinComprobante.EstadoPedido !== 'Rechazado') {
        delete pedidoSinComprobante.MotivoRechazo
      } else if (!pedidoSinComprobante.MotivoRechazo) {
        // Asegurarse de que MotivoRechazo no esté vacío si el pedido está rechazado
        console.error('MotivoRechazo es requerido cuando el pedido está rechazado')
        return
      }

      // Primero, crear el pedido sin el comprobante de pago
      const response = await AgregarPedidosVentas(pedidoSinComprobante)
      const data = await response.json()

      const numeroPedido = data.NumeroPedido // Obtener el NumeroPedido del pedido creado

      // Si se subió un archivo de comprobante de pago
      if (uploadedComprobante.value) {
        const formData = new FormData()
        formData.append('file', uploadedComprobante.value)

        const uploadUrl = `http://localhost:3000/upload-comprobante/${numeroPedido}`

        const uploadResponse = await fetch(uploadUrl, {
          method: 'POST',
          body: formData,
        })

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          newPedido.value.ComprobantePago = uploadData.path // Asigna la URL de la imagen a ComprobantePago
        } else {
          console.error('Error subiendo la imagen')
        }
      }

      emit('save', newPedido.value)
      router.push('/pedidosventas')
      // router.push('/pedidosventas')
      showSuccessAlert.value = true
      hideAlert()
    } catch (error) {
      console.error('Error al guardar el pedido:', error)
    }
  }
}

const hideAlert = () => {
  setTimeout(() => {
    showSuccessAlert.value = false
  }, 3000)
}

// Guardar el archivo subido
// const onFileChange = (event: Event) => {
//   const target = event.target as HTMLInputElement;
//   const file = target.files?.[0];
//   if (file) {
//     uploadedComprobante.value = file;
//   }
// };

const onClose = () => {
  router.push('/pedidosventas')
}

//validaciones
const totalPedidoRules = computed(() => [(v: string) => !!v || 'El campo es obligatorio'])
const fechaPedidoRules = computed(() => [(v: string) => !!v || 'El campo es obligatorio'])
const estadoPedidoRules = computed(() => [(v: string) => !!v || 'El campo es obligatorio'])
const fechaYhoraEstimadaRules = computed(() => [(v: string) => !!v || 'El campo es obligatorio'])
const direccionEnvioRules = computed(() => [(v: string) => !!v || 'El campo es obligatorio'])
const fechaEntregaRules = computed(() => [(v: string) => !!v || 'El campo es obligatorio'])
const formaPagoRules = computed(() => [(v: string) => !!v || 'El campo es obligatorio'])

// Método para buscar usuario por numero documento
const numeroDocumento = ref<number | null>(null)
const usuario = ref<Usuario | null>(null)
const cliente = ref<Cliente | null>(null)

// Método para buscar clientes
const buscarUsuario = async () => {
  try {
    if (numeroDocumento.value !== null) {
      const documento = numeroDocumento.value
      console.log(`Buscando usuario con número de documento: ${documento}`)
      const data = await obtenerUsuarioPorDocumento(documento)

      console.log('Respuesta del servidor:', data)

      if (data && data.usuario.IdUsuario) {
        usuario.value = data.usuario
        cliente.value = data.cliente
        newPedido.value.IdCliente = data.cliente.IdCliente
        console.log('Usuario encontrado:', data.usuario)
      } else {
        console.error('Usuario no encontrado')
      }
    } else {
      console.error('Número de documento no puede estar vacío')
    }
  } catch (error) {
    console.error('Error al buscar el Usuario:', error)
  }
}
</script>
<!-- eslint-disable prettier/prettier -->
<!-- RegistrarPedidos.vue -->
<template>
  <h2 class="text-xl font-semibold mb-4">Agregar Venta</h2>
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
            <!-- Campo de búsqueda de clientes -->
            <div class="flex mt-5 gap-4 flex-col w-full">
              <VaInput
                v-model="numeroDocumento"
                label="Ingresa tu número de documento"
                class="w-full"
                placeholder=" Número de documento y presione Enter"
                @keyup.enter="buscarUsuario"
              />

              <VaInput v-if="usuario" v-model="usuario.Nombre" label="Nombre" class="w-full mt-1" readonly />

              <VaInput
                v-if="usuario"
                v-model="usuario.TipoDocumento"
                label="Tipo Documento"
                class="w-full mt-1"
                readonly
              />

              <VaInput
                v-if="usuario"
                v-model="usuario.CorreoElectronico"
                label="Correo Electrónico"
                class="w-full mt-1"
                readonly
              />
              <VaInput v-if="cliente" v-model="cliente.Telefono" label="Télefono" class="w-full mt-1" readonly />

              <VaInput v-if="cliente" v-model="cliente.Direccion" label="Dirección" class="w-full mt-1" readonly />
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
                v-model="newPedido.TotalPedido"
                label="Total Pedido"
                class="w-full sm:w-1/2"
                placeholder="Ingrese el total del pedido"
                :rules="totalPedidoRules"
                name="TotalPedido"
              />

              <VaInput
                v-model="newPedido.FechaPedido"
                label="Fecha del pedido"
                class="w-full sm:w-1/2"
                type="date"
                :rules="fechaPedidoRules"
                name="FechaPedido"
              />
            </div>

            <!--segunda parte-->
            <div class="flex gap-4 mt-5 flex-col sm:flex-row w-full">
              <VaSelect
                v-model="newPedido.EstadoPedido"
                label="Estado"
                class="w-full sm:w-1/2"
                :options="['Pendiente', 'Aceptado', 'Rechazado', 'En proceso']"
                :rules="estadoPedidoRules"
                name="EstadoPedido"
                readonly
              />
              <VaInput
                v-model="newPedido.FechaYhoraEstimada"
                label="Fecha y Hora Estimada"
                class="w-full sm:w-1/2"
                type="datetime-local"
                :rules="fechaYhoraEstimadaRules"
                name="FechaYhoraEstimada"
              />
            </div>

            <!--Tercera parte-->
            <div class="flex gap-4 mt-4 flex-col sm:flex-row w-full">
              <VaInput
                v-model="newPedido.DireccionEnvio"
                label="Direccion Envió"
                class="w-full sm:w-1/2"
                placeholder="Ingrese la dirección de envío"
                :rules="direccionEnvioRules"
                name="DireccionEnvio"
              />
              <VaInput
                v-model="newPedido.FechaEntrega"
                label="Fecha de entrega"
                class="w-full sm:w-1/2"
                type="date"
                :rules="fechaEntregaRules"
                name="FechaEntrega"
              />
            </div>

            <!--Cuarta parte-->
            <div class="flex gap-4 mt-4 flex-col sm:flex-row w-full">
              <VaSelect
                v-model="newPedido.FormaPago"
                label="Cuenta de Banco"
                class="w-full sm:w-1/2"
                placeholder="Elegir cuenta de Banco"
                :options="['BANCOLOMBIA', 'NEQUI', 'BBVA']"
                :rules="formaPagoRules"
                name="FormaPago"
              />

              <VaSelect
                v-model="newPedido.EstadoVenta"
                label="Estado de Venta"
                class="w-full sm:w-1/2"
                :options="['Activo', 'Inactivo']"
                name="EstadoVenta"
              />

              <!-- Mostrar detalles de cuenta bancaria según la opción seleccionada -->
              <div v-if="newPedido.FormaPago === 'BANCOLOMBIA'" class="p-2 m-4 text-primary font-bold">
                <span>Cuenta ahorros (366-319-655-76)</span>
              </div>
              <div v-else-if="newPedido.FormaPago === 'NEQUI'" class="p-2 m-4 text-primary font-bold">
                <span>Cuenta Nequi (301-659-0931)</span>
              </div>
              <div v-else-if="newPedido.FormaPago === 'BBVA'" class="p-2 m-4 text-primary font-bold">
                <span>Cuenta BBVA (1478-120-486)</span>
              </div>
            </div>

            <!--Quinta parte-->

            <!-- <div class="flex gap-4 mt-5 flex-col sm:flex-row w-full">
              

            </div> -->
          </div>
        </div>

        <!-- Nueva sección para agregar productos -->
        <div class="mt-8 w-full">
          <h3 class="text-lg font-semibold mb-2">Productos</h3>
          <div class="flex gap-4 flex-col">
            -->
            <VaInput label="Nombre del Producto" class="w-full sm:w-1/3" placeholder="Ingrese el nombre del producto" />
            <VaInput label="Cantidad" class="w-full sm:w-1/5" type="number" placeholder="Ingrese la cantidad" />
            <VaInput label="Precio" class="w-full sm:w-1/5" type="number" placeholder="Ingrese el precio" /> -->
            <VaButton color="primary" @click="agregarProducto">Agregar Producto</VaButton>
          </div>
          -->
          <div class="mt-4">
            <h4 class="text-md font-semibold">Lista de Productos</h4>
            <ul>
              <li v-for="(producto, index) in productos" :key="index">
                {{ producto.Nombre }} - Cantidad: {{ producto.Cantidad }} - Precio: {{ producto.Precio }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Continúa con los demás campos del pedido -->

        <!-- Botón de cierre -->
        <div class="flex gap-2 flex-col-reverse items-stretch justify-end w-full sm:flex-row sm:items-center">
          <VaButton preset="secondary" color="secondary" @click="onClose">Cerrar</VaButton>
          <VaButton :disabled="!isValid" @click="onSave">Guardar</VaButton>
        </div>
      </VaForm>
    </VaCardContent>
  </VaCard>

  <div v-if="showSuccessAlert" class="alert alert-success" role="alert">Pedido guardado exitosamente!</div>
</template>

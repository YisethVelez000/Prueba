<script setup lang="ts">
import { ref } from 'vue'
import { VaButton, VaCard, VaCardContent, VaInput, VaModal, VaSelect } from 'vuestic-ui'
import { OrdenProduccion } from '../type'
import { useRouter } from 'vue-router'

// Usamos el router
const router = useRouter()

const defaultOrdenProduccion: OrdenProduccion = {
  NumeroOrdenProduccion: 0,
  FechaEstimada: Date.toString(),
  EsProduccionInterna: '',
  EstadoOrden: '',
  Produccion_Has_Producto: [],
  Estampado: [],
  Terciarias: [],
}

const nuevoProducto = ref({
  NombreProducto: '',
  Color: '',
  Talla: '',
  Cantidad: 0,
})

const nuevoProductoPersonalizado = ref({
  NombreProducto: '',
  Color: '',
  Talla: '',
  Cantidad: 0,
  imagen: '',
  IdUbicacion: 0,
  IdEstampado: 0,
})

const showModalEstampados = ref(false)
const showModal = ref(false)

const terciarias = ''
const ValorAPagar = 0
const nuevaOrdenProduccion = ref<OrdenProduccion>(defaultOrdenProduccion)

const productos = ref([
  { NombreProducto: 'Producto 1', Color: 'Rojo', Talla: 'M', Cantidad: 10 },
  { NombreProducto: 'Producto 2', Color: 'Azul', Talla: 'L', Cantidad: 5 },
])

const productosPersonalizados = ref([
  { NombreProducto: 'Producto Personalizado 1', Color: 'Verde', Talla: 'S', Cantidad: 3 },
])

const removeProduct = (index: number, type: string): void => {
  if (type === 'producto') {
    productos.value.splice(index, 1)
  } else {
    productosPersonalizados.value.splice(index, 1)
  }
} // Declare and assign a value to 'modalType'

const addProduct = (newProduct: any) => {
  productos.value.push(newProduct)
}

const addProductPersonalizado = (newProduct: any) => {
  productosPersonalizados.value.push(newProduct)
  showModalEstampados.value = false
}

const cancelar = () => {
  // Redirigir a la vista de roles
  router.push('/produccion')
}
</script>

<template>
  <div>
    <h2 class="text-xl font-semibold mb-4">Agregar</h2>
    <VaCard>
      <VaCardContent>
        <div class="self-stretch flex-col justify-start items-start gap-4 flex">
          <div class="flex gap-4 flex-col sm:flex-row w-full">
            <VaInput
              v-model="nuevaOrdenProduccion.FechaEstimada"
              class="w-full sm:w-1/2"
              name="FechaEstimada"
              label="Fecha Estimada"
              type="date"
            />
            <VaSelect
              v-model="nuevaOrdenProduccion.EsProduccionInterna"
              class="w-full sm:w-1/2"
              name="EsProduccionInterna"
              label="Produccion Interna"
              :options="['SI', 'NO']"
            />
          </div>
          <div class="flex gap-4 flex-col sm:flex-row w-full">
            <VaSelect
              v-model="nuevaOrdenProduccion.EstadoOrden"
              class="w-full sm:w-1/2"
              name="EstadoOrden"
              label="Estado"
              :options="['Pendiente', 'Iniciado', 'Estampando', 'Finalizado', 'En Tercera']"
            />
          </div>
          <div class="flex gap-4 flex-col sm:flex-row w-full">
            <VaInput v-model="terciarias" class="w-full sm:w-1/2" name="Terciarias" label="Terciarias" type="text" />
            <VaInput
              :aria-reset-label="ValorAPagar"
              class="w-full sm:w-1/2"
              name="ValorAPagar"
              label="Valor a Pagar"
              type="number"
            />
          </div>
          <div class="flex gap-4 flex-col sm:flex-row w-full mt-4">
            <div class="w-full sm:w-1/2">
              <!-- Tabla para Productos -->
              <div class="w-full">
                <h1 class="text-xl font-semibold mb-4">
                  Listado Productos
                  <VaButton
                    class="ml-4"
                    size="small"
                    icon="add"
                    @click="
                      () => {
                        showModal = true
                      }
                    "
                  />
                </h1>
                <table class="styled-table mt-4">
                  <thead>
                    <tr>
                      <th>Nombre Producto</th>
                      <th>Color</th>
                      <th>Talla</th>
                      <th>Cantidad</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(producto, index) in productos" :key="index">
                      <td>{{ producto.NombreProducto }}</td>
                      <td>{{ producto.Color }}</td>
                      <td>{{ producto.Talla }}</td>
                      <td>{{ producto.Cantidad }}</td>
                      <td>
                        <VaButton
                          preset="primary"
                          size="small"
                          icon="mso-delete"
                          color="danger"
                          aria-label="Eliminar Empleado"
                          title="Eliminar"
                          @click="removeProduct(index, 'producto')"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div class="w-full sm:w-1/2">
              <!-- Tabla para Productos Personalizados -->
              <div class="w-full mt-">
                <h1 class="text-xl font-semibold mb-4">
                  Listado Productos Personalizados
                  <VaButton
                    class="ml-4"
                    size="small"
                    icon="add"
                    @click="
                      () => {
                        showModalEstampados = true
                      }
                    "
                  />
                </h1>
                <table class="styled-table">
                  <thead>
                    <tr>
                      <th>Nombre Producto</th>
                      <th>Color</th>
                      <th>Talla</th>
                      <th>Cantidad</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(producto, index) in productosPersonalizados" :key="index">
                      <td>{{ producto.NombreProducto }}</td>
                      <td>{{ producto.Color }}</td>
                      <td>{{ producto.Talla }}</td>
                      <td>{{ producto.Cantidad }}</td>
                      <td>
                        <VaButton
                          preset="primary"
                          size="small"
                          icon="mso-delete"
                          color="danger"
                          aria-label="Eliminar Empleado"
                          title="Eliminar"
                          @click="removeProduct(index, 'personalizado')"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div class="flex justify-end space-x-4 mt-4">
          <VaButton preset="secondary" color="secondary" @click="cancelar">Cancelar</VaButton>
          <VaButton preset="primary" color="primary">Guardar</VaButton>
        </div>
      </VaCardContent>
    </VaCard>
    <!-- Modal para agregar productos -->
    <VaModal
      v-model="showModal"
      title="Agregar Nuevo Producto"
      :cancel-text="'Cancelar'"
      :ok-text="'Agregar'"
      @onOk="
        () => {
          addProduct(nuevoProducto)
        }
      "
    >
      <template #default>
        <VaInput v-model="nuevoProducto.NombreProducto" label="Nombre Producto" />
        <VaInput v-model="nuevoProducto.Color" label="Color" />
        <VaInput v-model="nuevoProducto.Talla" label="Talla" />
        <VaInput v-model="nuevoProducto.Cantidad" label="Cantidad" type="number" />
      </template>
    </VaModal>
    <!-- Modal para agregar productos personalizados -->
    <VaModal
      v-model="showModalEstampados"
      title="Agregar Nuevo Producto Personalizado"
      :ok-text="'Agregar'"
      :cancel-text="'Cancelar'"
      @onOk="
        () => {
          addProductPersonalizado(nuevoProductoPersonalizado)
        }
      "
    >
      <template #default>
        <VaInput v-model="nuevoProductoPersonalizado.NombreProducto" label="Nombre Producto" />
        <VaInput v-model="nuevoProductoPersonalizado.Color" label="Color" />
        <VaInput v-model="nuevoProductoPersonalizado.Talla" label="Talla" />
        <VaInput v-model="nuevoProductoPersonalizado.Cantidad" label="Cantidad" type="number" />
        <VaInput v-model="nuevoProductoPersonalizado.imagen" label="Imagen" type="file" />
        <VaInput v-model="nuevoProductoPersonalizado.IdUbicacion" label="Ubicación" type="number" />
        <VaInput v-model="nuevoProductoPersonalizado.IdEstampado" label="Estampado" type="number" />
      </template>
    </VaModal>
  </div>
</template>
<style scoped>
/* Estilos para las tablas */
.styled-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 16px;
  font-family: Arial, sans-serif;
  margin: 10px, 0, 0, 0;
}

.styled-table td {
  padding: 5px 0px;
}

.styled-table thead th {
  color: #000000;
  text-align: left;
  /* Cambia esto a 'center' si quieres centrar el texto */
  padding: 0px;
  /* Ajusta el padding para reducir espacio */
}
</style>

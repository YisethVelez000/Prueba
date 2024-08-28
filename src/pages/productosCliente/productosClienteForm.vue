<template>
  <div id="app">
    <header class="main-banner">
      <img src="./../../../public/logo de dosi.jpg" alt="Logo del software" class="logo-banner" />
      <!-- Contenedor para los botones de inicio de sesión y carrito -->
      <div class="actions-container">
        <!-- Botón de inicio de sesión -->
        <button class="login-button" @click="irAllogin">Iniciar sesión</button>
        <!-- Carrito de compras -->
        <button class="carrito-button" @click="toggleCartSidebar">
          <img
            src="https://cdn.icon-icons.com/icons2/933/PNG/512/shopping-cart_icon-icons.com_72552.png"
            alt="Carrito"
            class="cart-icon"
          />
        </button>
      </div>
    </header>

    <!-- Sidebar del carrito -->
    <div :class="['cart-sidebar', { 'is-open': isCartOpen }]">
      <div class="cart-sidebar-content">
        <button class="close-button" @click="toggleCartSidebar">X</button>
        <h3>Carrito de Compras</h3>
        <div v-if="cartProducts.length > 0">
          <div v-for="(product, index) in cartProducts" :key="index" class="cart-item">
            <img :src="product.ImagenProducto" alt="Imagen del producto" class="cart-item-image" />
            <div class="cart-item-info">
              <h4>{{ product.NombreProducto }}</h4>
              <p>{{ product.PrecioUnitario }} x {{ product.Cantidad }}</p>
              <p>Total: {{ product.PrecioTotal }}</p>
              <button @click="eliminarDelCarrito(index)">Eliminar</button>
            </div>
          </div>
        </div>
        <div v-else>
          <p>El carrito está vacío</p>
        </div>
      </div>
    </div>

    <!-- Fondo de página con imagen -->
    <div
      class="bg-cover bg-center"
      style="
        background-image: url('https://img.freepik.com/foto-gratis/fondo_53876-32170.jpg?w=900&t=st=1723158687~exp=1723159287~hmac=ca7360f6388e32be58092afafa63e288d84316777a9651ab19c310a192076f95');
        min-height: 100vh;
      "
    >
      <!-- Contenido centrado verticalmente -->
      <div class="flex items-center justify-center h-full">
        <!-- Contenedor interno para limitar el ancho -->
        <div class="bg-white shadow-md rounded-lg p-4 md:p-6" style="max-width: 1100px; width: 100%">
          <!-- Contenido dentro del contenedor -->

          <!-- Alerta de validación -->
          <VaAlert v-if="validationMessage" color="danger" class="mb-4" dense closable @close="validationMessage = ''">
            {{ validationMessage }}
          </VaAlert>

          <div class="flex flex-wrap gap-4">
            <!-- Contenido del producto -->
            <!-- Contenedor lateral izquierdo superior para imágenes del producto -->
            <div class="w-full lg:w-1/2">
              <h3 class="text-xl font-semibold text-primary mb-4">Imágenes del producto</h3>
              <div class="flex flex-wrap gap-4">
                <VaCarousel :items="uploadedImages" stateful indicators infinite swipable />
              </div>
            </div>

            <!-- Contenedor lateral derecho superior para precios -->
            <div v-if="producto" class="w-full lg:w-1/2">
              <div class="mb-4">
                <h3 class="text-lg font-semibold mb-2">Precio Total</h3>
                <div class="border border-gray-200 p-4 rounded-lg">
                  <!-- Precio total del producto -->
                  <div>
                    <label class="font-semibold">Precio Total:</label>
                    <span>{{ PrecioProductoConPrecioEstampado() }}</span>
                  </div>

                  <!-- Precio con estampado (si es personalizable) -->
                  <div v-if="productoPersonalizable">
                    <label class="font-semibold">Precio con Estampado:</label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Contenedor mitad superior para detalles del producto: tallas, colores y stock -->
            <div v-if="producto" class="w-full">
              <div class="mb-4">
                <h3 class="text-lg font-semibold mb-2">Detalles del producto</h3>
                <div class="border border-gray-200 p-4 rounded-lg">
                  <!-- Tallas disponibles -->
                  <div class="flex flex-col mb-2">
                    <label class="font-semibold">Talla:</label>
                    <div v-for="talla in selectedTallas" :key="talla.IdTalla">
                      <input
                        :id="'talla_' + talla.IdTalla"
                        v-model="productoCliente.Talla"
                        type="radio"
                        :value="talla.Talla"
                        class="mr-2"
                      />
                      <label :for="'talla_' + talla.IdTalla">{{ talla.Talla }}</label>
                    </div>
                  </div>

                  <!-- Colores disponibles -->
                  <div class="flex flex-col mb-2">
                    <label class="font-semibold">Color:</label>
                    <div v-for="color in selectedColors" :key="color.IdColor">
                      <input
                        :id="'color_' + color.IdColor"
                        v-model="productoCliente.Color"
                        type="radio"
                        :value="color.Color"
                        class="mr-2"
                      />
                      <label :for="'color_' + color.IdColor">{{ color.Color }}</label>
                    </div>
                  </div>

                  <!-- Stock del producto (visualización) -->
                  <div class="flex flex-col">
                    <label class="font-semibold">Cantidad disponible:</label>
                    <span>{{ producto.Stock }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Contenedor mitad inferior para personalización del estampado -->
            <div class="w-full">
              <div v-if="showAddEstampadoButton" class="mb-4 flex justify-end">
                <button
                  class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  @click="agregarEstampado"
                >
                  Agregar Estampado
                </button>
              </div>

              <div v-for="(estampado, index) in productoCliente.Estampados" :key="index">
                <h3 class="text-lg font-semibold mb-2">Personalización del Estampado {{ index + 1 }}</h3>
                <div class="border border-gray-200 p-4 rounded-lg">
                  <div class="grid grid-cols-3 gap-4">
                    <div v-if="estampado.mostrarCampos">
                      <div class="flex flex-col mb-2">
                        <label class="font-semibold">Tipo de Estampado:</label>
                        <div v-for="tipo in selectedEstampados" :key="tipo.IdEstampado">
                          <input
                            :id="'estampado_' + tipo.IdEstampado + '_' + index"
                            v-model="estampado.IdEstampado"
                            type="radio"
                            :value="tipo.IdEstampado"
                            class="mr-2"
                            @change="
                              () => {
                                estampado.TipoEstampado = tipo.TipoEstampado
                                actualizarUbicaciones(tipo.IdEstampado, index)
                              }
                            "
                          />
                          <label :for="'estampado_' + tipo.IdEstampado + '_' + index">
                            {{ tipo.TipoEstampado }}
                          </label>
                        </div>
                      </div>

                      <div class="flex flex-col mb-2">
                        <label class="font-semibold">Ubicación del Estampado:</label>
                        <div v-for="ubicacion in estampado.Ubicaciones" :key="ubicacion.IdUbicacion">
                          <input
                            :id="'ubicacion_' + ubicacion.IdUbicacion + '_' + index"
                            v-model="estampado.UbicacionSeleccionada"
                            type="radio"
                            :value="ubicacion.IdUbicacion"
                            class="mr-2"
                          />
                          <label :for="'ubicacion_' + ubicacion.IdUbicacion + '_' + index">
                            {{ ubicacion.Ubicacion }}
                          </label>
                        </div>
                      </div>

                      <div class="flex flex-col mb-2">
                        <label class="font-semibold">Imagen del Estampado:</label>
                        <input type="file" class="form-input" @change="handleFileChange($event, index)" />
                      </div>
                    </div>

                    <div class="col-span-3 flex justify-end">
                      <button
                        class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                        @click="eliminarEstampado(index)"
                      >
                        Eliminar Estampado
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end mt-4">
            <button
              class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              @click="agregarAlCarrito"
            >
              Agregar al carrito
            </button>
            <VaButton preset="secondary" color="secondary" @click="onClose">Cancelar</VaButton>
          </div>
        </div>
      </div>
    </div>
    <footer class="footer">
      <RouterLink to="/about">Sobre nosotros</RouterLink>
      <RouterLink to="https://www.instagram.com/dlalys_dosii/">Contacto</RouterLink>
      <RouterLink to="/privacy">Política de privacidad</RouterLink>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ObtenerColores, ObtenerTallas, ObtenerProductoPorId } from '../../data/pages/productos'
import { useRouter, useRoute } from 'vue-router'
import { ProductoConEstampados } from '../productosCliente/types'

const router = useRouter()
const route = useRoute()
const validationMessage = ref('')
// Estado para controlar el sidebar del carrito
const isCartOpen = ref(false)
const cartProducts = ref([])

// Funciones para manejar el almacenamiento en localStorage
const saveCartToLocalStorage = (cartProducts) => {
  localStorage.setItem('cart', JSON.stringify(cartProducts))
}

const loadCartFromLocalStorage = () => {
  const savedCart = localStorage.getItem('cart')
  return savedCart ? JSON.parse(savedCart) : []
}

// Cargar el carrito desde localStorage cuando se monte el componente
onMounted(() => {
  cartProducts.value = loadCartFromLocalStorage()
})

// Función para alternar la visibilidad del sidebar del carrito
const toggleCartSidebar = () => {
  isCartOpen.value = !isCartOpen.value
}

const onClose = () => {
  router.push('/home')
}

const agregarAlCarrito = async () => {
  // Validaciones de los campos requeridos
  if (!productoCliente.value.Talla) {
    validationMessage.value = 'Por favor, selecciona una talla.'
    return
  }

  if (!productoCliente.value.Color) {
    validationMessage.value = 'Por favor, selecciona un color.'
    return
  }

  if (producto.value.Personalizable === 'Sí' && productoCliente.value.Estampados.length === 0) {
    validationMessage.value = 'Por favor, selecciona al menos un estampado.'
    return
  }

  for (const estampado of productoCliente.value.Estampados) {
    if (!estampado.TipoEstampado) {
      validationMessage.value = 'Por favor, selecciona un tipo de estampado.'
      return
    }

    if (!estampado.UbicacionSeleccionada) {
      validationMessage.value = 'Por favor, selecciona una ubicación para el estampado.'
      return
    }

    if (estampado.IdEstampado === -1) {
      validationMessage.value = 'Por favor, selecciona un estampado válido.'
      return
    }

    if (!estampado.Ubicaciones.some((u) => u.IdUbicacion === estampado.UbicacionSeleccionada)) {
      validationMessage.value = 'Por favor, selecciona una ubicación válida.'
      return
    }
  }

  // Crear FormData para enviar los datos
  const formData = new FormData()
  formData.append('IdUsuario', '1')
  formData.append('IdProducto', productoCliente.value.IdProducto.toString())
  formData.append('cantidad', productoCliente.value.Cantidad.toString())
  formData.append('Talla', productoCliente.value.Talla)
  formData.append('Color', productoCliente.value.Color)

  // Serializar el array de estampados a un string JSON
  const estampadosData = productoCliente.value.Estampados.map((estampado) => ({
    IdEstampado: estampado.IdEstampado,
    IdUbicacion: estampado.UbicacionSeleccionada,
    TipoEstampado: estampado.TipoEstampado,
  }))

  formData.append('estampados', JSON.stringify(estampadosData))

  // Agregar imágenes de estampados si existen
  productoCliente.value.Estampados.forEach((estampado, index) => {
    if (estampado.ImagenEstampado) {
      formData.append(`imagenEstampado_${index}`, estampado.ImagenEstampado)
    }
  })

  try {
    const response = await fetch('https://apinodedvp.onrender.com/carrito', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      validationMessage.value = errorData.message
      return
    }

    const result = await response.json()
    console.log(result)
    // Si es exitoso, actualizar el carrito
    const nuevoProducto = {
      IdProducto: productoCliente.value.IdProducto,
      NombreProducto: producto.value.NombreProductoCatalogo,
      ImagenProducto: uploadedImages.value[0],
      Color: productoCliente.value.Color,
      Talla: productoCliente.value.Talla,
      Cantidad: productoCliente.value.Cantidad,
      PrecioUnitario: producto.value.PrecioProducto,
      PrecioTotal: PrecioProductoConPrecioEstampado(),
      Estampados: productoCliente.value.Estampados,
    }

    cartProducts.value.push(nuevoProducto)
    saveCartToLocalStorage(cartProducts.value)
    toggleCartSidebar()
  } catch (error) {
    console.error('Error al agregar al carrito:', error)
    validationMessage.value = 'Ocurrió un error al agregar el producto al carrito.'
  }
}

// Función para eliminar productos del carrito
const eliminarDelCarrito = (index) => {
  cartProducts.value.splice(index, 1)
  saveCartToLocalStorage(cartProducts.value)
}

// Estado de los productos y la personalización
const productoCliente = ref<ProductoConEstampados>({
  IdProducto: -1,
  NombreProducto: '',
  ImagenProducto: '',
  Color: '',
  Talla: '',
  Cantidad: 1,
  PrecioUnitario: 0,
  PrecioTotal: 0,
  Estampados: [],
})

const selectedColors = ref([])
const selectedTallas = ref([])
const selectedEstampados = ref([])
const tallasEnum = ref([])
const uploadedImages = ref([])
const showAddEstampadoButton = ref(false)
const colorsFromAPI = ref([])
const producto = ref(null)
const ubicacionesEstampado = ref([])
const precioEstampado = ref({})

const obtenerColores = async () => {
  try {
    const response = await ObtenerColores()
    colorsFromAPI.value = response.data
  } catch (error) {
    console.error('Error al obtener los colores:', error)
  }
}

const irAllogin = () => {
  router.push('/auth/login')
}

const obtenerEstampados = async (IdEstampado) => {
  try {
    const response = await fetch(`https://apinodedvp.onrender.com/estampados/${IdEstampado}`)

    const estampado = await response.json()

    ubicacionesEstampado.value = estampado.EstampadosUbicaciones.map((ubicacion) => ({
      IdUbicacion: ubicacion.Ubicacione.IdUbicacion,
      Ubicacion: ubicacion.Ubicacione.Ubicacion,
    }))

    precioEstampado.value = estampado.PrecioEstampado
  } catch (error) {
    console.error('Error al obtener el estampado:', error)
  }
}

const PrecioProductoConPrecioEstampado = () => {
  const precioBase = producto.value ? producto.value.PrecioProducto : 0

  const precioEstampados = productoCliente.value.Estampados.reduce((total, estampado) => {
    return total + (estampado.PrecioEstampado || 0)
  }, 0)

  return precioBase + precioEstampados
}

const obtenerTallas = async () => {
  try {
    const response = await ObtenerTallas()
    tallasEnum.value = response.data.map((talla, index) => ({
      IdTalla: index + 1,
      Talla: talla,
    }))
  } catch (error) {
    console.error('Error al obtener las tallas:', error)
  }
}

const actualizarUbicaciones = async (IdEstampado, index) => {
  try {
    const response = await fetch(`https://apinodedvp.onrender.com/estampados/${IdEstampado}`)
    const data = await response.json()

    productoCliente.value.Estampados[index].Ubicaciones = data.EstampadosUbicaciones.map((ubicacion) => ({
      IdUbicacion: ubicacion.Ubicacione.IdUbicacion,
      Ubicacion: ubicacion.Ubicacione.Ubicacion,
    }))

    productoCliente.value.Estampados[index].PrecioEstampado = data.PrecioEstampado || 0
  } catch (error) {
    console.error('Error al actualizar ubicaciones:', error)
  }
}

onMounted(async () => {
  try {
    let idProducto = route.params.IdProducto
    if (Array.isArray(idProducto)) {
      idProducto = idProducto[0]
    }

    const productoData = await ObtenerProductoPorId(idProducto)

    producto.value = {
      IdProducto: productoData.IdProducto,
      NombreProductoCatalogo: productoData.NombreProductoCatalogo,
      FechaRegistro: productoData.FechaRegistro,
      PrecioProducto: productoData.PrecioProducto,
      Personalizable: productoData.Personalizable,
      EstadoProducto: productoData.EstadoProducto,
      IdFichaTecnica: productoData.IdFichaTecnica,
      Producto_has_Colores: productoData.Producto_has_Colores.map((item) => ({
        IdProductoColor: item.IdProductoColor,
        Color: item.Color.Color,
        IdColor: item.Color.IdColor,
      })),
      Producto_has_Tallas: productoData.Producto_has_Tallas.map((item) => ({
        IdProductosTallas: item.IdProductosTallas,
        Talla: item.Talla.Talla,
        IdTalla: item.Talla.IdTalla,
      })),
      Producto_Has_Imagens: productoData.Producto_Has_Imagens.map((item) => ({
        IdProductoImagen: item.IdProductoImagen,
        Imagen: item.Imagen.Imagen,
      })),
      EstampadoProductos: productoData.EstampadoProductos.map((item) => ({
        IdEstampadoProducto: item.IdEstampadoProducto,
        TipoEstampado: item.Estampado.TipoEstampado,
        IdEstampado: item.Estampado.IdEstampado,
      })),
    }

    selectedColors.value = producto.value.Producto_has_Colores.map((item) => ({
      IdColor: item.IdColor,
      Color: item.Color,
    }))
    selectedTallas.value = producto.value.Producto_has_Tallas.map((item) => ({
      IdTalla: item.IdTalla,
      Talla: item.Talla,
    }))

    selectedEstampados.value = producto.value.EstampadoProductos.map((item) => ({
      IdEstampado: item.IdEstampado,
      TipoEstampado: item.TipoEstampado,
    }))

    uploadedImages.value = producto.value.Producto_Has_Imagens.map((item) => item.Imagen)

    showAddEstampadoButton.value = productoData.Personalizable === 'Sí'

    for (const estampado of producto.value.EstampadoProductos) {
      await obtenerEstampados(estampado.IdEstampado)
    }

    productoCliente.value = {
      IdProducto: productoData.IdProducto,
      NombreProducto: productoData.NombreProductoCatalogo,
      ImagenProducto: uploadedImages.value[0],
      Color: '',
      Talla: '',
      Cantidad: 1,
      PrecioUnitario: productoData.PrecioProducto,
      PrecioTotal: productoData.PrecioProducto,
      Estampados: [],
    }

    obtenerColores()
    obtenerTallas()
  } catch (error) {
    console.error('Error al cargar los datos del producto:', error)
  }
})

function agregarEstampado() {
  productoCliente.value.Estampados.push({
    IdDetalleEstampado: productoCliente.value.Estampados.length + 1,
    IdPedidoVenta: -1,
    IdEstampado: -1,
    Ubicacion: '',
    TipoEstampado: '',
    ImagenEstampado: '',
    mostrarCampos: true,
  })
}

function handleFileChange(event, index) {
  const fileInput = event.target
  if (fileInput.files && fileInput.files[0]) {
    productoCliente.value.Estampados[index].ImagenEstampado = fileInput.files[0]
  }
}

function eliminarEstampado(index) {
  productoCliente.value.Estampados.splice(index, 1)
}
</script>

<style scoped>
/* Estilos específicos para este componente */
.bg-cover {
  background-size: cover;
  background-repeat: no-repeat;
}

/* Ajuste de tamaño del contenedor principal */
.max-w-xl {
  max-width: 800px;
  margin: 0 auto;
}

/* Estilo adicional para pantallas grandes */
@media (min-width: 768px) {
  .max-w-xl {
    padding: 20px;
  }
}

.main-banner {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #f5f0f0;
  color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.logo-banner {
  max-width: 100px;
  border-radius: 50%;
  border: 4px solid rgb(255, 255, 255);
  object-fit: cover;
}

.actions-container {
  display: flex;
  align-items: center;
}

.login-button {
  background: none;
  border: none;
  color: #000000;
  font-size: 1rem;
  cursor: pointer;
  margin-right: 20px;
}

.carrito-button {
  background: none;
  border: none;
  color: #000;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.cart-icon {
  width: 24px;
  height: 24px;
}

/* Sidebar del carrito */
.cart-sidebar {
  position: fixed;
  top: 0;
  right: -300px;
  width: 300px;
  height: 100%;
  background-color: white;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.2);
  overflow-y: auto;
  transition: right 0.3s ease-in-out;
  z-index: 1000;
}

.cart-sidebar.is-open {
  right: 0;
}

.cart-sidebar-content {
  padding: 20px;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: transparent;
  border: none;
  font-size: 18px;
  cursor: pointer;
}

.cart-item {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.cart-item-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  margin-right: 10px;
}

.cart-item-info {
  flex: 1;
}

.cart-item-info h4 {
  margin: 0 0 5px;
  font-size: 16px;
}

@media (max-width: 600px) {
  .main-banner {
    flex-direction: column;
    background-color: #ddd;
  }

  .actions-container {
    margin-top: 10px;
  }
}

.footer {
  width: 100%;
  background-color: #333;
  color: #fff;
  padding: 20px;
  display: flex;
  justify-content: center;
  gap: 20px;
}

.footer a {
  color: #fff;
  text-decoration: none;
  font-weight: bold;
}

.footer a:hover {
  text-decoration: underline;
}
</style>

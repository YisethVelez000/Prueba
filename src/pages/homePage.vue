<template>
  <div class="home-page">
    <!-- Banner principal con logotipo a la izquierda y carrito a la derecha -->
    <header class="main-banner">
      <img src="./../../public/logo de dosi.jpg" alt="Logo del software" class="logo-banner" />
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
            <img :src="product.image" alt="Imagen del producto" class="cart-item-image" />
            <div class="cart-item-info">
              <h4>{{ product.name }}</h4>
              <p>{{ product.price }} x {{ product.quantity }}</p>
              <p>Total: {{ product.price * product.quantity }}</p>
            </div>
          </div>
        </div>
        <div v-else>
          <p>El carrito está vacío</p>
        </div>
      </div>
    </div>

    <!-- Sección de Novedades con carrusel -->
    <section class="novedades-section">
      <VaCarousel v-model="value" :items="items" :ratio="16 / 12" stateful autoscroll />
    </section>

    <!-- Sección de productos -->
    <div class="page-container">
      <div class="background">
        <div class="content-container">
          <div class="catalog">
            <div class="product-grid">
              <div v-for="product in products" :key="product.IdProducto" class="product-item">
                <VaCard class="product-card">
                  <div class="image-container">
                    <img
                      :src="getProductImage(product)"
                      :alt="product.NombreProductoCatalogo"
                      class="product-image"
                      @mouseover="zoomIn"
                      @mouseleave="zoomOut"
                    />
                  </div>
                  <div class="product-info">
                    <h3>{{ product.NombreProductoCatalogo }}</h3>
                    <p><strong>Precio: </strong>{{ product.PrecioProducto }}</p>
                  </div>
                  <RouterLink :to="{ name: 'productoCliente', params: { IdProducto: product.IdProducto } }">
                    <VaIcon name="edit" />
                  </RouterLink>
                </VaCard>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pie de página -->
    <footer class="footer">
      <RouterLink to="/about">Sobre nosotros</RouterLink>
      <RouterLink to="https://www.instagram.com/dlalys_dosii/">Contacto</RouterLink>
      <RouterLink to="/privacy">Política de privacidad</RouterLink>
    </footer>
  </div>
</template>

<script>
import axios from 'axios'
import { VaCarousel, VaCard, VaIcon } from 'vuestic-ui'

export default {
  components: {
    VaCarousel,
    VaCard,
    VaIcon,
  },
  data() {
    return {
      value: 0,
      items: [
        'https://images.pexels.com/photos/1937336/pexels-photo-1937336.jpeg',
        'https://images.pexels.com/photos/6461325/pexels-photo-6461325.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://crehana-blog.imgix.net/media/filer_public/01/f5/01f55d5e-1f4e-475f-9e87-5b917ad371c4/vinilo_textil.jpg?auto=format&q=50',
        'https://clarapatternstudio.com/wp-content/uploads/2022/05/que-es-serigrafia.jpeg',
        'https://tse1.mm.bing.net/th?id=OIP.W_9Y8BMzTsauzJNdf-CllwHaCy&pid=Api&P=0&h=180',
      ],
      products: [],
      cartProducts: [], // Productos en el carrito
      isCartOpen: false, // Estado del sidebar del carrito
    }
  },
  created() {
    this.fetchProducts()
    this.loadCart() // Cargar productos del carrito al crear el componente
  },
  methods: {
    async fetchProducts() {
      try {
        const response = await axios.get('https://apinodedvp.onrender.com/productos')
        console.log('Productos recibidos:', response.data)
        this.products = response.data
      } catch (error) {
        console.error('Error al obtener productos:', error)
      }
    },
    getProductImage(product) {
      if (product.Producto_Has_Imagens && product.Producto_Has_Imagens.length > 0) {
        return product.Producto_Has_Imagens[0].Imagen.Imagen
      }
      return 'https://via.placeholder.com/300' // Imagen por defecto si no hay ninguna
    },
    zoomIn(event) {
      const image = event.target
      image.style.transform = 'scale(1.1)'
      image.style.transition = 'transform 0.3s ease-in-out'
    },
    zoomOut(event) {
      const image = event.target
      image.style.transform = 'scale(1)'
    },
    irAlCarrito() {
      this.$router.push({ name: 'shopping-cart' })
    },
    irAllogin() {
      this.$router.push({ name: 'login' })
    },
    toggleCartSidebar() {
      this.isCartOpen = !this.isCartOpen
    },
    loadCart() {
      // Simular la carga de productos del carrito (puedes reemplazarlo con una llamada real a la API)
      const savedCartProducts = [
        {
          name: 'Producto 1',
          image: 'https://via.placeholder.com/150',
          price: 100,
          quantity: 2,
        },
        {
          name: 'Producto 2',
          image: 'https://via.placeholder.com/150',
          price: 150,
          quantity: 1,
        },
      ]
      this.cartProducts = savedCartProducts
    },
  },
}
</script>

<style scoped>
/* Sidebar del carrito */
.cart-sidebar {
  position: fixed;
  top: 0;
  right: -300px;
  width: 300px;
  height: 100%;
  background-color: #fff;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.5);
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
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  float: right;
}

.cart-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.cart-item-image {
  width: 50px;
  height: 50px;
  margin-right: 10px;
}

.cart-item-info {
  flex-grow: 1;
}

.home-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f7f7f7;
  color: #333;
  font-family: 'Open Sans', sans-serif;
}

.main-banner {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #f5f0f0;
  color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Agregar sombra para mejorar visibilidad */
}

.logo-banner {
  max-width: 100px;
  border-radius: 50%; /* Hacer que la imagen sea circular */
  border: 4px solid rgb(255, 255, 255); /* Borde azul para el círculo */
  object-fit: cover; /* Asegura que la imagen se ajuste bien al círculo */
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
  margin-right: 20px; /* Espacio entre los botones */
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

.intro-section {
  width: 80%;
  margin: 20px auto;
  padding: 20px;
  text-align: center;
  font-size: 1.5rem;
  color: #333;
  background-color: #fff;
  border-radius: 8px;
  border: 4px solid rgb(44, 44, 93); /* Agrega el borde azul */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-family: 'Playfair Display', serif; /* Aplica la fuente Playfair Display */
  line-height: 1.6; /* Aumenta el espaciado entre líneas */
}

.novedades-section {
  width: 80%;
  margin: 20px auto;
  /* Ajusta el alto del contenedor del carrusel */
  height: 500px; /* Cambia este valor según tus necesidades */
}

.va-carousel {
  width: 100%;
  height: 100%;
  /* Ajusta el tamaño del contenedor del carrusel */
}

.va-carousel img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Asegura que las imágenes llenen el contenedor sin distorsionarse */
  border-radius: 8px;
}

.carousel img {
  width: 100%;
  border-radius: 8px;
}

.page-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-image: url('https://img.freepik.com/foto-gratis/fondo_53876-32170.jpg?w=900&t=st=1723158687~exp=1723159287~hmac=ca7360f6388e32be58092afafa63e288d84316777a9651ab19c310a192076f95');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  padding: 20px;
  width: 100%;
}

.background {
  width: 100%;
  max-width: 1200px;
}

.content-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.catalog {
  width: 100%;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  justify-content: center;
}

.product-item {
  margin: 10px;
}

.product-card {
  background-color: rgba(232, 223, 223, 0.9);
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  height: 100%;
  border: 4px solid rgb(221, 221, 230); /* Borde azul */
}

.image-container {
  width: 100%;
  padding-top: 100%;
  position: relative;
  overflow: hidden;
}

.product-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease-in-out;
}

.product-info {
  padding: 10px;
  text-align: center;
}

.product-info h3 {
  font-size: 1.5rem;
  margin: 0 0 10px;
  font-weight: 500;
}

.product-info p {
  margin: 0 0 5px;
  font-size: 1rem;
}

.edit-button {
  position: absolute;
  top: 10px;
  right: 10px;
  color: #000;
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

.cart-icon {
  width: 24px;
  height: 24px;
}

@media (max-width: 600px) {
  .novedades-section {
    width: 100%;
  }

  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .main-banner {
    flex-direction: column;
    background-color: #ddd;
  }

  .actions-container {
    margin-top: 10px;
  }
}
</style>
}

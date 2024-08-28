<!-- eslint-disable prettier/prettier -->
<!-- src/components/NavBar.vue -->
<template>
  <nav class="navbar">
    <div class="navbar-container">
      <div class="navbar-logo">
        <img
          src="https://senacertificados.co/wp-content/uploads/2021/10/2090px-Sena_Colombia_logo.svg_-768x753.png"
          alt="Logo de la tienda"
        />
      </div>
      <div class="navbar-links">
        <div class="navbar-buttons">
          <button class="carrito-button" @click="irAlCarrito">
            Carrito de Productos
            <i class="fas fa-shopping-cart"></i>
            <!-- Puedes usar un icono aquí -->
          </button>
        </div>

        <!-- <RouterLink to="/auth">INICIAR SESIÓN</RouterLink> -->
        <!-- <RouterLink to="/register">REGISTRARSE</RouterLink> -->
      </div>
    </div>
  </nav>
</template>
<!-- eslint-disable prettier/prettier -->

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const irAlCarrito = () => {
  router.push({ name: 'shopping-cart' })
}
</script>
<!-- eslint-disable prettier/prettier -->
<style scoped>
.navbar {
  width: 100%;
  background-color: #fff;
  padding: 10px 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height: 68px;
}

.navbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar-logo img {
  max-width: 48px;
}

.navbar-links a {
  display: flex;
  margin-left: 20px;
  text-decoration: none;
  color: #333;
  font-weight: bold;
}

.navbar-links a:hover {
  color: #4838fa;
}

.navbar-buttons {
  display: flex;
  align-items: center;
}

.carrito-button {
  background: none;
  border: none;
  color: rgb(0, 0, 0);
  font-size: 1rem;
  cursor: pointer;
}

.carrito-button:hover {
  text-decoration: underline;
}

.fas.fa-shopping-cart {
  margin-left: 0.5rem;
}
</style>

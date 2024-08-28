<template>
  <div class="app-navbar-actions">
    <!-- Mostrar el nombre del usuario -->
    <span v-if="NombreUsuario">{{ NombreUsuario }}</span>
    <ProfileDropdown class="app-navbar-actions__item app-navbar-actions__item--profile mr-1" />
  </div>
</template>

<script lang="ts" setup>
import { jwtDecode } from 'jwt-decode'
import ProfileDropdown from './dropdowns/ProfileDropdown.vue'

// Define las propiedades del componente
defineProps({
  isMobile: { type: Boolean, default: false },
})

// Traemos el token del localstorage
const token = localStorage.getItem('token')

// Variable reactiva para el nombre de usuario
let NombreUsuario = ''

// Si el token existe, lo decodificamos y guardamos el nombre del usuario
if (token) {
  const decoded = jwtDecode(token) as any
  NombreUsuario = decoded.Nombre || ''
  localStorage.setItem('NombreUsuario', NombreUsuario)
  console.log('NombreUsuario', NombreUsuario, decoded)
}
</script>

<style lang="scss">
.app-navbar-actions {
  display: flex;
  align-items: center;

  .va-dropdown__anchor {
    color: var(--va-primary);
    fill: var(--va-primary);
  }

  &__item {
    padding: 0;
    margin-left: 0.25rem;
    margin-right: 0.25rem;

    svg {
      height: 20px;
    }

    &--profile {
      display: flex;
      justify-content: center;
    }

    .va-dropdown-content {
      background-color: var(--va-white);
    }

    @media screen and (max-width: 640px) {
      margin-left: 0;
      margin-right: 0;

      &:first-of-type {
        margin-left: 0;
      }
    }
  }

  .fa-github {
    color: var(--va-on-background-primary);
  }
}
</style>

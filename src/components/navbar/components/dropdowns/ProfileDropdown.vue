<template>
  <div class="profile-dropdown-wrapper">
    <VaDropdown v-model="isShown" :offset="[9, 0]" class="profile-dropdown" stick-to-edges>
      <template #anchor>
        <VaButton preset="secondary" color="textPrimary">
          <span class="profile-dropdown__anchor flex items-center">
            <slot />
            <VaIcon name="mso-arrow_drop_down person" class="ml-2 text-lg text-secondary" />
          </span>
        </VaButton>
      </template>
      <VaDropdownContent
        class="profile-dropdown__content rounded-lg shadow-lg bg-white"
        :style="{ '--hover-color': hoverColor }"
      >
        <VaList>
          <header class="uppercase text-secondary opacity-80 font-semibold text-xs px-4 mb-2">Opciones</header>
          <VaListItem class="profile-dropdown__item px-4 py-2" @click="Perfil">
            <VaIcon name="mso-person_outline" class="mr-3 text-secondary" />
            Perfil
          </VaListItem>
          <VaListItem class="profile-dropdown__item px-4 py-2" @click="CerrarSesion">
            <VaIcon name="mso-exit_to_app" class="mr-3 text-secondary" />
            Cerrar Sesión
          </VaListItem>
        </VaList>
      </VaDropdownContent>
    </VaDropdown>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useColors, VaListItem } from 'vuestic-ui'
import router from '../../../../router'

const { colors, setHSLAColor } = useColors()
const hoverColor = computed(() => setHSLAColor(colors.focus, { a: 0.1 }))

const isShown = ref(false)

const CerrarSesion = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('nombre')
  router.push({ name: 'home' })
}

const Perfil = () => {
  router.push({ name: 'perfil' })
}
</script>

<style lang="scss">
.profile-dropdown {
  cursor: pointer;

  &__content {
    min-width: 12rem;
    border-radius: 0.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    background-color: #fff;
  }

  &__anchor {
    display: flex;
    align-items: center;
    font-weight: 600;
  }

  &__item {
    transition: background-color 0.2s ease;
    display: flex;
    align-items: center;

    &:hover {
      background-color: var(--hover-color);
      border-radius: 0.25rem;
    }

    .va-icon {
      font-size: 1.25rem;
    }
  }
}
</style>

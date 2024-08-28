<template>
  <VaForm ref="form" @submit.prevent="submit">
    <h1 class="font-semibold text-4xl mb-4">Iniciar Sesión</h1>
    <p class="text-base mb-4 leading-5">
      ¿No tienes una cuenta?
      <RouterLink :to="{ name: 'signup' }" class="font-semibold text-primary"> Regístrate </RouterLink>
    </p>
    <VaInput
      v-model="formData.CorreoElectronico"
      :rules="[
        (v: any) => !!v || 'El campo correo electronico es requerido',
        (v: string) => /.+@.+\..+/.test(v) || 'El correo electronico no es valido',
      ]"
      class="mb-4"
      label="Correo Electrónico"
      type="email"
    />
    <VaValue v-slot="isPasswordVisible" :default-value="false">
      <VaInput
        v-model="formData.Contrasena"
        :rules="[(v: any) => !!v || 'La contraseña es requerida']"
        :type="isPasswordVisible.value ? 'text' : 'password'"
        class="mb-4"
        label="Contraseña"
        @clickAppendInner.stop="isPasswordVisible.value = !isPasswordVisible.value"
      >
        <template #appendInner>
          <VaIcon
            :name="isPasswordVisible.value ? 'mso-visibility_off' : 'mso-visibility'"
            class="cursor-pointer"
            color="secondary"
          />
        </template>
      </VaInput>
    </VaValue>

    <div class="auth-layout__options flex flex-col sm:flex-row items-start sm:items-center justify-between">
      <RouterLink :to="{ name: 'recover-password' }" class="mt-2 sm:mt-0 sm:ml-1 font-semibold text-primary">
        ¿Olvidaste tu contraseña?
      </RouterLink>
    </div>

    <div class="flex justify-center mt-4">
      <VaButton class="w-full" @click="submit"> Iniciar Sesion</VaButton>
    </div>
  </VaForm>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useForm, useToast } from 'vuestic-ui'
import { jwtDecode } from 'jwt-decode'

const { validate } = useForm('form')
const { push } = useRouter()
const { init } = useToast()

const formData = reactive({
  CorreoElectronico: '',
  Contrasena: '',
})

//Link del api https://apinodedvp.onrender.com/usuarios/login
const submit = () => {
  if (validate()) {
    console.log(formData)
    fetch('https://apinodedvp.onrender.com/usuarios/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        CorreoElectronico: formData.CorreoElectronico,
        Contrasena: formData.Contrasena,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error al iniciar sesión. Contraseña o correo incorrecto.')
        }
        return response.json()
      })
      .then((data) => {
        init({
          message: 'Inicio de sesión exitoso',
          color: 'success',
        })
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        const decoded: any = jwtDecode(data.token)
        localStorage.setItem('NombreUsuario', decoded.Nombre)
        localStorage.setItem('IdUsuario', decoded.IdUsuario)
        console.log(localStorage.getItem('NombreUsuario'))
        //Enviamos el  nombre del usuario al navbar para mostrarlo
        push({ name: 'dashboard' })

        // Redireccionar a la pagina de inicio
        //Tomamos el nombre del token y lo guardamos en la variable NombreUsuario para mostrarlo en el navbar
        localStorage.setItem('NombreUsuario', decoded.Nombre)
        //El token se guarda en el localstorage
        localStorage.setItem('token', data.token)
        push({ name: 'dashboard' })
      })
      .catch((error) => {
        console.error('Error:', error)
        init({
          message: 'Error al iniciar sesión. Contraseña o correo incorrecto',
          color: 'danger',
        })
      })
  }
}
</script>

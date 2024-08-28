<script setup lang="ts">
import { VaCardContent, VaInput } from 'vuestic-ui/web-components'
import { onMounted, ref } from 'vue'
import { jwtDecode } from 'jwt-decode'
import { ObtenerUsuarioPorId } from '../data/pages/pedidosventas'

// Traemos el token del local storage
const token = localStorage.getItem('token')

// Variable reactiva para el IdUsuario
let IdUsuario = ''

// Si el token existe, lo decodificamos y guardamos el idUsuario
if (token) {
  const decoded = jwtDecode(token) as any
  IdUsuario = decoded.idUsuario || ''
  console.log('Id del usuario ', IdUsuario)
}

// Traemos el usuario por el id
const usuario = ObtenerUsuarioPorId(Number(IdUsuario))
console.log('Usuario', usuario)

// Variable reactiva para el formulario
const formDataUsuario = ref({
  Nombre: '',
  Apellidos: '',
  CorreoElectronico: '',
  Telefono: '',
  Dirección: '',
  Fecha: '',
})

// Hacemos el onMounted para que se ejecute la función cuando se monte el componente
onMounted(async () => {
  // Asignamos los valores del usuario a los campos del formulario
  formDataUsuario.value.Nombre = (await usuario).Nombre
  formDataUsuario.value.Apellidos = (await usuario).Apellidos
  formDataUsuario.value.CorreoElectronico = (await usuario).CorreoElectronico
  formDataUsuario.value.Fecha = (await usuario).FechaNacimiento
})

const submit = () => {
  // Lógica para enviar el formulario
}
</script>

<template>
  <h2 class="text-xl font-semibold mb-4">Mi Perfil</h2>
  <VaCard>
    <VaCardContent>
      <div class="self-stretch flex-col justify-start items-start gap-4 flex">
        <div class="flex gap-4 flex-col sm:flex-row w-full">
          <VaInput
            v-model="formDataUsuario.Nombre"
            :rules="[(v: any) => !!v || 'El nombre es requerido']"
            class="mb-4"
            label="Nombre"
          />
          <VaInput
            v-model="formDataUsuario.Apellidos"
            :rules="[(v: any) => !!v || 'Los apellidos son requeridos']"
            class="mb-4"
            label="Apellidos"
          />
        </div>
        <VaInput
          v-model="formDataUsuario.CorreoElectronico"
          :rules="[
            (v: any) => !!v || 'El campo correo electronico es requerido',
            (v: string) => /.+@.+\..+/.test(v) || 'El correo electronico no es valido',
          ]"
          class="mb-4"
          label="Correo Electrónico"
          type="email"
        />
        <div class="flex gap-4 flex-col sm:flex-row w-full">
          <VaInput
            v-model="formDataUsuario.Fecha"
            :rules="[(v: any) => !!v || 'La fecha de nacimiento es requerida']"
            class="mb-4"
            label="Fecha de Nacimiento"
            type="date"
          />
        </div>
        <!-- Mostrar estos campos solo si mostrarCamposAdicionales es true -->
        <div class="flex gap-4 flex-col sm:flex-row w-full">
          <VaInput
            v-model="formDataUsuario.Telefono"
            :rules="[
              (v: any) => !!v || 'El Télefono es requerido',
              (v: string) => /^[0-9]*$/.test(v) || 'El Télefono no es valido',
            ]"
            class="mb-4"
            label="Telefono"
          />
          <VaInput
            v-model="formDataUsuario.Direccion"
            :rules="[(v: any) => !!v || 'La Dirección es requerida']"
            class="mb-4"
            label="Direccion"
          />
        </div>

        <div class="flex justify-center mt-4">
          <VaButton class="w-full" @click="submit">Actualizar</VaButton>
        </div>
      </div>
    </VaCardContent>
  </VaCard>
</template>

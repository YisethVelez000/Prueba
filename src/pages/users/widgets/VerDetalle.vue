<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from 'vuestic-ui'
import { Usuario, Rol } from '../types'
import { ObtenerUsuarioPorId } from '../../../data/pages/users'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'

const usuario = ref<Usuario>({
  IdUsuario: -1,
  Nombre: '',
  Apellidos: '',
  TipoDocumento: '',
  NumeroDocumento: '',
  CorreoElectronico: '',
  Contrasena: '',
  IdRol: 0,
  EstadoUsuario: 'Activo',
  FechaNacimiento: new Date().toISOString(),
  FechaInicio: new Date().toISOString(),
  FechaFinalizacion: new Date().toISOString(),
})

const roles = ref<Rol[]>([])

const close = () => {
  router.push('/users')
}

const { init: notify } = useToast()
const router = useRouter()
const route = useRoute()
const showSuccessAlert = ref(false)

onMounted(async () => {
  const Id = route.query.id
  console.log('ID de la ruta:', Id)

  let IdUsuario = Id?.toString()
  if (Array.isArray(IdUsuario)) {
    IdUsuario = IdUsuario[0]
  }

  console.log('ID del usuario:', IdUsuario)
  if (IdUsuario) {
    try {
      const usuarioData = await ObtenerUsuarioPorId(IdUsuario.toString())
      console.log('Datos del usuario:', usuarioData)

      usuario.value = usuarioData
      await cargarRoles() // Cargar roles después de obtener el usuario
      actualizarRolNombre()
    } catch (error) {
      console.error('Error al cargar el usuario:', error)
    }
  }
})

const cargarRoles = async () => {
  try {
    const response = await axios.get('https://apinodedvp.onrender.com/roles')
    roles.value = response.data
    console.log('Roles cargados:', roles.value)
  } catch (error) {
    console.error('Error al cargar los roles:', error)
  }
}

const actualizarRolNombre = () => {
  const rol = roles.value.find((r) => r.IdRol === usuario.value.IdRol)
  if (rol) {
    usuario.value.IdRol = rol.Nombre
  } else {
    usuario.value.IdRol = 'Rol no encontrado'
  }
}
</script>

<template>
  <h2 class="text-xl font-semibold mb-4">Detalle Usuario</h2>
  <VaCard>
    <VaCardContent>
      <VaForm
        ref="edit-user-form"
        class="flex-col justify-start items-start gap-4 inline-flex w-full"
        autocomplete="off"
      >
        <div class="self-stretch flex-col justify-start items-start gap-4 flex">
          <div class="flex gap-4 flex-col sm:flex-row w-full">
            <VaInput
              v-model="usuario.Nombre"
              label="Nombre"
              placeholder="Nombre"
              class="w-full sm:w-1/2"
              autocomplete="off"
              :rules="[
                (v: any) => !!v || 'El nombre es requerido',
                (v: any) => (v && v.length <= 50) || 'El nombre no puede tener más de 50 caracteres',
                (v: string | any[]) => (v && v.length >= 3) || 'El nombre no puede tener menos de 3 caracteres',
                (v: any) => /^[a-zA-Z\s]*$/.test(v) || 'El nombre no puede contener números ni caracteres especiales',
              ]"
              readonly
            />
            <VaInput
              v-model="usuario.Apellidos"
              label="Apellidos"
              placeholder="Apellidos"
              class="w-full sm:w-1/2"
              autocomplete="off"
              :rules="[
                (v: any) => !!v || 'Los apellidos son requeridos',
                (v: any) => (v && v.length <= 50) || 'Los apellidos no pueden tener más de 50 caracteres',
                (v: any) => (v && v.length >= 3) || 'Los apellidos no pueden tener menos de 3 caracteres',
                (v: string) =>
                  /^[a-zA-Z\s]*$/.test(v) || 'Los apellidos no pueden contener números ni caracteres especiales',
              ]"
              readonly
            />
          </div>
          <div class="flex gap-4 flex-col sm:flex-row w-full">
            <VaSelect
              v-model="usuario.TipoDocumento"
              label="Tipo de Documento"
              placeholder="Elija un tipo de documento"
              class="w-full sm:w-1/2"
              :options="[
                { text: 'Cédula de Ciudadanía', value: 'Cédula de Ciudadanía' },
                { text: 'Cédula de Extranjeria', value: 'Cédula de Extranjeria' },
                { text: 'Pasaporte', value: 'Pasaporte' },
                { text: 'Tarjeta de Identidad', value: 'Tarjeta de Identidad' },
              ]"
              readonly
              :rules="[(v: any) => !!v || 'El tipo de documento es requerido']"
            />
            <VaInput
              v-model="usuario.NumeroDocumento"
              label="Número de Documento"
              placeholder="Número de Documento"
              class="w-full sm:w-1/2"
              :rules="[
                (v: any) => !!v || 'El número de documento es requerido',
                (v: string | any[]) =>
                  (v && v.length <= 50) || 'El número de documento no puede tener más de 50 caracteres',
                (v: string | any[]) =>
                  (v && v.length >= 3) || 'El número de documento no puede tener menos de 3 caracteres',
                (v: string) => /^[0-9]*$/.test(v) || 'El número de documento solo puede contener números',
              ]"
              readonly
            />
          </div>
          <VaInput
            v-model="usuario.CorreoElectronico"
            label="Correo Electrónico"
            placeholder="Correo Electrónico"
            class="w-full"
            :rules="[
              (v: any) => !!v || 'El correo electrónico es requerido',
              (v: string) => /.+@.+\..+/.test(v) || 'El correo electrónico debe ser válido',
            ]"
            readonly
          />
        </div>
        <div class="flex gap-4 flex-col sm:flex-row w-full">
          <VaInput
            v-model="usuario.IdRol"
            label="Rol"
            placeholder="Rol"
            class="w-full sm:w-1/2"
            :rules="[(v: any) => !!v || 'El rol es requerido']"
            readonly
          />
          <VaSelect
            v-model="usuario.EstadoUsuario"
            label="Estado del Usuario"
            placeholder="Elija un estado"
            readonly
            class="w-full sm:w-1/2"
            :options="['Activo', 'Inactivo']"
            :rules="[(v: any) => !!v || 'El estado del usuario es requerido']"
          />
        </div>
        <div class="flex gap-4 flex-col sm:flex-row w-full">
          <VaInput
            v-model="usuario.FechaNacimiento"
            label="Fecha de Nacimiento"
            placeholder="Fecha de Nacimiento"
            type="date"
            readonly
            class="w-full"
            :rules="dateRules"
          />
        </div>
        <div class="flex gap-4 flex-col sm:flex-row w-full">
          <VaInput
            v-model="usuario.FechaInicio"
            label="Fecha de Inicio"
            placeholder="Fecha de Inicio"
            type="date"
            class="w-full sm:w-1/2"
            :rules="dateRulesFechaInicio"
            readonly
          />
          <VaInput
            v-model="usuario.FechaFinalizacion"
            label="Fecha de Finalización"
            placeholder="Fecha de Finalización"
            type="date"
            class="w-full sm:w-1/2"
            :rules="dateRulesFechaFinalizacion"
            readonly
          />
        </div>
        <div class="flex justify-end gap-4 w-full">
          <VaButton preset="secondary" color="secondary" @click="close">Cancelar</VaButton>
        </div>
      </VaForm>
    </VaCardContent>
  </VaCard>
</template>

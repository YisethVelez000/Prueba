<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Usuario } from '../types'
import { ObtenerUsuarioPorId, updateUser } from '../../../data/pages/users'
import { useRouter, useRoute } from 'vue-router'

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
  FechaFinalizacion: new Date().toISOString(),
  FechaInicio: new Date().toISOString(),
})

const roles = ref<Array<{ IdRol: number; Nombre: string }>>([])

const onSave = async () => {
  try {
    const UsuarioParaGuardar = {
      IdUsuario: usuario.value.IdUsuario,
      Nombre: usuario.value.Nombre,
      Apellidos: usuario.value.Apellidos,
      TipoDocumento: usuario.value.TipoDocumento,
      NumeroDocumento: usuario.value.NumeroDocumento,
      CorreoElectronico: usuario.value.CorreoElectronico,
      Contrasena: usuario.value.Contrasena,
      IdRol: usuario.value.IdRol,
      EstadoUsuario: usuario.value.EstadoUsuario,
      FechaNacimiento: usuario.value.FechaNacimiento,
      FechaInicio: usuario.value.FechaInicio,
      FechaFinalizacion: usuario.value.FechaFinalizacion,
    }

    await updateUser(UsuarioParaGuardar)
    router.push('/users')
  } catch (error) {
    console.error('Error al guardar el usuario:', error)
  }
}

const close = () => {
  router.push('/users')
}

const router = useRouter()
const route = useRoute()

onMounted(async () => {
  const Id = route.query.id
  let IdUsuario = Id?.toString()
  if (Array.isArray(IdUsuario)) {
    IdUsuario = IdUsuario[0]
  }

  if (IdUsuario) {
    try {
      const usuarioData = await ObtenerUsuarioPorId(IdUsuario.toString())
      usuario.value = {
        IdUsuario: usuarioData.IdUsuario,
        Nombre: usuarioData.Nombre,
        Apellidos: usuarioData.Apellidos,
        TipoDocumento: usuarioData.TipoDocumento,
        NumeroDocumento: usuarioData.NumeroDocumento,
        CorreoElectronico: usuarioData.CorreoElectronico,
        Contrasena: usuarioData.Contrasena,
        IdRol: usuarioData.IdRol,
        EstadoUsuario: usuarioData.EstadoUsuario,
        FechaNacimiento: usuarioData.FechaNacimiento,
        FechaInicio: usuarioData.FechaInicio,
        FechaFinalizacion: usuarioData.FechaFinalizacion,
      }
    } catch (error) {
      console.error('Error al cargar el usuario:', error)
    }
  }

  try {
    const response = await fetch('https://apinodedvp.onrender.com/roles')
    if (response.ok) {
      roles.value = await response.json()
    } else {
      console.error('Error al obtener los roles')
    }
  } catch (error) {
    console.error('Error al cargar los roles:', error)
  }
})
</script>
<template>
  <h2 class="text-xl font-semibold mb-4">Editar Usuario</h2>
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
                //Validamos que el nombre no contenga espacio en blancon al inicio y al final
                (v: any) => v.trim().length > 0 || 'El nombre no puede contener solo espacios en blanco',
                (v: string) =>
                  /^[^\s]+(\s+[^\s]+)*$/.test(v) || 'El nombre no puede tener espacios en blanco al inicio ni al final',
              ]"
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
                (v: any) => v.trim().length > 0 || 'El nombre no puede contener solo espacios en blanco',
                (v: string) =>
                  /^[^\s]+(\s+[^\s]+)*$/.test(v) || 'El nombre no puede tener espacios en blanco al inicio ni al final',
              ]"
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
                (v: any) => v.trim().length > 0 || 'El nombre no puede contener solo espacios en blanco',
                (v: string) =>
                  /^[^\s]+(\s+[^\s]+)*$/.test(v) || 'El nombre no puede tener espacios en blanco al inicio ni al final',
              ]"
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
              (v: any) => v.trim().length > 0 || 'El nombre no puede contener solo espacios en blanco',
              (v: string) =>
                /^[^\s]+(\s+[^\s]+)*$/.test(v) || 'El nombre no puede tener espacios en blanco al inicio ni al final',
            ]"
          />
          <div class="flex gap-4 flex-col sm:flex-row w-full">
            <VaSelect
              v-model="usuario.EstadoUsuario"
              label="Estado del Usuario"
              placeholder="Elija un estado"
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
              class="w-full sm:w-1/2"
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
            />
            <VaInput
              v-model="usuario.FechaFinalizacion"
              label="Fecha de Finalización"
              placeholder="Fecha de Finalización"
              type="date"
              class="w-full sm:w-1/2"
              :rules="dateRulesFechaFinalizacion"
            />
          </div>
          <div class="self-stretch flex-col justify-start items-start gap-4 flex">
            <!-- Otros campos del formulario -->
            <div class="form-group">
              <label for="roles" class="form-label">Rol</label>
              <select id="roles" v-model="usuario.IdRol" name="roles" class="form-control" required>
                <option value="" disabled selected>Elija un rol</option>
                <option v-for="rol in roles" :key="rol.IdRol" :value="rol.IdRol">
                  {{ rol.Nombre }}
                </option>
              </select>
            </div>
          </div>
          <div class="flex justify-end gap-4 w-full">
            <VaButton preset="secondary" color="secondary" @click="close">Cancelar</VaButton>
            <VaButton @click="onSave">Guardar</VaButton>
          </div>
        </div>
      </VaForm>
    </VaCardContent>
  </VaCard>
</template>
<style>
.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  color: #154ec1; /* Azul */
  font-size: 9px;
  line-height: 14px;
  letter-spacing: 0.4px;
  min-height: 14px;
  font-weight: bold;
}

.form-control {
  display: block;
  width: 100%;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  line-height: 1.5;
  color: #495057;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  transition:
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
}

.form-control:focus {
  border-color: #2563eb;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(37, 99, 235, 0.25);
}

.va-select.va-input {
  background-color: #f9fafb;
  border-radius: 8px;
}
</style>

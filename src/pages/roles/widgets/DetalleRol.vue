<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Rol, Permiso } from '../types'
import { ObtenerRolPorId } from '../../../data/pages/roles'

// Usamos el router
const router = useRouter()
const route = useRoute()

// Creamos una variable reactiva para almacenar el rol
const rol = ref<Rol>({
  IdRol: 0,
  Nombre: '',
  Descripcion: '',
  permisos: [], // Inicializamos como un array vacío para evitar problemas si no hay permisos
  length: 0,
})

// Creamos el onMounted para obtener el rol por id
onMounted(async () => {
  const id = route.query.id as string
  if (id) {
    try {
      // Obtiene la respuesta de la API
      const response = await ObtenerRolPorId(parseInt(id))

      // Verifica que la respuesta no sea nula y sea un array
      if (Array.isArray(response)) {
        const permisosMap = new Map<number, Permiso>()

        // Agrupamos los permisos y privilegios
        response.forEach((item: any) => {
          const { permiso, privilegio } = item

          // Asegúrate de que permiso exista en el mapa
          if (!permisosMap.has(permiso.IdPermiso)) {
            permisosMap.set(permiso.IdPermiso, {
              IdPermiso: permiso.IdPermiso,
              Nombre: permiso.Nombre,
              Descripcion: permiso.Descripcion,
              privilegios: [], // Inicializa privilegios como un array vacío
            })
          }

          // Agrega el privilegio al permiso correspondiente
          const existingPermiso = permisosMap.get(permiso.IdPermiso)
          if (existingPermiso && existingPermiso.privilegios) {
            existingPermiso.privilegios.push(privilegio)
          }
        })

        // Asignar valores al objeto rol
        rol.value.IdRol = response[0]?.IdRol || 0
        rol.value.Nombre = response[0]?.Rol.Nombre // Ajusta según corresponda
        rol.value.Descripcion = response[0]?.Rol.Descripcion || 'Descripción del Rol' // Ajusta según corresponda
        rol.value.permisos = Array.from(permisosMap.values())
      } else {
        console.warn('La respuesta no es un array o está vacía.')
      }

      // Verifica el estado después de asignar
      console.log('Estado de rol después de asignar:', rol.value)
    } catch (error) {
      console.error('Error al obtener el rol:', error)
    }
  }
})

// Creamos una función que nos devuelva a la vista de roles
const OnClose = () => {
  router.push('/roles')
}
</script>
<template>
  <div>
    <h1 class="page-title">Detalle del Rol</h1>
    <VaCard>
      <VaCardContent>
        <div class="flex flex-col md:flex-row gap-2 mb-2 justify-between">
          <div class="flex flex-col md:flex-row gap-2 justify-start">
            <VaInput v-model="rol.Nombre" placeholder="" readonly />
            <VaInput v-model="rol.Descripcion" placeholder="Descripcion" readonly />
          </div>
        </div>
        <div>
          <h3>Permisos y Privilegios:</h3>
          <table class="w-full border-collapse">
            <thead>
              <tr>
                <th class="border px-4 py-2">Nombre del Permiso</th>
                <th class="border px-4 py-2">Privilegios</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="permiso in rol.permisos" :key="permiso.IdPermiso">
                <td class="border px-4 py-2">{{ permiso.Nombre }}</td>
                <td class="border px-4 py-2">
                  <ul>
                    <!-- Mensaje en caso de que no haya privilegios -->
                    <li v-if="!permiso.privilegios || permiso.privilegios.length === 0">
                      No hay privilegios disponibles.
                    </li>
                    <!-- Itera sobre privilegios solo si existen -->
                    <li v-for="privilegio in permiso.privilegios" :key="privilegio.IdPrivilegio">
                      {{ privilegio.Nombre }}
                    </li>
                  </ul>
                </td>
              </tr>
              <tr v-if="rol.permisos?.length === 0">
                <td colspan="2" class="border px-4 py-2 text-center">No hay permisos disponibles.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </VaCardContent>
      <VaCardActions>
        <VaButton @click="OnClose">Cerrar</VaButton>
      </VaCardActions>
    </VaCard>
  </div>
</template>

/* eslint-disable prettier/prettier */
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import AuthLayout from '../layouts/AuthLayout.vue'
import AppLayout from '../layouts/AppLayout.vue'
import RouteViewComponent from '../layouts/RouterBypass.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/:pathMatch(.)',
    redirect: { name: 'dashboard' },
  },
  {
    name: 'admin',
    path: '/',
    component: AppLayout,
    redirect: { name: 'home' },
    children: [
      {
        name: 'dashboard',
        path: 'dashboard',
        component: () => import('../pages/admin/dashboard/Dashboard.vue'),
      },
      {
        name: 'shopping-cart',
        path: 'shopping-cart',
        component: () => import('../components/CartSidebar.vue'),
      },
      {
        name: 'settings',
        path: 'settings',
        component: () => import('../pages/settings/Settings.vue'),
      },
      {
        name: 'preferences',
        path: 'preferences',
        component: () => import('../pages/preferences/Preferences.vue'),
      },
      {
        name: 'users',
        path: 'users',
        component: () => import('../pages/users/UsersPage.vue'),
      },
      {
        name: 'gestionar-usuarios',
        path: 'users',
        component: RouteViewComponent,
        children: [
          {
            name: 'nuevo-usuario',
            path: 'nuevo',
            component: () => import('../pages/users/widgets/RegistrarUsuario..vue'),
          },
          {
            name: 'editar-usuario',
            path: 'editar/:IdUsuario',
            component: () => import('../pages/users/widgets/EditUserForm.vue'),
          },
          {
            name: 'detalle-usuario',
            path: 'detalle/:IdUsuario',
            component: () => import('../pages/users/widgets/VerDetalle.vue'),
          },
        ],
      },
      {
        name: 'clientes',
        path: 'clientes',
        component: () => import('../pages/clientes/ClientesPage.vue'),
      },
      {
        name: 'gestionar-clientes',
        path: 'clientes',
        component: RouteViewComponent,
        children: [
          {
            name: 'agregar-cliente',
            path: 'agregar',
            component: () => import('../pages/clientes/widgets/RegistrarCliente.vue'),
          },
          {
            name: 'editar-cliente',
            path: 'editar/:id',
            component: () => import('../pages/clientes/widgets/EditarCliente.vue'),
          },
          {
            name: 'detalle-cliente',
            path: 'detalle/:id',
            component: () => import('../pages/clientes/widgets/DetalleCliente.vue'),
          },
        ],
      },
      {
        name: 'produccion',
        path: 'produccion',
        component: () => import('../pages/produccion/produccionPage.vue'),
      },
      {
        name: 'gestionar-produccion',
        path: 'produccion',
        component: RouteViewComponent,
        children: [
          {
            name: 'nueva-produccion',
            path: 'nueva',
            component: () => import('../pages/produccion/widgets/RegistrarProduccion.vue'),
          },
          {
            name: 'editar-produccion',
            path: 'editar/:IdProduccion',
            component: () => import('../pages/produccion/widgets/EditarProduccion.vue'),
          },
          {
            name: 'detalle-produccion',
            path: 'detalle/:IdProduccion',
            component: () => import('../pages/produccion/widgets/DetalleProduccion.vue'),
          },
        ],
      },
      {
        name: 'roles',
        path: 'roles',
        component: () => import('../pages/roles/RolesPage.vue'),
      },
      {
        name: 'gestionar-roles',
        path: 'roles',
        component: RouteViewComponent,
        children: [
          {
            name: 'agregar-rol',
            path: 'agregar',
            component: () => import('../pages/roles/widgets/CrearRol.vue'),
          },
          {
            name: 'editar-rol',
            path: 'editar/:IdRol',
            component: () => import('../pages/roles/widgets/EditarRol.vue'),
          },
          {
            name: 'detalle-rol',
            path: 'detalle/:IdRol',
            component: () => import('../pages/roles/widgets/DetalleRol.vue'),
          },
        ],
      },
      {
        name: 'proveedores',
        path: 'proveedores',
        component: () => import('../pages/proveedores/ProveedoresPage.vue'),
      },
      {
        name: 'insumos',
        path: 'insumos',
        component: () => import('../pages/insumos/InsumosPage.vue'),
      },
      {
        name: 'compras',
        path: 'compras',
        component: () => import('../pages/compras/ComprasPage.vue'),
      },
      {
        name: 'estampados',
        path: 'estampados',
        component: () => import('../pages/estampados/EstampadosPage.vue'),
      },
      {
        name: 'productos',
        path: 'productos',
        component: () => import('../pages/productos/ProductosPage.vue'),
      },
      {
        name: 'parametrizacion',
        path: 'parametrizacion',
        component: () => import('../pages/parametrizacion/ParametrizacionPage.vue'),
      },
      {
        name: 'ubicaciones',
        path: 'ubicaciones',
        component: () => import('../pages/ubicaciones/UbicacionesPage.vue'),
      },
      {
        name: 'fichas',
        path: 'fichas',
        component: () => import('../../src/pages/fichatecnica/FichatecnicaPage.vue'),
      },
      {
        name: 'colores',
        path: 'colores',
        component: () => import('../../src/pages/colores/coloresPage.vue'),
      },
      {
        name: 'terciarias',
        path: 'terciarias',
        component: () => import('../pages/terciarias/TerciariasPage.vue'),
      },
      {
        name: 'pedidosventas',
        path: 'pedidosventas',
        component: () => import('../pages/pedidosventas/PedidosVentas.vue'),
      },
      {
        name: 'ventas',
        path: 'ventas',
        component: () => import('../pages/pedidosventas/ventas.vue'),
      },
      {
        name: 'projects',
        path: 'projects',
        component: () => import('../pages/projects/ProjectsPage.vue'),
      },
      {
        name: 'payments',
        path: '/payments',
        component: RouteViewComponent,
        children: [
          {
            name: 'payment-methods',
            path: 'payment-methods',
            component: () => import('../pages/payments/PaymentsPage.vue'),
          },
          {
            name: 'billing',
            path: 'billing',
            component: () => import('../pages/billing/BillingPage.vue'),
          },
          {
            name: 'pricing-plans',
            path: 'pricing-plans',
            component: () => import('../pages/pricing-plans/PricingPlans.vue'),
          },
        ],
      },
      {
        name: 'faq',
        path: '/faq',
        component: () => import('../pages/faq/FaqPage.vue'),
      },
      {
        path: '/insumos/editar/:IdInsumo',
        name: 'EditarInsumo',
        component: () => import('../pages/insumos/widgets/EditarInsumo.vue'),
      },
      {
        path: '/insumos/detalle/:IdInsumo',
        name: 'DetalleInsumo',
        component: () => import('../pages/insumos/widgets/VisualizarInsumo.vue'),
      },
      {
        path: '/pedidos/editar/:NumeroPedido',
        name: 'EditarPedidosVentas',
        component: () => import('../pages/pedidosventas/widgets/EditarPedidosVentas.vue'),
      },
      {
        path: '/pedidos/detalle/:NumeroPedido',
        name: 'DetallePedidosVentas',
        component: () => import('../pages/pedidosventas/widgets/VisualizarPedidosVentas.vue'),
      },
      {
        name: 'gestionar-insumos',
        path: '/insumos',
        component: RouteViewComponent,
        children: [
          {
            name: 'nuevo-Insumo',
            path: 'nuevo', // Ajuste en el path
            component: () => import('../pages/insumos/widgets/RegistrarInsumo.vue'),
          },
        ],
      },
      {
        name: 'gestionar-pedidos',
        path: '/pedidosventas',
        component: RouteViewComponent,
        children: [
          {
            name: 'nuevo-Pedido',
            path: 'nuevo', // Ajuste en el path
            component: () => import('../pages/pedidosventas/widgets/RegistrarPedidosVentas.vue'),
          },
        ],
      },
      {
        path: 'proveedores/editar/:IdProveedor',
        name: 'EditarProveedor',
        component: () => import('../pages/proveedores/widgets/EditarProveedor.vue'),
      },
      {
        path: 'proveedores/detalle/:IdProveedor',
        name: 'DetalleProveedor',
        component: () => import('../pages/proveedores/widgets/VisualizarProveedor.vue'),
      },
      {
        name: 'gestionar-proveedores',
        path: 'proveedores',
        component: RouteViewComponent,
        children: [
          {
            name: 'nuevo-Proveedor',
            path: 'nuevo', // Ajuste en el path
            component: () => import('../pages/proveedores/widgets/RegistrarProveedor.vue'),
          },
        ],
      },
      {
        name: 'gestionar-estampados',
        path: 'estampados',
        component: RouteViewComponent,
        children: [
          {
            name: 'nuevo-estampado',
            path: 'nuevo',
            component: () => import('../pages/estampados/widgets/EstampadosForm.vue'),
          },
          {
            name: 'editar-estampado',
            path: 'editar/:IdEstampado',
            component: () => import('../pages/estampados/widgets/EditEstampado.vue'),
          },
          {
            name: 'detalle-estampado',
            path: 'detalle/:IdEstampado',
            component: () => import('../pages/estampados/widgets/verDetalleEstampado.vue'),
          },
        ],
      },
      {
        name: 'gestionar-parametrizacion',
        path: 'parametrizacion',
        component: RouteViewComponent,
        children: [
          {
            name: 'nuevo-parametrizacion',
            path: 'nuevo',
            component: () => import('../pages/parametrizacion/widgets/ParametrizacionForm.vue'),
          },
          {
            name: 'editar-parametrizacion',
            path: 'editar/:IdParametrizacion',
            component: () => import('../pages/parametrizacion/widgets/ParametrizacionEdit.vue'),
          },
          {
            name: 'detalle-parametrizacion',
            path: 'detalle/:IdParametrizacion',
            component: () => import('../pages/parametrizacion/widgets/VerDetalleParametrizacion.vue'),
          },
        ],
      },
      {
        name: 'gestionar-productos',
        path: 'productos',
        component: RouteViewComponent,
        children: [
          {
            name: 'nuevo-producto',
            path: 'nuevo',
            component: () => import('../pages/productos/widgets/ProductosForm.vue'),
          },
          {
            name: 'editar-producto',
            path: 'editar/:IdProducto',
            component: () => import('../pages/productos/widgets/EditProducto.vue'),
          },
          {
            name: 'detalle-producto',
            path: 'detalle/:IdProducto',
            component: () => import('../pages/productos/widgets/verDetalleProducto.vue'),
          },
        ],
      },
      {
        name: 'gestionar-ubicaciones',
        path: 'ubicaciones',
        component: RouteViewComponent,
        children: [
          {
            name: 'nuevo-ubicacion',
            path: 'nuevo',
            component: () => import('../pages/ubicaciones/widgets/UbicacionesForm.vue'),
          },
          {
            name: 'editar-ubicacion',
            path: 'editar/:IdUbicacion',
            component: () => import('../pages/ubicaciones/widgets/EditUbicaciones.vue'),
          },
          {
            name: 'detalle-ubicacion',
            path: 'detalle/:IdUbicacion',
            component: () => import('../pages/ubicaciones/widgets/verDetalleUbicaciones.vue'),
          },
        ],
      },
      {
        name: 'gestionar-fichas',
        path: '/fichas',
        component: RouteViewComponent,
        children: [
          {
            name: 'nueva-ficha',
            path: 'nueva',
            component: () => import('../pages/fichatecnica/widgets/RegistrarFicha.vue'),
          },
        ],
      },
      {
        path: '/fichas/editar/:IdFichaTecnica',
        name: 'EditarFichaTecnica',
        component: () => import('../pages/fichatecnica/widgets/EditarFicha.vue'),
      },
      {
        path: '/fichas/detalle/:IdFichaTecnica',
        name: 'DetalleFichaTecnica',
        component: () => import('../pages/fichatecnica/widgets/VisualizaFicha.vue'),
      },

      {
        name: 'gestionar-colores',
        path: '/colores',
        component: RouteViewComponent,
        children: [
          {
            name: 'nuevo-color',
            path: 'nuevo',
            component: () => import('../../src/pages/colores/widgets/registrarcolor.vue'),
          },
        ],
      },
      {
        name: 'gestionar-terciarias',
        path: '/terciarias',
        component: RouteViewComponent,
        children: [
          {
            name: 'nuevo-terciaria',
            path: 'nuevo',
            component: () => import('../pages/terciarias/widgets/RegistrarTerciarias.vue'),
          },
        ],
      },
      {
        path: '/terciarias/editar/:IdEmpresa',
        name: 'EditarTerciarias',
        component: () => import('../pages/terciarias/widgets/EditarTerciarias.vue'),
      },
      {
        path: '/terciarias/detalle/:IdEmpresa',
        name: 'DetalleTerciarias',
        component: () => import('../pages/terciarias/widgets/VisualizarTerciarias.vue'),
      },
      {
        name: 'perfil',
        path: '/perfil',
        component: () => import('../pages/MiPerfil.vue'),
      },
      {
        name: 'comprasform',
        path: 'comprasform',
        component: RouteViewComponent,
        children: [
          {
            name: 'nueva-compra',
            path: 'nueva',
            component: () => import('../pages/compras/widgets/CompraFormPage.vue'),
          },
          // Nueva ruta para ver el detalle de la compra
          {
            name: 'detalle-compra',
            path: ':id',
            component: () => import('../pages/compras/widgets/VerDetalleCompra.vue'),
          },
        ],
      },
    ],
  },
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      {
        name: 'login',
        path: 'login',
        component: () => import('../pages/auth/Login.vue'),
      },
      {
        name: 'signup',
        path: 'signup',
        component: () => import('../pages/auth/Signup.vue'),
      },
      {
        name: 'recover-password',
        path: 'recover-password',
        component: () => import('../pages/auth/RecoverPassword.vue'),
      },
      {
        name: 'recover-password-email',
        path: 'recover-password-email',
        component: () => import('../pages/auth/CheckTheEmail.vue'),
      },
      {
        path: '',
        redirect: { name: 'login' },
      },
    ],
  },
  {
    name: 'home',
    path: '/home',
    component: () => import('../pages/homePage.vue'),
  },
  {
    name: 'productoCliente',
    path: '/productoCliente/:IdProducto',
    component: () => import('../pages/productosCliente/productosClienteForm.vue'),
  },
  {
    name: '404',
    path: '/404',
    component: () => import('../pages/404.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    } else {
      window.scrollTo(0, 0)
    }
  },
  routes,
})

export default router

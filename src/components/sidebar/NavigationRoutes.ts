/* eslint-disable prettier/prettier */
export interface INavigationRoute {
  name: string
  displayName: string
  meta: { icon: string }
  children?: INavigationRoute[]
}

export default {
  root: {
    name: '/',
    displayName: 'navigationRoutes.home',
  },
  routes: [
    {
      name: 'dashboard',
      displayName: 'menu.dashboard',
      meta: {
        icon: 'vuestic-iconset-dashboard',
      },
    },
    {
      name: 'users',
      displayName: 'Usuarios Administrativos',
      meta: {
        icon: 'group',
      },
    },
    {
      name: 'clientes',
      displayName: 'Clientes',
      meta: {
        icon: 'group',
      },
    },
    {
      name: 'settings',
      displayName: 'Configuración',
      meta: {
        icon: 'vuestic-iconset-settings',
      },
      children: [
        {
          name: 'roles',
          displayName: 'Roles',
        },
      ],
    },
    {
      name: 'Settings',
      displayName: 'Parametrización',
      meta: {
        icon: 'settings',
      },
      children: [
        {
          name: 'parametrizacion',
          displayName: 'Descuentos',
        },
      ],
    },
    {
      name: 'compras',
      displayName: 'Compras',
      meta: {
        icon: 'shop',
      },
      children: [
        {
          name: 'insumos',
          displayName: 'Insumos',
        },
        {
          name: 'compras',
          displayName: 'Compras',
        },
        {
          name: 'proveedores',
          displayName: 'Proveedores',
        },
      ],
    },
    {
      name: 'estampados',
      displayName: 'Estampados',
      meta: {
        icon: 'checkroom',
      },
      children: [
        {
          name: 'estampados',
          displayName: 'Estampados',
          meta: {
            icon: 'checkroom',
          },
        },
        {
          name: 'ubicaciones',
          displayName: 'Ubicaciones',
          meta: {
            icon: 'checkroom',
          },
        },
      ],
    },
    {
      name: 'produccion',
      displayName: 'Producción',
      meta: {
        icon: 'inventory',
      },
      children: [
        {
          name: 'produccion',
          displayName: 'Ordenes de Producción',
          meta: {
            icon: 'inventory',
          },
        },
        {
          name: 'terciarias',
          displayName: 'Empresas Terciarias',
          meta: {
            icon: 'group',
          },
        },
        {
          name: 'fichas',
          displayName: 'Ficha Tecnica',
          meta: {
            icon: 'group',
          },
        },
        {
          name: 'colores',
          displayName: 'Colores',
          meta: {
            icon: 'group',
          },
        },
        {
          name: 'productos',
          displayName: 'Productos',
          meta: {
            icon: 'group',
          },
        },
      ],
    },
    {
      name: 'pedidosventas',
      displayName: 'Pedidos',
      meta: {
        icon: 'book',
      },
    },
    {
      name: 'ventas',
      displayName: 'Ventas',
      meta: {
        icon: 'local_mall',
      },
    },
  ] as INavigationRoute[],
}

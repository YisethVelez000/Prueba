<template>
  <div :class="['cart-sidebar', { 'is-open': isCartOpen }]">
    <div class="cart-sidebar-content">
      <button class="close-button" @click="$emit('close')">X</button>
      <h3>Carrito de Compras</h3>
      <div v-if="cartProducts.length > 0">
        <div v-for="(product, index) in cartProducts" :key="index" class="cart-item">
          <img :src="product.ImagenProducto" alt="Imagen del producto" class="cart-item-image" />
          <div class="cart-item-info">
            <h4>{{ product.NombreProducto }}</h4>
            <p>{{ product.PrecioUnitario }} x {{ product.Cantidad }}</p>
            <p>Total: {{ product.PrecioTotal }}</p>
          </div>
        </div>
      </div>
      <div v-else>
        <p>El carrito está vacío</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    isCartOpen: {
      type: Boolean,
      required: true,
    },
    cartProducts: {
      type: Array,
      required: true,
    },
  },
  methods: {
    closeCart() {
      this.$emit('close')
    },
  },
}
</script>

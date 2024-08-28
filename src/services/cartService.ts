/* eslint-disable prettier/prettier */
// import { ref } from 'vue';

// const cart = ref([]);

// export const addToCart = async (product: any) => {
//   try {
//     const response = await fetch('https://tu-api-url.com/carrito', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(product),
//     });
//     const data = await response.json();
//     cart.value.push(data);
//   } catch (error) {
//     console.error('Error al añadir al carrito:', error);
//   }
// };

// export const getCart = async () => {
//   try {
//     const response = await fetch('https://tu-api-url.com/carrito');
//     cart.value = await response.json();
//   } catch (error) {
//     console.error('Error al obtener el carrito:', error);
//   }
// };

// export const removeFromCart = async (productId: number) => {
//   try {
//     await fetch(`https://tu-api-url.com/carrito/${productId}`, {
//       method: 'DELETE',
//     });
//     cart.value = cart.value.filter(item => item.id !== productId);
//   } catch (error) {
//     console.error('Error al eliminar del carrito:', error);
//   }
// };

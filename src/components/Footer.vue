<!-- eslint-disable prettier/prettier -->
<!-- Footer.vue -->
<template>
  <footer class="footer">
    <div class="footer-content">
      <h2>Contacto</h2>
      <div class="contact-info">
        <p>Teléfono: (123) 456-7890</p>
        <p>Correo electrónico: info@tuempresa.com</p>
        <p>Dirección: Calle Falsa 123, Ciudad, País</p>
      </div>
    </div>
  </footer>
</template>
<!-- eslint-disable prettier/prettier -->

<script>
export default {
  name: 'AppFooter',
}
</script>
<!-- eslint-disable prettier/prettier -->

<style scoped>
.footer {
  background-color: #ffff;
  color: #333;
  text-align: center;
  padding: 20px;
  width: 100%;
  position: relative;
  bottom: 0;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
}

.footer h2 {
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.contact-info {
  display: flex;
  justify-content: space-around; /* Distribuye los elementos horizontalmente */
  gap: 20px; /* Espacio entre los elementos */
  flex-wrap: wrap; /* Permite que los elementos se ajusten en varias líneas si es necesario */
}

.footer p {
  margin: 5px 0;
  flex: 1; /* Los elementos tomarán el mismo espacio disponible */
}
</style>

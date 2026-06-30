<template>
  <div class="flex flex-center auth-page">
    <div class="text-center">
      <q-icon name="error_outline" size="64px" class="text-grey-5 q-mb-md" />
      <div class="text-h5 text-weight-medium text-grey-8 q-mb-sm">Página no encontrada</div>
      <div class="text-body1 text-grey-6 q-mb-lg">Redirigiendo al inicio...</div>
      <q-btn color="primary" label="Ir al inicio" to="/home" no-caps />
    </div>
  </div>
</template>
<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
onMounted(() => setTimeout(() => router.push({ name: "home" }), 4000));
</script>
<style lang="scss" scoped>
.auth-page { min-height: 100vh; background: var(--color-background); }
</style>

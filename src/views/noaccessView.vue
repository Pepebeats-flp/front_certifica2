<template>
  <div class="flex flex-center auth-page">
    <div class="text-center">
      <q-icon name="gpp_bad" size="64px" class="text-negative q-mb-md" />
      <div class="text-h5 text-weight-medium text-grey-8 q-mb-sm">Acceso denegado</div>
      <div class="text-body1 text-grey-6">No tienes permisos para acceder a esta aplicación.</div>
    </div>
  </div>
</template>
<script setup>
import { onMounted } from "vue";
import { useUserStore } from "@/store/userStore";

onMounted(() => useUserStore().clearuser());
</script>
<style lang="scss" scoped>
.auth-page { min-height: 100vh; background: var(--color-background); }
</style>

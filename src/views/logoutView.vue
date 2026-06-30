<template>
  <div class="flex flex-center auth-page">
    <div class="text-center">
      <q-icon name="logout" size="64px" class="text-grey-5 q-mb-md" />
      <div class="text-h5 text-weight-medium text-grey-8 q-mb-sm">Sesión cerrada</div>
      <div class="text-body1 text-grey-6">Redirigiendo al inicio...</div>
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

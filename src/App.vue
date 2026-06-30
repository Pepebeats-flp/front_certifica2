<template>
  <router-view />
</template>

<script setup>
import { watch } from "vue";
import { useQuasar } from "quasar";
import { useTheme } from "@/composables/useTheme";

const $q = useQuasar();
const { isDark } = useTheme();

function applyTheme() {
  $q.dark.set(isDark.value);
  document.body.classList.toggle("body-dark", isDark.value);
}

applyTheme();

watch(isDark, applyTheme);
</script>

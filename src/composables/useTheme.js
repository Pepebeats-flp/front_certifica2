import { ref, watch } from "vue";

const THEME_KEY = "certifica-theme";

const isDark = ref(false);

function init() {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored !== null) isDark.value = stored === "dark";
  else isDark.value = false;
}

function toggle() {
  isDark.value = !isDark.value;
  localStorage.setItem(THEME_KEY, isDark.value ? "dark" : "light");
}

if (typeof window !== "undefined") init();

export function useTheme() {
  return { isDark, toggle };
}

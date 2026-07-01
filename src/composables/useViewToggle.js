import { ref } from "vue";
import { useQuasar } from "quasar";

const forceView = ref(null);

export function useViewToggle() {
  const $q = useQuasar();

  const isCurrentlyMobile = () => {
    if (forceView.value === "mobile") return true;
    if (forceView.value === "desktop") return false;
    return $q.screen.width < 1024;
  };

  const cycle = () => {
    if (forceView.value === null || forceView.value === "desktop") {
      forceView.value = "mobile";
    } else {
      forceView.value = "desktop";
    }
  };

  const label = () => {
    return isCurrentlyMobile() ? "Vista: Tarjetas" : "Vista: Tabla";
  };

  const icon = () => {
    return isCurrentlyMobile() ? "grid_view" : "table_chart";
  };

  return { forceView, cycle, label, icon };
}

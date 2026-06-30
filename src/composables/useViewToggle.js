import { ref } from "vue";

const forceView = ref(null);

export function useViewToggle() {
  const cycle = () => {
    if (forceView.value === null || forceView.value === "desktop") {
      forceView.value = "mobile";
    } else {
      forceView.value = "desktop";
    }
  };

  const label = () => {
    return forceView.value === "mobile" ? "Vista: Móvil" : "Vista: Escritorio";
  };

  const icon = () => {
    return forceView.value === "mobile" ? "phone_android" : "desktop_windows";
  };

  return { forceView, cycle, label, icon };
}

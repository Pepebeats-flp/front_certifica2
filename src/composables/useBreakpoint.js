import { computed } from "vue";
import { useQuasar } from "quasar";
import { useViewToggle } from "./useViewToggle";

const breakpoints = {
  xs: 0,
  sm: 600,
  md: 1024,
  lg: 1440,
  xl: 1920,
};

export function useBreakpoint() {
  const $q = useQuasar();
  const { forceView } = useViewToggle();

  const effectiveWidth = computed(() => {
    if (forceView.value === "mobile") return 375;
    if (forceView.value === "desktop") return 1280;
    return $q.screen.width;
  });

  const width = computed(() => effectiveWidth.value);

  const name = computed(() => {
    const w = effectiveWidth.value;
    if (w < breakpoints.sm) return "xs";
    if (w < breakpoints.md) return "sm";
    if (w < breakpoints.lg) return "md";
    if (w < breakpoints.xl) return "lg";
    return "xl";
  });

  const isXs = computed(() => effectiveWidth.value < breakpoints.sm);
  const isSm = computed(() => effectiveWidth.value >= breakpoints.sm && effectiveWidth.value < breakpoints.md);
  const isMd = computed(() => effectiveWidth.value >= breakpoints.md && effectiveWidth.value < breakpoints.lg);
  const isLg = computed(() => effectiveWidth.value >= breakpoints.lg && effectiveWidth.value < breakpoints.xl);
  const isXl = computed(() => effectiveWidth.value >= breakpoints.xl);

  const isMobile = computed(() => effectiveWidth.value < breakpoints.md);
  const isDesktop = computed(() => effectiveWidth.value >= breakpoints.md);

  function visibleIn(breakpointList) {
    if (!breakpointList || breakpointList.length === 0) return true;
    const current = name.value;
    for (const bp of ["xl", "lg", "md", "sm", "xs"]) {
      if (breakpointList.includes(bp) && bp === current) return true;
      if (bp === current) break;
    }
    return false;
  }

  return {
    width,
    name,
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    isMobile,
    isDesktop,
    visibleIn,
    breakpoints,
  };
}

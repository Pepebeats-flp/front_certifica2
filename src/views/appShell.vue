<template>
  <q-layout view="lHh Lpr lFf" class="layout-root">
    <q-header reveal elevated class="header-bar">
      <q-toolbar class="q-px-md">
        <q-btn
          flat round dense
          :icon="drawerOpen && !isMobile ? 'menu_open' : 'menu'"
          class="header-btn"
          @click="toggleDrawer"
        />

        <q-breadcrumbs v-if="breadcrumbs.length > 1" class="header-breadcrumbs q-ml-sm" gutter="xs" active-color="primary">
          <q-breadcrumbs-el
            v-for="(crumb, i) in breadcrumbs"
            :key="i"
            :label="crumb.label"
            :to="crumb.to"
            :icon="i === 0 ? crumb.icon : undefined"
            :class="{ 'text-weight-medium': i === breadcrumbs.length - 1 }"
          />
        </q-breadcrumbs>

        <q-space />

        <div class="row items-center q-gutter-xs">
          <q-btn flat round dense class="header-btn">
            <q-avatar size="30px" color="primary" text-color="white" class="text-weight-medium">
              <q-icon v-if="initials === '?'" name="person" size="20px" />
              <span v-else>{{ initials }}</span>
            </q-avatar>
            <q-menu anchor="bottom right" self="top right" :offset="[0, 8]">
              <q-list style="min-width: 200px">
                <q-item class="q-px-md q-py-sm">
                  <q-item-section avatar>
                    <q-avatar color="primary" text-color="white" size="40px" class="text-weight-medium"><q-icon v-if="initials === '?'" name="person" size="24px" /><span v-else>{{ initials }}</span></q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-medium">{{ name }}</q-item-label>
                    <q-item-label caption class="text-uppercase">{{ client }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable v-ripple @click="toggleTheme">
                  <q-item-section avatar><q-icon :name="isDark.value ? 'light_mode' : 'dark_mode'" /></q-item-section>
                  <q-item-section>{{ isDark.value ? 'Modo claro' : 'Modo oscuro' }}</q-item-section>
                </q-item>
                <q-item clickable v-ripple @click="viewToggle.cycle()">
                  <q-item-section avatar><q-icon :name="viewToggle.icon()" /></q-item-section>
                  <q-item-section>{{ viewToggle.label() }}</q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable v-ripple to="/logout">
                  <q-item-section avatar><q-icon name="logout" /></q-item-section>
                  <q-item-section>Cerrar sesión</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="drawerOpen"
      :mini="isDesktop ? miniState : false"
      :mini-width="64"
      :width="240"
      :breakpoint="isDesktop ? 0 : 1023"
      show-if-above
      bordered
      class="sidebar"
      @mouseover="onDrawerEnter"
      @mouseout="onDrawerLeave"
    >
      <div class="sidebar-brand" :class="{ 'justify-center': miniState && isDesktop }">
        <q-icon name="directions_bus" size="34px" class="text-primary" />
        <div v-if="!miniState || !isDesktop" class="q-ml-sm">
          <div class="text-weight-bold text-h6">Certifica</div>
          <div class="text-caption text-uppercase text-grey-6 text-weight-medium">{{ client }}</div>
        </div>
      </div>

      <q-separator />

      <div v-if="!miniState || !isDesktop" class="sidebar-search q-px-sm q-py-sm">
        <q-input
          v-model="menuSearch"
          dense outlined
          placeholder="Buscar módulo..."
          clearable
        >
          <template #prepend><q-icon name="search" size="18px" /></template>
        </q-input>
      </div>

      <q-separator v-if="!miniState || !isDesktop" />

      <q-list class="q-pa-sm" style="flex: 1; overflow-y: auto;">

        <q-item-label v-if="menuMatch('Inicio','Estado General','Inspección Técnica','Revisión Documental','Traspaso','Certificación','Programación','Reprograma','Mantenimiento Preventivo','Mantenimiento Correctivo','Revisión Técnica','Incidentes','Menor','Mayor')" header class="nav-section-header">Operaciones</q-item-label>

        <q-item v-if="showMenu() && menuMatch('Inicio')" clickable v-ripple :active="isActive('/home')" active-class="nav-active" to="/home" class="nav-item">
          <q-item-section avatar><q-icon name="home" size="22px" /></q-item-section>
          <q-item-section>Inicio</q-item-section>
        </q-item>

        <div v-if="menuMatch('Inicio','Estado General','Certificación','Programación','Reprograma') && showMenu()" class="nav-sep" />

        <q-expansion-item
          v-if="showMenu() && menuMatch('Estado General','Certificación','Programación','Reprograma')"
          icon="directions_bike"
          :label="miniState && isDesktop ? '' : 'Estado General'"
          :default-opened="isParentActive('/estadog')"
          header-class="nav-expansion"
          dense-toggle
        >
          <q-item clickable v-ripple :active="isActive('/estadog')" active-class="nav-active" to="/estadog" dense class="nav-sub">
            <q-item-section avatar><q-icon name="checklist" size="18px" /></q-item-section>
            <q-item-section>Certificación</q-item-section>
          </q-item>
          <q-item clickable v-ripple :active="isActive('/estadogP')" active-class="nav-active" to="/estadogP" dense class="nav-sub">
            <q-item-section avatar><q-icon name="calendar_month" size="18px" /></q-item-section>
            <q-item-section>Programación</q-item-section>
          </q-item>
          <q-item v-if="!dtpm" clickable v-ripple :active="isActive('/estadogR')" active-class="nav-active" to="/estadogR" dense class="nav-sub">
            <q-item-section avatar><q-icon name="refresh" size="18px" /></q-item-section>
            <q-item-section>Reprograma</q-item-section>
          </q-item>
        </q-expansion-item>

        <q-expansion-item
          v-if="showMenu() && menuMatch('Inspección Técnica','Certificación','Programación')"
          icon="engineering"
          :label="miniState && isDesktop ? '' : 'Inspección Técnica'"
          :default-opened="isParentActive('/inspec') || !!menuSearch"
          header-class="nav-expansion"
          dense-toggle
        >
          <q-item v-if="menuMatch('Certificación')" clickable v-ripple :active="isActive('/inspec')" active-class="nav-active" to="/inspec" dense class="nav-sub">
            <q-item-section avatar><q-icon name="checklist" size="18px" /></q-item-section>
            <q-item-section>Certificación</q-item-section>
          </q-item>
          <q-item v-if="menuMatch('Programación')" clickable v-ripple :active="isActive('/inspecP')" active-class="nav-active" to="/inspecP" dense class="nav-sub">
            <q-item-section avatar><q-icon name="calendar_month" size="18px" /></q-item-section>
            <q-item-section>Programación</q-item-section>
          </q-item>
        </q-expansion-item>

        <div v-if="menuMatch('Revisión Documental','Mantenimiento Preventivo','Mantenimiento Correctivo','Revisión Técnica','Incidentes') && showMenu()" class="nav-sep" />

        <q-expansion-item
          v-if="showMenu() && menuMatch('Revisión Documental','Mantenimiento Preventivo','Mantenimiento Correctivo','Revisión Técnica','Incidentes')"
          icon="description"
          :label="miniState && isDesktop ? '' : 'Revisión Documental'"
          :default-opened="isParentActive('/revdoc')"
          header-class="nav-expansion"
          dense-toggle
        >
          <q-item clickable v-ripple :active="isActive('/revdocP')" active-class="nav-active" to="/revdocP" dense class="nav-sub">
            <q-item-section avatar><q-icon name="build" size="18px" /></q-item-section>
            <q-item-section>Mantenimiento Preventivo</q-item-section>
          </q-item>
          <q-item clickable v-ripple :active="isActive('/revdocC')" active-class="nav-active" to="/revdocC" dense class="nav-sub">
            <q-item-section avatar><q-icon name="handyman" size="18px" /></q-item-section>
            <q-item-section>Mantenimiento Correctivo</q-item-section>
          </q-item>
          <q-item clickable v-ripple :active="isActive('/revdocT')" active-class="nav-active" to="/revdocT" dense class="nav-sub">
            <q-item-section avatar><q-icon name="car_repair" size="18px" /></q-item-section>
            <q-item-section>Revisión Técnica</q-item-section>
          </q-item>
          <q-item clickable v-ripple :active="isActive('/revdocI')" active-class="nav-active" to="/revdocI" dense class="nav-sub">
            <q-item-section avatar><q-icon name="warning" size="18px" /></q-item-section>
            <q-item-section>Incidentes</q-item-section>
          </q-item>
        </q-expansion-item>

        <q-expansion-item
          v-if="(showMenu('trasp') || showMenu('traspn')) && menuMatch('Traspaso','Menor','Mayor')"
          icon="swap_horiz"
          :label="miniState && isDesktop ? '' : 'Traspaso'"
          :default-opened="isParentActive('/trasp') || isParentActive('/traspN') || !!menuSearch"
          header-class="nav-expansion"
          dense-toggle
        >
          <q-item v-if="showMenu('trasp') && menuMatch('Menor')" clickable v-ripple :active="isActive('/trasp')" active-class="nav-active" to="/trasp" dense class="nav-sub">
            <q-item-section avatar><q-icon name="arrow_downward" size="18px" /></q-item-section>
            <q-item-section>Menor</q-item-section>
          </q-item>
          <q-item v-if="showMenu('traspn') && menuMatch('Menor')" clickable v-ripple :active="isActive('/traspN')" active-class="nav-active" to="/traspN" dense class="nav-sub">
            <q-item-section avatar><q-icon name="arrow_downward" size="18px" /></q-item-section>
            <q-item-section>Menor (Nuevo)</q-item-section>
          </q-item>
          <q-item v-if="menuMatch('Mayor')" clickable v-ripple :active="isActive('/traspM')" active-class="nav-active" to="/traspM" dense class="nav-sub">
            <q-item-section avatar><q-icon name="arrow_upward" size="18px" /></q-item-section>
            <q-item-section>Mayor</q-item-section>
          </q-item>
        </q-expansion-item>

        <q-item v-if="showMenu() && menuMatch('Registro Presencial')" clickable v-ripple :active="isActive('/repres')" active-class="nav-active" to="/repres" class="nav-item">
          <q-item-section avatar><q-icon name="assignment_ind" size="22px" /></q-item-section>
          <q-item-section>Registro Presencial</q-item-section>
        </q-item>

        <q-item v-if="showMenu() && menuMatch('Hoja de Vida')" clickable v-ripple :active="isActive('/hojav')" active-class="nav-active" to="/hojav" class="nav-item">
          <q-item-section avatar><q-icon name="directions_bus" size="22px" /></q-item-section>
          <q-item-section>Hoja de Vida</q-item-section>
        </q-item>

        <div v-if="menuMatch('Soporte Local','Repuestos','Reparación','Diagnóstico','Documentos','Informes') || !menuSearch" class="nav-sep" />
        <q-item-label v-if="menuMatch('Soporte Local','Repuestos','Reparación','Diagnóstico','Documentos','Informes') || !menuSearch" header class="nav-section-header">Gestión</q-item-label>

        <q-expansion-item
          v-if="menuMatch('Soporte Local','Repuestos','Reparación','Diagnóstico')"
          icon="support_agent"
          :label="miniState && isDesktop ? '' : 'Soporte Local'"
          :default-opened="isParentActive('/soploc') || !!menuSearch"
          header-class="nav-expansion"
          dense-toggle
        >
          <q-item v-if="menuMatch('Repuestos')" clickable v-ripple :active="isActive('/soplocRu')" active-class="nav-active" to="/soplocRu" dense class="nav-sub">
            <q-item-section avatar><q-icon name="inventory_2" size="18px" /></q-item-section>
            <q-item-section>Repuestos</q-item-section>
          </q-item>
          <q-item v-if="menuMatch('Reparación')" clickable v-ripple :active="isActive('/soplocRa')" active-class="nav-active" to="/soplocRa" dense class="nav-sub">
            <q-item-section avatar><q-icon name="construction" size="18px" /></q-item-section>
            <q-item-section>Reparación</q-item-section>
          </q-item>
          <q-item v-if="menuMatch('Diagnóstico')" clickable v-ripple :active="isActive('/soplocD')" active-class="nav-active" to="/soplocD" dense class="nav-sub">
            <q-item-section avatar><q-icon name="biotech" size="18px" /></q-item-section>
            <q-item-section>Diagnóstico</q-item-section>
          </q-item>
        </q-expansion-item>

        <q-item v-if="showMenu() && menuMatch('Documentos')" clickable v-ripple :active="isActive('/docu')" active-class="nav-active" to="/docu" class="nav-item">
          <q-item-section avatar><q-icon name="article" size="22px" /></q-item-section>
          <q-item-section>Documentos</q-item-section>
        </q-item>

        <q-item v-if="showMenu() && menuMatch('Informes')" clickable v-ripple :active="isActive('/info')" active-class="nav-active" to="/info" class="nav-item">
          <q-item-section avatar><q-icon name="assessment" size="22px" /></q-item-section>
          <q-item-section>Informes</q-item-section>
        </q-item>

        <div v-if="menuMatch('Indicadores','Est. Certificación','Incumplimiento','Seguimiento','Sinóptico') || !menuSearch" class="nav-sep" />
        <q-item-label v-if="menuMatch('Indicadores','Est. Certificación','Incumplimiento','Seguimiento','Sinóptico') || !menuSearch" header class="nav-section-header">Análisis</q-item-label>

        <q-expansion-item
          v-if="showMenu() && menuMatch('Indicadores','Est. Certificación','Incumplimiento')"
          icon="bar_chart"
          :label="miniState && isDesktop ? '' : 'Indicadores'"
          :default-opened="isParentActive('/ind')"
          header-class="nav-expansion"
          dense-toggle
        >
          <q-item v-if="menuMatch('Est. Certificación')" clickable v-ripple :active="isActive('/indE')" active-class="nav-active" to="/indE" dense class="nav-sub">
            <q-item-section avatar><q-icon name="verified" size="18px" /></q-item-section>
            <q-item-section>Est. Certificación</q-item-section>
          </q-item>
          <q-item v-if="!dtpm && menuMatch('Incumplimiento')" clickable v-ripple :active="isActive('/indI')" active-class="nav-active" to="/indI" dense class="nav-sub">
            <q-item-section avatar><q-icon name="gpp_bad" size="18px" /></q-item-section>
            <q-item-section>Incumplimiento</q-item-section>
          </q-item>
        </q-expansion-item>

        <q-expansion-item
          v-if="showMenu() && menuMatch('Seguimiento','Sinóptico')"
          icon="travel_explore"
          :label="miniState && isDesktop ? '' : 'Seguimiento'"
          :default-opened="isParentActive('/sinop') || !!menuSearch"
          header-class="nav-expansion"
          dense-toggle
        >
          <q-item v-if="menuMatch('Sinóptico')" clickable v-ripple :active="isActive('/sinop')" active-class="nav-active" to="/sinop" dense class="nav-sub">
            <q-item-section avatar><q-icon name="map" size="18px" /></q-item-section>
            <q-item-section>Sinóptico</q-item-section>
          </q-item>
        </q-expansion-item>

        <q-separator class="q-my-md" />
        <q-item clickable v-ripple to="/logout" class="nav-item text-grey-6">
          <q-item-section avatar><q-icon name="logout" size="22px" /></q-item-section>
          <q-item-section>Cerrar sesión</q-item-section>
        </q-item>
      </q-list>

      <div v-if="!miniState || !isDesktop" class="sidebar-footer">
        <div class="row items-center q-px-md q-py-xs text-caption text-grey-6">
          <q-icon name="spa" size="14px" class="q-mr-xs" />
          <span>v{{ version }}</span>
          <q-space />
          <span class="text-uppercase text-weight-medium">{{ client }}</span>
        </div>
      </div>
    </q-drawer>

    <q-page-container class="page-container">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { useUserStore } from "@/store/userStore";
import { useEstadogStore } from "@/store/estadogStore";
import { useEstadogpStore } from "@/store/estadogpStore";
import { useInspecStore } from "@/store/inspecStore";
import { useInspecpStore } from "@/store/inspecpStore";
import { useMprevStore } from "@/store/mprevStore";
import { useMcorrStore } from "@/store/mcorrStore";
import { useIncideStore } from "@/store/incideStore";
import { useRevtecStore } from "@/store/revtecStore";
import { useInfoStore } from "@/store/infoStore";
import { useSdiagStore } from "@/store/sdiagStore";
import { useSrepaStore } from "@/store/srepaStore";
import { useSrepuStore } from "@/store/srepuStore";
import { usePosicionStore } from "@/store/posicionStore";
import { useIncpStore } from "@/store/incpStore";
import { useRepresStore } from "@/store/represStore";
import { useIndicadorStore } from "@/store/indicaStore";
import { useTraspStore } from "@/store/traspStore";
import { useTraspmStore } from "@/store/traspmStore";
import { client } from "@/client";
import { useBreakpoint } from "@/composables/useBreakpoint";
import { useTheme } from "@/composables/useTheme";
import { useViewToggle } from "@/composables/useViewToggle";

const { isDesktop, isMobile } = useBreakpoint();
const { toggle: toggleTheme, isDark } = useTheme();
const viewToggle = useViewToggle();

// eslint-disable-next-line no-undef
const version = __APP_VERSION__;
const route = useRoute();

const drawerOpen = ref(false);
const miniState = ref(true);
const menuSearch = ref("");
const { name, dtpm, carro, binduser, unbinduser } = useUserStore();

const menuMatch = (...labels) => {
  const s = (menuSearch.value || "").trim().toLowerCase();
  if (!s) return true;
  return labels.some((l) => l.toLowerCase().includes(s));
};

const initials = computed(() => {
  if (!name.value) return "?";
  return name.value.split(" ").filter(s => s.length > 2).map(s => s.charAt(0).toUpperCase()).slice(0, 2).join("");
});

const breadcrumbs = computed(() => {
  const crumbs = [];
  const path = route.path;
  const parts = path.split("/").filter(Boolean);
  if (parts.length === 0 || parts[0] === "home") {
    return [{ label: "Inicio", to: "/home", icon: "home" }];
  }
  crumbs.push({ label: "Inicio", to: "/home", icon: "home" });
  const sectionIcons = {
    estadog: "directions_bike", estadogP: "directions_bike", estadogR: "directions_bike",
    inspec: "engineering", inspecP: "engineering",
    revdocP: "description", revdocC: "description", revdocT: "description", revdocI: "description",
    trasp: "swap_horiz", traspN: "swap_horiz", traspM: "swap_horiz",
    repres: "assignment_ind", hojav: "directions_bus",
    soplocRu: "support_agent", soplocRa: "support_agent", soplocD: "support_agent",
    docu: "article", info: "assessment",
    indE: "bar_chart", indI: "bar_chart",
    sinop: "travel_explore",
  };
  crumbs.push({ label: route.meta.desc || parts[0], to: `/${parts[0]}`, icon: sectionIcons[parts[0]] });
  return crumbs;
});

const toggleDrawer = () => {
  if (isDesktop.value && !isMobile.value) miniState.value = !miniState.value;
  else drawerOpen.value = !drawerOpen.value;
};

let drawerEnterTimeout = null;
let drawerLeaveTimeout = null;

const onDrawerEnter = () => {
  if (!isDesktop.value || isMobile.value) return;
  clearTimeout(drawerLeaveTimeout);
  drawerEnterTimeout = setTimeout(() => { miniState.value = false; }, 100);
};

const onDrawerLeave = () => {
  if (!isDesktop.value || isMobile.value) return;
  clearTimeout(drawerEnterTimeout);
  drawerLeaveTimeout = setTimeout(() => { miniState.value = true; }, 200);
};

const isActive = (path) => {
  const fullPath = route.path.replace(/\/$/, "");
  const target = path.replace(/\/$/, "");
  if (target === "/home") return fullPath === "/home";
  return fullPath === target || fullPath.startsWith(target + "/");
};

const isParentActive = (prefix) => route.path.startsWith(prefix);

const showMenu = (menu) => {
  if (carro) return false;
  if (menu === "trasp" && !["subus"].includes(client)) return false;
  if (menu === "traspn" && !["conecta", "voy", "granamericas"].includes(client)) return false;
  else return true;
};

const { bind: bindest, unbind: unbindest, bind_p: bindest_p, unbind_p: unbindest_p } = useEstadogStore();
const { bind: bindestp, unbind: unbindestp } = useEstadogpStore();
const { bind: bindinsp, unbind: unbindinsp } = useInspecStore();
const { bind: bindinspp, unbind: unbindinspp } = useInspecpStore();
const { bind: bindprev, unbind: unbindprev } = useMprevStore();
const { bind: bindcorr, unbind: unbindcorr } = useMcorrStore();
const { bind: bindinc, unbind: unbindinc } = useIncideStore();
const { bind: bindtec, unbind: unbindtec } = useRevtecStore();
const { bind: binddiag, unbind: unbinddiag } = useSdiagStore();
const { bind: bindrepa, unbind: unbindrepa } = useSrepaStore();
const { bind: bindrepu, unbind: unbindrepu } = useSrepuStore();
const { bind: bindinfo, unbind: unbindinfo } = useInfoStore();
const { bind: bindposicion, unbind: unbindposicion } = usePosicionStore();
const { bind: bindincp, unbind: unbindincp } = useIncpStore();
const { bind: bindrepres, unbind: unbindrepres } = useRepresStore();
const { bind: bindindica, unbind: unbindindica } = useIndicadorStore();
const { bind: bindtrasp, unbind: unbindtrasp } = useTraspStore();
const { bind: bindtraspm, unbind: unbindtraspm } = useTraspmStore();

if (!carro) {
  bindindica(); bindest(); bindestp(); bindest_p();
  bindinsp(); bindinspp(); bindinfo(); bindposicion();
  bindtec(); bindinc(); bindprev(); bindcorr();
  bindincp(); bindrepres();
}
if (["voy", "subus", "conecta", "granamericas"].includes(client)) {
  bindtrasp(); bindtraspm();
}
bindrepu(); bindrepa(); binddiag(); binduser();

onUnmounted(() => {
  unbindest(); unbindestp(); unbindest_p();
  unbindinsp(); unbindinspp(); unbindprev(); unbindcorr();
  unbindinc(); unbindtec(); unbindinfo();
  unbinddiag(); unbindrepa(); unbindrepu();
  unbindposicion(); unbindincp(); unbindrepres();
  unbindindica(); unbindtrasp(); unbindtraspm();
  unbinduser();
});
</script>

<style lang="scss" scoped>
.layout-root {
  background: var(--color-background);
}

.header-breadcrumbs {
  :deep(.q-breadcrumbs__el) {
    font-size: 17px;
  }
}

.header-bar {
  background: var(--color-surface) !important;
  color: var(--color-text-primary) !important;
  border-bottom: 1px solid var(--color-border);

  :deep(.q-toolbar) {
    min-height: 60px;
    flex-wrap: wrap;
  }
}

@include xs {
  .header-breadcrumbs :deep(.q-breadcrumbs__el) {
    font-size: 13px;
  }
}

.header-btn {
  color: var(--color-text-secondary) !important;
  transition: color var(--transition-fast), background var(--transition-fast);

  &:hover {
    color: var(--color-primary) !important;
    background: var(--color-primary-surface) !important;
  }
}

.sidebar {
  background: var(--color-surface) !important;
  color: var(--color-text-primary) !important;
  border-right: 1px solid var(--color-border) !important;

  :deep(.q-drawer__backdrop) {
    background: rgba(0, 0, 0, 0.35);
  }
}

.sidebar-brand {
  padding: 18px 16px 18px 20px;
  min-height: 60px;
  display: flex;
  align-items: center;
  font-size: 17px;
}

.sidebar-footer {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-surface);
  border-top: 1px solid var(--color-border-light);
  padding: 4px 0;
}

.nav-item {
  border-radius: var(--radius-md);
  margin: 1px 6px;
  min-height: 44px;
  font-size: 15px;
  color: var(--color-text-secondary);
  transition: background var(--transition-fast), color var(--transition-fast);

  &:hover {
    background: var(--color-background-alt);
    color: var(--color-text-primary);
  }
}

.nav-active {
  background: var(--color-primary-surface) !important;
  color: var(--color-primary) !important;
  font-weight: var(--font-weight-medium);

  :deep(.q-icon) {
    color: var(--color-primary) !important;
  }

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 10px;
    bottom: 10px;
    width: 3px;
    background: var(--color-primary);
    border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  }
}

.nav-sub {
  padding-left: 18px;
  border-radius: var(--radius-md);
  margin: 1px 12px;
  min-height: 38px;
  font-size: 14px;
  color: var(--color-text-secondary);
  transition: background var(--transition-fast);

  &:hover {
    background: var(--color-background-alt);
    color: var(--color-text-primary);
  }
}

.nav-expansion {
  border-radius: var(--radius-md);
  margin: 2px 6px;
  font-size: 15px;

  :deep(.q-item) {
    color: var(--color-text-primary);
    font-weight: var(--font-weight-semibold);
    border-radius: var(--radius-md);
    background: var(--color-background-alt);
    transition: background var(--transition-fast);
  }

  :deep(.q-item:hover) {
    background: var(--color-primary-surface);
  }

  :deep(.q-icon) {
    color: var(--color-primary) !important;
    opacity: 0.8;
  }
}

.nav-sep {
  margin: 4px 16px;
  border-top: 1px solid var(--color-border-light);
}

.page-container {
  background: var(--color-background);
}

.sidebar-search :deep(.q-field__control) {
  border-radius: 10px;
  background: var(--color-background-alt);
  transition: all var(--transition-fast);

  &:before { border-color: transparent !important; }
  &:after { border-color: var(--color-primary) !important; }
}

.sidebar-search :deep(.q-field__native) {
  font-size: 13.5px;
}



.nav-section-header {
  font-size: 11px !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.8px !important;
  color: var(--color-text-tertiary) !important;
  padding: 8px 16px 4px 20px !important;
  margin-top: 4px;
  min-height: auto !important;
}
</style>

<template>
  <div class="home-page q-pa-lg">
    <div class="home-search q-mb-lg">
      <div class="home-search-card">
        <q-input
          v-model="searchText"
          outlined
          placeholder="¿Qué necesitas? Busca una patente, una sección..."
          class="home-search-input"
          clearable
          @update:model-value="onSearchInput"
          @keydown.enter="onSearchEnter"
        >
          <template #prepend><q-icon name="search" size="24px" color="primary" /></template>
          <template #append>
            <q-icon v-if="!searchText" name="directions_bus" size="20px" color="grey-5" />
          </template>
        </q-input>

        <div v-if="searchSuggestions.length > 0 && searchText" class="home-search-results">
          <q-list dense>
            <q-item
              v-for="s in searchSuggestions"
              :key="s.to"
              clickable v-ripple
              @click="navigateTo(s.to)"
            >
              <q-item-section avatar><q-icon :name="s.icon" :color="s.icon === 'directions_bus' && s.desc.includes('Buscar') ? 'primary' : 'grey-7'" size="18px" /></q-item-section>
              <q-item-section>
                <q-item-label :class="{ 'text-primary': s.icon === 'directions_bus' }">{{ s.label }}</q-item-label>
                <q-item-label caption>{{ s.desc }}</q-item-label>
              </q-item-section>
              <q-item-section side><q-icon name="chevron_right" size="16px" /></q-item-section>
            </q-item>
          </q-list>
        </div>
      </div>
    </div>

    <div v-if="showDashboard" class="home-card q-mb-lg">
      <div class="text-subtitle1 text-weight-medium text-grey-8 q-px-lg q-pt-lg">Dashboard</div>
      <div class="iframe-container q-pa-lg" :class="`iframe-${client}`">
        <iframe :src="hdasboard_link" frameborder="0" allowfullscreen
          sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox" />
      </div>
    </div>

    <div class="row q-col-gutter-lg">
      <div class="col-12 col-md-6">
        <div class="home-card">
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium text-grey-8 q-mb-sm">Estado General</div>
            <q-inner-loading :showing="loading" color="primary" />
            <apexchart v-if="!loading" type="bar" height="280" :options="chartOptions('Estado General')" :series="egSeries" />
          </q-card-section>
        </div>
      </div>
      <div class="col-12 col-md-6">
        <div class="home-card">
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium text-grey-8 q-mb-sm">Inspección Técnica</div>
            <q-inner-loading :showing="loading" color="primary" />
            <apexchart v-if="!loading" type="bar" height="280" :options="chartOptions('Inspección Técnica')" :series="itSeries" />
          </q-card-section>
        </div>
      </div>
      <div class="col-12">
        <div class="home-card">
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium text-grey-8 q-mb-sm">Mantenimiento Preventivo</div>
            <q-inner-loading :showing="loading" color="primary" />
            <apexchart v-if="!loading" type="bar" height="250" :options="chartOptions('Mantenimiento Preventivo')" :series="mpSeries" />
          </q-card-section>
        </div>
      </div>
      <div class="col-12">
        <div class="home-card">
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium text-grey-8 q-mb-sm">No Aprobado — Depósito</div>
            <div id="map" class="home-map"></div>
          </q-card-section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useIndicadorStore } from "@/store/indicaStore";
import { storeToRefs } from "pinia";
import { invoke, until } from "@vueuse/core";
import { Loader } from "@googlemaps/js-api-loader";
import { terminales_map, client, hdasboard_link } from "@/client";

const router = useRouter();
const searchText = ref("");

const allSections = [
  { label: "Inicio", to: "/home", icon: "home", desc: "Panel principal" },
  { label: "Estado General", to: "/estadog/list", icon: "directions_bike", desc: "Certificación REGB" },
  { label: "Estado General — Programación", to: "/estadogP/list", icon: "calendar_month", desc: "Programación de certificación" },
  { label: "Inspección Técnica", to: "/inspec/list", icon: "engineering", desc: "Certificación IT" },
  { label: "Mantenimiento Preventivo", to: "/revdocP/list", icon: "build", desc: "Revisiones preventivas" },
  { label: "Mantenimiento Correctivo", to: "/revdocC/list", icon: "handyman", desc: "Reparaciones" },
  { label: "Revisión Técnica", to: "/revdocT/list", icon: "car_repair", desc: "PRT" },
  { label: "Incidentes", to: "/revdocI/list", icon: "warning", desc: "Eventos y accidentes" },
  { label: "Traspaso Menor", to: "/trasp/list", icon: "swap_horiz", desc: "Inspección de traspaso" },
  { label: "Traspaso Mayor", to: "/traspM/list", icon: "swap_horiz", desc: "Traspaso mayor" },
  { label: "Registro Presencial", to: "/repres/list", icon: "assignment_ind", desc: "Asistencia en terreno" },
  { label: "Hoja de Vida", to: "/hojav/list", icon: "directions_bus", desc: "Historial de buses" },
  { label: "Soporte Local — Repuestos", to: "/soplocRu/list", icon: "inventory_2", desc: "Solicitud de repuestos" },
  { label: "Soporte Local — Reparación", to: "/soplocRa/list", icon: "construction", desc: "Solicitud de reparación" },
  { label: "Soporte Local — Diagnóstico", to: "/soplocD/list", icon: "biotech", desc: "Solicitud de diagnóstico" },
  { label: "Documentos", to: "/docu/list", icon: "article", desc: "Documentación" },
  { label: "Informes", to: "/info/list", icon: "assessment", desc: "Reportes" },
  { label: "Indicadores", to: "/indE/list", icon: "bar_chart", desc: "Estado de certificación" },
  { label: "Seguimiento", to: "/sinop/ecert", icon: "travel_explore", desc: "Vista sinóptica" },
];

const searchSuggestions = computed(() => {
  const q = (searchText.value || "").trim().toLowerCase();
  if (!q || q.length < 1) return [];
  const results = [];

  if (/^[a-z0-9]{5,6}$/.test(q)) {
    const p = q.toUpperCase();
    results.push({ label: `Buscar ${p} en Estado General`, to: `/estadog/list?search=${p}`, icon: "directions_bike", desc: "Certificación REGB" });
    results.push({ label: `Buscar ${p} en Inspección Técnica`, to: `/inspec/list?search=${p}`, icon: "engineering", desc: "Certificación IT" });
    results.push({ label: `Buscar ${p} en Hoja de Vida`, to: `/hojav/list?search=${p}`, icon: "article", desc: "Historial completo" });
    results.push({ label: `Buscar ${p} en Estado Certificación`, to: `/indE/list?search=${p}`, icon: "verified", desc: "Indicador de certificación" });
    results.push({ label: `Buscar ${p} en Incumplimiento`, to: `/indI/list?search=${p}`, icon: "gpp_bad", desc: "Registro de incumplimientos" });
  }

  results.push(...allSections.filter(s =>
    s.label.toLowerCase().includes(q) ||
    s.desc.toLowerCase().includes(q)
  ).slice(0, 8));

  return results;
});

const navigateTo = (path) => {
  searchText.value = "";
  router.push(path);
};

const onSearchInput = () => {};
const onSearchEnter = () => {
  if (searchSuggestions.value.length === 1) {
    navigateTo(searchSuggestions.value[0].to);
  }
};

const { getindicador } = useIndicadorStore();
const { m_indicador_change } = storeToRefs(useIndicadorStore());
const loading = ref(true);
const showDashboard = computed(() => ["voy", "redbus"].includes(client));

const egSeries = ref([]);
const itSeries = ref([]);
const mpSeries = ref([]);
const chartMonths = ref([]);

const chartOptions = (title) => ({
  chart: {
    type: "bar",
    toolbar: { show: false },
    fontFamily: "Roboto, sans-serif",
    animations: { enabled: true, speed: 600 },
  },
  plotOptions: {
    bar: { borderRadius: 6, columnWidth: "55%", borderRadiusApplication: "end" },
  },
  colors: ["#b91c1c", "#f59e0b"],
  dataLabels: { enabled: false },
  stroke: { width: [0, 2], curve: "smooth" },
  grid: { borderColor: "#f4f4f5", strokeDashArray: 4 },
  xaxis: { categories: chartMonths.value, labels: { style: { colors: "#a1a1aa", fontSize: "12px" } } },
  yaxis: { labels: { style: { colors: "#a1a1aa", fontSize: "12px" } } },
  legend: { position: "bottom", markers: { radius: 12 }, fontSize: "13px", fontWeight: 500 },
  tooltip: { theme: "light", style: { fontSize: "12px" } },
});

invoke(async () => {
  await until(m_indicador_change).toMatch((v) => v > 0);
  const indicadores = await getindicador({ uuid: `indicadores_${client}` });

  loading.value = false;
  chartMonths.value = indicadores.meses;

  egSeries.value = [
    { name: "Total", data: indicadores.eg_total },
    { name: "No Aprobado", type: "line", data: indicadores.eg_noaprobado },
  ];
  itSeries.value = [
    { name: "Total", data: indicadores.it_total },
    { name: "No Aprobado", type: "line", data: indicadores.it_noaprobado },
  ];
  mpSeries.value = [
    { name: "Total", data: indicadores.mp_total },
    { name: "No Aprobado", type: "line", data: indicadores.mp_noaprobado },
  ];

  const loader = new Loader({ apiKey: "AIzaSyBOgaVzmCfZTL6Rs8dGgJ2AJRFNqnJS1CQ", version: "weekly" });
  const google = await loader.load();
  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -33.442903876968494, lng: -70.65383698099131 },
    zoom: 10, mapId: "2523ba55831ae7ec",
    mapTypeControl: false, streetViewControl: false,
  });

  for (const depo in indicadores.eg_noaprobado_depo) {
    const t = terminales_map.get(depo);
    new google.maps.Circle({
      strokeColor: "#ef4444", strokeOpacity: 0.7, strokeWeight: 2,
      fillColor: "#ef4444", fillOpacity: 0.2,
      map, center: { lat: t[2], lng: t[1] },
      radius: Math.sqrt(indicadores.eg_noaprobado_depo[depo]) * 1000,
    });
  }

  for (const depo in indicadores.it_noaprobado_depo) {
    const t = terminales_map.get(depo);
    new google.maps.Circle({
      strokeColor: "#8b5cf6", strokeOpacity: 0.7, strokeWeight: 2,
      fillColor: "#8b5cf6", fillOpacity: 0.2,
      map, center: { lat: t[2], lng: t[1] },
      radius: Math.sqrt(indicadores.it_noaprobado_depo[depo]) * 1000,
    });
  }
});
</script>

<style lang="scss" scoped>
.home-page {
  max-width: 1400px;
  margin: 0 auto;
}

.home-search-card {
  position: relative;
  background: var(--color-surface);
  border-radius: 16px;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-border);
  padding: 4px;
}

.home-search-input :deep(.q-field__control) {
  border-radius: 14px;
  height: 56px;
  font-size: 16px;
  background: transparent;

  &:before { border: none !important; }
  &:after { border: none !important; }
}

.home-search-input :deep(.q-field__native) {
  font-size: 16px;
}

.home-search-results {
  border-top: 1px solid var(--color-divider);
  margin-top: 4px;
  max-height: 320px;
  overflow-y: auto;
}

.home-shortcuts {
  justify-content: center;
}

.home-card {
  background: var(--color-surface);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
  overflow: hidden;
  transition: box-shadow var(--transition-fast);
  &:hover { box-shadow: var(--shadow-md); }
}

.iframe-container iframe {
  width: 100%; border: 0;
}
.iframe-voy iframe  { height: 85vh; }
.iframe-redbus iframe { height: 95vh; }

.home-map { height: 350px; border-radius: 8px; margin-top: 8px; position: relative; }

@include tablet {
  .iframe-voy iframe  { height: 95vh; }
  .iframe-redbus iframe { height: 130vh; }
  .home-page { padding: 12px !important; }
  .home-search-input :deep(.q-field__control) { height: 48px; }
  .home-search-input :deep(.q-field__native) { font-size: 14px; }
  .home-map { height: 220px; }
}
</style>

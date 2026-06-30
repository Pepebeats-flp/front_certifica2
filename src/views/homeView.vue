<template>
  <div class="home-page">
    <q-card class="home-search-card">
      <q-card-section class="q-py-lg q-px-xl">
        <div class="text-center q-mb-md">
          <div class="text-h5 text-weight-bold">Panel de Control</div>
          <div class="text-grey-6">Monitoreo y gestión de flota</div>
        </div>
        <q-form @submit.prevent="onSearchEnter">
          <q-input
            v-model="searchText"
            outlined dense
            placeholder="¿Qué necesitas? Busca una patente, una sección..."
            class="home-search-input"
            clearable
            @update:model-value="searchText = $event"
          >
            <template #prepend><q-icon name="search" size="20px" /></template>
            <template #append><q-icon name="directions_bus" size="20px" color="primary" /></template>
          </q-input>
        </q-form>
        <div v-if="searchSuggestions.length" class="home-search-results">
          <q-list dense separator>
            <q-item
              v-for="(s, i) in searchSuggestions"
              :key="i"
              clickable v-ripple
              @click="navigateTo(s)"
            >
              <q-item-section avatar>
                <q-icon :name="s.icon" color="primary" size="18px" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ s.label }}</q-item-label>
                <q-item-label caption>{{ s.description }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right" size="16px" color="grey-5" />
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </q-card-section>
    </q-card>

    <div class="home-charts">
      <q-card v-if="showDashboard" class="home-card home-card-full">
        <q-card-section>
          <div class="text-subtitle1 text-weight-medium text-grey-8 q-mb-sm">Dashboard</div>
          <div class="iframe-container" :class="`iframe-${client}`">
            <iframe
              :src="hdasboard_link"
              frameborder="0"
              style="border: 0"
              allowfullscreen
              sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            ></iframe>
          </div>
        </q-card-section>
      </q-card>

      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-6">
          <q-card class="home-card">
            <q-card-section>
              <div class="text-subtitle1 text-weight-medium q-mb-sm">Estado General</div>
              <apexchart
                v-if="egSeries.length"
                type="bar"
                height="280"
                :options="chartOptions('Estado General')"
                :series="egSeries"
              />
              <q-inner-loading :showing="loading" label="Cargando..." label-class="text-primary" label-style="font-size: 0.9em" color="primary" />
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-6">
          <q-card class="home-card">
            <q-card-section>
              <div class="text-subtitle1 text-weight-medium q-mb-sm">Inspección Técnica</div>
              <apexchart
                v-if="itSeries.length"
                type="bar"
                height="280"
                :options="chartOptions('Inspección Técnica')"
                :series="itSeries"
              />
              <q-inner-loading :showing="loading" label="Cargando..." label-class="text-primary" label-style="font-size: 0.9em" color="primary" />
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12">
          <q-card class="home-card">
            <q-card-section>
              <div class="text-subtitle1 text-weight-medium q-mb-sm">Mantenimiento Preventivo</div>
              <apexchart
                v-if="mpSeries.length"
                type="bar"
                height="250"
                :options="chartOptions('Mantenimiento Preventivo')"
                :series="mpSeries"
              />
              <q-inner-loading :showing="loading" label="Cargando..." label-class="text-primary" label-style="font-size: 0.9em" color="primary" />
            </q-card-section>
          </q-card>
        </div>
      </div>

      <q-card class="home-card q-mt-md">
        <q-card-section>
          <div class="text-subtitle1 text-weight-medium q-mb-sm">No Aprobado - Depósito</div>
          <div id="map" class="home-map"></div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { useIndicadorStore } from "@/store/indicaStore";
import { storeToRefs } from "pinia";
import { ref, computed } from "vue";
import { invoke, until } from "@vueuse/core";
import { useRouter } from "vue-router";
import { Loader } from "@googlemaps/js-api-loader";
import { terminales_map, client, hdasboard_link } from "@/client";

const router = useRouter();
const { getindicador } = useIndicadorStore();
const { m_indicador_change } = storeToRefs(useIndicadorStore());

const loading = ref(true);
const searchText = ref("");

const showDashboard = computed(() => {
  return ["voy", "redbus", "conecta", "granamericas", "metropol", "subus"].includes(client);
});

const allSections = [
  { label: "Estado General", route: "/estadog/list", icon: "assignment", description: "Inspecciones de estado general", keywords: ["eg", "estado"] },
  { label: "Inspección Técnica", route: "/inspec/list", icon: "build", description: "Inspecciones técnicas", keywords: ["it", "inspeccion", "tecnica"] },
  { label: "Traspaso", route: "/trasp/list", icon: "swap_horiz", description: "Inspecciones de traspaso", keywords: ["traspaso"] },
  { label: "Registro Presencial", route: "/repres/list", icon: "fact_check", description: "Registros de presencia", keywords: ["repres", "presencial", "presencia"] },
  { label: "Informes", route: "/info/list", icon: "description", description: "Informes mensuales", keywords: ["informe"] },
  { label: "Hoja de Vida", route: "/hojav/list", icon: "folder", description: "Ficha técnica de buses", keywords: ["hojav", "hoja", "vida", "bus", "buses"] },
  { label: "Soplado", route: "/soploc/listar", icon: "air", description: "Registro de soplado", keywords: ["soploc", "soplado"] },
  { label: "Pesaje", route: "/pesaje/listar", icon: "scale", description: "Registro de pesaje", keywords: ["pesaje"] },
  { label: "Rutero", route: "/soploc/listru", icon: "route", description: "Gestión de ruteros", keywords: ["rutero"] },
];

const searchSuggestions = computed(() => {
  const q = searchText.value.trim().toLowerCase();
  if (!q) return [];
  const results = [];
  const isPlate = /^[a-z0-9]{5,6}$/.test(q);
  if (isPlate) {
    results.push(
      { label: `EG: ${q.toUpperCase()}`, route: `/estadog/list?search=${q.toUpperCase()}`, icon: "assignment", description: "Buscar en Estado General" },
      { label: `IT: ${q.toUpperCase()}`, route: `/inspec/list?search=${q.toUpperCase()}`, icon: "build", description: "Buscar en Inspección Técnica" },
      { label: `Traspaso: ${q.toUpperCase()}`, route: `/trasp/list?search=${q.toUpperCase()}`, icon: "swap_horiz", description: "Buscar en Traspaso" },
      { label: `Hoja de Vida: ${q.toUpperCase()}`, route: `/hojav/list`, icon: "folder", description: "Ver ficha del bus" },
    );
  }
  const sectionMatches = allSections.filter((s) =>
    s.label.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.keywords.some((k) => k.includes(q))
  );
  results.push(...sectionMatches.slice(0, 8));
  return results;
});

const navigateTo = (s) => {
  searchText.value = "";
  router.push(s.route);
};

const onSearchEnter = () => {
  if (searchSuggestions.value.length === 1) {
    navigateTo(searchSuggestions.value[0]);
  }
};

const chartMonths = ref([]);
const egSeries = ref([]);
const itSeries = ref([]);
const mpSeries = ref([]);

const chartOptions = (title) => ({
  chart: {
    fontFamily: "Roboto, sans-serif",
    toolbar: { show: false },
    stacked: false,
  },
  colors: ["#b91c1c", "#f59e0b"],
  plotOptions: {
    bar: { borderRadius: 4, columnWidth: "60%" },
  },
  dataLabels: { enabled: false },
  xaxis: {
    categories: chartMonths.value,
    labels: { style: { fontSize: "12px" } },
  },
  yaxis: {
    labels: { style: { fontSize: "12px" } },
  },
  legend: {
    position: "bottom",
    fontSize: "13px",
  },
  tooltip: { shared: true, intersect: false },
  responsive: [
    {
      breakpoint: 700,
      options: {
        chart: { height: 220 },
        xaxis: { labels: { style: { fontSize: "10px" } } },
      },
    },
  ],
});

invoke(async () => {
  await until(m_indicador_change).toMatch((v) => v > 0);
  const indicadores = await getindicador({ uuid: `indicadores_${client}` });
  loading.value = false;

  chartMonths.value = indicadores.meses || [];
  egSeries.value = [
    { name: "Total", type: "bar", data: indicadores.eg_total || [] },
    { name: "No Aprobado", type: "line", data: indicadores.eg_noaprobado || [] },
  ];
  itSeries.value = [
    { name: "Total", type: "bar", data: indicadores.it_total || [] },
    { name: "No Aprobado", type: "line", data: indicadores.it_noaprobado || [] },
  ];
  mpSeries.value = [
    { name: "Total", type: "bar", data: indicadores.mp_total || [] },
    { name: "No Aprobado", type: "line", data: indicadores.mp_noaprobado || [] },
  ];

  const loader = new Loader({
    apiKey: "AIzaSyBOgaVzmCfZTL6Rs8dGgJ2AJRFNqnJS1CQ",
    version: "weekly",
  });
  const google = await loader.load();
  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -33.442903876968494, lng: -70.65383698099131 },
    zoom: 10,
    mapId: "2523ba55831ae7ec",
    mapTypeControl: false,
    streetViewControl: false,
  });

  for (const depo in indicadores.eg_noaprobado_depo) {
    const terminal = terminales_map.get(depo);
    if (!terminal) continue;
    new google.maps.Circle({
      strokeColor: "#ef4444",
      strokeOpacity: 0.7,
      strokeWeight: 2,
      fillColor: "#ef4444",
      fillOpacity: 0.2,
      map,
      center: { lat: terminal[2], lng: terminal[1] },
      radius: Math.sqrt(indicadores.eg_noaprobado_depo[depo]) * 1000,
    });
  }

  for (const depo in indicadores.it_noaprobado_depo) {
    const terminal = terminales_map.get(depo);
    if (!terminal) continue;
    new google.maps.Circle({
      strokeColor: "#8b5cf6",
      strokeOpacity: 0.7,
      strokeWeight: 2,
      fillColor: "#8b5cf6",
      fillOpacity: 0.2,
      map,
      center: { lat: terminal[2], lng: terminal[1] },
      radius: Math.sqrt(indicadores.it_noaprobado_depo[depo]) * 1000,
    });
  }
});
</script>

<style lang="scss" scoped>
.home-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px;
}

.home-search-card {
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  margin-bottom: 20px;
}

.home-search-input {
  :deep(.q-field__control) {
    height: 56px;
    border-radius: 12px;
    background: var(--color-background-alt);
    border: 1px solid var(--color-border);
    padding: 0 16px;
    font-size: 16px;
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast);

    &:focus-within {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(185, 28, 28, 0.1);
    }
  }

  :deep(.q-field__native) { font-size: 16px; }
  :deep(.q-field__before),
  :deep(.q-field__after) { height: 100%; }
}

.home-search-results {
  margin-top: 12px;
  border-top: 1px solid var(--color-divider);
  max-height: 360px;
  overflow-y: auto;
}

.home-charts {
  display: flex;
  flex-direction: column;
  gap: 16px;
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

.home-card-full {
  grid-column: 1 / -1;
}

.iframe-voy iframe,
.iframe-conecta iframe,
.iframe-granamericas iframe,
.iframe-metropol iframe,
.iframe-subus iframe {
  width: 100%;
  height: 85vh;
  border: 0;
}

.iframe-redbus iframe {
  width: 100%;
  height: 95vh;
  border: 0;
}

.home-map {
  height: 350px;
  border-radius: 8px;
  margin-top: 8px;
}

@media (max-width: 700px) {
  .home-page { padding: 12px; }

  .home-search-input {
    :deep(.q-field__control) { height: 48px; font-size: 14px; }
    :deep(.q-field__native) { font-size: 14px; }
  }

  .iframe-voy iframe,
  .iframe-conecta iframe,
  .iframe-granamericas iframe,
  .iframe-metropol iframe,
  .iframe-subus iframe {
    height: 110vh;
  }
  .iframe-redbus iframe {
    height: 175vh;
  }
}
</style>

<template>
  <div class="row justify-center">
    <div class="col-12 flex justify-center">
      <q-card v-if="showDashboard" bordered class="my-card-double q-ma-md text-center">
        <q-card-section>
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
    </div>

    <q-card bordered class="my-card q-ma-md text-center">
      <q-card-section>
        <q-inner-loading :showing="loading" label="Cargando..." label-class="text-primary" label-style="font-size: 0.9em" color="primary" />
        <div class="text-h6">Estado General</div>
        <q-scroll-area style="height: 300px; max-width: 600px">
          <canvas style="min-width: 560px" id="eg"></canvas>
        </q-scroll-area>
      </q-card-section>
    </q-card>
    <q-card bordered class="my-card q-ma-md text-center">
      <q-card-section>
        <q-inner-loading :showing="loading" label="Cargando..." label-class="text-primary" label-style="font-size: 0.9em" color="primary" />
        <div class="text-h6">Inspección Técnica</div>
        <q-scroll-area style="height: 300px; max-width: 600px">
          <canvas style="min-width: 560px" id="it"></canvas>
        </q-scroll-area>
      </q-card-section>
    </q-card>
    <q-card bordered class="my-card q-ma-md text-center">
      <q-card-section>
        <q-inner-loading :showing="loading" label="Cargando..." label-class="text-primary" label-style="font-size: 0.9em" color="primary" />
        <div class="text-h6">Mantenimiento Preventivo</div>
        <q-scroll-area style="height: 300px; max-width: 600px">
          <canvas style="min-width: 560px" id="mp"></canvas>
        </q-scroll-area>
      </q-card-section>
    </q-card>
    <q-card bordered class="my-card q-ma-md text-center">
      <q-card-section>
        <q-inner-loading :showing="loading" label="Cargando..." label-class="text-primary" label-style="font-size: 0.9em" color="primary" />
        <div class="text-h6">No Aprobado - Deposito</div>
        <div id="map" class="map"></div>
      </q-card-section>
    </q-card>
  </div>
</template>
<script setup>
import { useIndicadorStore } from "@/store/indicaStore";
import { storeToRefs } from "pinia";
import { ref, computed } from "vue";
import { invoke, until } from "@vueuse/core";
import Chart from "chart.js/auto";
import { Loader } from "@googlemaps/js-api-loader";
import { terminales_map, client, hdasboard_link } from "@/client";

const { getindicador } = useIndicadorStore();
const { m_indicador_change } = storeToRefs(useIndicadorStore());

const loading = ref(true);

const showDashboard = computed(() => {
  if (["voy", "redbus", "conecta", "granamericas", "metropol", "subus"].includes(client)) return true;
  else return false;
});

invoke(async () => {
  //Espera ejecución hasta que exista algun dato
  await until(m_indicador_change).toMatch((v) => v > 0);
  const indicadores = await getindicador({
    uuid: `indicadores_${client}`,
  });

  loading.value = false;
  new Chart(document.getElementById("eg"), {
    data: {
      datasets: [
        {
          type: "bar",
          label: "Total",
          data: indicadores.eg_total,
        },
        {
          type: "line",
          label: "No Aprobado",
          data: indicadores.eg_noaprobado,
        },
      ],
      labels: indicadores.meses,
    },
  });
  new Chart(document.getElementById("it"), {
    data: {
      datasets: [
        {
          type: "bar",
          label: "Total",
          data: indicadores.it_total,
        },
        {
          type: "line",
          label: "No Aprobado",
          data: indicadores.it_noaprobado,
        },
      ],
      labels: indicadores.meses,
    },
  });
  new Chart(document.getElementById("mp"), {
    data: {
      datasets: [
        {
          type: "bar",
          label: "Total",
          data: indicadores.mp_total,
        },
        {
          type: "line",
          label: "No Aprobado",
          data: indicadores.mp_noaprobado,
        },
      ],
      labels: indicadores.meses,
    },
  });
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

  //EG No aprobado
  for (const depo in indicadores.eg_noaprobado_depo) {
    const terminal = terminales_map.get(depo);
    new google.maps.Circle({
      strokeColor: "#943126",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#943126",
      fillOpacity: 0.35,
      map,
      center: { lat: terminal[2], lng: terminal[1] },
      radius: Math.sqrt(indicadores.eg_noaprobado_depo[depo]) * 1000,
    });
  }

  //IT No aprobado
  for (const depo in indicadores.it_noaprobado_depo) {
    const terminal = terminales_map.get(depo);
    new google.maps.Circle({
      strokeColor: "#5b2c6f",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#5b2c6f",
      fillOpacity: 0.35,
      map,
      center: { lat: terminal[2], lng: terminal[1] },
      radius: Math.sqrt(indicadores.it_noaprobado_depo[depo]) * 1000,
    });
  }
});
</script>
<style lang="scss" scoped>
.my-card {
  width: 100%;
  max-width: 600px;
}

.my-card-double {
  width: 100%;
  max-width: 1230px;
}

.map {
  margin: 0;
  padding: 0;
  height: 350px;
  max-width: 600px;
}
.map :deep(.custom-map-control-button) {
  background-color: #fff;
  border: 2px solid #fff;
  border-radius: 3px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  color: rgb(102, 102, 102);
  margin: 10px;
  font: 400 24px Material Icons;
  cursor: pointer;
  text-align: center;
  line-height: 34px;
}
.map :deep(.custom-map-control-button:hover) {
  color: rgb(17, 17, 17);
}

.iframe-container {
  width: 100%;
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

@media (max-width: 700px) {
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

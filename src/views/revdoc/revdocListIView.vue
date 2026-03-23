<template>
  <div class="q-pa-md">
    <q-table
      title="Registros"
      :rows="incidente_arr"
      :columns="columns"
      :filter="filter"
      row-key="uuid"
      class="q-ma-md"
      :loading="loading"
      :pagination="pagination"
      :visible-columns="visible_cols"
      :rows-per-page-options="[0]"
      no-data-label="No se han encontrado registros"
      no-results-label="No se encuentran resultados para búsqueda"
      loading-label="Cargando.."
    >
      <template v-slot:top>
        <q-btn color="primary" to="/revdocI/add" label="Agregar" class="q-mr-sm" />
        <q-btn color="dark" label="Histórico" class="q-mr-sm" @click="exportTable" :loading="loading_his" />
        <q-space />
        <q-input debounce="500" dense v-model="filter" label="Filtrar" type="search" style="max-width: 50%" input-class="text-uppercase">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
      <template v-slot:no-data="{ message }">
        <div class="full-width row flex-center text-accent q-gutter-sm">
          <q-icon size="2em" name="sentiment_dissatisfied" />
          <span> {{ message }} </span>
        </div>
      </template>
    </q-table>
  </div>
</template>
<script setup>
import { useIncideStore } from "@/store/incideStore";
import { storeToRefs } from "pinia";
import { ref, watch, shallowRef } from "vue";
import { exportFile, useQuasar } from "quasar";
import { stringify } from "csv-stringify/browser/esm/sync";

const visible_cols = [
  "unidad_negocio",
  "unidad_servicio",
  "uuid",
  "estado",
  "placa_patente",
  "tipo_servicio",
  "sistema_componente",
  "inc_apertura_fecha",
  "inc_apertura_hora",
  "inc_cierre_fecha",
  "inc_cierre_hora",
  "inc_taller_planta",
  "km_ejecucion",
  "causa_origen",
  "uuid_estado_general",
];
const estado_map = new Map([
  [0, "En Proceso"],
  [1, "Finalizada"],
  [2, ""],
  [3, "Eliminada"],
]);
const tipos_map = new Map([
  [0, "INCIDENTE"],
  [1, "SINIESTRO"],
]);

const columns = [
  {
    name: "unidad_negocio",
    label: "Unidad Negocio",
    field: "unidad_negocio",
    align: "center",
  },
  {
    name: "unidad_servicio",
    label: "Unidad Servicio",
    field: "unidad_servicio",
    align: "center",
  },
  {
    name: "uuid",
    label: "ID",
    field: "uuid",
    align: "center",
  },
  {
    name: "estado",
    label: "Estado",
    field: (row) => estado_map.get(row.estado) || "",
    align: "center",
  },
  {
    name: "placa_patente",
    label: "Placa Patente",
    field: "placa_patente",
    align: "center",
  },
  {
    name: "tipo",
    label: "Tipo",
    field: (row) => tipos_map.get(row.tipo) || "INCIDENTE",
    align: "center",
  },
  {
    name: "sistema_componente",
    label: "Sistema / Componente",
    field: "sistema_componente",
    align: "center",
  },
  {
    name: "causa_origen",
    label: "Causa / Origen",
    field: "causa_origen",
    align: "center",
  },
  {
    name: "inc_apertura_fecha",
    label: "Fecha Apertura",
    field: "inc_apertura_fecha",
    align: "center",
  },
  {
    name: "inc_apertura_hora",
    label: "Hora Apertura",
    field: "inc_apertura_hora",
    align: "center",
  },
  {
    name: "inc_cierre_fecha",
    label: "Fecha Cierre",
    field: "inc_cierre_fecha",
    align: "center",
  },
  {
    name: "inc_cierre_hora",
    label: "Hora Cierre",
    field: "inc_cierre_hora",
    align: "center",
  },
  {
    name: "uuid_estado_general",
    label: "ID Estado General",
    field: "uuid_estado_general",
    align: "center",
  },
  {
    name: "inc_taller_planta",
    label: "Taller / Planta",
    field: "inc_taller_planta",
    align: "center",
  },
  {
    name: "km_ejecucion",
    label: "Km Ejecución",
    field: "km_ejecucion",
    align: "center",
  },
  {
    name: "inc_apertura_timestamp",
    field: "inc_apertura_timestamp",
  },
];
const filter = ref("");
const pagination = ref({
  sortBy: "inc_apertura_timestamp",
  descending: true,
  page: 1,
  rowsPerPage: 7,
});

const { m_incidente_change } = storeToRefs(useIncideStore());
const { getall, gethistoric } = useIncideStore();
const incidente_arr = shallowRef([]);
const { notify } = useQuasar();
const loading = ref(true);
const loading_his = ref(false);

const exportTable = async () => {
  loading_his.value = true;
  const content = [];
  content.push([
    "UNIDAD NEGOCIO",
    "UNIDAD SERVICIO",
    "ID",
    "ESTADO",
    "PLACA PATENTE",
    "TIPO SERVICIO",
    "SISTEMA / COMPONENTE",
    "CAUSA / ORIGEN",
    "FECHA APERTURA",
    "HORA APERTURA",
    "FECHA CIERRE",
    "HORA CIERRE",
    "ID ESTADO GENERAL",
    "TALLER / PLANTA",
    "KM EJECUCION",
  ]);
  const registros = await gethistoric();
  if (registros.length === 0) {
    loading_his.value = false;
    return notify({
      color: "red-6",
      textColor: "white",
      icon: "error",
      message: "No ha sido posible descargar histórico",
      timeout: 1000,
    });
  }
  for (const registro of registros) {
    content.push([
      registro.unidad_negocio,
      registro.unidad_servicio,
      registro.uuid,
      estado_map.get(registro.estado)?.toUpperCase() || "",
      registro.placa_patente,
      tipos_map.get(registro.tipo) || "INCIDENTE",
      registro.sistema_componente,
      registro.causa_origen,
      registro.inc_apertura_fecha,
      registro.inc_apertua_hora,
      registro.inc_cierre_fecha,
      registro.inc_cierre_hora,
      registro.uuid_estado_general,
      registro.inc_taller_planta,
      registro.km_ejecucion,
    ]);
  }
  const data = stringify(content, {
    delimiter: ";",
    quoted_string: true,
    bom: true,
  });
  exportFile("incidentes.csv", data, "text/csv");
  loading_his.value = false;
};
watch(
  () => m_incidente_change.value,
  async () => {
    incidente_arr.value = await getall();
    if (m_incidente_change.value > 0) loading.value = false;
  },
  { immediate: true },
);
</script>

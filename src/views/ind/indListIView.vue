<template>
  <div class="q-pa-md">
    <q-table
      title="Registros"
      :rows="incumple_arr"
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
import { useIncpStore } from "@/store/incpStore";
import { storeToRefs } from "pinia";
import { ref, watch, shallowRef } from "vue";
import { exportFile } from "quasar";
import { stringify } from "csv-stringify/browser/esm/sync";
import { useQuasar } from "quasar";

const visible_cols = [
  "unidad_negocio",
  "unidad_servicio",
  "uuid",
  "estado",
  "placa_patente",
  "actividad",
  "causa",
  "fecha_inicio",
  "hora_inicio",
  "fecha_termino",
  "hora_termino",
];
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
    field: (row) => (row.estado === 0 ? "En Proceso" : row.estado === 1 ? "Finalizado" : row.estado === 3 ? "Eliminado" : ""),
    align: "center",
  },
  {
    name: "placa_patente",
    label: "Placa Patente",
    field: "placa_patente",
    align: "center",
  },
  {
    name: "actividad",
    label: "Actividad",
    field: (row) =>
      row.actividad === 0 ? "ESTADO GENERAL" : row.actividad === 1 ? "INSPECCION TECNICA" : row.actividad === 2 ? "MANTENIMIENTO PREVENTIVO" : "",
    align: "center",
  },
  {
    name: "causa",
    label: "Causa",
    field: (row) => (row.causa === 0 ? "NO PRESENTADO" : row.causa === 1 ? "NO APROBADO" : ""),
    align: "center",
  },
  {
    name: "fecha_inicio",
    label: "Fecha Inicio",
    field: "fecha_inicio",
    align: "center",
  },
  {
    name: "hora_inicio",
    label: "Hora inicio",
    field: "hora_inicio",
    align: "center",
  },
  {
    name: "fecha_termino",
    label: "Fecha Termino",
    field: "fecha_termino",
    align: "center",
  },
  {
    name: "hora_termino",
    label: "Hora Termino",
    field: "hora_termino",
    align: "center",
  },
  {
    name: "fecha_inicio_timestamp",
    field: "fecha_inicio_timestamp",
  },
];
const pagination = ref({
  sortBy: "fecha_inicio_timestamp",
  descending: true,
  page: 1,
  rowsPerPage: 7,
});

const { m_incumple_change } = storeToRefs(useIncpStore());
const { getall, gethistoric } = useIncpStore();
const incumple_arr = shallowRef([]);
const { notify } = useQuasar();
const filter = ref("");
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
    "ACTIVIDAD",
    "CAUSA",
    "FECHA INICIO",
    "HORA INICIO",
    "FECHA TERMINO",
    "HORA TERMINO",
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
  for (const revision of registros) {
    content.push([
      revision.unidad_negocio,
      revision.unidad_servicio,
      revision.uuid,
      revision.estado === 0 ? "EN PROCESO" : revision.estado === 1 ? "FINALIZADO" : revision.estado === 3 ? "ELIMINADO" : "",
      revision.placa_patente,
      revision.actividad === 0
        ? "ESTADO GENERAL"
        : revision.actividad === 1
          ? "INSPECCION TECNICA"
          : revision.actividad === 2
            ? "MANTENIMIENTO PREVENTIVO"
            : "",
      revision.causa === 0 ? "NO PRESENTADO" : revision.causa === 1 ? "NO APROBADO" : "",
      revision.fecha_inicio,
      revision.hora_inicio,
      revision.fecha_termino,
      revision.hora_termino,
    ]);
  }
  const data = stringify(content, {
    delimiter: ";",
    quoted_string: true,
    bom: true,
  });
  exportFile("incumplimiento.csv", data, "text/csv");
  loading_his.value = false;
};
watch(
  () => m_incumple_change.value,
  async () => {
    incumple_arr.value = await getall();
    if (m_incumple_change.value > 0) loading.value = false;
  },
  { immediate: true },
);
</script>

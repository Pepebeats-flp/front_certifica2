<template>
  <div>
    <SmartTable
      :rows="incumple_arr"
      :columns="columns"
      row-key="uuid"
      :loading="loading"
      persist-key="ind-list-i"
      search-placeholder="Buscar por placa, actividad..."
      empty-icon="gpp_bad"
      empty-text="Aún no hay incumplimientos registrados"
      :initial-search="routeSearch"
    >
      <template #top-left>
        <q-btn color="dark" icon="archive" label="Histórico" :loading="loading_his" @click="exportTable" />
      </template>
    </SmartTable>
  </div>
</template>

<script setup>
import SmartTable from "@/components/shared/SmartTable.vue";
import { useIncpStore } from "@/store/incpStore";
import { storeToRefs } from "pinia";
import { ref, watch, shallowRef } from "vue";
import { useRoute } from "vue-router";
import { exportFile } from "quasar";
import { stringify } from "csv-stringify/browser/esm/sync";
import { useQuasar } from "quasar";

const estadoColorMap = {
  "En Proceso": "orange",
  "Finalizado": "positive",
  "Eliminado": "negative",
};

const columns = [
  { name: "unidad_negocio", label: "UN", field: "unidad_negocio", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "unidad_servicio", label: "US", field: "unidad_servicio", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "uuid", label: "ID", field: "uuid", align: "center", responsive: ["sm", "md", "lg", "xl"], width: "90px" },
  {
    name: "estado", label: "Estado", align: "center",
    field: (row) => row.estado === 0 ? "En Proceso" : row.estado === 1 ? "Finalizado" : row.estado === 3 ? "Eliminado" : "",
    chip: true, chipColor: (row) => {
      const e = row.estado === 0 ? "En Proceso" : row.estado === 1 ? "Finalizado" : row.estado === 3 ? "Eliminado" : "";
      return estadoColorMap[e] || "grey";
    },
    width: "130px", chipOutline: true,
  },
  { name: "placa_patente", label: "Placa Patente", field: "placa_patente", align: "center", width: "110px", style: "font-weight: 700; letter-spacing: 0.5px;", headerStyle: "font-weight: 700;" },
  {
    name: "actividad", label: "Actividad", align: "center",
    field: (row) => row.actividad === 0 ? "ESTADO GENERAL" : row.actividad === 1 ? "INSPECCION TECNICA" : row.actividad === 2 ? "MANTENIMIENTO PREVENTIVO" : "",
  },
  {
    name: "causa", label: "Causa", align: "center",
    field: (row) => row.causa === 0 ? "NO PRESENTADO" : row.causa === 1 ? "NO APROBADO" : "",
    chip: true, chipColor: (row) => row.causa === 0 ? "warning" : row.causa === 1 ? "negative" : "grey",
  },
  { name: "fecha_inicio", label: "Fecha Inicio", field: "fecha_inicio", align: "center" },
  { name: "hora_inicio", label: "Hora", field: "hora_inicio", align: "center", responsive: ["md", "lg", "xl"], width: "70px" },
  { name: "fecha_termino", label: "Fecha Término", field: "fecha_termino", align: "center" },
  { name: "hora_termino", label: "Hora Término", field: "hora_termino", align: "center", responsive: ["md", "lg", "xl"], width: "70px" },
];

const { m_incumple_change } = storeToRefs(useIncpStore());
const { getall, gethistoric } = useIncpStore();
const incumple_arr = shallowRef([]);
const { notify } = useQuasar();
const loading = ref(true);
const loading_his = ref(false);
const route = useRoute();
const routeSearch = route.query.search || "";

const exportTable = async () => {
  loading_his.value = true;
  const content = [
    ["UNIDAD NEGOCIO", "UNIDAD SERVICIO", "ID", "ESTADO", "PLACA PATENTE", "ACTIVIDAD", "CAUSA", "FECHA INICIO", "HORA INICIO", "FECHA TERMINO", "HORA TERMINO"],
  ];
  const registros = await gethistoric();
  if (registros.length === 0) {
    loading_his.value = false;
    return notify({ color: "red-6", textColor: "white", icon: "error", message: "No ha sido posible descargar histórico", timeout: 1000 });
  }
  for (const revision of registros) {
    content.push([
      revision.unidad_negocio, revision.unidad_servicio, revision.uuid,
      revision.estado === 0 ? "EN PROCESO" : revision.estado === 1 ? "FINALIZADO" : revision.estado === 3 ? "ELIMINADO" : "",
      revision.placa_patente,
      revision.actividad === 0 ? "ESTADO GENERAL" : revision.actividad === 1 ? "INSPECCION TECNICA" : revision.actividad === 2 ? "MANTENIMIENTO PREVENTIVO" : "",
      revision.causa === 0 ? "NO PRESENTADO" : revision.causa === 1 ? "NO APROBADO" : "",
      revision.fecha_inicio, revision.hora_inicio, revision.fecha_termino, revision.hora_termino,
    ]);
  }
  const data = stringify(content, { delimiter: ";", quoted_string: true, bom: true });
  exportFile("incumplimiento.csv", data, "text/csv");
  loading_his.value = false;
};

watch(
  () => m_incumple_change.value,
  async () => {
    incumple_arr.value = await getall();
    if (m_incumple_change.value > 0) loading.value = false;
  },
  { immediate: true }
);
</script>

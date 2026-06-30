<template>
  <div>
    <SmartTable
      :rows="estado_general_arr"
      :columns="columns"
      row-key="uuid"
      :loading="loading"
      persist-key="estadog-list-r"
      search-placeholder="Buscar por placa, monitor, lugar..."
      empty-icon="directions_bike"
      empty-text="Aún no hay reprogramaciones registradas"
    >
      <template #top-left>
        <q-btn color="dark" icon="archive" label="Histórico" :loading="loading_his" @click="exportTable" />
      </template>

      <template #body-cell-actions="{ row }">
        <q-btn color="green" icon="search" flat dense @click="onSearch(row)">
          <q-tooltip>Ver detalle</q-tooltip>
        </q-btn>
      </template>
    </SmartTable>
  </div>
</template>

<script setup>
import SmartTable from "@/components/shared/SmartTable.vue";
import { useEstadogStore } from "@/store/estadogStore";
import { storeToRefs } from "pinia";
import { ref, watch, shallowRef } from "vue";
import { exportFile, useQuasar } from "quasar";
import { stringify } from "csv-stringify/browser/esm/sync";
import { useRouter } from "vue-router";

const estadoColorMap = {
  "En Proceso": "orange",
  "Finalizada": "positive",
  "Eliminada": "negative",
};

const resultadoColorMap = {
  "Aprobado": "positive",
  "No Aprobado": "negative",
  "No Aprobado/No Presentado": "negative",
  "No Aprobado/Dtpm": "warning",
};

const columns = [
  { name: "unidad_negocio", label: "UN", field: "unidad_negocio", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "unidad_servicio", label: "US", field: "unidad_servicio", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "uuid", label: "Id", field: "uuid", align: "center", sortable: true, responsive: ["sm", "md", "lg", "xl"], width: "90px" },
  {
    name: "estado", label: "Estado", align: "center", sortable: true,
    field: (row) => row.estado === 4 ? "En Proceso" : row.estado === 5 ? "Finalizada" : row.estado === 6 ? "Eliminada" : "",
    chip: true, chipColor: (row) => {
      const e = row.estado === 4 ? "En Proceso" : row.estado === 5 ? "Finalizada" : row.estado === 6 ? "Eliminada" : "";
      return estadoColorMap[e] || "grey";
    },
    width: "130px", chipOutline: true,
  },
  {
    name: "fecha_inicio", label: "Fecha Creación", field: "fecha_inicio", align: "center", sortable: true,
    sort: (a, b) => { const dA = a.split("/"), dB = b.split("/"); return new Date(+dA[2], dA[1] - 1, +dA[0]) - new Date(+dB[2], dB[1] - 1, +dB[0]); },
    responsive: ["sm", "md", "lg", "xl"],
  },
  { name: "hora_inicio", label: "Hora", field: "hora_inicio", align: "center", responsive: ["md", "lg", "xl"], width: "70px" },
  { name: "lugar_inspeccion", label: "Lugar Inspección", field: "lugar_inspeccion", align: "center", sortable: true, responsive: ["sm", "md", "lg", "xl"] },
  {
    name: "placa_patente", label: "Placa Patente", field: "placa_patente", align: "center", sortable: true, width: "110px",
    style: "font-weight: 700; letter-spacing: 0.5px;", headerStyle: "font-weight: 700;",
  },
  { name: "kilometraje", label: "Km", field: "kilometraje", align: "center", sortable: true, responsive: ["sm", "md", "lg", "xl"], width: "80px" },
  { name: "user_name", label: "Monitor", field: "user_name", align: "center", sortable: true, responsive: ["md", "lg", "xl"] },
  { name: "dbaja", label: "Def. Bajos", field: (row) => (isNaN(row?.total_lows - row?.curr_lows) ? "" : row.total_lows - row.curr_lows), align: "center", sortable: true, responsive: ["lg", "xl"], width: "90px" },
  { name: "dmedia", label: "Def. Medios", field: (row) => (isNaN(row?.total_mediums - row?.curr_mediums) ? "" : row.total_mediums - row.curr_mediums), align: "center", sortable: true, responsive: ["lg", "xl"], width: "90px" },
  { name: "dalta", label: "Def. Altos", field: (row) => (isNaN(row?.total_highs - row?.curr_highs) ? "" : row.total_highs - row.curr_highs), align: "center", sortable: true, responsive: ["lg", "xl"], width: "90px" },
  { name: "defectos", label: "Defectos", field: (row) => row?.defectos?.join(",") || "", align: "center", sortable: true, responsive: ["lg", "xl"], width: "120px" },
  {
    name: "resultado", label: "Resultado", align: "center", sortable: true,
    field: (row) =>
      row.estado === 5 && row.resultado.at(-1)?.causa === 0 ? "No Aprobado/No Presentado"
      : row.estado === 5 && row.resultado.at(-1)?.causa === 1 ? "No Aprobado/Dtpm"
      : row.estado === 5 && row.resultado.at(-1)?.certifica === true ? "Aprobado"
      : row.estado === 5 && row.resultado.at(-1)?.certifica === false ? "No Aprobado"
      : "",
    chip: true, chipColor: (row) => {
      const val = row.estado === 5 && row.resultado.at(-1)?.causa === 0 ? "No Aprobado/No Presentado"
        : row.estado === 5 && row.resultado.at(-1)?.causa === 1 ? "No Aprobado/Dtpm"
        : row.estado === 5 && row.resultado.at(-1)?.certifica === true ? "Aprobado"
        : row.estado === 5 && row.resultado.at(-1)?.certifica === false ? "No Aprobado" : "";
      return resultadoColorMap[val] || "grey";
    },
    responsive: ["sm", "md", "lg", "xl"], width: "140px",
  },
  {
    name: "fecha_termino", label: "Fecha Término", field: (row) => (row.estado === 5 ? row.resultado.at(-1).fecha : ""), align: "center", sortable: true,
    sort: (a, b) => { const dA = a.split("/"), dB = b.split("/"); return new Date(+dA[2], dA[1] - 1, +dA[0]) - new Date(+dB[2], dB[1] - 1, +dB[0]); },
    responsive: ["sm", "md", "lg", "xl"],
  },
  { name: "hora_termino", label: "Hora Término", field: (row) => (row.estado === 5 ? row.resultado.at(-1).hora : ""), align: "center", responsive: ["md", "lg", "xl"], width: "70px" },
  { name: "obs_inspeccion", label: "Observación", field: "obs_inspeccion", align: "center", sortable: true, responsive: ["xl"] },
  { name: "hasPendingWrites", label: "Sync", field: "hasPendingWrites", align: "center", format: (val) => val ? "Pendiente" : "OK", responsive: ["md", "lg", "xl"], width: "80px" },
  { name: "actions", label: "Acciones", field: "", align: "center", width: "80px" },
];

const { m_estado_general_change } = storeToRefs(useEstadogStore());
const { getall, gethistoric } = useEstadogStore();
const estado_general_arr = shallowRef([]);
const { notify } = useQuasar();
const router = useRouter();
const loading = ref(true);
const loading_his = ref(false);

const onSearch = (row) => {
  router.push({ name: "estadog_detr", params: { uuid: row.uuid, view: true } });
};

const exportTable = async () => {
  loading_his.value = true;
  const content = [
    ["UNIDAD NEGOCIO", "UNIDAD SERVICIO", "ID", "ESTADO", "FECHA CREACION", "HORA CREACION", "LUGAR INSPECCION", "PLACA PATENTE", "KILOMETRAJE", "MONITOR", "DEFECTOS BAJOS", "DEFECTOS MEDIOS", "DEFECTOS ALTOS", "DEFECTOS", "RESULTADO", "FECHA TERMINO", "HORA TERMINO", "OBSERVACION"],
  ];
  const registros = await gethistoric();
  if (registros.length === 0) {
    loading_his.value = false;
    return notify({ color: "red-6", textColor: "white", icon: "error", message: "No ha sido posible descargar histórico", timeout: 1000 });
  }
  for (const estado of registros) {
    if (![4, 5, 6].includes(estado.estado)) continue;
    content.push([
      estado.unidad_negocio, estado.unidad_servicio, estado.uuid,
      estado.estado === 4 ? "En Proceso" : estado.estado === 5 ? "Finalizada" : estado.estado === 6 ? "Eliminada" : "",
      estado.fecha_inicio, estado.hora_inicio, estado.lugar_inspeccion, estado.placa_patente, estado.kilometraje, estado.user_name,
      isNaN(estado?.total_lows - estado?.curr_lows) ? "" : estado.total_lows - estado.curr_lows,
      isNaN(estado?.total_mediums - estado?.curr_mediums) ? "" : estado.total_mediums - estado.curr_mediums,
      isNaN(estado?.total_highs - estado?.curr_highs) ? "" : estado.total_highs - estado.curr_highs,
      estado?.defectos?.join(","),
      estado.estado === 5 && estado.resultado.at(-1)?.causa === 0 ? "No Aprobado/No Presentado"
      : estado.estado === 5 && estado.resultado.at(-1)?.causa === 1 ? "No Aprobado/Dtpm"
      : estado.estado === 5 && estado.resultado.at(-1)?.certifica === true ? "Aprobado"
      : estado.estado === 5 && estado.resultado.at(-1)?.certifica === false ? "No Aprobado" : "",
      estado.estado === 5 ? estado.resultado.at(-1).fecha : "",
      estado.estado === 5 ? estado.resultado.at(-1).hora : "",
      estado.obs_inspeccion?.replaceAll("\n", ". "),
    ]);
  }
  const data = stringify(content, { delimiter: ";", quoted_string: true, bom: true });
  exportFile("reprograma.csv", data, "text/csv");
  loading_his.value = false;
};

watch(
  () => m_estado_general_change.value,
  async () => {
    estado_general_arr.value = await getall(true);
    if (m_estado_general_change.value > 0) loading.value = false;
  },
  { immediate: true }
);
</script>

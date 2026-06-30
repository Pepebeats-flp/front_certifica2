<template>
  <div>
    <SmartTable
      :rows="registros_arr"
      :columns="columns"
      row-key="uuid"
      :loading="loading"
      persist-key="repres-list"
      search-placeholder="Buscar por lugar, monitor..."
      empty-icon="directions_bike"
      empty-text="Aún no hay registros presenciales"
      :initial-search="routeSearch"
    >
      <template #top-left>
        <q-btn v-if="!only_view" color="primary" icon="add" to="/repres/add" label="Agregar" />
        <q-btn color="dark" icon="archive" label="Histórico" :loading="loading_his" @click="exportTable" />
      </template>

      <template #empty-action>
        <q-btn v-if="!only_view" color="primary" icon="add" label="Crear primer registro" to="/repres/add" />
      </template>

      <template #body-cell-actions="{ row }">
        <q-btn v-if="!only_view && canDelete(row)" color="negative" icon="delete" flat dense @click="onDelete(row)">
          <q-tooltip>Eliminar</q-tooltip>
        </q-btn>
      </template>
    </SmartTable>
  </div>
</template>

<script setup>
import SmartTable from "@/components/shared/SmartTable.vue";
import { useRepresStore } from "@/store/represStore";
import { storeToRefs } from "pinia";
import { ref, watch, shallowRef } from "vue";
import { exportFile, useQuasar } from "quasar";
import { useUserStore } from "@/store/userStore";
import { useRoute } from "vue-router";
import { stringify } from "csv-stringify/browser/esm/sync";

const estadoColorMap = {
  "En Proceso": "orange",
  "Finalizada": "positive",
  "Reinspección": "warning",
  "Eliminada": "negative",
};

const columns = [
  { name: "unidad_negocio", label: "UN", field: "unidad_negocio", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "unidad_servicio", label: "US", field: "unidad_servicio", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "uuid", label: "Id", field: "uuid", align: "center", sortable: true, responsive: ["sm", "md", "lg", "xl"], width: "90px" },
  {
    name: "estado", label: "Estado", align: "center", sortable: true,
    field: (row) => row.estado === 0 ? "En Proceso" : row.estado === 1 ? "Finalizada" : row.estado === 2 ? "Reinspección" : row.estado === 3 ? "Eliminada" : "",
    chip: true, chipColor: (row) => {
      const e = row.estado === 0 ? "En Proceso" : row.estado === 1 ? "Finalizada" : row.estado === 2 ? "Reinspección" : row.estado === 3 ? "Eliminada" : "";
      return estadoColorMap[e] || "grey";
    },
    width: "130px", chipOutline: true,
  },
  {
    name: "fecha_inicio", label: "Fecha Inicio", field: "fecha_inicio", align: "center", sortable: true,
    sort: (a, b) => { const dA = a.split("/"), dB = b.split("/"); return new Date(+dA[2], dA[1] - 1, +dA[0]) - new Date(+dB[2], dB[1] - 1, +dB[0]); },
    responsive: ["sm", "md", "lg", "xl"],
  },
  { name: "hora_inicio", label: "Hora", field: "hora_inicio", align: "center", responsive: ["md", "lg", "xl"], width: "70px" },
  { name: "lugar_inspeccion", label: "Lugar Inspección", field: "lugar_inspeccion", align: "center", sortable: true, responsive: ["sm", "md", "lg", "xl"] },
  { name: "user_name", label: "Monitor", field: "user_name", align: "center", sortable: true, responsive: ["md", "lg", "xl"] },
  {
    name: "fecha_termino", label: "Fecha Término", field: "fecha_termino", align: "center", sortable: true,
    sort: (a, b) => { const dA = a.split("/"), dB = b.split("/"); return new Date(+dA[2], dA[1] - 1, +dA[0]) - new Date(+dB[2], dB[1] - 1, +dB[0]); },
    responsive: ["sm", "md", "lg", "xl"],
  },
  { name: "hora_termino", label: "Hora Término", field: "hora_termino", align: "center", responsive: ["md", "lg", "xl"], width: "70px" },
  { name: "hasPendingWrites", label: "Sync", field: "hasPendingWrites", align: "center", format: (val) => val ? "Pendiente" : "OK", responsive: ["md", "lg", "xl"], width: "80px" },
  { name: "actions", label: "Acciones", field: "", align: "center", width: "80px" },
];

const { m_change } = storeToRefs(useRepresStore());
const { update, getall, gethistoric } = useRepresStore();
const registros_arr = shallowRef([]);
const { notify } = useQuasar();
const { uid, only_view, admin } = useUserStore();
const route = useRoute();
const routeSearch = route.query.search || "";
const loading = ref(true);
const loading_his = ref(false);

const canDelete = (row) => ![3].includes(row.estado) && (row.user_uid === uid || admin);

const onDelete = (row) => {
  if (!canDelete(row)) {
    notify({ color: "red-6", textColor: "white", icon: "error", message: "Presencia no puede ser eliminada", timeout: 1000 });
    return;
  }
  update({ uuid: row.uuid, estado: 3 });
  notify({ color: "green-6", textColor: "white", icon: "cloud_done", message: "Presencia eliminada", timeout: 1000 });
};

const exportTable = async () => {
  loading_his.value = true;
  const content = [
    ["UNIDAD NEGOCIO", "UNIDAD SERVICIO", "ID", "ESTADO", "FECHA INICIO", "HORA INICIO", "LUGAR INSPECCION", "MONITOR", "FECHA TERMINO", "HORA TERMINO"],
  ];
  const registros = await gethistoric();
  if (registros.length === 0) {
    loading_his.value = false;
    return notify({ color: "red-6", textColor: "white", icon: "error", message: "No ha sido posible descargar histórico", timeout: 1000 });
  }
  for (const estado of registros) {
    content.push([
      estado.unidad_negocio, estado.unidad_servicio, estado.uuid,
      estado.estado === 0 ? "En Proceso" : estado.estado === 1 ? "Finalizada" : estado.estado === 2 ? "Reinspección" : estado.estado === 3 ? "Eliminada" : "",
      estado.fecha_inicio, estado.hora_inicio, estado.lugar_inspeccion, estado.user_name,
      estado.fecha_termino, estado.hora_termino,
    ]);
  }
  const data = stringify(content, { delimiter: ";", quoted_string: true, bom: true });
  exportFile("registro_presencial.csv", data, "text/csv");
  loading_his.value = false;
};

watch(
  () => m_change.value,
  async () => {
    registros_arr.value = await getall();
    if (m_change.value > 0) loading.value = false;
  },
  { immediate: true }
);
</script>

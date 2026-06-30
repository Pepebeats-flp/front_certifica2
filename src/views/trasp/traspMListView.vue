<template>
  <div>
    <SmartTable
      :rows="estado_general_arr"
      :columns="columns"
      row-key="uuid"
      :loading="loading"
      persist-key="traspm-list"
      search-placeholder="Buscar..."
      empty-icon="arrow_upward"
      empty-text="No hay traspasos mayores registrados"
    >
      <template #top-left>
        <q-btn color="dark" label="Histórico" class="q-mr-sm" @click="exportTable" :loading="loading_his" />
      </template>
      <template #body-cell-desconexion="{ row }">
        <q-td>
          <q-chip v-if="row.version !== 'G'" :color="row.c0_pend === false && row.l0_pend === false ? 'positive' : 'negative'" text-color="white" dense class="text-weight-bold" square>
            {{ row.c0_pend === false && row.l0_pend === false ? "Finalizada" : "Pendiente" }}
          </q-chip>
        </q-td>
      </template>
      <template #body-cell-loza="{ row }">
        <q-td>
          <q-chip :color="row.c1_pend === false && row.l1_pend === false ? 'positive' : 'negative'" text-color="white" dense class="text-weight-bold" square>
            {{ row.c1_pend === false && row.l1_pend === false ? "Finalizada" : "Pendiente" }}
          </q-chip>
        </q-td>
      </template>
      <template #body-cell-pozo="{ row }">
        <q-td>
          <q-chip :color="row.c2_pend === false && row.l2_pend === false ? 'positive' : 'negative'" text-color="white" dense class="text-weight-bold" square>
            {{ row.c2_pend === false && row.l2_pend === false ? "Finalizada" : "Pendiente" }}
          </q-chip>
        </q-td>
      </template>
      <template #body-cell-techo="{ row }">
        <q-td>
          <q-chip :color="row.c3_pend === false && row.l3_pend === false ? 'positive' : 'negative'" text-color="white" dense class="text-weight-bold" square>
            {{ row.c3_pend === false && row.l3_pend === false ? "Finalizada" : "Pendiente" }}
          </q-chip>
        </q-td>
      </template>
      <template #body-cell-yutong="{ row }">
        <q-td>
          <q-chip v-if="row.version !== 'G'" :color="row.c4_pend === false && row.l4_pend === false ? 'positive' : 'negative'" text-color="white" dense class="text-weight-bold" square>
            {{ row.c4_pend === false && row.l4_pend === false ? "Finalizada" : "Pendiente" }}
          </q-chip>
        </q-td>
      </template>
      <template #body-cell-fotos="{ row }">
        <q-td>
          <q-chip :color="row.filenames?.length >= 5 ? 'positive' : 'negative'" text-color="white" dense class="text-weight-bold" square>
            {{ row.filenames?.length >= 5 ? "Finalizada" : "Pendiente" }}
          </q-chip>
        </q-td>
      </template>
      <template #body-cell-actions="{ row }">
        <q-td>
          <q-btn v-if="!only_view" color="primary" icon="edit" flat dense @click="onEdit(row)">
            <q-tooltip>Editar</q-tooltip>
          </q-btn>
          <q-btn color="primary" icon="search" flat dense @click="onSearch(row)">
            <q-tooltip>Ver detalle</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </SmartTable>
  </div>
</template>

<script setup>
import { useTraspmStore } from "@/store/traspmStore";
import { storeToRefs } from "pinia";
import { ref, watch, shallowRef } from "vue";
import { exportFile, useQuasar } from "quasar";
import { useUserStore } from "@/store/userStore";
import { stringify } from "csv-stringify/browser/esm/sync";
import { useRouter } from "vue-router";
import SmartTable from "@/components/shared/SmartTable.vue";

const columns = [
  { name: "unidad_negocio", label: "UN", field: "unidad_negocio", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "unidad_servicio", label: "US", field: "unidad_servicio", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "uuid", label: "Id", field: "uuid", align: "center", sortable: true, responsive: ["sm", "md", "lg", "xl"], width: "90px" },
  { name: "estado", label: "Estado", field: (row) => row.estado === 0 ? "Abierta" : "Cerrada", align: "center", sortable: true, width: "100px" },
  { name: "fecha_inicio", label: "Fecha Inicio", field: "fecha_inicio", align: "center", sortable: true, responsive: ["sm", "md", "lg", "xl"], sort: (a, b) => { const dA = a.split("/"), dB = b.split("/"); return new Date(+dA[2], dA[1] - 1, +dA[0]) - new Date(+dB[2], dB[1] - 1, +dB[0]); } },
  { name: "hora_inicio", label: "Hora Inicio", field: "hora_inicio", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "lugar_inspeccion", label: "Lugar Inspección", field: "lugar_inspeccion", align: "center", sortable: true, responsive: ["md", "lg", "xl"] },
  { name: "placa_patente", label: "Placa Patente", field: "placa_patente", align: "center", sortable: true, width: "110px", style: "font-weight: 700; letter-spacing: 0.5px;", headerStyle: "font-weight: 700;" },
  { name: "tipo", label: "Tipo", field: (row) => row.version === "G" ? "Diesel" : "Electrico", align: "center", sortable: true, width: "90px" },
  { name: "desconexion", label: "Desconexion", field: "", align: "center" },
  { name: "loza", label: "Loza", field: "", align: "center" },
  { name: "pozo", label: "Pozo", field: "", align: "center" },
  { name: "techo", label: "Techo", field: "", align: "center" },
  { name: "yutong", label: "Yutong", field: "", align: "center" },
  { name: "fotos", label: "Fotos", field: "", align: "center" },
  { name: "fecha_termino", label: "Fecha Termino", field: (row) => (row.version === "G" || (!row.c0_pend && !row.l0_pend)) && !row.c1_pend && !row.l1_pend && !row.c2_pend && !row.l2_pend && !row.c3_pend && !row.l3_pend && (row.version === "G" || (!row.c4_pend && !row.l4_pend)) && row.filenames?.length >= 5 ? row.fecha : "", align: "center", sortable: true, responsive: ["sm", "md", "lg", "xl"], sort: (a, b) => { const dA = a.split("/"), dB = b.split("/"); return new Date(+dA[2], dA[1] - 1, +dA[0]) - new Date(+dB[2], dB[1] - 1, +dB[0]); } },
  { name: "hora_termino", label: "Hora Termino", field: (row) => (row.version === "G" || (!row.c0_pend && !row.l0_pend)) && !row.c1_pend && !row.l1_pend && !row.c2_pend && !row.l2_pend && !row.c3_pend && !row.l3_pend && (row.version === "G" || (!row.c4_pend && !row.l4_pend)) && row.filenames?.length >= 5 ? row.hora : "", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "hasPendingWrites", label: "Sincronizado", field: "hasPendingWrites", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "actions", label: "Acciones", field: "", align: "center" },
  { name: "fecha_inicio_timestamp", field: "fecha_inicio_timestamp" },
];

const { reg_change } = storeToRefs(useTraspmStore());
const { getall, gethistoric } = useTraspmStore();
const estado_general_arr = shallowRef([]);
const { notify } = useQuasar();
const { only_view } = useUserStore();
const router = useRouter();
const loading = ref(true);
const loading_his = ref(false);

const onEdit = (row) => {
  if (![0].includes(row.estado)) {
    notify({ color: "red-6", textColor: "white", icon: "error", message: "Inspección no puede ser editada", timeout: 1000 });
    return false;
  }
  router.push({ name: "traspm_det", params: { uuid: row.uuid } });
};

const onSearch = (row) => {
  router.push({ name: "traspm_det", params: { uuid: row.uuid, view: true } });
};

const exportTable = async () => {
  loading_his.value = true;
  const content = [];
  content.push(["UNIDAD NEGOCIO", "UNIDAD SERVICIO", "ID", "ESTADO", "FECHA INICIO", "HORA INICIO", "PLACA PATENTE", "TIPO", "DESCONEXION", "LOZA", "POZO", "TECHO", "YUTONG", "FOTOS", "FECHA TERMINO", "HORA TERMINO"]);
  const registros = await gethistoric();
  if (registros.length === 0) {
    loading_his.value = false;
    return notify({ color: "red-6", textColor: "white", icon: "error", message: "No ha sido posible descargar histórico", timeout: 1000 });
  }
  for (const registro of registros) {
    if ([4, 5, 6].includes(registro.estado)) continue;
    content.push([registro.unidad_negocio, registro.unidad_servicio, registro.uuid, registro.estado === 0 ? "Abierta" : "Cerrada", registro.fecha_inicio, registro.hora_inicio, registro.placa_patente, registro.version === "G" ? "Diesel" : "Electrico", registro.version === "G" ? null : registro.c0_pend === false && registro.l0_pend === false ? "Finalizada" : "Pendiente", registro.c1_pend === false && registro.l1_pend === false ? "Finalizada" : "Pendiente", registro.c2_pend === false && registro.l2_pend === false ? "Finalizada" : "Pendiente", registro.c3_pend === false && registro.l3_pend === false ? "Finalizada" : "Pendiente", registro.version === "G" ? null : registro.c4_pend === false && registro.l4_pend === false ? "Finalizada" : "Pendiente", registro.filenames?.length >= 5 ? "Finalizada" : "Pendiente", (registro.version === "G" || (!registro.c0_pend && !registro.l0_pend)) && !registro.c1_pend && !registro.l1_pend && !registro.c2_pend && !registro.l2_pend && !registro.c3_pend && !registro.l3_pend && (registro.version === "G" || (!registro.c4_pend && !registro.l4_pend)) && registro.filenames?.length >= 5 ? registro.fecha : "", (registro.version === "G" || (!registro.c0_pend && !registro.l0_pend)) && !registro.c1_pend && !registro.l1_pend && !registro.c2_pend && !registro.l2_pend && !registro.c3_pend && !registro.l3_pend && (registro.version === "G" || (!registro.c4_pend && !registro.l4_pend)) && registro.filenames?.length >= 5 ? registro.hora : ""]);
  }
  const data = stringify(content, { delimiter: ";", quoted_string: true, bom: true });
  exportFile("inspeccion_traspaso_mayor.csv", data, "text/csv");
  loading_his.value = false;
};

watch(
  () => reg_change.value,
  async () => {
    estado_general_arr.value = await getall(false);
    if (reg_change.value > 0) loading.value = false;
  },
  { immediate: true }
);
</script>

<template>
  <div>
    <SmartTable
      :rows="estado_general_sort"
      :columns="columns"
      row-key="uuid"
      :loading="loading"
      persist-key="estadog-list"
      search-placeholder="Buscar por placa, monitor, lugar..."
      empty-icon="directions_bike"
      empty-text="Aún no hay estados generales registrados"
      :initial-search="routeSearch"
    >
      <template #top-left>
        <q-btn v-if="!only_view" color="primary" icon="add" to="/estadog/add" label="Agregar" />
        <q-btn color="dark" icon="archive" label="Histórico" :loading="loading_his" @click="exportTable" />
      </template>

      <template #empty-action>
        <q-btn v-if="!only_view" color="primary" icon="add" label="Crear primer estado general" to="/estadog/add" />
      </template>

      <template #body-cell-defectos="{ row }">
        <q-td auto-width class="text-center">
          <div v-if="row?.defectos?.length" class="row items-center justify-center q-gutter-xs no-wrap">
            <span class="text-caption">{{ row.defectos.length }} def.</span>
            <q-btn
              dense flat round size="sm" color="primary" icon="visibility"
              @click.stop="showDefectos(row)"
            >
              <q-tooltip>Ver defectos</q-tooltip>
            </q-btn>
          </div>
          <span v-else class="text-grey-6">—</span>
        </q-td>
      </template>

      <template #body-cell-actions="{ row }">
        <q-btn v-if="!only_view && canEdit(row)" color="primary" icon="edit" flat dense @click="onEdit(row)">
          <q-tooltip>Editar</q-tooltip>
        </q-btn>
        <q-btn v-if="canView(row)" color="green" icon="search" flat dense @click="onSearch(row)">
          <q-tooltip>Ver detalle</q-tooltip>
        </q-btn>
        <q-btn v-if="!only_view && canDelete(row)" color="negative" icon="delete" flat dense @click="onDelete(row)">
          <q-tooltip>Eliminar</q-tooltip>
        </q-btn>
        <q-btn v-if="admin" color="accent" icon="change_circle" flat dense @click="onChange(row)">
          <q-tooltip>Cambiar a En Proceso</q-tooltip>
        </q-btn>
        <q-btn v-if="canRepair(row)" color="indigo" icon="construction" flat dense @click="onRepair(row)">
          <q-tooltip>Resolver reinspección</q-tooltip>
        </q-btn>
      </template>
    </SmartTable>

    <q-dialog v-model="dialog_defectos">
      <q-card style="min-width: 320px; max-width: 500px">
        <q-card-section class="row items-center">
          <div class="text-h6">Defectos</div>
          <q-space />
          <div class="text-caption text-grey-7 q-mr-sm">{{ defectos_placa }}</div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <div class="row q-gutter-xs">
            <q-chip v-for="(d, i) in selectedDefectos" :key="i" color="primary" text-color="white" dense :label="d" />
          </div>
          <div v-if="!selectedDefectos?.length" class="text-grey-6 text-center q-pa-md">Sin defectos registrados</div>
        </q-card-section>
        <q-card-section class="text-caption text-grey-6">Total: {{ selectedDefectos?.length || 0 }} defectos</q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialog_repair" transition-show="scale" transition-hide="scale" persistent>
      <q-card>
        <q-form @submit="onCRepair()">
          <q-card-section class="row items-center no-wrap">
            <div>
              <div class="row">
                <div class="text-weight-bold q-mr-sm">RESOLVER</div>
                <div class="text-grey">{{ estado_uuid }}</div>
              </div>
            </div>
            <q-btn flat round color="dark" icon="cancel" v-close-popup @click="causa = null">
              <q-tooltip class="bg-dark">Cancelar</q-tooltip>
            </q-btn>
            <q-btn flat round color="indigo" icon="construction" type="submit">
              <q-tooltip class="bg-indigo">Resolver</q-tooltip>
            </q-btn>
          </q-card-section>
        </q-form>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, watch, shallowRef } from "vue";
import { storeToRefs } from "pinia";
import { exportFile, useQuasar } from "quasar";
import { useRouter, useRoute } from "vue-router";
import { stringify } from "csv-stringify/browser/esm/sync";
import { useEstadogStore } from "@/store/estadogStore";
import { useUserStore } from "@/store/userStore";
import { client } from "@/client";
import SmartTable from "@/components/shared/SmartTable.vue";

const estadoColorMap = {
  "En Proceso": "orange",
  "Finalizada": "positive",
  "Reinspección": "warning",
  "Eliminada": "negative",
  "Reprograma": "info",
};

const resultadoColorMap = {
  "Aprobado": "positive",
  "No Aprobado": "negative",
  "No Aprobado/No Presentado": "negative",
  "No Aprobado/Dtpm": "warning",
  "Pendiente": "grey",
};

const columns = [
  { name: "unidad_negocio", label: "UN", field: "unidad_negocio", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "unidad_servicio", label: "US", field: "unidad_servicio", align: "center", responsive: ["md", "lg", "xl"] },
  {
    name: "uuid", label: "Id", field: "uuid", align: "center", sortable: true,
    responsive: ["sm", "md", "lg", "xl"], width: "90px",
  },
  {
    name: "estado", label: "Estado", align: "center", sortable: true,
    field: (row) =>
      row.estado === 0 ? "En Proceso" : row.estado === 1 ? "Finalizada" : row.estado === 2 ? "Reinspección" : row.estado === 3 ? "Eliminada" : row.estado === 4 ? "Reprograma" : "",
    chip: true, chipColor: (row) => {
      const estado = row.estado === 0 ? "En Proceso" : row.estado === 1 ? "Finalizada" : row.estado === 2 ? "Reinspección" : row.estado === 3 ? "Eliminada" : row.estado === 4 ? "Reprograma" : "";
      return estadoColorMap[estado] || "grey";
    },
    width: "130px",
    chipOutline: true,
  },
  {
    name: "fecha_inicio", label: "Fecha Creación", field: "fecha_inicio", align: "center", sortable: true,
    sort: (a, b) => {
      const dA = a.split("/"), dB = b.split("/");
      return new Date(+dA[2], dA[1] - 1, +dA[0]) - new Date(+dB[2], dB[1] - 1, +dB[0]);
    },
    responsive: ["sm", "md", "lg", "xl"],
  },
  { name: "hora_inicio", label: "Hora", field: "hora_inicio", align: "center", responsive: ["md", "lg", "xl"], width: "70px" },
  { name: "lugar_inspeccion", label: "Lugar Inspección", field: "lugar_inspeccion", align: "center", sortable: true, responsive: ["sm", "md", "lg", "xl"] },
  { name: "placa_patente", label: "Placa Patente", field: "placa_patente", align: "center", sortable: true, width: "110px",
    style: "font-weight: 700; letter-spacing: 0.5px;",
    headerStyle: "font-weight: 700;",
  },
  { name: "kilometraje", label: "Km", field: "kilometraje", align: "center", sortable: true, responsive: ["sm", "md", "lg", "xl"], width: "80px" },
  { name: "user_name", label: "Monitor", field: "user_name", align: "center", sortable: true, responsive: ["md", "lg", "xl"] },
  { name: "dbaja", label: "Def. Bajos", field: (row) => (isNaN(row?.total_lows - row?.curr_lows) ? "" : row.total_lows - row.curr_lows), align: "center", sortable: true, responsive: ["lg", "xl"], width: "90px" },
  { name: "dmedia", label: "Def. Medios", field: (row) => (isNaN(row?.total_mediums - row?.curr_mediums) ? "" : row.total_mediums - row.curr_mediums), align: "center", sortable: true, responsive: ["lg", "xl"], width: "90px" },
  { name: "dalta", label: "Def. Altos", field: (row) => (isNaN(row?.total_highs - row?.curr_highs) ? "" : row.total_highs - row.curr_highs), align: "center", sortable: true, responsive: ["lg", "xl"], width: "90px" },
  { name: "defectos", label: "Defectos", field: (row) => row?.defectos?.join(",") || "", align: "center", sortable: true, responsive: ["lg", "xl"], width: "120px" },
  {
    name: "resultado1", label: "Resultado 1ra", align: "center", sortable: true,
    field: (row) =>
      row.resultado.length > 0 && row.resultado[0]?.causa === 0 ? "No Aprobado/No Presentado"
      : row.resultado.length > 0 && row.resultado[0]?.causa === 1 ? "No Aprobado/Dtpm"
      : row.resultado.length > 0 && row.resultado[0].certifica ? "Aprobado"
      : row.resultado.length > 0 && row.resultado[0].certifica === false ? "No Aprobado"
      : row.resultado.length > 0 ? "Pendiente" : "",
    chip: true, chipColor: (row) => {
      const r = row.resultado;
      const val = r.length > 0 && r[0]?.causa === 0 ? "No Aprobado/No Presentado"
        : r.length > 0 && r[0]?.causa === 1 ? "No Aprobado/Dtpm"
        : r.length > 0 && r[0].certifica ? "Aprobado"
        : r.length > 0 && r[0].certifica === false ? "No Aprobado"
        : r.length > 0 ? "Pendiente" : "";
      return resultadoColorMap[val] || "grey";
    },
    responsive: ["sm", "md", "lg", "xl"], width: "140px",
  },
  { name: "user_name_resol", label: "Resolutor", field: "user_name_resol", align: "center", sortable: true, responsive: ["lg", "xl"] },
  {
    name: "fecha_resol", label: "Fecha Resolución", field: "fecha_resol", align: "center", sortable: true,
    sort: (a, b) => { const dA = a.split("/"), dB = b.split("/"); return new Date(+dA[2], dA[1] - 1, +dA[0]) - new Date(+dB[2], dB[1] - 1, +dB[0]); },
    responsive: ["lg", "xl"],
  },
  {
    name: "fecha2", label: "Periodo Cura", align: "center", sortable: true,
    field: (row) => row.resultado.length === 2 ? row.resultado[1].fecha : row.resultado.length > 0 && row.resultado[0].certifica === null ? row.fecha_reins : "",
    sort: (a, b) => {
      let dA = a.split("/"), dB = b.split("/");
      if (dA.length < 3) dA = [0, 0, 0]; if (dB.length < 3) dB = [0, 0, 0];
      return new Date(+dA[2], dA[1] - 1, +dA[0]) - new Date(+dB[2], dB[1] - 1, +dB[0]);
    },
    responsive: ["lg", "xl"],
  },
  {
    name: "resultado2", label: "Resultado 2da", align: "center", sortable: true,
    field: (row) => row.resultado.length > 1 && row.resultado[1].certifica ? "Aprobado" : row.resultado.length > 1 && row.resultado[1].certifica === false ? "No Aprobado" : "",
    chip: true, chipColor: (row) => {
      const r = row.resultado;
      return r.length > 1 && r[1].certifica ? "positive" : r.length > 1 && r[1].certifica === false ? "negative" : "grey";
    },
    responsive: ["lg", "xl"], width: "120px",
  },
  {
    name: "fecha_termino", label: "Fecha Término", field: (row) => (row.estado === 1 ? row.resultado.at(-1).fecha : ""), align: "center", sortable: true,
    sort: (a, b) => { const dA = a.split("/"), dB = b.split("/"); return new Date(+dA[2], dA[1] - 1, +dA[0]) - new Date(+dB[2], dB[1] - 1, +dB[0]); },
    responsive: ["sm", "md", "lg", "xl"],
  },
  { name: "hora_termino", label: "Hora Término", field: (row) => (row.estado === 1 ? row.resultado.at(-1).hora : ""), align: "center", responsive: ["md", "lg", "xl"], width: "70px" },
  { name: "obs_inspeccion", label: "Observación", field: "obs_inspeccion", align: "center", sortable: true, responsive: ["xl"] },
  {
    name: "hasPendingWrites", label: "Sync", field: "hasPendingWrites", align: "center",
    format: (val) => val ? "Pendiente" : "OK",
    responsive: ["md", "lg", "xl"], width: "80px",
  },
  { name: "actions", label: "Acciones", field: "", align: "center", width: "160px" },
];

const customSort = (rows) => {
  const getTimestamp = (row) => (row.fecha_termino_timestamp ? parseFloat(row.fecha_termino_timestamp) : parseFloat(row.fecha_inicio_timestamp));
  const data = [...rows];
  data.sort((a, b) => getTimestamp(b) - getTimestamp(a));
  return data;
};

const { m_estado_general_change } = storeToRefs(useEstadogStore());
const { update, removep, addp, getall, gethistoric } = useEstadogStore();
const estado_general_sort = shallowRef([]);
const { notify } = useQuasar();
const { uid, only_view, admin, name } = useUserStore();
const router = useRouter();
const route = useRoute();
const routeSearch = route.query.search || "";
const loading = ref(true);
const loading_his = ref(false);
const dialog_repair = ref(false);
const dialog_defectos = ref(false);
const selectedDefectos = ref([]);
const defectos_placa = ref("");
const estado_uuid = ref(null);
let fecha_reins_timestamp = 0;

const canEdit = (row) => ![1, 3, 4].includes(row.estado) && (row.user_uid === uid || admin);
const canView = () => true;
const canDelete = (row) => ![1, 3].includes(row.estado) && (row.user_uid === uid || admin);
const canRepair = (row) => [2].includes(row.estado) && !row.fecha_resol_timestamp;

const showDefectos = (row) => {
  selectedDefectos.value = row.defectos || [];
  defectos_placa.value = row.placa_patente;
  dialog_defectos.value = true;
};

const addWorkDays = (date, days) => {
  while (days) ![6, 0].includes(date.getUTCDay(date.setUTCDate(date.getUTCDate() + 1))) && days--;
  date.setHours(0, 0, 0);
  return date;
};

const onEdit = (row) => {
  if (!canEdit(row)) {
    notify({ color: "red-6", textColor: "white", icon: "error", message: "Inspección no puede ser editada", timeout: 1000 });
    return;
  }
  router.push({ name: "estadog_det", params: { uuid: row.uuid } });
};

const onSearch = (row) => {
  router.push({ name: "estadog_det", params: { uuid: row.uuid, view: true } });
};

const onDelete = (row) => {
  if (!canDelete(row)) {
    notify({ color: "red-6", textColor: "white", icon: "error", message: "Inspección no puede ser eliminada", timeout: 1000 });
    return;
  }
  update({ uuid: row.uuid, estado: 3 });
  removep({ uuid: `estados_${client}`, values: row.placa_patente });
  notify({ color: "green-6", textColor: "white", icon: "cloud_done", message: "Inspección eliminada", timeout: 1000 });
};

const onChange = (row) => {
  update({ uuid: row.uuid, estado: 0, resultado: [] });
  addp({ uuid: `estados_${client}`, values: row.placa_patente });
  notify({ color: "green-6", textColor: "white", icon: "cloud_done", message: "Inspección cambiada a En Proceso", timeout: 1000 });
};

const onRepair = (row) => {
  if (![2].includes(row.estado)) {
    notify({ color: "red-6", textColor: "white", icon: "error", message: "Inspección no se encuentra en Reinspección", timeout: 1000 });
    return;
  }
  if (row.fecha_resol_timestamp) {
    notify({ color: "red-6", textColor: "white", icon: "error", message: "Inspección con Fecha Resolución ya registrada", timeout: 1000 });
    return;
  }
  estado_uuid.value = row.uuid;
  fecha_reins_timestamp = row.fecha_reins_timestamp;
  dialog_repair.value = true;
};

const onCRepair = () => {
  const nueva_cura = addWorkDays(new Date(), 3);
  const payload = {
    uuid: estado_uuid.value,
    fecha_resol: new Date().toLocaleDateString("en-GB", { month: "2-digit", day: "2-digit", year: "numeric" }),
    hora_resol: new Date().toLocaleTimeString([], { hour12: false }),
    fecha_resol_timestamp: Date.now() / 1000,
    user_name_resol: name,
  };
  if (nueva_cura.getTime() / 1000 > fecha_reins_timestamp) {
    payload.fecha_reins = nueva_cura.toLocaleDateString("en-GB", { month: "2-digit", day: "2-digit", year: "numeric" });
    payload.hora_reins = nueva_cura.toLocaleTimeString([], { hour12: false });
    payload.fecha_reins_timestamp = nueva_cura.getTime() / 1000;
  }
  update(payload);
  dialog_repair.value = false;
  notify({ color: "green-6", textColor: "white", icon: "cloud_done", message: "Inspección Actualizada", timeout: 1000 });
};

const exportTable = async () => {
  loading_his.value = true;
  const content = [
    ["UNIDAD NEGOCIO", "UNIDAD SERVICIO", "ID", "ESTADO", "FECHA CREACION", "HORA CREACION", "LUGAR INSPECCION", "PLACA PATENTE", "KILOMETRAJE", "MONITOR", "DEFECTOS BAJOS", "DEFECTOS MEDIOS", "DEFECTOS ALTOS", "DEFECTOS", "RESULTADO 1ERA", "PERIODO CURA", "RESULTADO 2DA", "FECHA TERMINO", "HORA TERMINO", "OBSERVACION"],
  ];
  const registros = await gethistoric();
  if (registros.length === 0) {
    loading_his.value = false;
    return notify({ color: "red-6", textColor: "white", icon: "error", message: "No ha sido posible descargar histórico", timeout: 1000 });
  }
  for (const estado of registros) {
    if ([4, 5, 6].includes(estado.estado)) continue;
    content.push([
      estado.unidad_negocio, estado.unidad_servicio, estado.uuid,
      estado.estado === 0 ? "En Proceso" : estado.estado === 1 ? "Finalizada" : estado.estado === 2 ? "Reinspección" : estado.estado === 3 ? "Eliminada" : estado.estado === 4 ? "Reprograma" : "",
      estado.fecha_inicio, estado.hora_inicio, estado.lugar_inspeccion, estado.placa_patente, estado.kilometraje, estado.user_name,
      isNaN(estado?.total_lows - estado?.curr_lows) ? "" : estado.total_lows - estado.curr_lows,
      isNaN(estado?.total_mediums - estado?.curr_mediums) ? "" : estado.total_mediums - estado.curr_mediums,
      isNaN(estado?.total_highs - estado?.curr_highs) ? "" : estado.total_highs - estado.curr_highs,
      estado?.defectos?.join(","),
      estado.resultado.length > 0 && estado.resultado[0]?.causa === 0 ? "No Aprobado/No Presentado"
      : estado.resultado.length > 0 && estado.resultado[0]?.causa === 1 ? "No Aprobado/Dtpm"
      : estado.resultado.length > 0 && estado.resultado[0].certifica ? "Aprobado"
      : estado.resultado.length > 0 && estado.resultado[0].certifica === false ? "No Aprobado" : "Pendiente",
      estado.resultado.length === 2 ? estado.resultado[1].fecha : estado.resultado.length > 0 && estado.resultado[0].certifica === null ? estado.fecha_reins : "",
      estado.resultado.length > 1 && estado.resultado[1].certifica ? "Aprobado" : estado.resultado.length > 1 && estado.resultado[1].certifica === false ? "No Aprobado" : "",
      estado.estado === 1 ? estado.resultado.at(-1).fecha : "",
      estado.estado === 1 ? estado.resultado.at(-1).hora : "",
      estado.obs_inspeccion?.replaceAll("\n", ". "),
    ]);
  }
  const data = stringify(content, { delimiter: ";", quoted_string: true, bom: true });
  exportFile("estado_general.csv", data, "text/csv");
  loading_his.value = false;
};

watch(
  () => m_estado_general_change.value,
  async () => {
    const estado_general_arr = await getall(false);
    estado_general_sort.value = customSort(estado_general_arr);
    if (m_estado_general_change.value > 0 && estado_general_arr.length > 0) {
      setTimeout(() => { loading.value = false; }, 300);
    }
  },
  { immediate: true }
);
</script>

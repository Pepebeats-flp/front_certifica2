<template>
  <div class="q-pa-md">
    <q-table
      title="Registros"
      :rows="solicitud_reparacion_arr"
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
        <q-btn v-if="srepa" color="primary" to="/soplocRa/add" label="Agregar" class="q-mr-sm" />
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
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn v-if="sumi" color="primary" icon="event" flat dense @click="onEnd(props.row)" />
          <q-btn v-if="sumi || srepa" color="negative" icon="delete" flat dense @click="onDelete(props.row)" />
        </q-td>
      </template>
    </q-table>
  </div>
  <q-dialog v-model="dialog" transition-show="scale" transition-hide="scale" persistent>
    <div class="q-gutter-md row items-start">
      <q-date
        v-if="!showTime"
        v-model="fecha_resolucion_concretada"
        :title="fh_concretada ? useDateFormat(fh_concretada, 'DD/MM/YYYY HH:mm').value : ''"
        :subtitle="solicitud_uuid"
        :options="optionsFn"
        :events="eventsFn"
        :event-color="eventsCFn"
        @update:model-value="onDateSelected"
      >
        <q-form @submit="onCEnd()">
          <q-input
            v-model="causa_origen"
            label="CAUSA / ORIGEN"
            dense
            :rules="[(val) => (val && val.length > 0) || 'Este campo es obligatorio.']"
            input-class="text-uppercase"
            autogrow
          >
          </q-input>
          <q-input
            v-model="ot_resolucion_detalle"
            label="DETALLE RESOLUCION"
            dense
            :rules="[(val) => (val && val.length > 0) || 'Este campo es obligatorio.']"
            input-class="text-uppercase"
            autogrow
          >
          </q-input>
          <div class="row justify-center q-mt-sm">
            <q-btn
              color="dark"
              label="Cancelar"
              class="q-mr-sm"
              v-close-popup
              @click="
                showTime = false;
                dialog = false;
              "
            />
            <q-btn
              color="primary"
              label="Finalizar"
              class="q-mr-sm"
              type="submit"
              :disable="!fecha_resolucion_concretada || !hora_resolucion_concretada"
            />
          </div>
        </q-form>
      </q-date>
      <q-time v-if="showTime" v-model="hora_resolucion_concretada" @update:model-value="showTime = false"> </q-time>
    </div>
  </q-dialog>

  <q-dialog v-model="dialog_del" transition-show="scale" transition-hide="scale" persistent>
    <q-card>
      <q-form @submit="onCDelete()">
        <q-linear-progress :value="1.0" color="negative"></q-linear-progress>
        <q-card-section class="row items-center no-wrap">
          <div>
            <div class="row">
              <div class="text-weight-bold q-mr-sm">ELIMINAR</div>
              <div class="text-grey">{{ solicitud_uuid }}</div>
            </div>
            <q-select
              v-if="sumi"
              v-model="causa"
              label="CAUSA"
              :options="delete_options"
              dense
              :rules="[(val) => !!val || 'Este campo es obligatorio.']"
            >
            </q-select>
          </div>
          <q-btn flat round icon="cancel" v-close-popup @click="causa = null">
            <q-tooltip class="bg-dark" :offset="[0, 5]">Cancelar</q-tooltip>
          </q-btn>
          <q-btn flat round color="negative" icon="delete" type="submit">
            <q-tooltip class="bg-negative" :offset="[0, 5]">Eliminar</q-tooltip>
          </q-btn>
        </q-card-section>
      </q-form>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { useQuasar } from "quasar";
import { useSrepaStore } from "@/store/srepaStore";
import { storeToRefs } from "pinia";
import { ref, watch, shallowRef, computed } from "vue";
import { exportFile } from "quasar";
import { useUserStore } from "@/store/userStore";
import { stringify } from "csv-stringify/browser/esm/sync";
import { useDateFormat } from "@vueuse/core";
import { contratos } from "@/client";
import buses from "@/assets/json/buses.json";

const visible_cols = [
  "unidad_negocio",
  "unidad_servicio",
  "contrato",
  "uuid",
  "estado",
  "placa_patente",
  "km_ejecucion",
  "tipo_solicitud",
  "sistema_componente",
  "ot_numero",
  "ot_solicitud_fecha",
  "ot_solicitud_hora",
  "ot_solicitud_name",
  //"ot_resolucion_solicitada_fecha",
  "ot_taller_planta",
  "dominio",
  "ot_taller_planta",
  "ot_solicitud_detalle",
  "ot_resolucion_concretada_fecha",
  "ot_resolucion_concretada_hora",
  "ot_resolucion_name",
  "causa_origen",
  "ot_resolucion_detalle",
  "causa",
  "hasPendingWrites",
  "actions",
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
    name: "contrato",
    label: "Contrato",
    field: (row) => contratos.get(buses?.[row.placa_patente]?.[35]) || "",
    align: "center",
    sortable: true,
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
    field: (row) => (row.estado === 0 ? "En Proceso" : row.estado === 1 ? "Finalizada" : row.estado === 3 ? "Eliminada" : ""),
    align: "center",
    sortable: true,
  },
  {
    name: "tipo_solicitud",
    label: "Tipo Solicitud",
    field: "tipo_solicitud",
    align: "center",
  },
  {
    name: "placa_patente",
    label: "Placa Patente",
    field: "placa_patente",
    align: "center",
  },
  {
    name: "km_ejecucion",
    label: "Kilometraje",
    field: "km_ejecucion",
    align: "center",
  },
  {
    name: "sistema_componente",
    label: "Sistema / Componente",
    field: "sistema_componente",
    align: "center",
  },
  {
    name: "ot_numero",
    label: "Numero OT",
    field: "ot_numero",
    align: "center",
  },
  {
    name: "ot_solicitud_fecha",
    label: "Fecha Solicitud",
    field: "ot_solicitud_fecha",
    align: "center",
  },
  {
    name: "ot_solicitud_hora",
    label: "Hora Solicitud",
    field: "ot_solicitud_hora",
    align: "center",
  },
  {
    name: "ot_solicitud_name",
    label: "Solicitante",
    field: "ot_solicitud_name",
    align: "center",
  },
  {
    name: "ot_resolucion_solicitada_fecha",
    label: "Fecha Resolucion Solicitada",
    field: "ot_resolucion_solicitada_fecha",
    align: "center",
  },
  {
    name: "ot_taller_planta",
    label: "Taller / Planta",
    field: "ot_taller_planta",
    align: "center",
  },
  {
    name: "dominio",
    label: "Dominio",
    field: (row) => (row.dominio === "0" ? "CARROCERIA" : row.dominio === "1" ? "CHASIS" : "CHASIS"),
    align: "center",
    sortable: true,
  },
  {
    name: "ot_solicitud_detalle",
    label: "Detalle Solicitud",
    field: "ot_solicitud_detalle",
    align: "center",
  },
  {
    name: "ot_resolucion_concretada_fecha",
    label: "Fecha Resolucion Concretada",
    field: "ot_resolucion_concretada_fecha",
    align: "center",
  },
  {
    name: "ot_resolucion_concretada_hora",
    label: "Hora Resolucion Concretada",
    field: "ot_resolucion_concretada_hora",
    align: "center",
  },
  {
    name: "ot_resolucion_name",
    label: "Resolutor",
    field: "ot_resolucion_name",
    align: "center",
  },
  {
    name: "causa_origen",
    label: "Causa / Origen",
    field: "causa_origen",
    align: "center",
  },
  {
    name: "ot_resolucion_detalle",
    label: "Detalle Resolución",
    field: "ot_resolucion_detalle",
    align: "center",
  },
  {
    name: "causa",
    label: "Causa Eliminación",
    field: (row) => delete_map.get(row.causa),
    align: "center",
  },
  {
    name: "hasPendingWrites",
    label: "Sincronizado",
    field: "hasPendingWrites",
    align: "center",
  },
  { name: "actions", label: "Acciones", field: "", align: "center" },
  {
    name: "ot_solicitud_timestamp",
    field: "ot_solicitud_timestamp",
  },
];
const pagination = ref({
  sortBy: "ot_solicitud_timestamp",
  descending: true,
  page: 1,
  rowsPerPage: 7,
});

const { m_solicitud_reparacion_change } = storeToRefs(useSrepaStore());
const { getall, gethistoric, update } = useSrepaStore();
const solicitud_reparacion_arr = shallowRef([]);
const filter = ref("");
const { notify } = useQuasar();
const { name, uid, sumi, srepa } = useUserStore();
const loading = ref(true);
const loading_his = ref(false);

const dialog = ref(false);
const dialog_del = ref(false);
const solicitud_uuid = ref(false);
const fecha_resolucion_concretada = ref(null);
const hora_resolucion_concretada = ref(null);
let ot_resolucion_solicitada_timestamp = null;
let ot_solicitud_timestamp = null;
const causa = ref(null);
const ot_resolucion_detalle = ref(null);
const causa_origen = ref(null);
const showTime = ref(false);

const delete_options = [
  {
    label: "FECHA NO CORRESPONDE",
    value: 4,
  },
  {
    label: "SOLICITUD INVIABLE",
    value: 5,
  },
];
const delete_map = new Map([
  [0, "SOLICITUD INCORRECTA"],
  [1, "VALORES NO CORRESPONDEN"],
  [2, "CANTIDADES NO CORRESPONDEN"],
  [3, "LINEAS NO CORRESPONDEN"],
  [4, "FECHA NO CORRESPONDE"],
  [5, "SOLICITUD INVIABLE"],
]);

const onDateSelected = () => {
  hora_resolucion_concretada.value = null;
  showTime.value = true;
};

const fh_concretada = computed(() => {
  if (!fecha_resolucion_concretada.value || !hora_resolucion_concretada.value) return null;
  const [year, month, day] = fecha_resolucion_concretada.value.split("/");
  const [hour, minute] = hora_resolucion_concretada.value.split(":");
  return new Date(year, month - 1, day, hour, minute);
});

const optionsFn = (date) => {
  return date >= useDateFormat(new Date(ot_solicitud_timestamp * 1000), "YYYY/MM/DD").value;
};
const eventsFn = (date) => {
  return date >= useDateFormat(new Date(ot_solicitud_timestamp * 1000), "YYYY/MM/DD").value;
};
const eventsCFn = (date) => {
  if (date <= useDateFormat(new Date(ot_resolucion_solicitada_timestamp * 1000), "YYYY/MM/DD").value) return "teal";
  else return "red";
};

const onDelete = (row) => {
  if (![0].includes(row.estado) || (row.user_uid !== uid && !sumi)) {
    notify({
      color: "red-6",
      textColor: "white",
      icon: "error",
      message: "Solicitud no puede ser eliminada",
      timeout: 1000,
    });
    return false;
  }
  solicitud_uuid.value = row.uuid;
  dialog_del.value = true;
};
const onCDelete = () => {
  const payload = {
    uuid: solicitud_uuid.value,
    estado: 3,
    causa: causa.value?.value || 0,
    ot_resolucion_name: name,
    ot_resolucion_uid: uid,
  };
  dialog_del.value = false;
  update(payload);
  notify({
    color: "green-6",
    textColor: "white",
    icon: "cloud_done",
    message: "Solicitud Eliminada",
    timeout: 1000,
  });
};
const onEnd = (row) => {
  if (![0].includes(row.estado)) {
    notify({
      color: "red-6",
      textColor: "white",
      icon: "error",
      message: "Solicitud no puede ser editada",
      timeout: 1000,
    });
    return false;
  }
  solicitud_uuid.value = row.uuid;
  ot_resolucion_solicitada_timestamp = row.ot_resolucion_solicitada_timestamp;
  ot_solicitud_timestamp = row.ot_solicitud_timestamp;
  dialog.value = true;
};

const onCEnd = () => {
  const payload = {
    uuid: solicitud_uuid.value,
    estado: 1,
    ot_resolucion_concretada_fecha: useDateFormat(fh_concretada.value, "DD/MM/YYYY").value,
    ot_resolucion_concretada_hora: useDateFormat(fh_concretada.value, "HH:mm").value,
    ot_resolucion_concretada_timestamp: fh_concretada.value / 1000,
    ot_resolucion_detalle: ot_resolucion_detalle.value.toUpperCase(),
    causa_origen: causa_origen.value.toUpperCase(),
    resultado: ot_resolucion_solicitada_timestamp >= fh_concretada.value / 1000 ? true : false,
    ot_resolucion_name: name,
    ot_resolucion_uid: uid,
  };
  dialog.value = false;
  update(payload);
  notify({
    color: "green-6",
    textColor: "white",
    icon: "cloud_done",
    message: "Solicitud Finalizada",
    timeout: 1000,
  });
};

const exportTable = async () => {
  loading_his.value = true;
  const content = [];
  content.push([
    "UNIDAD NEGOCIO",
    "UNIDAD SERVICIO",
    "CONTRATO",
    "ID",
    "ESTADO",
    "TIPO SOLICITUD",
    "PLACA PATENTE",
    "KILOMETRAJE",
    "SISTEMA / COMPONENTE",
    "NUMERO OT",
    "FECHA SOLICITUD",
    "HORA SOLICITUD",
    "SOLICITANTE",
    //"FECHA RESOLUCION SOLICITADA",
    "TALLER / PLANTA",
    "DOMINIO",
    "DETALLE SOLICITUD",
    "FECHA RESOLUCION CONCRETADA",
    "HORA RESOLUCION CONCRETADA",
    "RESOLUTOR",
    "CAUSA / ORIGEN",
    "DETALLE RESOLUCION",
    "CAUSA ELIMINACION",
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
      contratos.get(buses?.[registro.placa_patente]?.[35]) || "",
      registro.uuid,
      registro.estado === 0 ? "En Proceso" : registro.estado === 1 ? "Finalizada" : registro.estado === 3 ? "Eliminada" : "",
      registro.tipo_solicitud,
      registro.placa_patente,
      registro.km_ejecucion,
      registro.sistema_componente,
      registro.ot_numero,
      registro.ot_solicitud_fecha,
      registro.ot_solicitud_hora,
      registro.ot_solicitud_name,
      //registro.ot_resolucion_solicitada_fecha,
      registro.ot_taller_planta,
      registro.dominio === "0" ? "CARROCERIA" : registro.dominio === "1" ? "CHASIS" : "CHASIS",
      registro.ot_solicitud_detalle,
      registro.ot_resolucion_concretada_fecha,
      registro.ot_resolucion_concretada_hora,
      registro.ot_resolucion_name,
      registro.causa_origen,
      registro.ot_resolucion_detalle,
      delete_map.get(registro.causa),
    ]);
  }
  const data = stringify(content, {
    delimiter: ";",
    quoted_string: true,
    bom: true,
  });
  exportFile("solicitud_reparacion.csv", data, "text/csv");
  loading_his.value = false;
};
watch(
  () => m_solicitud_reparacion_change.value,
  async () => {
    solicitud_reparacion_arr.value = await getall();
    if (m_solicitud_reparacion_change.value > 0) loading.value = false;
  },
  { immediate: true },
);
</script>

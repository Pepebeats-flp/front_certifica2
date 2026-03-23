<template>
  <div class="q-pa-md">
    <q-table
      title="Registros"
      :rows="solicitud_repuesto_arr"
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
        <q-btn v-if="srepu" color="primary" to="/soplocRu/add" label="Agregar" class="q-mr-sm" />
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
          <q-btn v-if="sumi || srepu" color="negative" icon="delete" flat dense @click="onDelete(props.row)" />
        </q-td>
      </template>
    </q-table>
  </div>
  <q-dialog v-model="dialog" transition-show="scale" transition-hide="scale" persistent>
    <div class="q-gutter-md row items-start">
      <q-date
        v-if="!showTime"
        v-model="fecha_entrega_concretada"
        :title="fh_concretada ? useDateFormat(fh_concretada, 'DD/MM/YYYY HH:mm').value : ''"
        :subtitle="solicitud_uuid"
        :options="optionsFn"
        :events="eventsFn"
        :event-color="eventsCFn"
        @update:model-value="onDateSelected"
      >
        <div class="row items-center justify-center q-gutter-sm">
          <q-btn
            color="dark"
            label="Cancelar"
            class="q-mr-sm"
            @click="
              showTime = false;
              dialog = false;
            "
            v-close-popup
          />
          <q-btn
            color="primary"
            label="Finalizar"
            class="q-mr-sm"
            @click="onCEnd()"
            :disable="!fecha_entrega_concretada || !hora_entrega_concretada"
            v-close-popup
          />
        </div>
      </q-date>
      <q-time v-if="showTime" v-model="hora_entrega_concretada" @update:model-value="showTime = false"> </q-time>
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
import { useSrepuStore } from "@/store/srepuStore";
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
  "tipo_solicitud",
  "motivo_solicitud",
  "sistema_componente",
  "co_numero",
  "oc_numero",
  //"oc_solicitud_fecha",
  //"oc_solicitud_hora",
  "oc_solicitud_name",
  "oc_entrega_solicitada_fecha",
  "oc_entrega_solicitada_hora",
  "oc_taller_planta",
  "dominio",
  "repuesto_tipo",
  "repuesto_marca",
  "repuesto_codigo",
  "repuesto_descripcion",
  "repuesto_medida",
  "repuesto_cantidad",
  "placa_patente",
  "numero_interno",
  "numero_vin",
  "tipo_bus",
  "oc_entrega_concretada_fecha",
  "oc_entrega_concretada_hora",
  "oc_entrega_name",
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
    field: (row) => contratos.get(row.tipo_bus) || "",
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
    name: "motivo_solicitud",
    label: "Motivo Solicitud",
    field: (row) => motivo_map.get(row.motivo_solicitud) || "",
    align: "center",
  },
  {
    name: "sistema_componente",
    label: "Sistema / Componente",
    field: "sistema_componente",
    align: "center",
  },
  {
    name: "co_numero",
    label: "Numero CO",
    field: "co_numero",
    align: "center",
  },
  {
    name: "oc_numero",
    label: "Numero OC",
    field: "oc_numero",
    align: "center",
  },
  {
    name: "oc_solicitud_fecha",
    label: "Fecha Solicitud",
    field: "oc_solicitud_fecha",
    align: "center",
  },
  {
    name: "oc_solicitud_hora",
    label: "Hora Solicitud",
    field: "oc_solicitud_hora",
    align: "center",
  },
  {
    name: "oc_solicitud_name",
    label: "Solicitante",
    field: "oc_solicitud_name",
    align: "center",
  },
  {
    name: "oc_entrega_solicitada_fecha",
    label: "Fecha Solicitud",
    field: "oc_entrega_solicitada_fecha",
    align: "center",
  },
  {
    name: "oc_entrega_solicitada_hora",
    label: "Hora Solicitud",
    field: "oc_entrega_solicitada_hora",
    align: "center",
  },
  {
    name: "oc_taller_planta",
    label: "Taller / Planta",
    field: "oc_taller_planta",
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
    name: "repuesto_tipo",
    label: "Tipo Repuesto",
    field: "repuesto_tipo",
    align: "center",
  },
  {
    name: "repuesto_marca",
    label: "Marca Repuesto",
    field: "repuesto_marca",
    align: "center",
  },
  {
    name: "repuesto_codigo",
    label: "Codigo Repuesto",
    field: "repuesto_codigo",
    align: "center",
  },
  {
    name: "repuesto_descripcion",
    label: "Descripción Repuesto",
    field: "repuesto_descripcion",
    align: "center",
  },
  {
    name: "repuesto_medida",
    label: "Medida Repuesto",
    field: "repuesto_medida",
    align: "center",
  },
  {
    name: "repuesto_cantidad",
    label: "Cantidad Repuesto",
    field: "repuesto_cantidad",
    align: "center",
  },
  {
    name: "placa_patente",
    label: "Placa Patente",
    field: "placa_patente",
    align: "center",
  },
  {
    name: "numero_interno",
    label: "Numero Interno",
    field: (row) => buses?.[row.placa_patente]?.[0],
    align: "center",
    sortable: true,
  },
  {
    name: "numero_vin",
    label: "Numero VIN",
    field: (row) => buses?.[row.placa_patente]?.[2],
    align: "center",
  },
  {
    name: "tipo_bus",
    label: "Tipo de Bus",
    field: "tipo_bus",
    align: "center",
  },
  {
    name: "oc_entrega_concretada_fecha",
    label: "Fecha Entrega Concretada",
    field: "oc_entrega_concretada_fecha",
    align: "center",
  },
  {
    name: "oc_entrega_concretada_hora",
    label: "Hora Entrega Concretada",
    field: "oc_entrega_concretada_hora",
    align: "center",
  },
  {
    name: "oc_entrega_name",
    label: "Resolutor",
    field: "oc_entrega_name",
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
    name: "oc_solicitud_timestamp",
    field: "oc_solicitud_timestamp",
  },
];
const pagination = ref({
  sortBy: "oc_solicitud_timestamp",
  descending: true,
  page: 1,
  rowsPerPage: 7,
});

const { m_solicitud_repuesto_change } = storeToRefs(useSrepuStore());
const { getall, gethistoric, update } = useSrepuStore();
const solicitud_repuesto_arr = shallowRef([]);
const { notify } = useQuasar();
const { name, uid, sumi, srepu } = useUserStore();
const filter = ref("");
const loading = ref(true);
const loading_his = ref(false);
const dialog = ref(false);
const dialog_del = ref(false);
const solicitud_uuid = ref(false);
const fecha_entrega_concretada = ref(null);
const hora_entrega_concretada = ref(null);
let oc_entrega_solicitada_timestamp = null;
let oc_solicitud_timestamp = null;
const causa = ref(null);
const showTime = ref(false);

const delete_options = [
  {
    label: "VALORES NO CORRESPONDEN",
    value: 1,
  },
  {
    label: "CANTIDADES NO CORRESPONDEN",
    value: 2,
  },
  {
    label: "LINEAS NO CORRESPONDEN",
    value: 3,
  },
  {
    label: "FECHA NO CORRESPONDE",
    value: 4,
  },
  {
    label: "SOLICITUD INVIABLE",
    value: 5,
  },
  {
    label: "ORDEN DE COMPRA NO EXISTE",
    value: 6,
  },
];
const delete_map = new Map([
  [0, "SOLICITUD INCORRECTA"],
  [1, "VALORES NO CORRESPONDEN"],
  [2, "CANTIDADES NO CORRESPONDEN"],
  [3, "LINEAS NO CORRESPONDEN"],
  [4, "FECHA NO CORRESPONDE"],
  [5, "SOLICITUD INVIABLE"],
  [6, "ORDEN DE COMPRA NO EXISTE"],
]);

const motivo_map = new Map([
  [0, "STOCK"],
  [1, "REPARACIÓN"],
]);

const onDateSelected = () => {
  hora_entrega_concretada.value = null;
  showTime.value = true;
};

const fh_concretada = computed(() => {
  if (!fecha_entrega_concretada.value || !hora_entrega_concretada.value) return null;
  const [year, month, day] = fecha_entrega_concretada.value.split("/");
  const [hour, minute] = hora_entrega_concretada.value.split(":");
  return new Date(year, month - 1, day, hour, minute);
});

const optionsFn = (date) => {
  return date >= useDateFormat(new Date(oc_solicitud_timestamp * 1000), "YYYY/MM/DD").value;
};
const eventsFn = (date) => {
  return date >= useDateFormat(new Date(oc_solicitud_timestamp * 1000), "YYYY/MM/DD").value;
};
const eventsCFn = (date) => {
  if (date <= useDateFormat(new Date(oc_entrega_solicitada_timestamp * 1000), "YYYY/MM/DD").value) return "teal";
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
    oc_entrega_name: name,
    oc_entrega_uid: uid,
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
  oc_entrega_solicitada_timestamp = row.oc_entrega_solicitada_timestamp;
  oc_solicitud_timestamp = row.oc_solicitud_timestamp;
  dialog.value = true;
};

const onCEnd = () => {
  const payload = {
    uuid: solicitud_uuid.value,
    estado: 1,
    oc_entrega_concretada_fecha: useDateFormat(fh_concretada.value, "DD/MM/YYYY").value,
    oc_entrega_concretada_hora: useDateFormat(fh_concretada.value, "HH:mm").value,
    oc_entrega_concretada_timestamp: fh_concretada.value / 1000,
    resultado: oc_entrega_solicitada_timestamp >= fh_concretada.value / 1000 ? true : false,
    oc_entrega_name: name,
    oc_entrega_uid: uid,
  };
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
    "MOTIVO SOLICITUD",
    "SISTEMA / COMPONENTE",
    "NUMERO CO",
    "NUMERO OC",
    //"FECHA SOLICITUD",
    //"HORA SOLICITUD",
    "SOLICITANTE",
    "FECHA SOLICITUD",
    "HORA SOLICITUD",
    "TALLER / PLANTA",
    "DOMINIO",
    "TIPO REPUESTO",
    "MARCA REPUESTO",
    "CODIGO REPUESTO",
    "DESCRIPCIÓN REPUESTO",
    "MEDIDA REPUESTO",
    "CANTIDAD REPUESTO",
    "PLACA PATENTE",
    "NUMERO INTERNO",
    "NUMERO VIN",
    "TIPO BUS",
    "FECHA ENTREGA CONCRETADA",
    "HORA ENTREGA CONCRETADA",
    "RESOLUTOR",
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
  for (const solicitud_repuesto of registros) {
    if (solicitud_repuesto.motivo_solicitud === 0) continue; //No consideramos solicitudes por motivo Stock
    content.push([
      solicitud_repuesto.unidad_negocio,
      solicitud_repuesto.unidad_servicio,
      contratos.get(solicitud_repuesto.tipo_bus) || "",
      solicitud_repuesto.uuid,
      solicitud_repuesto.estado === 0
        ? "En Proceso"
        : solicitud_repuesto.estado === 1
          ? "Finalizada"
          : solicitud_repuesto.estado === 3
            ? "Eliminada"
            : "",
      solicitud_repuesto.tipo_solicitud,
      motivo_map.get(solicitud_repuesto.motivo_solicitud) || "",
      solicitud_repuesto.sistema_componente,
      solicitud_repuesto.co_numero,
      solicitud_repuesto.oc_numero,
      //solicitud_repuesto.oc_solicitud_fecha,
      //solicitud_repuesto.oc_solicitud_hora,
      solicitud_repuesto.oc_solicitud_name,
      solicitud_repuesto.oc_entrega_solicitada_fecha,
      solicitud_repuesto.oc_entrega_solicitada_hora,
      solicitud_repuesto.oc_taller_planta,
      solicitud_repuesto.dominio === "0" ? "CARROCERIA" : solicitud_repuesto.dominio === "1" ? "CHASIS" : "CHASIS",
      solicitud_repuesto.repuesto_tipo,
      solicitud_repuesto.repuesto_marca,
      solicitud_repuesto.repuesto_codigo,
      solicitud_repuesto.repuesto_descripcion,
      solicitud_repuesto.repuesto_medida,
      solicitud_repuesto.repuesto_cantidad,
      solicitud_repuesto.placa_patente,
      buses?.[solicitud_repuesto.placa_patente]?.[0],
      buses?.[solicitud_repuesto.placa_patente]?.[2],
      solicitud_repuesto.tipo_bus,
      solicitud_repuesto.oc_entrega_concretada_fecha,
      solicitud_repuesto.oc_entrega_concretada_hora,
      solicitud_repuesto.oc_entrega_name,
      delete_map.get(solicitud_repuesto.causa),
    ]);
  }
  const data = stringify(content, {
    delimiter: ";",
    quoted_string: true,
    bom: true,
  });
  exportFile("solicitud_repuesto.csv", data, "text/csv");
  loading_his.value = false;
};
watch(
  () => m_solicitud_repuesto_change.value,
  async () => {
    solicitud_repuesto_arr.value = (await getall()).filter((registro) => registro.motivo_solicitud !== 0); //No consideramos solicitudes por motivo Stock

    if (m_solicitud_repuesto_change.value > 0) loading.value = false;
  },
  { immediate: true },
);
</script>

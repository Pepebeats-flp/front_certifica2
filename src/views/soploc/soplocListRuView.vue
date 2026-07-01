<template>
  <div>
    <SmartTable
      :rows="solicitud_repuesto_arr"
      :columns="columns"
      row-key="uuid"
      :loading="loading"
      persist-key="soplocru-list"
      search-placeholder="Buscar..."
      empty-icon="inventory_2"
      empty-text="No hay solicitudes de repuestos"
    >
      <template #top-left>
        <q-btn v-if="srepu" color="primary" to="/soplocRu/add" label="Agregar" class="q-mr-sm" />
        <q-btn color="dark" label="Histórico" class="q-mr-sm" @click="exportTable" :loading="loading_his" />
      </template>
      <template #body-cell-actions="{ row }">
        <q-td>
          <q-btn v-if="sumi" color="primary" icon="event" flat dense @click="onEnd(row)">
            <q-tooltip>Fijar fecha</q-tooltip>
          </q-btn>
          <q-btn v-if="sumi || srepu" color="negative" icon="delete" flat dense @click="onDelete(row)">
            <q-tooltip>Eliminar</q-tooltip>
          </q-btn>
        </q-td>
      </template>
      <template #empty-action>
        <q-btn color="primary" to="/soplocRu/add" label="Crear solicitud" />
      </template>
    </SmartTable>
    <q-dialog v-model="dialog" transition-show="scale" transition-hide="scale" persistent>
      <div class="q-gutter-md row items-start">
        <q-date v-if="!showTime" v-model="fecha_entrega_concretada" :title="fh_concretada ? useDateFormat(fh_concretada, 'DD/MM/YYYY HH:mm').value : ''" :subtitle="solicitud_uuid" :options="optionsFn" :events="eventsFn" :event-color="eventsCFn" @update:model-value="onDateSelected">
          <div class="row items-center justify-center q-gutter-sm">
            <q-btn color="dark" label="Cancelar" class="q-mr-sm" @click="dialog = false" />
          </div>
        </q-date>
        <q-time v-if="showTime" v-model="hora_entrega_concretada" :title="fh_concretada ? useDateFormat(fh_concretada, 'DD/MM/YYYY HH:mm').value : ''" :subtitle="solicitud_uuid" :options="(hr, min, sec) => min % 15 === 0" format24h @update:model-value="onCEnd">
          <div class="row items-center justify-end q-gutter-sm">
            <q-btn color="dark" label="Cancelar" @click="showTime = false" />
          </div>
        </q-time>
      </div>
    </q-dialog>
    <q-dialog v-model="dialog_del" transition-show="scale" transition-hide="scale" persistent>
      <q-card style="min-width: 400px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">¿Eliminar solicitud?</div>
        </q-card-section>
        <q-card-section>
          <q-select v-model="causa" :options="delete_options" label="Causa" emit-value map-options />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn color="dark" label="Cancelar" @click="dialog_del = false" />
          <q-btn color="negative" label="Eliminar" @click="onCDelete" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { useQuasar } from "quasar";
import { useSrepuStore } from "@/store/srepuStore";
import { storeToRefs } from "pinia";
import { ref, watch, shallowRef, computed } from "vue";
import { exportFile } from "quasar";
import { stringify } from "csv-stringify/browser/esm/sync";
import { useDateFormat } from "@vueuse/core";
import { useUserStore } from "@/store/userStore";
import buses from "@/assets/json/buses.json";
import SmartTable from "@/components/shared/SmartTable.vue";

const contratos = new Map(Object.entries(buses).map(([, v]) => [v[35], v[34]]));

const motivo_map = new Map([[0, "STOCK"], [1, "REPARACIÓN"]]);

const columns = [
  { name: "unidad_negocio", label: "UN", field: "unidad_negocio", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "unidad_servicio", label: "US", field: "unidad_servicio", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "contrato", label: "Contrato", field: (row) => contratos.get(row.tipo_bus) || "", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "uuid", label: "ID", field: "uuid", align: "center", responsive: ["sm", "md", "lg", "xl"], width: "90px" },
  { name: "estado", label: "Estado", field: (row) => row.estado === 0 ? "En Proceso" : row.estado === 1 ? "Finalizada" : row.estado === 3 ? "Eliminada" : "", align: "center", sortable: true, chip: true, chipColor: (row) => row.estado === 0 ? "orange" : row.estado === 1 ? "positive" : row.estado === 3 ? "negative" : "grey", chipOutline: true, width: "130px" },
  { name: "tipo_solicitud", label: "Tipo Solicitud", field: "tipo_solicitud", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "motivo_solicitud", label: "Motivo Solicitud", field: (row) => motivo_map.get(row.motivo_solicitud) || "", align: "center", chip: true, chipColor: (row) => row.motivo_solicitud === 0 ? "info" : row.motivo_solicitud === 1 ? "warning" : "grey", responsive: ["md", "lg", "xl"] },
  { name: "sistema_componente", label: "Sistema / Componente", field: "sistema_componente", align: "center" },
  { name: "co_numero", label: "Numero CO", field: "co_numero", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "oc_numero", label: "Numero OC", field: "oc_numero", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "oc_solicitud_fecha", label: "Fecha Solicitud", field: "oc_solicitud_fecha", align: "center", responsive: ["sm", "md", "lg", "xl"] },
  { name: "oc_solicitud_hora", label: "Hora Solicitud", field: "oc_solicitud_hora", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "oc_solicitud_name", label: "Solicitante", field: "oc_solicitud_name", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "oc_entrega_solicitada_fecha", label: "Fecha Compromiso", field: "oc_entrega_solicitada_fecha", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "oc_entrega_solicitada_hora", label: "Hora Compromiso", field: "oc_entrega_solicitada_hora", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "oc_taller_planta", label: "Taller / Planta", field: "oc_taller_planta", align: "center", responsive: ["lg", "xl"] },
  { name: "dominio", label: "Dominio", field: (row) => row.dominio === "0" ? "CARROCERIA" : row.dominio === "1" ? "CHASIS" : "CHASIS", align: "center", sortable: true, responsive: ["md", "lg", "xl"] },
  { name: "repuesto_tipo", label: "Tipo Repuesto", field: "repuesto_tipo", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "repuesto_marca", label: "Marca Repuesto", field: "repuesto_marca", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "repuesto_codigo", label: "Codigo Repuesto", field: "repuesto_codigo", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "repuesto_descripcion", label: "Descripción Repuesto", field: "repuesto_descripcion", align: "center" },
  { name: "repuesto_medida", label: "Medida Repuesto", field: "repuesto_medida", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "repuesto_cantidad", label: "Cantidad Repuesto", field: "repuesto_cantidad", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "placa_patente", label: "Placa Patente", field: "placa_patente", align: "center", sortable: true, width: "110px", style: "font-weight: 700; letter-spacing: 0.5px;", headerStyle: "font-weight: 700;" },
  { name: "numero_interno", label: "Numero Interno", field: (row) => buses?.[row.placa_patente]?.[0], align: "center", sortable: true, responsive: ["md", "lg", "xl"] },
  { name: "numero_vin", label: "Numero VIN", field: (row) => buses?.[row.placa_patente]?.[2], align: "center", responsive: ["lg", "xl"] },
  { name: "tipo_bus", label: "Tipo de Bus", field: "tipo_bus", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "oc_entrega_concretada_fecha", label: "Fecha Entrega Concretada", field: "oc_entrega_concretada_fecha", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "oc_entrega_concretada_hora", label: "Hora Entrega Concretada", field: "oc_entrega_concretada_hora", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "oc_entrega_name", label: "Resolutor", field: "oc_entrega_name", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "causa_eliminacion", label: "Causa Eliminación", field: (row) => delete_map.get(row.causa), align: "center", responsive: ["lg", "xl"] },
  { name: "hasPendingWrites", label: "Sincronizado", field: "hasPendingWrites", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "actions", label: "Acciones", field: "", align: "center" },
  { name: "oc_solicitud_timestamp", field: "oc_solicitud_timestamp" },
];

const { m_solicitud_repuesto_change } = storeToRefs(useSrepuStore());
const { getall, gethistoric, update } = useSrepuStore();
const solicitud_repuesto_arr = shallowRef([]);
const { notify } = useQuasar();
const { name, uid, sumi, srepu } = useUserStore();
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
  { label: "VALORES NO CORRESPONDEN", value: 1 },
  { label: "CANTIDADES NO CORRESPONDEN", value: 2 },
  { label: "LINEAS NO CORRESPONDEN", value: 3 },
  { label: "FECHA NO CORRESPONDE", value: 4 },
  { label: "SOLICITUD INVIABLE", value: 5 },
  { label: "ORDEN DE COMPRA NO EXISTE", value: 6 },
];
const delete_map = new Map([
  [0, "SOLICITUD INCORRECTA"], [1, "VALORES NO CORRESPONDEN"], [2, "CANTIDADES NO CORRESPONDEN"],
  [3, "LINEAS NO CORRESPONDEN"], [4, "FECHA NO CORRESPONDE"], [5, "SOLICITUD INVIABLE"], [6, "ORDEN DE COMPRA NO EXISTE"],
]);

const onDateSelected = () => { hora_entrega_concretada.value = null; showTime.value = true; };
const fh_concretada = computed(() => {
  if (!fecha_entrega_concretada.value || !hora_entrega_concretada.value) return null;
  const [year, month, day] = fecha_entrega_concretada.value.split("/");
  const [hour, minute] = hora_entrega_concretada.value.split(":");
  return new Date(year, month - 1, day, hour, minute);
});
const optionsFn = (date) => date >= useDateFormat(new Date(oc_solicitud_timestamp * 1000), "YYYY/MM/DD").value;
const eventsFn = (date) => date >= useDateFormat(new Date(oc_solicitud_timestamp * 1000), "YYYY/MM/DD").value;
const eventsCFn = (date) => date <= useDateFormat(new Date(oc_entrega_solicitada_timestamp * 1000), "YYYY/MM/DD").value ? "teal" : "red";

const onDelete = (row) => {
  if (![0].includes(row.estado) || (row.user_uid !== uid && !sumi)) {
    notify({ color: "red-6", textColor: "white", icon: "error", message: "Solicitud no puede ser eliminada", timeout: 1000 });
    return false;
  }
  solicitud_uuid.value = row.uuid;
  dialog_del.value = true;
};
const onCDelete = () => {
  update({ uuid: solicitud_uuid.value, estado: 3, causa: causa.value?.value || 0, oc_entrega_name: name, oc_entrega_uid: uid });
  dialog_del.value = false;
  notify({ color: "green-6", textColor: "white", icon: "cloud_done", message: "Solicitud Eliminada", timeout: 1000 });
};
const onEnd = (row) => {
  if (![0].includes(row.estado)) {
    notify({ color: "red-6", textColor: "white", icon: "error", message: "Solicitud no puede ser editada", timeout: 1000 });
    return false;
  }
  solicitud_uuid.value = row.uuid;
  oc_entrega_solicitada_timestamp = row.oc_entrega_solicitada_timestamp;
  oc_solicitud_timestamp = row.oc_solicitud_timestamp;
  dialog.value = true;
};
const onCEnd = () => {
  update({
    uuid: solicitud_uuid.value, estado: 1,
    oc_entrega_concretada_fecha: useDateFormat(fh_concretada.value, "DD/MM/YYYY").value,
    oc_entrega_concretada_hora: useDateFormat(fh_concretada.value, "HH:mm").value,
    oc_entrega_concretada_timestamp: fh_concretada.value / 1000,
    resultado: oc_entrega_solicitada_timestamp >= fh_concretada.value / 1000,
    oc_entrega_name: name, oc_entrega_uid: uid,
  });
  notify({ color: "green-6", textColor: "white", icon: "cloud_done", message: "Solicitud Finalizada", timeout: 1000 });
};
const exportTable = async () => {
  loading_his.value = true;
  const content = [];
  content.push(["UNIDAD NEGOCIO", "UNIDAD SERVICIO", "CONTRATO", "ID", "ESTADO", "TIPO SOLICITUD", "MOTIVO SOLICITUD", "SISTEMA / COMPONENTE", "NUMERO CO", "NUMERO OC", "FECHA SOLICITUD", "HORA SOLICITUD", "SOLICITANTE", "TALLER / PLANTA", "DOMINIO", "TIPO REPUESTO", "MARCA REPUESTO", "CODIGO REPUESTO", "DESCRIPCIÓN REPUESTO", "MEDIDA REPUESTO", "CANTIDAD REPUESTO", "PLACA PATENTE", "NUMERO INTERNO", "NUMERO VIN", "TIPO BUS", "FECHA ENTREGA CONCRETADA", "HORA ENTREGA CONCRETADA", "RESOLUTOR", "CAUSA ELIMINACION"]);
  const registros = await gethistoric();
  if (registros.length === 0) {
    loading_his.value = false;
    return notify({ color: "red-6", textColor: "white", icon: "error", message: "No ha sido posible descargar histórico", timeout: 1000 });
  }
  for (const s of registros) {
    if (s.motivo_solicitud === 0) continue;
    content.push([s.unidad_negocio, s.unidad_servicio, contratos.get(s.tipo_bus) || "", s.uuid, s.estado === 0 ? "En Proceso" : s.estado === 1 ? "Finalizada" : s.estado === 3 ? "Eliminada" : "", s.tipo_solicitud, motivo_map.get(s.motivo_solicitud) || "", s.sistema_componente, s.co_numero, s.oc_numero, s.oc_solicitud_fecha, s.oc_solicitud_hora, s.oc_solicitud_name, s.oc_taller_planta, s.dominio === "0" ? "CARROCERIA" : s.dominio === "1" ? "CHASIS" : "CHASIS", s.repuesto_tipo, s.repuesto_marca, s.repuesto_codigo, s.repuesto_descripcion, s.repuesto_medida, s.repuesto_cantidad, s.placa_patente, buses?.[s.placa_patente]?.[0], buses?.[s.placa_patente]?.[2], s.tipo_bus, s.oc_entrega_concretada_fecha, s.oc_entrega_concretada_hora, s.oc_entrega_name, delete_map.get(s.causa)]);
  }
  const data = stringify(content, { delimiter: ";", quoted_string: true, bom: true });
  exportFile("solicitud_repuesto.csv", data, "text/csv");
  loading_his.value = false;
};
watch(
  () => m_solicitud_repuesto_change.value,
  async () => {
    solicitud_repuesto_arr.value = (await getall()).filter((registro) => registro.motivo_solicitud !== 0);
    if (m_solicitud_repuesto_change.value > 0) loading.value = false;
  },
  { immediate: true }
);
</script>

<template>
  <div>
    <SmartTable
      :rows="solicitud_diagnostico_arr"
      :columns="columns"
      row-key="uuid"
      :loading="loading"
      persist-key="soplocd-list"
      search-placeholder="Buscar..."
      empty-icon="biotech"
      empty-text="No hay solicitudes de diagnóstico"
    >
      <template #top-left>
        <q-btn v-if="sdiag" color="primary" to="/soplocD/add" label="Agregar" class="q-mr-sm" />
        <q-btn color="dark" label="Histórico" class="q-mr-sm" @click="exportTable" :loading="loading_his" />
      </template>
      <template #body-cell-actions="{ row }">
        <q-td>
          <q-btn v-if="sumi" color="primary" icon="event" flat dense @click="onEnd(row)">
            <q-tooltip>Fijar fecha</q-tooltip>
          </q-btn>
          <q-btn v-if="sumi || sdiag" color="negative" icon="delete" flat dense @click="onDelete(row)">
            <q-tooltip>Eliminar</q-tooltip>
          </q-btn>
        </q-td>
      </template>
      <template #empty-action>
        <q-btn color="primary" to="/soplocD/add" label="Crear solicitud" />
      </template>
    </SmartTable>
    <q-dialog v-model="dialog" transition-show="scale" transition-hide="scale" persistent>
      <div class="q-gutter-md row items-start">
        <q-date v-if="!showTime" v-model="fecha_resolucion_concretada" :title="fh_concretada ? useDateFormat(fh_concretada, 'DD/MM/YYYY HH:mm').value : ''" :subtitle="solicitud_uuid" :options="optionsFn" :events="eventsFn" :event-color="eventsCFn" @update:model-value="onDateSelected">
          <q-form @submit="onCEnd()">
            <q-input v-model="ot_resolucion_detalle" label="DETALLE RESOLUCION" dense :rules="[(val) => (val && val.length > 0) || 'Este campo es obligatorio.']" input-class="text-uppercase" autogrow />
            <div class="row items-center justify-end q-gutter-sm">
              <q-btn color="dark" label="Cancelar" @click="dialog = false" />
              <q-btn color="primary" label="Guardar" type="submit" />
            </div>
          </q-form>
        </q-date>
        <q-time v-if="showTime" v-model="hora_resolucion_concretada" :title="fh_concretada ? useDateFormat(fh_concretada, 'DD/MM/YYYY HH:mm').value : ''" :subtitle="solicitud_uuid" :options="(hr, min, sec) => min % 15 === 0" format24h @update:model-value="dialog = false">
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
import { useSdiagStore } from "@/store/sdiagStore";
import { storeToRefs } from "pinia";
import { ref, watch, shallowRef, computed } from "vue";
import { exportFile } from "quasar";
import { stringify } from "csv-stringify/browser/esm/sync";
import { useDateFormat } from "@vueuse/core";
import { useUserStore } from "@/store/userStore";
import buses from "@/assets/json/buses.json";
import SmartTable from "@/components/shared/SmartTable.vue";

const contratos = new Map(Object.entries(buses).map(([, v]) => [v[35], v[34]]));

const columns = [
  { name: "unidad_negocio", label: "UN", field: "unidad_negocio", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "unidad_servicio", label: "US", field: "unidad_servicio", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "contrato", label: "Contrato", field: (row) => contratos.get(buses?.[row.placa_patente]?.[35]) || "", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "uuid", label: "ID", field: "uuid", align: "center", responsive: ["sm", "md", "lg", "xl"], width: "90px" },
  { name: "estado", label: "Estado", field: (row) => row.estado === 0 ? "En Proceso" : row.estado === 1 ? "Finalizada" : row.estado === 3 ? "Eliminada" : "", align: "center", sortable: true, chip: true, chipColor: (row) => row.estado === 0 ? "orange" : row.estado === 1 ? "positive" : row.estado === 3 ? "negative" : "grey", chipOutline: true, width: "130px" },
  { name: "tipo_solicitud", label: "Tipo Solicitud", field: "tipo_solicitud", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "placa_patente", label: "Placa Patente", field: "placa_patente", align: "center", sortable: true, width: "110px", style: "font-weight: 700; letter-spacing: 0.5px;", headerStyle: "font-weight: 700;" },
  { name: "km_ejecucion", label: "Kilometraje", field: "km_ejecucion", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "sistema_componente", label: "Sistema / Componente", field: "sistema_componente", align: "center" },
  { name: "ot_numero", label: "Numero Atención", field: "ot_numero", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "ot_solicitud_fecha", label: "Fecha Solicitud", field: "ot_solicitud_fecha", align: "center", responsive: ["sm", "md", "lg", "xl"] },
  { name: "ot_solicitud_hora", label: "Hora Solicitud", field: "ot_solicitud_hora", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "ot_solicitud_name", label: "Solicitante", field: "ot_solicitud_name", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "ot_resolucion_solicitada_fecha", label: "Fecha Resolucion Solicitada", field: "ot_resolucion_solicitada_fecha", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "ot_taller_planta", label: "Taller / Planta", field: "ot_taller_planta", align: "center", responsive: ["lg", "xl"] },
  { name: "dominio", label: "Dominio", field: (row) => row.dominio === "0" ? "CARROCERIA" : row.dominio === "1" ? "CHASIS" : "CHASIS", align: "center", sortable: true, responsive: ["md", "lg", "xl"] },
  { name: "ot_solicitud_detalle", label: "Detalle Solicitud", field: "ot_solicitud_detalle", align: "center" },
  { name: "ot_resolucion_concretada_fecha", label: "Fecha Resolucion Concretada", field: "ot_resolucion_concretada_fecha", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "ot_resolucion_concretada_hora", label: "Hora Resolucion Concretada", field: "ot_resolucion_concretada_hora", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "ot_resolucion_name", label: "Resolutor", field: "ot_resolucion_name", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "ot_resolucion_detalle", label: "Detalle Resolución", field: "ot_resolucion_detalle", align: "center" },
  { name: "causa_eliminacion", label: "Causa Eliminación", field: (row) => delete_map.get(row.causa), align: "center", responsive: ["lg", "xl"] },
  { name: "hasPendingWrites", label: "Sincronizado", field: "hasPendingWrites", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "actions", label: "Acciones", field: "", align: "center" },
  { name: "ot_solicitud_timestamp", field: "ot_solicitud_timestamp" },
];

const { m_solicitud_diagnostico_change } = storeToRefs(useSdiagStore());
const { getall, gethistoric, update } = useSdiagStore();
const solicitud_diagnostico_arr = shallowRef([]);
const { notify } = useQuasar();
const { name, uid, sumi, sdiag } = useUserStore();
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
const showTime = ref(false);

const delete_options = [{ label: "FECHA NO CORRESPONDE", value: 4 }, { label: "SOLICITUD INVIABLE", value: 5 }];
const delete_map = new Map([[0, "SOLICITUD INCORRECTA"], [1, "VALORES NO CORRESPONDEN"], [2, "CANTIDADES NO CORRESPONDEN"], [3, "LINEAS NO CORRESPONDEN"], [4, "FECHA NO CORRESPONDE"], [5, "SOLICITUD INVIABLE"]]);

const onDateSelected = () => { hora_resolucion_concretada.value = null; showTime.value = true; };
const fh_concretada = computed(() => {
  if (!fecha_resolucion_concretada.value || !hora_resolucion_concretada.value) return null;
  const [year, month, day] = fecha_resolucion_concretada.value.split("/");
  const [hour, minute] = hora_resolucion_concretada.value.split(":");
  return new Date(year, month - 1, day, hour, minute);
});
const optionsFn = (date) => date >= useDateFormat(new Date(ot_solicitud_timestamp * 1000), "YYYY/MM/DD").value && date <= useDateFormat(new Date(), "YYYY/MM/DD").value;
const eventsFn = (date) => date >= useDateFormat(new Date(ot_solicitud_timestamp * 1000), "YYYY/MM/DD").value;
const eventsCFn = (date) => date <= useDateFormat(new Date(ot_resolucion_solicitada_timestamp * 1000), "YYYY/MM/DD").value ? "teal" : "red";

const onDelete = (row) => {
  if (![0].includes(row.estado) || (row.user_uid !== uid && !sumi)) {
    notify({ color: "red-6", textColor: "white", icon: "error", message: "Solicitud no puede ser eliminada", timeout: 1000 });
    return false;
  }
  solicitud_uuid.value = row.uuid;
  dialog_del.value = true;
};
const onCDelete = () => {
  update({ uuid: solicitud_uuid.value, estado: 3, causa: causa.value?.value || 0, ot_resolucion_name: name, ot_resolucion_uid: uid });
  dialog_del.value = false;
  notify({ color: "green-6", textColor: "white", icon: "cloud_done", message: "Solicitud Eliminada", timeout: 1000 });
};
const onEnd = (row) => {
  if (![0].includes(row.estado)) {
    notify({ color: "red-6", textColor: "white", icon: "error", message: "Solicitud no puede ser editada", timeout: 1000 });
    return false;
  }
  solicitud_uuid.value = row.uuid;
  ot_resolucion_solicitada_timestamp = row.ot_resolucion_solicitada_timestamp;
  ot_solicitud_timestamp = row.ot_solicitud_timestamp;
  dialog.value = true;
};
const onCEnd = () => {
  update({
    uuid: solicitud_uuid.value, estado: 1,
    ot_resolucion_concretada_fecha: useDateFormat(fh_concretada.value, "DD/MM/YYYY").value,
    ot_resolucion_concretada_hora: useDateFormat(fh_concretada.value, "HH:mm").value,
    ot_resolucion_concretada_timestamp: fh_concretada.value / 1000,
    ot_resolucion_detalle: ot_resolucion_detalle.value.toUpperCase(),
    resultado: ot_resolucion_solicitada_timestamp >= fh_concretada.value / 1000,
    ot_resolucion_name: name, ot_resolucion_uid: uid,
  });
  dialog.value = false;
  notify({ color: "green-6", textColor: "white", icon: "cloud_done", message: "Solicitud Finalizada", timeout: 1000 });
};
const exportTable = async () => {
  loading_his.value = true;
  const content = [];
  content.push(["UNIDAD NEGOCIO", "UNIDAD SERVICIO", "CONTRATO", "ID", "ESTADO", "TIPO SOLICITUD", "PLACA PATENTE", "KILOMETRAJE", "SISTEMA / COMPONENTE", "FECHA SOLICITUD", "HORA SOLICITUD", "SOLICITANTE", "TALLER / PLANTA", "DOMINIO", "DETALLE SOLICITUD", "FECHA RESOLUCION CONCRETADA", "HORA RESOLUCION CONCRETADA", "RESOLUTOR", "DETALLE RESOLUCION", "CAUSA ELIMINACION"]);
  const registros = await gethistoric();
  if (registros.length === 0) {
    loading_his.value = false;
    return notify({ color: "red-6", textColor: "white", icon: "error", message: "No ha sido posible descargar histórico", timeout: 1000 });
  }
  for (const s of registros) {
    content.push([s.unidad_negocio, s.unidad_servicio, contratos.get(buses?.[s.placa_patente]?.[35]) || "", s.uuid, s.estado === 0 ? "En Proceso" : s.estado === 1 ? "Finalizada" : s.estado === 3 ? "Eliminada" : "", s.tipo_solicitud, s.placa_patente, s.km_ejecucion, s.sistema_componente, s.ot_solicitud_fecha, s.ot_solicitud_hora, s.ot_solicitud_name, s.ot_taller_planta, s.dominio === "0" ? "CARROCERIA" : s.dominio === "1" ? "CHASIS" : "CHASIS", s.ot_solicitud_detalle, s.ot_resolucion_concretada_fecha, s.ot_resolucion_concretada_hora, s.ot_resolucion_name, s.ot_resolucion_detalle, delete_map.get(s.causa)]);
  }
  const data = stringify(content, { delimiter: ";", quoted_string: true, bom: true });
  exportFile("solicitud_diagnostico.csv", data, "text/csv");
  loading_his.value = false;
};
watch(
  () => m_solicitud_diagnostico_change.value,
  async () => {
    solicitud_diagnostico_arr.value = await getall();
    if (m_solicitud_diagnostico_change.value > 0) loading.value = false;
  },
  { immediate: true }
);
</script>

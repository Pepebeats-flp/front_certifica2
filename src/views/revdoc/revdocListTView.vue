<template>
  <div>
    <SmartTable
      :rows="revision_tecnica_arr"
      :columns="columns"
      row-key="uuid"
      :loading="loading"
      persist-key="revdoct-list"
      search-placeholder="Buscar..."
      empty-icon="car_repair"
      empty-text="No hay revisiones técnicas registradas"
    >
      <template #top-left>
        <q-btn color="primary" to="/revdocT/add" label="Agregar" class="q-mr-sm" />
        <q-btn color="dark" label="Histórico" class="q-mr-sm" @click="exportTable" :loading="loading_his" />
      </template>
      <template #empty-action>
        <q-btn color="primary" to="/revdocT/add" label="Crear registro" />
      </template>
    </SmartTable>
  </div>
</template>

<script setup>
import { useQuasar } from "quasar";
import { useRevtecStore } from "@/store/revtecStore";
import { storeToRefs } from "pinia";
import { ref, watch, shallowRef } from "vue";
import { exportFile } from "quasar";
import { stringify } from "csv-stringify/browser/esm/sync";
import SmartTable from "@/components/shared/SmartTable.vue";

const columns = [
  { name: "unidad_negocio", label: "UN", field: "unidad_negocio", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "unidad_servicio", label: "US", field: "unidad_servicio", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "uuid", label: "ID", field: "uuid", align: "center", responsive: ["sm", "md", "lg", "xl"], width: "90px" },
  { name: "placa_patente", label: "Placa Patente", field: "placa_patente", align: "center", sortable: true, width: "110px", style: "font-weight: 700; letter-spacing: 0.5px;", headerStyle: "font-weight: 700;" },
  { name: "tipo_servicio", label: "Tipo Servicio", field: "tipo_servicio", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "sistema_componente", label: "Sistema / Componente", field: "sistema_componente", align: "center" },
  { name: "crt_num_certificado", label: "Numero Certificado", field: "crt_num_certificado", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "crt_apertura_fecha", label: "Fecha Apertura", field: "crt_apertura_fecha", align: "center", responsive: ["sm", "md", "lg", "xl"] },
  { name: "crt_apertura_hora", label: "Hora Apertura", field: "crt_apertura_hora", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "crt_cierre_fecha", label: "Fecha Cierre", field: "crt_cierre_fecha", align: "center", responsive: ["sm", "md", "lg", "xl"] },
  { name: "crt_cierre_hora", label: "Hora Cierre", field: "crt_cierre_hora", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "crt_taller_planta", label: "Taller / Planta", field: "crt_taller_planta", align: "center", responsive: ["lg", "xl"] },
  { name: "km_ejecucion", label: "Km Ejecución", field: "km_ejecucion", align: "center", responsive: ["lg", "xl"] },
  { name: "cantidad_defectos", label: "Cantidad Defectos", field: (row) => row.defectos?.length, align: "center", responsive: ["md", "lg", "xl"] },
  {
    name: "resultado", label: "Resultado", align: "center",
    field: (row) => row.certifica === true ? "APROBADO" : "NO APROBADO",
    chip: true, chipColor: (row) => row.certifica === true ? "positive" : "negative",
  },
  { name: "crt_vencimiento_fecha", label: "Fecha Vencimiento", field: "crt_vencimiento_fecha", align: "center", responsive: ["sm", "md", "lg", "xl"] },
  { name: "crt_vencimiento_hora", label: "Hora Vencimiento", field: "crt_vencimiento_hora", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "crt_apertura_timestamp", field: "crt_apertura_timestamp" },
];

const { m_rev_tecnica_change } = storeToRefs(useRevtecStore());
const { getall, gethistoric } = useRevtecStore();
const revision_tecnica_arr = shallowRef([]);
const { notify } = useQuasar();
const loading = ref(true);
const loading_his = ref(false);

const exportTable = async () => {
  loading_his.value = true;
  const content = [];
  content.push(["UNIDAD NEGOCIO", "UNIDAD SERVICIO", "ID", "PLACA PATENTE", "TIPO SERVICIO", "SISTEMA / COMPONENTE", "NUMERO CERTIFICADO", "FECHA APERTURA", "HORA APERTURA", "FECHA CIERRE", "HORA CIERRE", "TALLER / PLANTA", "KM EJECUCION", "CANTIDAD DEFECTOS", "RESULTADO", "FECHA VENCIMIENTO", "HORA VENCIMIENTO"]);
  const registros = await gethistoric();
  if (registros.length === 0) {
    loading_his.value = false;
    return notify({ color: "red-6", textColor: "white", icon: "error", message: "No ha sido posible descargar histórico", timeout: 1000 });
  }
  for (const revision of registros) {
    content.push([revision.unidad_negocio, revision.unidad_servicio, revision.uuid, revision.placa_patente, revision.tipo_servicio, revision.sistema_componente, revision.crt_num_certificado, revision.crt_apertura_fecha, revision.crt_apertura_hora, revision.crt_cierre_fecha, revision.crt_cierre_hora, revision.crt_taller_planta, revision.km_ejecucion, revision.defectos?.length, revision.certifica === true ? "APROBADO" : "NO APROBADO", revision.crt_vencimiento_fecha, revision.crt_vencimiento_hora]);
  }
  const data = stringify(content, { delimiter: ";", quoted_string: true, bom: true });
  exportFile("revision_tecnica.csv", data, "text/csv");
  loading_his.value = false;
};

watch(
  () => m_rev_tecnica_change.value,
  async () => {
    revision_tecnica_arr.value = await getall();
    if (m_rev_tecnica_change.value > 0) loading.value = false;
  },
  { immediate: true }
);
</script>

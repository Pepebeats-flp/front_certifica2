<template>
  <div>
    <SmartTable
      :rows="incidente_arr"
      :columns="columns"
      row-key="uuid"
      :loading="loading"
      persist-key="revdoci-list"
      search-placeholder="Buscar..."
      empty-icon="warning"
      empty-text="No hay incidentes registrados"
    >
      <template #top-left>
        <q-btn color="primary" to="/revdocI/add" label="Agregar" class="q-mr-sm" />
        <q-btn color="dark" label="Histórico" class="q-mr-sm" @click="exportTable" :loading="loading_his" />
      </template>
      <template #empty-action>
        <q-btn color="primary" to="/revdocI/add" label="Crear registro" />
      </template>
    </SmartTable>
  </div>
</template>

<script setup>
import { useIncideStore } from "@/store/incideStore";
import { storeToRefs } from "pinia";
import { ref, watch, shallowRef } from "vue";
import { exportFile, useQuasar } from "quasar";
import { stringify } from "csv-stringify/browser/esm/sync";
import SmartTable from "@/components/shared/SmartTable.vue";

const estado_map = new Map([[0, "En Proceso"], [1, "Finalizada"], [2, ""], [3, "Eliminada"]]);
const tipos_map = new Map([[0, "INCIDENTE"], [1, "SINIESTRO"]]);

const columns = [
  { name: "unidad_negocio", label: "UN", field: "unidad_negocio", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "unidad_servicio", label: "US", field: "unidad_servicio", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "uuid", label: "ID", field: "uuid", align: "center", responsive: ["sm", "md", "lg", "xl"], width: "90px" },
  {
    name: "estado", label: "Estado", align: "center", sortable: true,
    field: (row) => estado_map.get(row.estado) || "",
    chip: true, chipColor: (row) => { const v = estado_map.get(row.estado) || ""; return v === "En Proceso" ? "orange" : v === "Finalizada" ? "positive" : v === "Eliminada" ? "negative" : "grey"; },
    width: "130px", chipOutline: true,
  },
  { name: "placa_patente", label: "Placa Patente", field: "placa_patente", align: "center", sortable: true, width: "110px", style: "font-weight: 700; letter-spacing: 0.5px;", headerStyle: "font-weight: 700;" },
  {
    name: "tipo", label: "Tipo", align: "center",
    field: (row) => tipos_map.get(row.tipo) || "INCIDENTE",
    chip: true, chipColor: (row) => row.tipo === 1 ? "negative" : "warning",
  },
  { name: "sistema_componente", label: "Sistema / Componente", field: "sistema_componente", align: "center" },
  { name: "causa_origen", label: "Causa / Origen", field: "causa_origen", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "inc_apertura_fecha", label: "Fecha Apertura", field: "inc_apertura_fecha", align: "center", responsive: ["sm", "md", "lg", "xl"] },
  { name: "inc_apertura_hora", label: "Hora Apertura", field: "inc_apertura_hora", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "inc_cierre_fecha", label: "Fecha Cierre", field: "inc_cierre_fecha", align: "center", responsive: ["sm", "md", "lg", "xl"] },
  { name: "inc_cierre_hora", label: "Hora Cierre", field: "inc_cierre_hora", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "uuid_estado_general", label: "ID Estado General", field: "uuid_estado_general", align: "center", responsive: ["lg", "xl"] },
  { name: "inc_taller_planta", label: "Taller / Planta", field: "inc_taller_planta", align: "center", responsive: ["lg", "xl"] },
  { name: "km_ejecucion", label: "Km Ejecución", field: "km_ejecucion", align: "center", responsive: ["lg", "xl"] },
  { name: "inc_apertura_timestamp", field: "inc_apertura_timestamp" },
];

const { m_incidente_change } = storeToRefs(useIncideStore());
const { getall, gethistoric } = useIncideStore();
const incidente_arr = shallowRef([]);
const { notify } = useQuasar();
const loading = ref(true);
const loading_his = ref(false);

const exportTable = async () => {
  loading_his.value = true;
  const content = [];
  content.push(["UNIDAD NEGOCIO", "UNIDAD SERVICIO", "ID", "ESTADO", "PLACA PATENTE", "TIPO", "SISTEMA / COMPONENTE", "CAUSA / ORIGEN", "FECHA APERTURA", "HORA APERTURA", "FECHA CIERRE", "HORA CIERRE", "ID ESTADO GENERAL", "TALLER / PLANTA", "KM EJECUCION"]);
  const registros = await gethistoric();
  if (registros.length === 0) {
    loading_his.value = false;
    return notify({ color: "red-6", textColor: "white", icon: "error", message: "No ha sido posible descargar histórico", timeout: 1000 });
  }
  for (const registro of registros) {
    content.push([registro.unidad_negocio, registro.unidad_servicio, registro.uuid, estado_map.get(registro.estado)?.toUpperCase() || "", registro.placa_patente, tipos_map.get(registro.tipo) || "INCIDENTE", registro.sistema_componente, registro.causa_origen, registro.inc_apertura_fecha, registro.inc_apertura_hora, registro.inc_cierre_fecha, registro.inc_cierre_hora, registro.uuid_estado_general, registro.inc_taller_planta, registro.km_ejecucion]);
  }
  const data = stringify(content, { delimiter: ";", quoted_string: true, bom: true });
  exportFile("incidentes.csv", data, "text/csv");
  loading_his.value = false;
};

watch(
  () => m_incidente_change.value,
  async () => {
    incidente_arr.value = await getall();
    if (m_incidente_change.value > 0) loading.value = false;
  },
  { immediate: true }
);
</script>

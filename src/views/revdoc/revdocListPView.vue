<template>
  <div>
    <SmartTable
      :rows="mantenimiento_preventivo_arr"
      :columns="columns"
      row-key="uuid"
      :loading="loading"
      persist-key="revdocp-list"
      search-placeholder="Buscar..."
      empty-icon="build"
      empty-text="No hay mantenimientos preventivos registrados"
    >
      <template #top-left>
        <q-btn color="primary" to="/revdocP/add" label="Agregar" class="q-mr-sm" />
        <q-btn color="dark" label="Histórico" class="q-mr-sm" @click="onDownload" :loading="loading_his" />
      </template>
      <template #empty-action>
        <q-btn color="primary" to="/revdocP/add" label="Crear registro" />
      </template>
    </SmartTable>
  </div>
</template>

<script setup>
import { useMprevStore } from "@/store/mprevStore";
import { storeToRefs } from "pinia";
import { ref, watch, shallowRef } from "vue";
import { getStorage, ref as fref, getDownloadURL } from "firebase/storage";
import { client, revdoc_map } from "@/client";
import SmartTable from "@/components/shared/SmartTable.vue";

const columns = [
  { name: "unidad_negocio", label: "UN", field: "unidad_negocio", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "unidad_servicio", label: "US", field: "unidad_servicio", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "uuid", label: "ID", field: "uuid", align: "center", responsive: ["sm", "md", "lg", "xl"], width: "90px" },
  { name: "placa_patente", label: "Placa Patente", field: "placa_patente", align: "center", sortable: true, width: "110px", style: "font-weight: 700; letter-spacing: 0.5px;", headerStyle: "font-weight: 700;" },
  { name: "tipo_servicio", label: "Tipo Servicio", field: "tipo_servicio", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "pauta_proyectada", label: "Pauta proyectada", field: "pauta_proyectada", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "sistema_componente", label: "Sistema / Componente", field: "sistema_componente", align: "center" },
  { name: "causa_origen", label: "Causa / Origen", field: "causa_origen", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "km_proyectado", label: "KM Proyectado", field: "km_proyectado", align: "center", responsive: ["lg", "xl"] },
  { name: "frecuencia", label: "Frecuencia", field: "frecuencia", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "tolerancia", label: "Tolerancia", field: "tolerancia", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "fecha_proyectada", label: "Fecha Proyectada", field: "fecha_proyectada", align: "center", responsive: ["sm", "md", "lg", "xl"] },
  { name: "ot_numero", label: "Numero OT", field: "ot_numero", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "ot_apertura_fecha", label: "Fecha Apertura", field: "ot_apertura_fecha", align: "center", responsive: ["sm", "md", "lg", "xl"] },
  { name: "ot_apertura_hora", label: "Hora Apertura", field: "ot_apertura_hora", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "ot_cierre_fecha", label: "Fecha Cierre", field: "ot_cierre_fecha", align: "center", responsive: ["sm", "md", "lg", "xl"] },
  { name: "ot_cierre_hora", label: "Hora Cierre", field: "ot_cierre_hora", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "taller_planta", label: "Taller / Planta", field: "taller_planta", align: "center", responsive: ["lg", "xl"] },
  { name: "km_ejecucion", label: "Km Ejecución", field: "km_ejecucion", align: "center", responsive: ["lg", "xl"] },
  { name: "pauta_ejecutada", label: "Pauta Ejecutada", field: "pauta_ejecutada", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "cantidad_trepuestos", label: "Cantidad Tipos Repuestos", field: (row) => row.repuestos?.length, align: "center", responsive: ["md", "lg", "xl"] },
  { name: "cantidad_tinsumos", label: "Cantidad Tipos Insumos", field: (row) => row.insumos?.length, align: "center", responsive: ["md", "lg", "xl"] },
  { name: "observacion", label: "Observacion", field: "observacion", align: "center" },
  { name: "km_diferencia", label: "Km Diferencia", field: "km_diferencia", align: "center", responsive: ["lg", "xl"] },
  { name: "resultado", label: "Resultado", field: (row) => revdoc_map.get(row.resultado) || "", align: "center" },
  { name: "fecha_creacion_timestamp", field: "fecha_creacion_timestamp" },
];

const { m_mant_prev_change } = storeToRefs(useMprevStore());
const { getall } = useMprevStore();
const mantenimiento_preventivo_arr = shallowRef([]);
const loading = ref(true);
const loading_his = ref(false);

watch(
  () => m_mant_prev_change.value,
  async () => {
    mantenimiento_preventivo_arr.value = await getall();
    if (m_mant_prev_change.value > 0) loading.value = false;
  },
  { immediate: true }
);

const onDownload = async () => {
  loading_his.value = true;
  const url = await getDownloadURL(fref(getStorage(), `revision_documental/mantenimiento_preventivo_${client}.csv`));
  window.location.href = url;
  loading_his.value = false;
};
</script>

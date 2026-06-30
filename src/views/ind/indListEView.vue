<template>
  <div>
    <SmartTable
      :rows="buses_arr"
      :columns="columns"
      row-key="uuid"
      :loading="loading"
      persist-key="ind-list-e"
      search-placeholder="Buscar por placa, estado..."
      empty-icon="assignment_turned_in"
      empty-text="Cargando datos de certificación..."
      :initial-search="routeSearch"
    >
      <template #top-left>
        <q-btn color="primary" icon="archive" icon-right="archive" label="Descargar" no-caps @click="exportTable" />
      </template>
    </SmartTable>
  </div>
</template>

<script setup>
import SmartTable from "@/components/shared/SmartTable.vue";
import { ref, shallowRef } from "vue";
import { useRoute } from "vue-router";
import { exportFile } from "quasar";
import { stringify } from "csv-stringify/browser/esm/sync";
import buses from "@/assets/json/buses.json";
import { useEstadogStore } from "@/store/estadogStore";
import { useInspecStore } from "@/store/inspecStore";
import { useMprevStore } from "@/store/mprevStore";
import { useIncideStore } from "@/store/incideStore";
import { useRevtecStore } from "@/store/revtecStore";
import { useInfoStore } from "@/store/infoStore";
import { meses_estado_general, meses_inspeccion_tecnica } from "@/client";
import { useQuasar } from "quasar";
import { invoke, until, useDateFormat } from "@vueuse/core";
import { storeToRefs } from "pinia";

const statusColorMap = {
  "Caducado": "negative",
  "Aprobado": "positive",
  "No Aprobado": "negative",
  "Pendiente": "warning",
};

const columns = [
  { name: "unidad_negocio", label: "UN", field: (row) => row[11], align: "center", responsive: ["md", "lg", "xl"] },
  { name: "unidad_servicio", label: "US", field: (row) => row[1], align: "center", responsive: ["md", "lg", "xl"] },
  { name: "placa_patente", label: "Placa Patente", field: (row) => row[0], align: "center", sortable: true, width: "110px", style: "font-weight: 700; letter-spacing: 0.5px;", headerStyle: "font-weight: 700;" },
  { name: "estado_bus", label: "Estado Bus", field: (row) => row[10], align: "center", sortable: true },
  { name: "estado_propiedad", label: "Estado Propiedad", field: (row) => row[2], align: "center", responsive: ["lg", "xl"] },
  { name: "inicio_operacion", label: "Inicio Operación", field: (row) => row[3], align: "center", responsive: ["md", "lg", "xl"] },
  { name: "vence_permiso_circula", label: "Venc. Permiso Circ.", field: (row) => row[4], align: "center", responsive: ["md", "lg", "xl"] },
  { name: "vence_revision_tecnica", label: "Venc. Rev. Técnica", field: (row) => row[9].crt_vencimiento_fecha, align: "center", responsive: ["lg", "xl"] },
  {
    name: "e_estado_general", label: "Estado General", align: "center",
    field: (row) => Date.now() > row[12] ? "Caducado" : row[5].certifica === true ? "Aprobado" : row[5].certifica === false ? "No Aprobado" : "Pendiente",
    chip: true, chipColor: (row) => {
      const val = Date.now() > row[12] ? "Caducado" : row[5].certifica === true ? "Aprobado" : row[5].certifica === false ? "No Aprobado" : "Pendiente";
      return statusColorMap[val] || "grey";
    },
    width: "130px", chipOutline: true,
  },
  { name: "f_estado_general", label: "Fecha EG", field: (row) => row[5].fecha, align: "center", responsive: ["lg", "xl"] },
  { name: "h_estado_general", label: "Hora EG", field: (row) => row[5].hora, align: "center", responsive: ["xl"] },
  { name: "vence_estado_general", label: "Venc. EG", field: (row) => row[14], align: "center", responsive: ["lg", "xl"] },
  {
    name: "e_inspeccion_tecnica", label: "Inspección Técnica", align: "center",
    field: (row) => Date.now() > row[13] ? "Caducado" : row[6].certifica === true ? "Aprobado" : row[6].certifica === false ? "No Aprobado" : "Pendiente",
    chip: true, chipColor: (row) => {
      const val = Date.now() > row[13] ? "Caducado" : row[6].certifica === true ? "Aprobado" : row[6].certifica === false ? "No Aprobado" : "Pendiente";
      return statusColorMap[val] || "grey";
    },
    width: "130px", chipOutline: true,
  },
  { name: "f_inspeccion_tecnica", label: "Fecha IT", field: (row) => row[6].fecha, align: "center", responsive: ["lg", "xl"] },
  { name: "h_inspeccion_tecnica", label: "Hora IT", field: (row) => row[6].hora, align: "center", responsive: ["xl"] },
  { name: "vence_inspeccion_tecnica", label: "Venc. IT", field: (row) => row[15], align: "center", responsive: ["lg", "xl"] },
  {
    name: "e_revision_documental", label: "Rev. Documental", align: "center",
    field: (row) => row[8] === true ? "Aprobado" : row[8] === false ? "No Aprobado" : "Pendiente",
    chip: true, chipColor: (row) => row[8] === true ? "positive" : row[8] === false ? "negative" : "warning",
    width: "130px", chipOutline: true,
  },
  { name: "f_revision_documental", label: "Fecha RD", field: (row) => row[7].fecha_creacion, align: "center", responsive: ["lg", "xl"] },
  { name: "h_revision_documental", label: "Hora RD", field: (row) => row[7].hora_creacion, align: "center", responsive: ["xl"] },
];

const { getlastf: getlastfe } = useEstadogStore();
const { getlastf: getlastfi } = useInspecStore();
const { getinc } = useMprevStore();
const { m_mant_prev_change } = storeToRefs(useMprevStore());
const { getlasto } = useIncideStore();
const { getlast: getlastr } = useRevtecStore();
const { getlast: getlasti } = useInfoStore();
const buses_arr = shallowRef([]);
const loading = ref(true);
const { notify } = useQuasar();
const route = useRoute();
const routeSearch = route.query.search || "";

const exportTable = () => {
  const content = [
    ["UNIDAD NEGOCIO", "UNIDAD SERVICIO", "PLACA PATENTE", "ESTADO BUS", "ESTADO PROPIEDAD", "INICIO OPERACIÓN", "VENCIMIENTO PERMISO CIRCULACIÓN", "VENCIMIENTO REVISION TECNICA", "ESTADO GENERAL", "FECHA ESTADO GENERAL", "HORA ESTADO GENERAL", "VENCIMIENTO ESTADO GENERAL", "INSPECCIÓN TECNICA", "FECHA INSPECCIÓN TECNICA", "HORA INSPECCIÓN TECNICA", "VENCIMIENTO INSPECCIÓN TECNICA", "REVISION DOCUMENTAL", "FECHA REVISION DOCUMENTAL", "HORA REVISION DOCUMENTAL"],
  ];
  for (const bus of buses_arr.value) {
    content.push([
      bus[11], bus[1], bus[0], bus[10], bus[2], bus[3], bus[4], bus[9].crt_vencimiento_fecha,
      Date.now() > bus[12] ? "Caducado" : bus[5].certifica === true ? "Aprobado" : bus[5].certifica === false ? "No Aprobado" : "Pendiente",
      bus[5].fecha, bus[5].hora, bus[14],
      Date.now() > bus[13] ? "Caducado" : bus[6].certifica === true ? "Aprobado" : bus[6].certifica === false ? "No Aprobado" : "Pendiente",
      bus[6].fecha, bus[6].hora, bus[15],
      bus[8] === true ? "Aprobado" : bus[8] === false ? "No Aprobado" : "Pendiente",
      bus[7].fecha_creacion, bus[7].hora_creacion,
    ]);
  }
  const data = stringify(content, { delimiter: ";", quoted_string: true, bom: true });
  const status = exportFile("estado_certificacion.csv", data, "text/csv");
  if (status !== true) {
    notify({ color: "red-6", textColor: "white", icon: "error", message: "No ha sido posible descargar buses", timeout: 1000 });
  }
};

invoke(async () => {
  await until(m_mant_prev_change).toMatch((v) => v > 0);
  const arr = [];
  const revdoc = await getlasti();
  const incumple = await getinc();
  const u_revision_tecnica = await getlastr();
  const uf_estado_general = await getlastfe();
  const uf_inspeccion_tecnica = await getlastfi();
  const o_incidente = await getlasto();

  for (const [key, value] of Object.entries(buses)) {
    let [day, month, year] = value[31].split("/");
    if (isNaN(day) || isNaN(month) || isNaN(year))
      [day, month, year] = [1, 12, 2022];
    const inicio_operacion_date = new Date(`${year}-${month}-${day}`);
    let estadog = uf_estado_general.get(key);
    if (!estadog) {
      estadog = { resultado: [{ certifica: null, fecha_timestamp: inicio_operacion_date.getTime() / 1000 }] };
    }
    let inspec = uf_inspeccion_tecnica.get(key);
    if (!inspec) {
      inspec = { resultado: [{ certifica: null, fecha_timestamp: inicio_operacion_date.getTime() / 1000 }] };
    }
    const revdocE = !incumple.has(key);
    let tecnica = u_revision_tecnica.get(key);
    if (!tecnica) {
      tecnica = { crt_vencimiento_fecha: "" };
    }
    const estadog_cdate = new Date(estadog.resultado.at(-1).fecha_timestamp * 1000);
    estadog_cdate.setMonth(estadog_cdate.getMonth() + meses_estado_general);
    const inspec_cdate = new Date(inspec.resultado.at(-1).fecha_timestamp * 1000);
    inspec_cdate.setMonth(inspec_cdate.getMonth() + meses_inspeccion_tecnica);
    arr.push({
      uuid: key, 0: key, 1: value[17], 2: value[24], 3: value[31], 4: value[21],
      5: estadog.resultado.at(-1), 6: inspec.resultado.at(-1), 7: revdoc, 8: revdocE,
      9: tecnica, 10: o_incidente.has(key) ? "Fuera de Servicio" : "Operativo",
      11: value[18], 12: estadog_cdate.getTime(), 13: inspec_cdate.getTime(),
      14: useDateFormat(estadog_cdate, "DD/MM/YYYY").value, 15: useDateFormat(inspec_cdate, "DD/MM/YYYY").value,
    });
  }
  buses_arr.value = arr;
  loading.value = false;
});
</script>

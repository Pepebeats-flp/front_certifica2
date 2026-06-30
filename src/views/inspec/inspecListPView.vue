<template>
  <div>
    <SmartTable
      :rows="registros_arr"
      :columns="columns"
      row-key="uuid"
      :loading="loading"
      persist-key="inspec-list-p"
      search-placeholder="Buscar por placa, terminal, estado..."
      empty-icon="assignment"
      empty-text="Aún no hay programaciones registradas"
    >
      <template #top-left>
        <q-btn color="primary" icon="list_alt" label="Programa" :loading="loading_hisp" @click="exportTable(false)" />
        <q-btn color="dark" icon="archive" label="Histórico" :loading="loading_his" @click="exportTable(true)" />
      </template>
    </SmartTable>
  </div>
</template>

<script setup>
import SmartTable from "@/components/shared/SmartTable.vue";
import { useInspecpStore } from "@/store/inspecpStore";
import { storeToRefs } from "pinia";
import { ref, watch, shallowRef } from "vue";
import buses from "@/assets/json/buses.json";
import { exportFile, useQuasar } from "quasar";
import { stringify } from "csv-stringify/browser/esm/sync";

const date = new Date();
const estado_day = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const estadoColorMap = {
  "En Plazo": "positive",
  "Por Vencer": "warning",
  "Vencida": "negative",
  "Finalizada": "info",
  "Eliminada": "grey",
};

const columns = [
  { name: "unidad_negocio", label: "UN", field: "unidad_negocio", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "unidad_servicio", label: "US", field: "unidad_servicio", align: "center", responsive: ["md", "lg", "xl"] },
  { name: "uuid", label: "Id", field: "uuid", align: "center", sortable: true, responsive: ["sm", "md", "lg", "xl"], width: "90px" },
  { name: "placa_patente", label: "Placa Patente", field: "placa_patente", align: "center", sortable: true, width: "110px", style: "font-weight: 700; letter-spacing: 0.5px;", headerStyle: "font-weight: 700;" },
  { name: "terminal", label: "Terminal", field: (row) => buses[row.placa_patente]?.[23] ?? "", align: "center", responsive: ["sm", "md", "lg", "xl"] },
  {
    name: "estado", label: "Estado", align: "center", sortable: true,
    field: (row) =>
      row.estado === 0 && row.dia_semana >= date.getDay() ? "En Plazo"
      : row.estado === 0 && row.dia_semana < date.getDay() && row.fecha_caduca_timestamp >= date.getTime() / 1000 ? "Por Vencer"
      : row.estado === 0 && row.fecha_caduca_timestamp < date.getTime() / 1000 ? "Vencida"
      : row.estado === 1 ? "Finalizada"
      : row.estado === 3 ? "Eliminada" : "",
    chip: true, chipColor: (row) => {
      const e = row.estado === 0 && row.dia_semana >= date.getDay() ? "En Plazo"
        : row.estado === 0 && row.dia_semana < date.getDay() && row.fecha_caduca_timestamp >= date.getTime() / 1000 ? "Por Vencer"
        : row.estado === 0 && row.fecha_caduca_timestamp < date.getTime() / 1000 ? "Vencida"
        : row.estado === 1 ? "Finalizada"
        : row.estado === 3 ? "Eliminada" : "";
      return estadoColorMap[e] || "grey";
    },
    width: "130px", chipOutline: true,
  },
  {
    name: "certifica_inicio", label: "Resultado Actual", align: "center", sortable: true,
    field: (row) => row.certifica_inicio === true ? "Aprobado" : "No Aprobado",
    chip: true, chipColor: (row) => row.certifica_inicio === true ? "positive" : "negative",
    width: "120px",
  },
  {
    name: "fecha_programa", label: "Fecha Propuesta", field: "fecha_programa", align: "center", sortable: true,
    sort: (a, b) => { const dA = a.split("/"), dB = b.split("/"); return new Date(+dA[2], dA[1] - 1, +dA[0]) - new Date(+dB[2], dB[1] - 1, +dB[0]); },
    responsive: ["sm", "md", "lg", "xl"],
  },
  {
    name: "dia_semana", label: "Día", field: (row) => estado_day[row.dia_semana] || "", align: "center", sortable: true, responsive: ["md", "lg", "xl"],
  },
  {
    name: "fecha_expira", label: "Fecha Expiración", field: "fecha_caduca", align: "center", sortable: true,
    sort: (a, b) => { const dA = a.split("/"), dB = b.split("/"); return new Date(+dA[2], dA[1] - 1, +dA[0]) - new Date(+dB[2], dB[1] - 1, +dB[0]); },
    responsive: ["sm", "md", "lg", "xl"],
  },
  { name: "hora_expira", label: "Hora Exp.", field: "hora_caduca", align: "center", responsive: ["md", "lg", "xl"], width: "70px" },
  { name: "dias_restantes", label: "Días Rest.", field: (row) => row.estado === 0 && row.fecha_caduca_timestamp > date.getTime() / 1000 ? Math.trunc((row.fecha_caduca_timestamp - date.getTime() / 1000) / (3600 * 24)) : row.estado === 0 ? 0 : "", align: "center", sortable: true, width: "90px" },
  { name: "modelo_bus", label: "Modelo", field: (row) => buses[row.placa_patente]?.[0] ?? "", align: "center", responsive: ["lg", "xl"] },
  { name: "chasis", label: "Chasis", field: (row) => buses[row.placa_patente]?.[1] ?? "", align: "center", responsive: ["lg", "xl"] },
];

const { m_change } = storeToRefs(useInspecpStore());
const { getall, gethistoric } = useInspecpStore();
const registros_arr = shallowRef([]);
const { notify } = useQuasar();
const loading = ref(true);
const loading_his = ref(false);
const loading_hisp = ref(false);

const exportTable = async (historic) => {
  if (historic) loading_his.value = true;
  else loading_hisp.value = true;
  const content = [];
  content.push(["UNIDAD NEGOCIO", "UNIDAD SERVICIO", "ID", "PLACA PATENTE", "TERMINAL", "ESTADO", "RESULTADO ACTUAL", "FECHA PROPUESTA", "DIA", "FECHA EXPIRACIÓN", "HORA EXPIRACIÓN", "DIAS RESTANTES"]);
  const registros = await gethistoric();
  if (registros.length === 0) {
    loading_his.value = false;
    loading_hisp.value = false;
    return notify({ color: "red-6", textColor: "white", icon: "error", message: "No ha sido posible descargar histórico", timeout: 1000 });
  }
  for (const registro of registros) {
    if (!historic && registro.estado !== 0) continue;
    content.push([registro.unidad_negocio, registro.unidad_servicio, registro.uuid, registro.placa_patente, buses[registro.placa_patente]?.[23] ?? "",
      registro.estado === 0 && registro.dia_semana >= date.getDay() ? "En Plazo"
      : registro.estado === 0 && registro.dia_semana < date.getDay() && registro.fecha_caduca_timestamp >= date.getTime() / 1000 ? "Por Vencer"
      : registro.estado === 0 && registro.fecha_caduca_timestamp < date.getTime() / 1000 ? "Vencida"
      : registro.estado === 1 ? "Finalizada" : registro.estado === 3 ? "Eliminada" : "",
      registro.certifica_inicio === true ? "Aprobado" : "No Aprobado",
      registro.fecha_programa, estado_day[registro.dia_semana] || "", registro.fecha_caduca, registro.hora_caduca,
      registro.estado === 0 && registro.fecha_caduca_timestamp > date.getTime() / 1000 ? Math.trunc((registro.fecha_caduca_timestamp - date.getTime() / 1000) / (3600 * 24)) : registro.estado === 0 ? 0 : "",
    ]);
  }
  const data = stringify(content, { delimiter: ";", quoted_string: true, bom: true });
  exportFile("inspeccion_tecnica_prog.csv", data, "text/csv");
  loading_his.value = false;
  loading_hisp.value = false;
};

watch(
  () => m_change.value,
  async () => {
    registros_arr.value = await getall();
    if (m_change.value > 0) loading.value = false;
  },
  { immediate: true }
);
</script>

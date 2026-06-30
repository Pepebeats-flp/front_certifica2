<template>
  <div>
    <SmartTable
      :rows="buses_arr"
      :columns="columns"
      row-key="uuid"
      :loading="false"
      persist-key="hojav-list"
      search-placeholder="Buscar por patente, VIN, marca..."
      empty-icon="directions_bus"
      empty-text="No hay buses registrados"
    >
      <template #top-left>
        <q-btn color="primary" icon="archive" icon-right="archive" label="Descargar" no-caps @click="exportTable" />
      </template>

      <template #body-cell-actions="{ row }">
        <q-btn color="primary" icon="download" flat dense @click="onDownload(row)" :loading="downloading[row.uuid]">
          <q-tooltip>Descargar hoja de vida</q-tooltip>
        </q-btn>
      </template>
    </SmartTable>
  </div>
</template>

<script setup>
import SmartTable from "@/components/shared/SmartTable.vue";
import { ref, computed } from "vue";
import { exportFile, useQuasar } from "quasar";
import { stringify } from "csv-stringify/browser/esm/sync";
import buses from "@/assets/json/buses.json";
import { getStorage, ref as fref, getDownloadURL } from "firebase/storage";

const columns = [
  { name: "unidad_negocio", label: "Unidad Negocio", field: (row) => row[19], align: "center", responsive: ["md", "lg", "xl"] },
  { name: "unidad_servicio", label: "Unidad Servicio", field: (row) => row[18], align: "center", responsive: ["md", "lg", "xl"] },
  { name: "placa_patente", label: "Placa Patente", field: (row) => row[0], align: "center", sortable: true, width: "110px", style: "font-weight: 700; letter-spacing: 0.5px;", headerStyle: "font-weight: 700;" },
  { name: "codigo_activo", label: "Codigo Activo", field: (row) => row[1], align: "center", sortable: true },
  { name: "ano_bus", label: "Año Bus", field: (row) => row[2], align: "center", sortable: true, responsive: ["md", "lg", "xl"] },
  { name: "numero_vin", label: "Numero VIN", field: (row) => row[3], align: "center", sortable: true, responsive: ["lg", "xl"] },
  { name: "numero_motor", label: "Numero Motor", field: (row) => row[4], align: "center", sortable: true, responsive: ["lg", "xl"] },
  { name: "marca_chasis", label: "Marca Chasis", field: (row) => row[5], align: "center", responsive: ["lg", "xl"] },
  { name: "modelo_chasis", label: "Modelo Chasis", field: (row) => row[6], align: "center", responsive: ["lg", "xl"] },
  { name: "marca_carroceria", label: "Marca Carroceria", field: (row) => row[7], align: "center", responsive: ["lg", "xl"] },
  { name: "modelo_carroceria", label: "Modelo Carroceria", field: (row) => row[8], align: "center", responsive: ["lg", "xl"] },
  { name: "marca_motor", label: "Marca Motor", field: (row) => row[9], align: "center", responsive: ["lg", "xl"] },
  { name: "modelo_motor", label: "Modelo Motor", field: (row) => row[10], align: "center", responsive: ["lg", "xl"] },
  { name: "torque", label: "Torque", field: (row) => row[11], align: "center", responsive: ["lg", "xl"] },
  { name: "marca_transmision", label: "Marca Transmision", field: (row) => row[12], align: "center", responsive: ["lg", "xl"] },
  { name: "modelo_transmision", label: "Modelo Transmision", field: (row) => row[13], align: "center", responsive: ["lg", "xl"] },
  { name: "tipo_propulsion", label: "Tipo Propulsion", field: (row) => row[14], align: "center", responsive: ["lg", "xl"] },
  { name: "norma_emision", label: "Norma Emision", field: (row) => row[15], align: "center", responsive: ["lg", "xl"] },
  { name: "certificado_homologacion", label: "Cert. Homologacion", field: (row) => row[16], align: "center", responsive: ["lg", "xl"] },
  { name: "plazas_totales", label: "Plazas Totales", field: (row) => row[17], align: "center", sortable: true, responsive: ["lg", "xl"] },
  { name: "folio", label: "Folio", field: (row) => row[20], align: "center", sortable: true, responsive: ["lg", "xl"] },
  { name: "fecha_inscripcion", label: "Fecha Inscripcion", field: (row) => row[21], align: "center", responsive: ["lg", "xl"] },
  { name: "vencimiento_permiso_circulacion", label: "Venc. Permiso Circ.", field: (row) => row[22], align: "center", responsive: ["lg", "xl"] },
  { name: "terminal", label: "Terminal", field: (row) => row[24], align: "center", sortable: true, responsive: ["md", "lg", "xl"] },
  { name: "estado_propiedad", label: "Estado Propiedad", field: (row) => row[25], align: "center", responsive: ["lg", "xl"] },
  { name: "km_inicial", label: "Km Inicial", field: (row) => row[26], align: "center", sortable: true, responsive: ["lg", "xl"] },
  { name: "km_acumulado", label: "Km Acumulado", field: (row) => row[27], align: "center", sortable: true, responsive: ["lg", "xl"] },
  { name: "marca_aire_acondicionado", label: "Marca A/A", field: (row) => row[28], align: "center", responsive: ["xl"] },
  { name: "modelo_aire_acondicionado", label: "Modelo A/A", field: (row) => row[29], align: "center", responsive: ["xl"] },
  { name: "tipo_rutero", label: "Tipo Rutero", field: (row) => row[30], align: "center", responsive: ["lg", "xl"] },
  { name: "identificacion_neumaticos", label: "Ident. Neumaticos", field: (row) => row[31], align: "center", responsive: ["xl"] },
  { name: "inicio_operacion", label: "Inicio Operacion", field: (row) => row[32], align: "center", responsive: ["lg", "xl"] },
  { name: "instalacion_equipo_sonda", label: "Inst. Equipo Sonda", field: (row) => row[33], align: "center", responsive: ["xl"] },
  { name: "tipo_equipamiento", label: "Tipo Equipamiento", field: (row) => row[34], align: "center", responsive: ["lg", "xl"] },
  { name: "tipologia_bus", label: "Tipologia Bus", field: (row) => row[36], align: "center", sortable: true, responsive: ["lg", "xl"] },
  { name: "diferencial", label: "Diferencial", field: (row) => row[37], align: "center", responsive: ["xl"] },
  { name: "largo", label: "Largo", field: (row) => row[38], align: "center", sortable: true, responsive: ["xl"] },
  { name: "peso", label: "Peso", field: (row) => row[39], align: "center", sortable: true, responsive: ["xl"] },
  { name: "tipo_torniquete", label: "Tipo Torniquete", field: (row) => row[40], align: "center", responsive: ["xl"] },
  { name: "marca_torniquete", label: "Marca Torniquete", field: (row) => row[41], align: "center", responsive: ["xl"] },
  { name: "modelo_torniquete", label: "Modelo Torniquete", field: (row) => row[42], align: "center", responsive: ["xl"] },
  { name: "numero_puertas_costado_derecho", label: "Ptas. Der.", field: (row) => row[43], align: "center", responsive: ["xl"] },
  { name: "numero_puertas_costado_izquierdo", label: "Ptas. Izq.", field: (row) => row[44], align: "center", responsive: ["xl"] },
  { name: "marca_sistema_asistencia_conductor", label: "Marca Asist. Cond.", field: (row) => row[45], align: "center", responsive: ["xl"] },
  { name: "modelo_sistema_asistencia_conductor", label: "Modelo Asist. Cond.", field: (row) => row[46], align: "center", responsive: ["xl"] },
  { name: "marca_pantalla_informacion_interior", label: "Marca Panel Info", field: (row) => row[47], align: "center", responsive: ["xl"] },
  { name: "modelo_pantalla_informacion_interior", label: "Modelo Panel Info", field: (row) => row[48], align: "center", responsive: ["xl"] },
  { name: "numero_asistentos_pasajeros", label: "Asientos Pasaj.", field: (row) => row[49], align: "center", sortable: true, responsive: ["lg", "xl"] },
  { name: "actions", label: "Acciones", field: "", align: "center", width: "80px" },
];

const buses_arr = computed(() => {
  return Object.entries(buses).map(([key, value]) => {
    const row = { uuid: key, 0: key };
    for (let i = 0; i < value.length; i++) {
      row[i + 1] = value[i];
    }
    return row;
  });
});

const downloading = ref([]);
const { notify } = useQuasar();

const exportTable = () => {
  const content = [
    ["UNIDAD NEGOCIO", "UNIDAD SERVICIO", "PLACA PATENTE", "CODIGO ACTIVO", "AÑO BUS", "NUMERO VIN", "NUMERO MOTOR", "MARCA CHASIS", "MODELO CHASIS", "MARCA CARROCERIA", "MODELO CARROCERIA", "MARCA MOTOR", "MODELO MOTOR", "TORQUE", "MARCA TRANSMISION", "MODELO TRANSMISION", "TIPO PROPULSION", "NORMA EMISION", "CERTIFICADO HOMOLOGACION", "PLAZAS TOTALES", "FOLIO", "FECHA INSCRIPCION", "VENCIMIENTO PERMISO CIRCULACIÓN", "TERMINAL", "ESTADO PROPIEDAD", "KM INICIAL", "KM ACUMULADO", "MARCA AIRE ACONDICIONADO", "MODELO AIRE ACONDICIONADO", "TIPO RUTERO", "IDENTIFICACION NEUMATICOS", "INICIO OPERACION", "INSTALACION EQUIPO SONDA", "TIPO EQUIPAMIENTO", "TIPOLOGIA BUS", "DIFERENCIAL", "LARGO", "PESO", "TIPO TORNIQUETE", "MARCA TORNIQUETE", "MODELO TORNIQUETE", "NUMERO PUERTAS COSTADO DERECHO", "NUMERO PUERTAS COSTADO IZQUIERDO", "MARCA SISTEMA ASISTENCIA CONDUCTOR", "MODELO SISTEMA ASISTENCIA CONDUCTOR", "MARCA PANTALLA INFORMACION INTERIOR", "MODELO PANTALLA INFORMACION INTERIOR", "NUMERO ASISTENTOS PASAJEROS"],
  ];
  for (const bus of buses_arr.value) {
    content.push([
      bus[19], bus[18], bus[0], bus[1], bus[2], bus[3], bus[4], bus[5], bus[6], bus[7], bus[8], bus[9], bus[10],
      bus[11], bus[12], bus[13], bus[14], bus[15], bus[16], bus[17], bus[20], bus[21], bus[22], bus[24], bus[25],
      bus[26], bus[27], bus[28], bus[29], bus[30], bus[31], bus[32], bus[33], bus[34], bus[36], bus[37], bus[38],
      bus[39], bus[40], bus[41], bus[42], bus[43], bus[44], bus[45], bus[46], bus[47], bus[48], bus[49],
    ]);
  }
  const data = stringify(content, { delimiter: ";", quoted_string: true, bom: true });
  const status = exportFile("buses.csv", data, "text/csv");
  if (status !== true) {
    notify({ color: "red-6", textColor: "white", icon: "error", message: "No ha sido posible descargar buses", timeout: 1000 });
  }
};

const onDownload = async (row) => {
  downloading.value[row.uuid] = true;
  const url = await getDownloadURL(fref(getStorage(), `hoja_vida/${row[0]}.xlsx`));
  window.location.href = url;
  downloading.value[row.uuid] = false;
};
</script>

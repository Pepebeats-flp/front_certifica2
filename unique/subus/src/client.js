const client = "subus";
const unidad_servicio = "2";
const unidad_negocio = "2";
const unidad_negocio_arr = ["2"];
const unidad_map = new Map([["2", "U2"]]);
const terminales_map = new Map([
  ["RECOLETA", ["2", -70.638537, -33.378704]],
  ["LIBERTADORES", ["2", -70.682878, -33.361313]],
  ["SANTA ROSA", ["2", -70.634825, -33.606977]],
  ["PIE ANDINO", ["2", -70.553965, -33.604328]],
  ["SAN JOSE", ["2", -70.693775, -33.597802]],
  ["SAN ALFONSO", ["2", -70.674038, -33.470664]],
  ["CATEMITO", ["2", -70.7137764, -33.6112888]],
]);
const terminales = ["RECOLETA", "LIBERTADORES", "SANTA ROSA", "PIE ANDINO", "SAN JOSE", "SAN ALFONSO", "CATEMITO"];
const inspeccion_pautas = [
  "H_ADMISION_25_B8",
  "H_ADMISION_25_B8A",
  "H_ADMISION_25_B8E6",
  "H_CARROCE_20_B8",
  "H_CARROCE_20_B8A",
  "H_CARROCE_30_DIAS_B8A_INT",
  "H_CARROCE_60_B8",
  "H_CARROCE_90_DIAS_B8A_INT",
  "H_COMBUS_50_B8A",
  "H_COMBUS_50_B8E5",
  "H_COMBUS_50_B8E6",
  "H_DIRECCION_50_B8A",
  "H_DIRECCION_50_B8E5",
  "H_DIRECCION_50_B8E6",
  "H_ELECTRIC_10_B8_AA",
  "H_ELECTRIC_10_B8A",
  "H_ELECTRIC_10_B9_B7_Y_B8",
  "H_ELECTRIC_20_B8",
  "H_ELECTRIC_20_B8_AA",
  "H_ELECTRIC_20_B8A",
  "H_ELECTRIC_20_B8E6",
  "H_ELECTRIC_30_DIAS_B8A_AA",
  "H_ELECTRIC_7_DIAS_B8_AA",
  "H_FRENOS_25_B8E6_1_E",
  "H_FRENOS_25_B8E6_2_E",
  "H_FRENOS_30_B8_2_E",
  "H_FRENOS_35_B8_1_E",
  "H_FRENOS_35_B8A_1_E",
  "H_FRENOS_35_B8A_2_E",
  "H_FRENOS_35_B8A_3_E",
  "H_FRENOS_45_B8A_1_E",
  "H_FRENOS_45_B8A_2_E",
  "H_FRENOS_45_B8A_3_E",
  "H_LUBRICA_20_B8_M",
  "H_LUBRICA_20_B8A",
  "H_LUBRICA_20_B8E6",
  "H_LUBRICA_25_B8_M",
  "H_LUBRICA_25_B8A",
  "H_LUBRICA_35_B8E6",
  "H_LUBRICA_60_B8A",
  "H_LUBRICA_60_B8E5",
  "H_LUBRICA_60_B8E6",
  "H_MOTOR_50_B8A",
  "H_MOTOR_50_B8E5",
  "H_MOTOR_50_B8E6",
  "H_REFRIGERA_30_B8",
  "H_REFRIGERA_30_B8A",
  "H_REV_TECNICA_180_DIAS",
  "H_SUSPENSI_50_B8A",
  "H_SUSPENSI_50_B8E5",
  "H_SUSPENSI_50_B8E6",
  "H_TRANSMI_50_B8A",
  "H_TRANSMI_50_B8E5",
  "H_TRANSMI_50_B8E6",
  "CORRECTIVO",
];
const meses_estado_general = 3;
const meses_inspeccion_tecnica = 6;
const dashboard_link = "https://app.powerbi.com/home";
const hdasboard_link = "";
const revdoc_map = new Map([
  [true, "CUMPLE"],
  [false, "NO CUMPLE"],
]);
const traspaso_version = "0";
const traspaso_xtipo = false;
const contratos = new Map();
export {
  client,
  unidad_servicio,
  unidad_negocio,
  terminales,
  unidad_negocio_arr,
  inspeccion_pautas,
  meses_estado_general,
  meses_inspeccion_tecnica,
  dashboard_link,
  hdasboard_link,
  unidad_map,
  terminales_map,
  revdoc_map,
  traspaso_version,
  traspaso_xtipo,
  contratos,
};

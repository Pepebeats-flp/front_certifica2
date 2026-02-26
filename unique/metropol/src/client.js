const client = "metropol";
const unidad_servicio = "8";
const unidad_negocio = "8";
const unidad_negocio_arr = ["8", "9"];
const unidad_map = new Map([
  ["8", "US1"],
  ["9", "US2"],
]);
const terminales_map = new Map([
  ["COCA COLA", ["8", -70.758163, -33.394516]],
  ["CONDELL", ["8", -70.731905, -33.40189]],
  ["EL RETIRO", ["8", -70.774466, -33.411559]],
  ["JOSE AGUIRRE", ["9", -70.647571, -33.37472]],
  ["JUANITA", ["9", -70.611038, -33.632729]],
  ["PIE ANDINO", ["9", -70.553868, -33.604311]],
  ["SANTA MARGARITA", ["8", -70.705557, -33.541406]],
  ["SANTA MARTA", ["8", -70.677237, -33.35482]],
]);
const terminales = ["COCA COLA", "CONDELL", "EL RETIRO", "JOSE AGUIRRE", "JUANITA", "PIE ANDINO", "SANTA MARGARITA", "SANTA MARTA"];
const inspeccion_pautas = [
  "MP_A_8BRL_A",
  "MP_A_8BRL_B",
  "MP_A_8BRL_C",
  "MP_A_O500U",
  "MP_A_O500UA",
  "MP_B_8BRL_A",
  "MP_B_8BRL_B",
  "MP_B_8BRL_C",
  "MP_B_O500U",
  "MP_B_O500UA",
  "MP_C_8BRL_A",
  "MP_C_8BRL_B",
  "MP_C_8BRL_C",
  "MP_C_O500U",
  "MP_C_O500UA",
  "MP_D_8BRL_A",
  "MP_D_8BRL_B",
  "MP_D_8BRL_C",
  "MP_D_O500U",
  "MP_D_O500UA",
  "MP_E_8BRL_A",
  "MP_E_8BRL_B",
  "MP_E_8BRL_C",
  "MP_F_8BRL_A",
  "MP_F_8BRL_B",
  "MP_F_8BRL_C",
  "MP_L_K280U",
  "MP_M_K280U",
  "MP_S_K280U",
  "MP_X_K280U",
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
const contratos = new Map([
  ["A2", "L024-U55-O01"],
  ["B2", "L024-U55-O02"],
  ["C2", "L024-U55-O03"],
]);
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

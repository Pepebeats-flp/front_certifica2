const client = "granamericas";
const unidad_servicio = "16";
const unidad_negocio = "16";
const unidad_negocio_arr = ["16"];
const unidad_map = new Map([["16", "US16"]]);
const terminales_map = new Map([
  ["LOS SAUCES", ["16", -70.77551063136238, -33.44453883120206]],
  ["SANTA ROSA", ["16", -70.634825, -33.606977]],
]);
const terminales = ["LOS SAUCES", "SANTA ROSA"];
const inspeccion_pautas = ["ZK6128", "S"];
const meses_estado_general = 3;
const meses_inspeccion_tecnica = 6;
const dashboard_link = "https://app.powerbi.com/home";
const hdasboard_link = "";
const revdoc_map = new Map([
  [true, "APROBADO"],
  [false, "NO APROBADO"],
]);
const traspaso_version = "1";
const traspaso_xtipo = true;
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

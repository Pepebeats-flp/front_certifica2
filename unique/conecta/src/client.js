const client = "conecta";
const unidad_servicio = "17";
const unidad_negocio = "17";
const unidad_negocio_arr = ["17", "18", "19"];
const unidad_map = new Map([
  ["17", "US17"],
  ["18", "US18"],
  ["19", "US19"],
]);
const terminales_map = new Map([
  ["RECOLETA", ["19", -70.638537, -33.378704]],
  ["LIBERTADORES", ["19", -70.682878, -33.361313]],
  ["SANTA ROSA", ["19", -70.634825, -33.606977]],
  ["PIE ANDINO", ["19", -70.553965, -33.604328]],
  ["SAN JOSE", ["19", -70.693775, -33.597802]],
  ["SAN ALFONSO", ["19", -70.674038, -33.470664]],
  ["CATEMITO", ["19", -70.7137764, -33.6112888]],
]);
const terminales = ["RECOLETA", "LIBERTADORES", "SANTA ROSA", "PIE ANDINO", "SAN JOSE", "SAN ALFONSO", "CATEMITO"];
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

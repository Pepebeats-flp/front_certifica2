const client = "redbus";
const unidad_servicio = "11";
const unidad_negocio = "11";
const unidad_negocio_arr = ["11", "13"];
const unidad_map = new Map([
  ["11", "US4"],
  ["13", "US6"],
]);
const terminales_map = new Map([
  ["COLO COLO", ["13", -70.765548, -33.362697]],
  ["EL ROBLE", ["13", -70.792846, -33.438973]],
  ["EL SALTO", ["11", -70.622321, -33.386972]],
  ["JOSE ARRIETA", ["13", -70.532064, -33.465142]],
  ["LO ECHEVERS", ["13", -70.762353, -33.375354]],
]);
const terminales = ["COLO COLO", "EL ROBLE", "EL SALTO", "JOSE ARRIETA", "LO ECHEVERS"];
const inspeccion_pautas = ["MP4-160", "MP1-200", "I-175", "R-20", "CORRECTIVO"];
const meses_estado_general = 3;
const meses_inspeccion_tecnica = 6;
const dashboard_link = "https://app.powerbi.com/home";
const hdasboard_link = "https://lookerstudio.google.com/embed/reporting/1dc67d51-26bd-4aa4-ab9f-39bcdf6d36c9/page/ELsoF";
const revdoc_map = new Map([
  [true, "CUMPLE"],
  [false, "NO CUMPLE"],
]);
const traspaso_version = "0";
const traspaso_xtipo = false;
const contratos = new Map([
  ["A2", "L024-U55-O04"],
  ["B2", "L024-U55-O05"],
  ["C2", "L024-U55-O06"],
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

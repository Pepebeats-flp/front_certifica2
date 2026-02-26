const client = "voy";
const unidad_servicio = "14";
const unidad_negocio = "14";
const unidad_negocio_arr = ["4", "14", "15"];
const unidad_map = new Map([
  ["4", "U4"],
  ["14", "US14"],
  ["15", "US15"],
]);
const terminales_map = new Map([
  ["LA VARA", ["4", -70.7084936, -33.5681571]],
  ["LO ESPEJO", ["4", -70.7027855, -33.5337455]],
  ["MUJICA", ["4", -70.604075, -33.56303]],
  ["RINCONADA DE NOS", ["4", -70.6964612, -33.6219017]],
  ["EL CONQUISTADOR", ["14", -70.80098454474864, -33.52153947485533]],
  ["ENEA", ["15", -70.77210082458856, -33.42767166355481]],
  ["LA ESTRELLA", ["15", -70.75052950006223, -33.42753429216531]],
  ["DIEGO PORTALES", ["15", -70.56479193752328, -33.559980499434175]],
  ["LAS PERDICES", ["14", -70.56479193752328, -33.559980499434175]],
]);
const terminales = ["ENEA", "LA ESTRELLA", "LA VARA", "LAS PERDICES", "LO ESPEJO", "MUJICA", "RINCONADA DE NOS", "EL CONQUISTADOR", "DIEGO PORTALES"];
const inspeccion_pautas = ["ZK6128", "S"];
const meses_estado_general = 3;
const meses_inspeccion_tecnica = 6;
const dashboard_link = "https://app.powerbi.com/home";
const hdasboard_link = "https://lookerstudio.google.com/embed/reporting/9f83d30b-6200-40b4-bf3e-76cb68066111/page/p_l1vaxcuu0d";
const revdoc_map = new Map([
  [true, "APROBADO"],
  [false, "NO APROBADO"],
]);
const traspaso_version = "0";
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

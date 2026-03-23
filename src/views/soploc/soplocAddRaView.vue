<template>
  <q-form @submit="onSubmit">
    <q-card bordered class="q-ma-md">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">General</div>
      </q-card-section>
      <q-card-section>
        <q-input
          v-model="ot_numero"
          label="NUMERO OT"
          :rules="[(val) => (val && val.length > 0) || 'Este campo es obligatorio.']"
          dense
          mask="#"
          reverse-fill-mask
          :readonly="submited"
        >
          <template v-slot:before>
            <q-icon name="tag" />
          </template>
        </q-input>
        <q-select
          v-model="terminal"
          label="TERMINAL"
          :options="terminales"
          dense
          :rules="[(val) => (val && val.length > 0) || 'Este campo es obligatorio.']"
          :readonly="submited"
        >
          <template v-slot:before>
            <q-icon name="place" />
          </template>
        </q-select>

        <q-select
          v-model="dominio"
          label="DOMINIO"
          :options="dominio_options"
          dense
          :rules="[(val) => !!val || 'Este campo es obligatorio.']"
          @update:model-value="sistema_componentev = null"
          :readonly="submited"
        >
          <template v-slot:before>
            <q-icon name="chevron_right" />
          </template>
        </q-select>

        <q-select
          v-model="sistema_componentev"
          label="SISTEMA / COMPONENTE"
          :options="siscom_options"
          dense
          :rules="[(val) => !!val || 'Este campo es obligatorio.']"
          :readonly="submited"
          :disable="!dominio"
        >
          <template v-slot:before>
            <q-icon name="chevron_right" />
          </template>
        </q-select>

        <q-input
          v-model="placa_patente"
          label="PLACA PATENTE"
          :rules="[(val) => (val && validPpu.has(val.toUpperCase())) || 'Por favor, escribe una placa patente válida.']"
          dense
          mask="XXXXXX"
          debounce="500"
          :readonly="submited"
        >
          <template v-slot:before>
            <q-icon name="directions_bus" />
          </template>
        </q-input>

        <q-input
          v-model="km_ejecucion"
          label="KILOMETRAJE"
          :rules="[(val) => (val && val.length > 0) || 'Este campo es obligatorio.']"
          dense
          mask="#"
          reverse-fill-mask
          :readonly="submited"
        >
          <template v-slot:before>
            <q-icon name="linear_scale" />
          </template>
        </q-input>
        <q-input
          v-model="fecha_resolucion_solicitada"
          label="FECHA RESOLUCION SOLICITADA"
          :rules="[(val) => (val && val.length > 0) || 'Este campo es obligatorio.']"
          dense
          readonly
        >
          <q-popup-proxy transition-show="scale" transition-hide="scale">
            <q-date v-model="fecha_resolucion_solicitada" mask="DD/MM/YYYY" :options="optionsFn">
              <div class="row items-center justify-end">
                <q-btn v-close-popup label="Cerrar" color="primary" flat />
              </div>
            </q-date>
          </q-popup-proxy>
          <template v-slot:before>
            <q-icon name="event" />
          </template>
        </q-input>
        <q-input
          v-model="ot_solicitud_detalle"
          label="DETALLE SOLICITUD"
          dense
          :rules="[(val) => (val && val.length > 0) || 'Este campo es obligatorio.']"
          input-class="text-uppercase"
          :readonly="submited"
          autogrow
        >
          <template v-slot:before>
            <q-icon name="person" />
          </template>
        </q-input>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn label="Registrar" type="submit" color="primary" :loading="submited" />
      </q-card-actions>
    </q-card>
  </q-form>
</template>

<script setup>
import { useQuasar } from "quasar";
import { ref, computed } from "vue";
import buses from "@/assets/json/buses.json";
import { customAlphabet } from "nanoid";
import { alphanumeric } from "nanoid-dictionary";
import { useSrepaStore } from "@/store/srepaStore";
import { useUserStore } from "@/store/userStore";
import { terminales } from "@/client";
import { sistema_componente } from "sistema_componente";

import { useDateFormat } from "@vueuse/core";
import { useRouter } from "vue-router";
//const removeAccents = (str) =>
//  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const { add } = useSrepaStore();
const { notify } = useQuasar();
const { name, uid } = useUserStore();
const submited = ref(false);
const router = useRouter();

const terminal = ref(null);
const ot_numero = ref(null);
const dominio = ref(null);
const validPpu = new Set(Object.keys(buses));

const fecha_resolucion_solicitada = ref(null);
const dominio_options = [
  {
    label: "CARROCERIA",
    value: "0",
  },
  {
    label: "CHASIS",
    value: "1",
  },
];
const sistema_componentev = ref(null);
const ot_solicitud_detalle = ref(null);

const siscom_options = computed(() => {
  if (!dominio.value) return null;
  return sistema_componente[dominio.value.value];
});

const km_ejecucion = ref(null);
const placa_patente = ref(null);
//No se puede seleccionar:
//Fechas previas a la actual
//Fechas que son sabado o domingo
//Se suma +1 dia si son pasado las 16:00
const optionsFn = (date) => {
  const datec = new Date();
  const add_day = new Date().getHours() >= 16 ? 1 : 0;
  datec.setDate(datec.getDate() + add_day);
  datec.setHours(0, 0, 0, 0); //Hora minuto segundo milsec
  const dated = new Date(date);
  if (dated.getDay() == 6 || dated.getDay() == 0) return false;
  if (dated < datec) return false;
  else return true;
};

const onSubmit = async () => {
  submited.value = true;
  const nanoid = customAlphabet(alphanumeric, 20);
  const [day, month, year] = fecha_resolucion_solicitada.value.split("/");
  const fecha_resolucion_solicitada_date = new Date(`${year}-${month}-${day} 18:00:00`);

  const payload = {
    uuid: nanoid(),
    unidad_servicio: buses[placa_patente.value.toUpperCase()][17],
    unidad_negocio: buses[placa_patente.value.toUpperCase()][18],
    placa_patente: placa_patente.value.toUpperCase(),
    sistema_componente: sistema_componentev.value.label,
    //causa_origen: removeAccents(result.CAUSA_ORIGEN).trim().toUpperCase(),
    km_ejecucion: parseInt(km_ejecucion.value),
    ot_numero: parseInt(ot_numero.value),
    ot_solicitud_fecha: useDateFormat(new Date(), "DD/MM/YYYY").value,
    ot_solicitud_hora: useDateFormat(new Date(), "HH:mm:ss").value,
    ot_solicitud_timestamp: Date.now() / 1000,
    ot_solicitud_name: name,
    ot_resolucion_solicitada_fecha: useDateFormat(fecha_resolucion_solicitada_date, "DD/MM/YYYY").value,
    ot_resolucion_solicitada_timestamp: fecha_resolucion_solicitada_date.getTime() / 1000,
    ot_taller_planta: terminal.value,
    ot_solicitud_detalle: ot_solicitud_detalle.value.toUpperCase(),
    tipo_solicitud: "REPARACION",
    ot_resolucion_concretada_fecha: null,
    ot_resolucion_concretada_timestamp: null,
    ot_resolucion_detalle: null,
    causa_origen: null,
    resultado: null,
    user_uid: uid,
    user_name: name,
    fecha_creacion_timestamp: Date.now() / 1000,
    fecha_creacion: useDateFormat(new Date(), "DD/MM/YYYY").value,
    estado: 0,
    dominio: dominio.value.value,
  };
  await add(payload);
  notify({
    color: "green-6",
    textColor: "white",
    icon: "cloud_done",
    message: "Solicitud Registrada",
    timeout: 1000,
  });
  setTimeout(
    () =>
      router.push({
        name: "soploc_listra",
      }),
    2500,
  );
};
</script>

<template>
  <div class="q-pa-md">
    <q-card bordered class="q-ma-md">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">General</div>
      </q-card-section>
      <q-form @submit="onSubmit">
        <q-card-section>
          <q-select
            v-model="tipo"
            label="TIPO INFORME"
            :options="['ESTADO GENERAL', 'HOJA DE VIDA', 'REVISION DOCUMENTAL', 'INSPECCION TECNICA', 'TIEMPO DE RESPUESTA']"
            dense
            :rules="[(val) => (val && val.length > 0) || 'Este campo es obligatorio.']"
            :readonly="submited"
          >
            <template v-slot:before>
              <q-icon name="tune" />
            </template>
          </q-select>
          <q-input
            v-model="fecha_creacion"
            mask="##/##/####"
            label="FECHA CREACION"
            fill-mask
            :rules="[(val) => (val && val.length > 0) || 'Este campo es obligatorio.', (val) => fecha_creacion_timestamp || 'Fecha invalida.']"
            dense
            input-class="text-uppercase"
            :readonly="submited"
          >
            <template v-slot:before>
              <q-icon name="person" />
            </template>
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="fecha_creacion" mask="DD/MM/YYYY">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <q-select
            v-model="mes"
            label="MES INFORME"
            :options="['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE']"
            dense
            :rules="[(val) => (val && val.length > 0) || 'Este campo es obligatorio.']"
            :readonly="submited"
          >
            <template v-slot:before>
              <q-icon name="tune" />
            </template>
          </q-select>
          <q-select
            v-model="ano"
            label="AÑO INFORME"
            :options="['2025', '2026']"
            dense
            :rules="[(val) => (val && val.length > 0) || 'Este campo es obligatorio.']"
            :readonly="submited"
          >
            <template v-slot:before>
              <q-icon name="tune" />
            </template>
          </q-select>

          <q-file
            v-model="file"
            label="Archivo"
            accept=".xlsx,.zip,.pdf"
            @rejected="onRejected"
            :rules="[(val) => val || 'Este campo es obligatorio.']"
          >
            <template v-slot:before>
              <q-icon name="attach_file" />
            </template>
          </q-file>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn label="Agregar" type="submit" color="primary" :loading="submited" />
        </q-card-actions>
      </q-form>
    </q-card>
  </div>
</template>

<script setup>
import { useQuasar } from "quasar";
import { ref, computed } from "vue";
import { useInfoStore } from "@/store/infoStore";
import { useUserStore } from "@/store/userStore";
import { customAlphabet } from "nanoid";
import { alphanumeric } from "nanoid-dictionary";
const nanoid = customAlphabet(alphanumeric, 20);
import { getStorage, ref as reff, uploadBytes } from "firebase/storage";
import { unidad_negocio } from "@/client";
import { useDateFormat } from "@vueuse/core";
import { useRouter } from "vue-router";

const tipo = ref(null);
const fecha_creacion = ref(null);
const mes = ref(null);
const ano = ref(null);
const { add } = useInfoStore();
const { notify } = useQuasar();
const { name, uid } = useUserStore();
const submited = ref(false);
const fecha_creacion_timestamp = computed(() => {
  const [day, month, year] = fecha_creacion.value.split("/");
  if (isNaN(day) || isNaN(month) || isNaN(year)) return false;
  const isoFormattedStr = `${year}-${month}-${day}`;
  const date = new Date(isoFormattedStr);
  const timestamp = date.getTime();
  if (typeof timestamp !== "number" || Number.isNaN(timestamp)) return false;
  else return timestamp;
});
const file = ref(null);
const router = useRouter();
const onSubmit = async () => {
  submited.value = true;
  const uuid = nanoid();
  const payload = {
    uuid: uuid,
    user_uid: uid,
    user_name: name,
    tipo: tipo.value,
    fecha_creacion: fecha_creacion.value,
    hora_creacion: useDateFormat(new Date(), "HH:mm:ss").value,
    fecha_creacion_timestamp: fecha_creacion_timestamp.value / 1000,
    mes: mes.value,
    ano: ano.value,
    unidad_negocio: unidad_negocio,
    unidad_servicio: unidad_negocio,
    filename: `${uuid}.${file.value.name.split(".").pop()}`,
    estado: 1,
  };
  add(payload);
  const storage = getStorage();
  await uploadBytes(reff(storage, `informes/${uuid}.${file.value.name.split(".").pop()}`), file.value);
  notify({
    color: "green-6",
    textColor: "white",
    icon: "cloud_done",
    message: "Informe almacenado",
    timeout: 1000,
  });
  setTimeout(
    () =>
      router.push({
        name: "info_list",
      }),
    2500,
  );
};
const onRejected = () => {
  notify({
    color: "red-6",
    textColor: "white",
    icon: "error",
    message: "Tipo de Archivo invalido.",
    timeout: 1000,
  });
};
</script>

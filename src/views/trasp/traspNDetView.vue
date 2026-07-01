<template>
  <q-form @submit="onSubmit()" @validation-error="onError" autocomplete="off">
    <q-card bordered class="q-ma-md">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">Atributos</div>
      </q-card-section>
      <q-card-section>
        <q-option-group :options="list" type="checkbox" v-model="group" @update:model-value="onUpdate()" :disable="view" />
      </q-card-section>
    </q-card>

    <q-card v-if="crit_show.length > 0" bordered class="q-ma-md">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">Criterios</div>
      </q-card-section>
      <q-card-section>
        <q-select
          v-for="[key, options] in crit_show"
          :name="key"
          :key="key"
          v-model="groupc[key]"
          @update:model-value="onUpdate()"
          options-selected-class="bg-indigo-6 text-white"
          :label="`${key} - Criterios`"
          :options="options"
          dense
          :rules="[(val) => (val && val.length > 0) || 'Este campo es obligatorio.']"
          :readonly="view"
          multiple
          emit-value
        >
          <template v-slot:before>
            <q-icon name="tune" />
          </template>
        </q-select>
      </q-card-section>
    </q-card>

    <q-card v-if="value.length > 0" bordered class="q-ma-md">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">Valores</div>
      </q-card-section>
      <q-card-section>
        <q-input
          v-for="option in value"
          :name="option.value"
          :key="option.value"
          v-model="groupv[option.value]"
          @update:model-value="onUpdate()"
          :label="option.label"
          :rules="[(val) => (val && val.length > 0) || 'Este campo es obligatorio.']"
          dense
          type="number"
          step="any"
          :readonly="view"
        >
          <template v-slot:before>
            <q-icon name="numbers" />
          </template>
        </q-input>
      </q-card-section>
    </q-card>
    <q-card bordered class="q-ma-md">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">Registro Fotografico</div>
      </q-card-section>
      <q-card-section>
        <div class="q-gutter-md">
          <q-file
            v-model="files"
            @click="files = null"
            label="Seleccionar fotos"
            counter
            multiple
            clearable
            accept=".jpg, image/*"
            :readonly="isUploading"
          >
            <template v-slot:before>
              <q-icon name="photo_camera" />
            </template>
            <template v-slot:after v-if="canUpload">
              <q-btn color="primary" dense icon="cloud_upload" round @click="onUpload" :disable="!canUpload" :loading="isUploading" />
            </template>
          </q-file>
        </div>
      </q-card-section>
      <q-card-section>
        <q-scroll-area v-if="filenames.length > 0" style="height: 135px" visible>
          <div class="row justify-center q-gutter-sm">
            <q-img
              v-for="(filename, index) in filenames"
              :key="filename"
              :src="preurl + 'thumb_' + remExt(filename.name) + '.webp'"
              basic
              spinner-color="primary"
              style="max-height: 200px; max-width: 200px"
              class="rounded-borders shadow-5"
            >
              <div class="absolute-top-right cursor-pointer">
                {{ (filename.atrib || "XXX").toUpperCase() }}
                <q-popup-edit
                  v-model="filename.atrib"
                  @update:model-value="dataImage()"
                  auto-save
                  :validate="(val) => validateCode(val)"
                  v-slot="scope"
                  :disable="view"
                >
                  <q-input
                    v-model="scope.value"
                    dense
                    input-class="text-uppercase"
                    autofocus
                    @keyup.enter="scope.set"
                    hint="Codigo Criterio"
                    :rules="[(val) => scope.validate(val) || 'Codigo Invalido']"
                  >
                    <template v-slot:append>
                      <q-icon name="edit" />
                    </template>
                  </q-input>
                </q-popup-edit>
              </div>

              <div class="absolute-top-left cursor-pointer" style="height: 53px; width: 58px; overflow: hidden">
                {{ (filename.desc || "***").toUpperCase() }}
                <q-popup-edit v-model="filename.desc" @update:model-value="dataImage()" auto-save v-slot="scope">
                  <q-input
                    type="textarea"
                    @keyup.enter.stop
                    v-model="scope.value"
                    dense
                    input-class="text-uppercase"
                    autofocus
                    hint="Descripción Foto"
                  >
                  </q-input>
                </q-popup-edit>
              </div>

              <div class="absolute-bottom row">
                <q-btn v-if="!view" color="white" icon="delete" flat dense @click="deleteImage(index)" />
                <q-space />
                <q-btn color="white" icon="fullscreen" flat dense @click="largeImage(filename)" />
              </div>
            </q-img>
          </div>
        </q-scroll-area>
      </q-card-section>
    </q-card>
    <q-card bordered class="q-ma-md">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">Resultado</div>
      </q-card-section>
      <q-card-section>
        <q-input
          v-model="obs_inspeccion"
          label="OBSERVACIONES"
          dense
          input-class="text-uppercase"
          :readonly="view"
          debounce="2000"
          @update:model-value="onUpdate()"
          autogrow
        >
          <template v-slot:before>
            <q-icon name="person" />
          </template>
        </q-input>
      </q-card-section>
      <q-card-section>
        <q-markup-table>
          <thead>
            <tr>
              <th></th>
              <th>BAJA</th>
              <th>MEDIA</th>
              <th>ALTA</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="text-left">CUMPLE</td>
              <td class="text-center">{{ curr_lows }}</td>
              <td class="text-center">{{ curr_mediums }}</td>
              <td class="text-center">{{ curr_highs }}</td>
            </tr>
            <tr>
              <td class="text-left">NO CUMPLE</td>
              <td class="text-center">
                {{ options_low.size - curr_lows }}
              </td>
              <td class="text-center">
                {{ options_medium.size - curr_mediums }}
              </td>
              <td class="text-center">
                {{ options_high.size - curr_highs }}
              </td>
            </tr>
            <tr>
              <td class="text-left">TOTAL</td>
              <td class="text-center">{{ options_low.size }}</td>
              <td class="text-center">{{ options_medium.size }}</td>
              <td class="text-center">{{ options_high.size }}</td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn label="Guardar" @click="onGuardar()" color="secondary" :disable="view" />
        <q-btn label="Finalizar" type="submit" color="primary" :loading="submited" :disable="view" />
      </q-card-actions>
    </q-card>
  </q-form>
  <q-dialog v-model="dialog" transition-show="scale" transition-hide="scale" persistent>
    <q-card bordered class="q-ma-md">
      <q-card-section>
        <div class="text-h6">Confirmación</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        La inspección sera finalizada con estado "{{ estado_desc }}". <br />Por favor confirmar estado.
      </q-card-section>
      <q-card-actions align="right">
        <q-btn label="Cancelar" color="secondary" v-close-popup />
        <q-btn
          label="Confirmar"
          color="primary"
          :loading="progress"
          @click="
            progress = true;
            onConfirm();
          "
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { openURL, useQuasar } from "quasar";
import traspaso from "@/assets/json/traspaso.json";
import { useTraspStore } from "@/store/traspStore";
import { storeToRefs } from "pinia";
import { ref, computed, shallowRef, watch } from "vue";
import { getStorage, ref as refStorage, uploadBytes } from "firebase/storage";
import { customAlphabet } from "nanoid";
import { alphanumeric } from "nanoid-dictionary";
import { useRouter, useRoute } from "vue-router";
import { invoke } from "@vueuse/core";

const { notify } = useQuasar();
const { update, getbyid } = useTraspStore();

const { regd_change } = storeToRefs(useTraspStore());
const files = ref(null);
const isUploading = ref(false);
const group = ref([]);
const groupv = ref({});
const groupc = ref({});

const filenames = ref([]);
const filenames_ori = ref(new Set());

const preurl = "https://storage.googleapis.com/slared.appspot.com/traspaso/";
const curr_lows = ref(0);
const curr_mediums = ref(0);
const curr_highs = ref(0);
const obs_inspeccion = ref(null);

const submited = ref(false);
const progress = ref(false);
const estado_desc = ref(null);

const view = ref(false);
const version = ref(null);
const list = shallowRef([]);
const value = shallowRef([]);
const crit = shallowRef([]);

const no_atributos = ref([]);
const options_low = computed(() => {
  if (!version.value) return new Set([]);
  else return new Set(traspaso[version.value].options_low.filter((i) => !no_atributos.value.includes(i)));
});
const options_medium = computed(() => {
  if (!version.value) return new Set([]);
  else return new Set(traspaso[version.value].options_medium.filter((i) => !no_atributos.value.includes(i)));
});
const options_high = computed(() => {
  if (!version.value) return new Set([]);
  else return new Set(traspaso[version.value].options_high.filter((i) => !no_atributos.value.includes(i)));
});

const crit_show = computed(() => crit.value.filter(([key]) => !group.value.includes(key)));

const validateCode = (val) => {
  const options_all = [...Array.from(options_low.value), ...Array.from(options_medium.value), ...Array.from(options_high.value)];
  //obtenemos llaves y valores presentes en crit
  const crit_keys = crit.value.map(([key]) => key);
  const crit_values = crit.value.flatMap(([, value]) => value.map((i) => i.value));
  //filtramos de options_all las llaves presentes en crit
  const filtered_options = options_all.filter((opt) => !crit_keys.includes(opt));
  //agregamos a filtered_options los valores presentes en crit
  filtered_options.push(...crit_values);
  //permitimos null
  if (!val || val.length === 0) return true;
  return filtered_options.includes(val.replaceAll(".", "-").toUpperCase());
};

//let charged = false;
//let file_charged = 0;
const certifica = ref(null);
const canUpload = computed(() => files.value !== null);
const dialog = ref(false);
const router = useRouter();
const route = useRoute();
const remExt = (fname) => fname.substring(0, fname.lastIndexOf("."));

const onUpdate = () => {
  //Verificamos relaciones
  const relaciones = traspaso[version.value].related;
  for (const [clave, relacion] of relaciones) {
  //filtramos relaciones que no esten en no_atributos
    const relacion_filtrada = relacion.filter((i) => !no_atributos.value.includes(i));
    if (group.value.includes(clave) && !relacion_filtrada.every((valor) => group.value.includes(valor))) {
      group.value.splice(group.value.indexOf(clave), 1); //Eliminamos valor general seleccionado
      notify({
        color: "negative",
        icon: "error",
        message: "No se cumplen requisitos para Aprobar " + clave.replace("-", ".") + ": [" + relacion_filtrada.join(", ") + "]",
      });
    }
  }
  //Borramos crits que tienen atributo seleccionado.
  for (const key of group.value) {
    groupc.value[key] = [];
  }

  //Establecemos cumplimiento
  let lows = 0;
  let mediums = 0;
  let highs = 0;
  for (const option of group.value) {
    if (options_low.value.has(option)) lows++;
    if (options_medium.value.has(option)) mediums++;
    if (options_high.value.has(option)) highs++;
  }
  curr_lows.value = lows;
  curr_mediums.value = mediums;
  curr_highs.value = highs;
  const options_all = [...Array.from(options_low.value), ...Array.from(options_medium.value), ...Array.from(options_high.value)];
  const defectos = options_all.filter((value) => !group.value.includes(value));
  const payload = {
    uuid: route.params.uuid,
    group: group.value,
    groupv: groupv.value,
    groupc: groupc.value,
    obs_inspeccion: obs_inspeccion.value?.toUpperCase() || null,
    defectos: defectos,
    total_lows: options_low.value.size,
    total_mediums: options_medium.value.size,
    total_highs: options_high.value.size,
    curr_lows: curr_lows.value,
    curr_mediums: curr_mediums.value,
    curr_highs: curr_highs.value,
  };
  update(payload);
};
const onSubmit = () => {
  if (filenames.value.length < 2) {
    notify({
      color: "red-6",
      textColor: "white",
      icon: "cloud_done",
      message: `Minimo 2 fotos a registrar`,
      timeout: 1000,
    });
    return;
  }
  //Verificamos que no hayan fotos asociadas a criterios sin incumplimiento
  const options_all = [...Array.from(options_low.value), ...Array.from(options_medium.value), ...Array.from(options_high.value)];
  //obtenemos llaves y valores presentes en crit
  const defectos_keys = Object.entries(groupc.value)
    .map(([k, v]) => (v.length > 0 ? k : null))
    .filter((i) => i !== null);
  const defectos = options_all.filter((value) => !group.value.includes(value) && !defectos_keys.includes(value));
  //adicionamos a defectos los criterios seleccionados en groupc
  Object.values(groupc.value).map((v) => defectos.push(...v)); //Creamos un array con los valores en el objeto (que son arrays)
  for (const filename of filenames.value) {
    if (filename.atrib && !defectos.includes(filename.atrib.replaceAll(".", "-").toUpperCase())) {
      notify({
        color: "red-6",
        textColor: "white",
        icon: "cloud_done",
        message: `Foto asignada a criterio sin incumplimiento: ${filename.atrib.replaceAll(".", "-").toUpperCase()}`,
        timeout: 1000,
      });
      return;
    }
  }

  if (options_high.value.size - curr_highs.value > 0) {
    certifica.value = false;
  } else if (options_medium.value.size - curr_mediums.value > 0) certifica.value = null;
  else {
    certifica.value = true;
  }
  estado_desc.value = certifica.value === true ? "Cumple" : certifica.value === false ? "No Cumple" : "Condicional";

  //Mostramos dialog
  dialog.value = true;
};
const onConfirm = () => {
  //Identificamos incumplimientos.
  const options_all = [...Array.from(options_low.value), ...Array.from(options_medium.value), ...Array.from(options_high.value)];
  const defectos = options_all.filter((value) => !group.value.includes(value));
  const resultado = [];
  resultado.push({
    certifica: certifica.value,
    total_lows: options_low.value.size,
    total_mediums: options_medium.value.size,
    total_highs: options_high.value.size,
    curr_lows: curr_lows.value,
    curr_mediums: curr_mediums.value,
    curr_highs: curr_highs.value,
    fecha: new Date().toLocaleDateString("en-GB", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    }),
    hora: new Date().toLocaleTimeString([], { hour12: false }),
    fecha_timestamp: Date.now() / 1000,
    defectos: defectos,
  });

  const payload = {
    uuid: route.params.uuid,
    estado: 1,
    resultado: resultado,
    fecha_termino: new Date().toLocaleDateString("en-GB", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    }),
    hora_termino: new Date().toLocaleTimeString([], { hour12: false }),
    fecha_termino_timestamp: Date.now() / 1000,
  };
  update(payload);
  notify({
    color: "green-6",
    textColor: "white",
    icon: "cloud_done",
    message: "Inspección registrada",
    timeout: 1000,
  });
  setTimeout(
    () =>
      router.push({
        name: "traspn_list",
      }),
    2500
  );
};
const largeImage = (filename) => {
  if (filename.name) openURL(preurl + filename.name);
  else openURL(preurl + filename);
};
const deleteImage = (index) => {
  filenames.value.splice(index, 1);
  const payload = {
    uuid: route.params.uuid,
    filenames: filenames.value,
  };
  update(payload);
};
const dataImage = () => {
  const payload = {
    uuid: route.params.uuid,
    filenames: filenames.value,
  };
  update(payload);
};
const onUpload = () => {
  isUploading.value = true;
  const filePromises = [];
  const storage = getStorage();
  for (const file of files.value) {
    //Solo se sube una vez el archivo. Se filtra por el nombre
    //if (filenames_ori.has(file.name)) continue;
    const nanoid = customAlphabet(alphanumeric, 20);
    const file_name_ori = file.name;
    const file_name = `${nanoid()}.${file.name.split(".").pop()}`;
    const storageRef = refStorage(storage, `traspaso/${file_name}`);
    const uploadTask = uploadBytes(storageRef, file, {
      customMetadata: {
        uuid: route.params.uuid,
        filename: file_name_ori,
        collection: "traspaso",
      },
    });
    filePromises.push(uploadTask);
  }
  Promise.all(filePromises)
    .then(() => {
      //file_charged = filePromises.length;
      notify({
        color: "green-6",
        textColor: "white",
        icon: "cloud_done",
        message: "Fotos Subidas",
        timeout: 1000,
      });
      isUploading.value = false;
      files.value = null;
    })
    .catch((error) => {
      notify({
        color: "red-6",
        textColor: "white",
        icon: "cloud_done",
        message: `Error al subir: ${error.code}`,
        timeout: 1000,
      });
      isUploading.value = false;
    });
};
const onGuardar = () => {
  notify({
    color: "green-6",
    textColor: "white",
    icon: "cloud_done",
    message: "Inspección guardada",
    timeout: 1000,
  });
  setTimeout(
    () =>
      router.push({
        name: "traspn_list",
      }),
    2500
  );
};
//Llamada que se gatilla al ingresar o refrescar pagina, una vez se hayan cargado los datos.
invoke(async () => {
  const registro = await getbyid(route.params.uuid);
  if (registro) {
    version.value = registro["version"];
    no_atributos.value = registro["no_atributos"];
    list.value = traspaso[version.value].list.filter((i) => !no_atributos.value.includes(i.value));
    value.value = traspaso[version.value].value.filter((i) => !no_atributos.value.includes(i.value));
    //crit.value = Object.fromEntries(Object.entries(traspaso[version.value].crit).filter(([key]) => !no_atributos.value.includes(key)));
    crit.value = Object.entries(traspaso[version.value].crit).filter(([key]) => !no_atributos.value.includes(key));
    group.value = registro["group"];
    groupv.value = registro["groupv"];
    groupc.value = registro["groupc"] || {};
    obs_inspeccion.value = registro["obs_inspeccion"];

    //Establecemos cumplimiento
    let lows = 0;
    let mediums = 0;
    let highs = 0;
    for (const option of registro["group"]) {
      if (options_low.value.has(option)) lows++;
      if (options_medium.value.has(option)) mediums++;
      if (options_high.value.has(option)) highs++;
    }
    curr_lows.value = lows;
    curr_mediums.value = mediums;
    curr_highs.value = highs;

    filenames.value = registro["filenames"];
    filenames_ori.value = new Set(registro["filenames_ori"]);

    if (route.params.view === "true") {
      view.value = true;
      notify({
        color: "red-6",
        textColor: "white",
        icon: "warning",
        message: `Acceso en modo de solo lectura`,
        timeout: 5000,
      });
    }
  }
});
watch(
  () => regd_change.value,
  async () => {
    const registro = await getbyid(route.params.uuid);
    if (registro && registro["filenames"].length !== filenames.value.length) filenames.value = registro["filenames"];
  }
);
const onError = (el) => {
  el.$el.scrollIntoView({
    behavior: "smooth",
    block: "center",
    inline: "nearest",
  });
};
</script>
<style scoped lang="scss">
@use "@/styles/_criteria" as *;
</style>

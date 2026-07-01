<template>
  <q-form @submit="onSubmit">
    <q-card bordered class="q-ma-md">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">Criterios</div>
      </q-card-section>
      <q-card-section>
        <q-option-group :options="options_list" type="checkbox" v-model="group" @update:model-value="onUpdate()" :disable="submited || view" />
      </q-card-section>
    </q-card>
    <q-card bordered class="q-ma-md">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">Repuestos</div>
      </q-card-section>
      <q-card-section>
        <q-btn round color="dark" icon="add" class="q-mb-sm" @click="material_dialog = true" :disable="view" />
        <q-markup-table>
          <thead>
            <tr>
              <th class="text-center">CODIGO</th>
              <th class="text-center">DESCRIPCIÓN</th>
              <th class="text-center">CANTIDAD</th>
              <th class="text-center">MEDIDA</th>
              <th class="text-center">ACCIÓN</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(material, index) in materiales" :key="index">
              <td class="text-center">{{ material.codigo }}</td>
              <td class="text-center">{{ material.descripcion }}</td>
              <td class="text-center">{{ material.cantidad }}</td>
              <td class="text-center">{{ material.medida }}</td>
              <td class="text-center">
                <q-btn flat rounded color="purple" icon="delete" @click="material_remove(index)" :disable="view" />
              </td>
            </tr>
          </tbody>
        </q-markup-table>
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
            <template v-slot:prepend>
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
              :src="filenames_new ? preurl + 'thumb_' + remExt(filename.name) + '.webp' : preurl + 'thumb_' + filename"
              basic
              spinner-color="primary"
              style="max-height: 200px; max-width: 200px"
              class="rounded-borders shadow-5"
            >
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
          :readonly="submited || view"
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
              <td class="text-center">{{ total_lows - curr_lows }}</td>
              <td class="text-center">
                {{ total_mediums - curr_mediums }}
              </td>
              <td class="text-center">
                {{ total_highs - curr_highs }}
              </td>
            </tr>
            <tr>
              <td class="text-left">TOTAL</td>
              <td class="text-center">{{ total_lows }}</td>
              <td class="text-center">{{ total_mediums }}</td>
              <td class="text-center">{{ total_highs }}</td>
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
  <q-dialog v-model="material_dialog">
    <q-card style="min-width: 350px; max-width: 90vw">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">Material</div>
      </q-card-section>
      <q-form @submit="onSubmit_material">
        <q-card-section>
          <q-input
            v-model="material_codigo"
            label="CODIGO"
            :rules="[(val) => (val && val.length > 0) || 'Este campo es obligatorio.']"
            dense
            input-class="text-uppercase"
          >
            <template v-slot:before>
              <q-icon name="tag" />
            </template>
          </q-input>
          <q-input
            v-model="material_descripcion"
            label="DESCRIPCIÓN"
            :rules="[(val) => (val && val.length > 0) || 'Este campo es obligatorio.']"
            dense
            input-class="text-uppercase"
          >
            <template v-slot:before>
              <q-icon name="view_headline" />
            </template>
          </q-input>
          <q-input
            v-model="material_cantidad"
            label="CANTIDAD"
            :rules="[(val) => (val && val.length > 0) || 'Este campo es obligatorio.']"
            dense
            mask="#"
            reverse-fill-mask
          >
            <template v-slot:before>
              <q-icon name="numbers" />
            </template>
          </q-input>
          <q-select
            v-model="material_medida"
            label="MEDIDA"
            :options="['UNIDAD', 'KILO', 'LITRO']"
            dense
            :rules="[(val) => (val && val.length > 0) || 'Este campo es obligatorio.']"
            :readonly="submited"
          >
            <template v-slot:before>
              <q-icon name="tune" />
            </template>
          </q-select>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn label="Agregar" type="submit" color="primary" :loading="submited" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
  <q-dialog v-model="confirm_dialog" transition-show="scale" transition-hide="scale" persistent>
    <q-card bordered class="q-ma-md">
      <q-card-section>
        <div class="text-h6">Confirmación</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        La inspección sera finalizada con estado "{{ estado_desc }}". <br />Por favor confirmar finalización.
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
import inspeccion_tecnica from "@/assets/json/inspeccion_tecnica.json";
import { useInspecStore } from "@/store/inspecStore";
import { storeToRefs } from "pinia";
import { ref, computed, shallowRef, watch } from "vue";
import { getStorage, ref as refStorage, uploadBytes } from "firebase/storage";
import { customAlphabet } from "nanoid";
import { alphanumeric } from "nanoid-dictionary";
import { useRouter, useRoute } from "vue-router";
import { invoke } from "@vueuse/core";

const { notify } = useQuasar();
const { update, getbyid } = useInspecStore();
const { m_inspeccion_tecnicad_change } = storeToRefs(useInspecStore());
const options_low = new Set(inspeccion_tecnica.options_low);
const options_medium = new Set(inspeccion_tecnica.options_medium);
const options_high = new Set(inspeccion_tecnica.options_high);
//const init = true;
const files = ref(null);
const isUploading = ref(false);
const group = ref([]);
const filenames = ref([]);
const filenames_ori = ref(new Set());
let filenames_new = false;

const preurl = "https://storage.googleapis.com/slared.appspot.com/inspeccion_tecnica/";
const curr_lows = ref(0);
const curr_mediums = ref(0);
const curr_highs = ref(0);
const total_lows = ref(0);
const total_mediums = ref(0);
const total_highs = ref(0);
const obs_inspeccion = ref(null);
const submited = ref(false);
const progress = ref(false);
const curr_estado = ref(0);
const curr_resultado = ref([]);
const estado = ref(1);
const estado_desc = ref(null);

const fecha_reins = ref(null);

const hora_reins = ref(null);
const fecha_reins_timestamp = ref(null);

const view = ref(false);
const options_list = shallowRef([]);
const options_all = ref([]);
const material_codigo = ref(null);
const material_descripcion = ref(null);
const material_cantidad = ref(null);
const material_medida = ref(null);
const material_dialog = ref(false);
const materiales = ref([]);

//const charged = false;
//const file_charged = 0;
const certifica = ref(null);
const canUpload = computed(() => files.value !== null);
const confirm_dialog = ref(false);
const router = useRouter();
const route = useRoute();
const remExt = (fname) => fname.substring(0, fname.lastIndexOf("."));

const onUpdate = () => {
  //Establecemos cumplimiento
  let lows = 0;
  let mediums = 0;
  let highs = 0;
  for (const option of group.value) {
    if (options_low.has(option)) lows++;
    if (options_medium.has(option)) mediums++;
    if (options_high.has(option)) highs++;
  }
  curr_lows.value = lows;
  curr_mediums.value = mediums;
  curr_highs.value = highs;
  const defectos = options_all.value.filter((value) => !group.value.includes(value));
  const payload = {
    uuid: route.params.uuid,
    group: group.value,
    obs_inspeccion: obs_inspeccion.value,
    defectos: defectos,
    total_lows: total_lows.value,
    total_mediums: total_mediums.value,
    total_highs: total_highs.value,
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
      message: `Minimo 2 fotos para Finalizar`,
      timeout: 1000,
    });
    return;
  }

  //submited.value = true;

  //Establecemos cumplimiento
  let lows = 0;
  let mediums = 0;
  let highs = 0;
  estado.value = 1;
  certifica.value = null;
  for (const option of group.value) {
    if (options_low.has(option)) lows++;
    if (options_medium.has(option)) mediums++;
    if (options_high.has(option)) highs++;
  }
  curr_lows.value = lows;
  curr_mediums.value = mediums;
  curr_highs.value = highs;

  //Resultado: Alta>0 =>No certifica. Otros => Pendiente
  const defectos_highs = total_highs.value - curr_highs.value;
  const defectos_mediums = total_mediums.value - curr_mediums.value;
  const defectos_lows = total_lows.value - curr_lows.value;
  const defectos_total = defectos_highs + defectos_mediums + defectos_lows;

  /*
  console.log("Total ALTA: " + total_highs.value);
  console.log("Total MEDIA: " + total_mediums.value);
  console.log("Total BAJA: " + total_lows.value);

  console.log("Defectos ALTA: " + defectos_highs);
  console.log("Defectos MEDIA: " + defectos_mediums);
  console.log("Defectos BAJA: " + defectos_lows);
*/

  if (
    defectos_highs > 0 || // Al menos 1 defecto ALTA
    (curr_estado.value === 2 && (defectos_mediums > 0 || defectos_lows > 0)) || // Reinspección con cualquier defecto medio o bajo
    defectos_mediums >= 3 || // 3 o más defectos MEDIA
    defectos_lows >= 5 || // 5 o más defectos BAJA
    defectos_total > 5 // Más de 5 defectos en total
  ) {
    certifica.value = false;
  } else if (defectos_mediums > 0 && curr_estado.value === 0) {
    estado.value = 2;
    fecha_reins.value = new Date(Date.now() + 3600 * 1000 * 24 * 3).toLocaleDateString("en-GB", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
    hora_reins.value = new Date(Date.now() + 3600 * 1000 * 24 * 3).toLocaleTimeString("en-GB", { hour12: false });
    fecha_reins_timestamp.value = (Date.now() + 3600 * 1000 * 24 * 3) / 1000;
  } else if (defectos_lows > 0 && curr_estado.value === 0) {
    estado.value = 2;
    fecha_reins.value = new Date(Date.now() + 3600 * 1000 * 24 * 5).toLocaleDateString("en-GB", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
    hora_reins.value = new Date(Date.now() + 3600 * 1000 * 24 * 5).toLocaleTimeString("en-GB", { hour12: false });
    fecha_reins_timestamp.value = (Date.now() + 3600 * 1000 * 24 * 5) / 1000;
  } else certifica.value = true;

  estado_desc.value =
    estado.value === 1 && certifica.value === true ? "Aprobado" : estado.value === 1 && certifica.value === false ? "No Aprobado" : "Reinspección";

  //Mostramos dialog
  confirm_dialog.value = true;
};
const onConfirm = () => {
  //Identificamos incumplimientos.
  const defectos = options_all.value.filter((value) => !group.value.includes(value));
  const resultado = curr_resultado.value;
  resultado.push({
    certifica: certifica.value,
    total_lows: total_lows.value,
    total_mediums: total_mediums.value,
    total_highs: total_highs.value,
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
    group: group.value,
    estado: estado.value,
    obs_inspeccion: obs_inspeccion.value,
    fecha_reins: fecha_reins.value,
    hora_reins: hora_reins.value,
    fecha_reins_timestamp: fecha_reins_timestamp.value,

    resultado: resultado,
    fecha_termino:
      estado.value === 1
        ? new Date().toLocaleDateString("en-GB", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
          })
        : "",
    hora_termino: estado.value === 1 ? new Date().toLocaleTimeString([], { hour12: false }) : "",
    fecha_termino_timestamp: estado.value === 1 ? Date.now() / 1000 : "",
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
        name: "inspec_list",
      }),
    2500,
  );
};
const onSubmit_material = () => {
  materiales.value.push({
    codigo: material_codigo.value.toUpperCase(),
    descripcion: material_descripcion.value.toUpperCase(),
    cantidad: material_cantidad.value,
    medida: material_medida.value,
  });
  const payload = {
    uuid: route.params.uuid,
    materiales: materiales.value,
  };
  update(payload);
  notify({
    color: "green-6",
    textColor: "white",
    icon: "cloud_done",
    message: "Material registrado",
    timeout: 1000,
  });
  //Reseteamos variables
  material_codigo.value = null;
  material_descripcion.value = null;
  material_cantidad.value = null;
  material_medida.value = null;
  material_dialog.value = false;
};
const material_remove = (index) => {
  materiales.value.splice(index, 1);
  const payload = {
    uuid: route.params.uuid,
    materiales: materiales.value,
  };
  update(payload);
  notify({
    color: "green-6",
    textColor: "white",
    icon: "cloud_done",
    message: "Material eliminado",
    timeout: 1000,
  });
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
    const storageRef = refStorage(storage, `inspeccion_tecnica/${file_name}`);
    const uploadTask = uploadBytes(storageRef, file, {
      customMetadata: {
        uuid: route.params.uuid,
        filename: file_name_ori,
        collection: "inspeccion_tecnica",
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
    })
    .catch((error) => {
      notify({
        color: "red-6",
        textColor: "white",
        icon: "cloud_off",
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
        name: "inspec_list",
      }),
    2500,
  );
};

//Llamada que se gatilla al ingresar o refrescar pagina, una vez se hayan cargado los datos.
invoke(async () => {
  const inspec = await getbyid(route.params.uuid);
  if (inspec) {
    group.value = inspec["group"];
    obs_inspeccion.value = inspec["obs_inspeccion"];
    curr_estado.value = inspec["estado"];
    curr_resultado.value = inspec["resultado"];
    fecha_reins.value = inspec["fecha_reins"];
    hora_reins.value = inspec["hora_reins"] || null;
    fecha_reins_timestamp.value = inspec["fecha_reins_timestamp"] || null;

    materiales.value = inspec["materiales"];

    //Cargamos options
    options_list.value = inspeccion_tecnica[inspec["sistema_componente"]];

    //Establecemos cumplimiento
    let lows = 0;
    let mediums = 0;
    let highs = 0;
    for (const option of inspec["group"]) {
      if (options_low.has(option)) lows++;
      if (options_medium.has(option)) mediums++;
      if (options_high.has(option)) highs++;
    }
    curr_lows.value = lows;
    curr_mediums.value = mediums;
    curr_highs.value = highs;

    //establecemo cantidades totales
    let total_lowsc = 0;
    let total_mediumsc = 0;
    let total_highsc = 0;
    const options_allc = [];
    for (const option of inspeccion_tecnica[inspec["sistema_componente"]]) {
      options_allc.push(option.value);
      if (options_low.has(option.value)) total_lowsc++;
      if (options_medium.has(option.value)) total_mediumsc++;
      if (options_high.has(option.value)) total_highsc++;
    }
    total_lows.value = total_lowsc;
    total_mediums.value = total_mediumsc;
    total_highs.value = total_highsc;
    options_all.value = options_allc;

    //charged = true;
    //file_charged = file_charged - 1;
    // 7 de Agosto 00:00:00 GMT-4
    if (inspec["fecha_inicio_timestamp"] > 1691380800) filenames_new = true;
    filenames.value = inspec["filenames"];
    filenames_ori.value = new Set(inspec["filenames_ori"]);

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
  () => m_inspeccion_tecnicad_change.value,
  async () => {
    const inspec = await getbyid(route.params.uuid);
    if (inspec && inspec["filenames"].length !== filenames.value.length) filenames.value = inspec["filenames"];
  },
);
</script>
<style scoped>
.q-option-group :deep(.q-checkbox__bg) {
  top: 0%;
}
.q-option-group :deep(.q-checkbox) {
  align-items: unset;
}
.q-option-group :deep(.q-checkbox.disabled) {
  opacity: unset !important;
}
</style>

<template>
  <q-form @submit="onSubmit" @validation-error="onError" autocomplete="off">
    <q-card bordered class="q-ma-md">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">General</div>
      </q-card-section>
      <q-card-section>
        <q-input
          :model-value="placa_patente"
          label="PLACA PATENTE"
          dense
          disable
        >
          <template v-slot:before>
            <q-icon name="directions_bus" />
          </template>
        </q-input>
        <q-input
          :model-value="version === 'G' ? 'DIESEL' : 'ELECTRICO'"
          label="TIPO"
          dense
          disable
        >
          <template v-slot:before>
            <q-icon name="tag" />
          </template>
        </q-input>
      </q-card-section>
    </q-card>

    <q-card v-if="options_c0.length > 0" bordered class="q-ma-md">
      <q-card-section
        class="bg-primary text-white"
        :class="{ 'bg-negative': c0_pend }"
      >
        <div class="text-h6">Desconexion</div>
      </q-card-section>
      <q-card-section>
        <q-checkbox
          v-for="option in options_c0"
          :name="option.value"
          :key="option.value"
          v-model="group_c0[option.value]"
          @update:model-value="onUpdate('0')"
          :val="option.value"
          :label="option.label"
          :disable="view"
          class="fit"
        />
      </q-card-section>
    </q-card>
    <q-card
      v-if="crits_l0_show.length > 0 || crits_i0.length > 0"
      bordered
      class="q-ma-md"
    >
      <q-card-section
        class="bg-primary text-white"
        :class="{ 'bg-negative': l0_pend }"
      >
        <div class="text-h6">Desconexion - Criterios</div>
      </q-card-section>
      <q-card-section>
        <q-input
          v-for="option in crits_i0"
          :name="option"
          :key="option"
          v-model="crit_l0[option]"
          @update:model-value="onUpdate('0')"
          :label="traspaso_map.get(option + '_LABEL')"
          :rules="[
            (val) => (val && val.length > 0) || 'Este campo es obligatorio.',
          ]"
          dense
          mask="#"
          reverse-fill-mask
          :readonly="view"
        >
          <template v-slot:before>
            <q-icon name="numbers" />
          </template>
        </q-input>

        <q-select
          v-for="option in crits_l0_show"
          :name="option"
          :key="option"
          v-model="crit_l0[option]"
          @update:model-value="onUpdate('0')"
          options-selected-class="bg-indigo-6 text-white"
          :label="traspaso_map.get(option + '_LABEL')"
          :options="traspaso_map.get(option)"
          dense
          :rules="[
            (val) => (val && val.length > 0) || 'Este campo es obligatorio.',
          ]"
          :readonly="view"
          :multiple="crit_simple(option)"
          emit-value
        >
          <template v-slot:before>
            <q-icon name="tune" />
          </template>
        </q-select>
      </q-card-section>
    </q-card>
    <q-card v-if="options_c1.length > 0" bordered class="q-ma-md">
      <q-card-section
        class="bg-primary text-white"
        :class="{ 'bg-negative': c1_pend }"
      >
        <div class="text-h6">Loza</div>
      </q-card-section>
      <q-card-section>
        <q-checkbox
          v-for="option in options_c1"
          :name="option.value"
          :key="option.value"
          v-model="group_c1[option.value]"
          @update:model-value="onUpdate('1')"
          :val="option.value"
          :label="option.label"
          :disable="view"
          class="fit"
        />
      </q-card-section>
    </q-card>
    <q-card
      v-if="crits_l1_show.length > 0 || crits_i1.length > 0"
      bordered
      class="q-ma-md"
    >
      <q-card-section
        class="bg-primary text-white"
        :class="{ 'bg-negative': l1_pend }"
      >
        <div class="text-h6">Loza - Criterios</div>
      </q-card-section>
      <q-card-section>
        <q-input
          v-for="option in crits_i1"
          :name="option"
          :key="option"
          v-model="crit_l1[option]"
          @update:model-value="onUpdate('1')"
          :label="traspaso_map.get(option + '_LABEL')"
          :rules="[
            (val) => (val && val.length > 0) || 'Este campo es obligatorio.',
          ]"
          dense
          mask="#"
          reverse-fill-mask
          :readonly="view"
        >
          <template v-slot:before>
            <q-icon name="numbers" />
          </template>
        </q-input>

        <q-select
          v-for="option in crits_l1_show"
          :name="option"
          :key="option"
          v-model="crit_l1[option]"
          @update:model-value="onUpdate('1')"
          options-selected-class="bg-indigo-6 text-white"
          :label="traspaso_map.get(option + '_LABEL')"
          :options="traspaso_map.get(option)"
          dense
          :rules="[
            (val) => (val && val.length > 0) || 'Este campo es obligatorio.',
          ]"
          :readonly="view"
          :multiple="crit_simple(option)"
          emit-value
        >
          <template v-slot:before>
            <q-icon name="tune" />
          </template>
        </q-select>
      </q-card-section>
    </q-card>
    <q-card v-if="options_c2.length > 0" bordered class="q-ma-md">
      <q-card-section
        class="bg-primary text-white"
        :class="{ 'bg-negative': c2_pend }"
      >
        <div class="text-h6">Pozo</div>
      </q-card-section>
      <q-card-section>
        <q-checkbox
          v-for="option in options_c2"
          :name="option.value"
          :key="option.value"
          v-model="group_c2[option.value]"
          @update:model-value="onUpdate('2')"
          :val="option.value"
          :label="option.label"
          :disable="view"
          class="fit"
        />
      </q-card-section>
    </q-card>
    <q-card
      v-if="crits_l2_show.length > 0 || crits_i2.length > 0"
      bordered
      class="q-ma-md"
    >
      <q-card-section
        class="bg-primary text-white"
        :class="{ 'bg-negative': l2_pend }"
      >
        <div class="text-h6">Pozo - Criterios</div>
      </q-card-section>
      <q-card-section>
        <q-input
          v-for="option in crits_i2"
          :name="option"
          :key="option"
          v-model="crit_l2[option]"
          @update:model-value="onUpdate('2')"
          :label="traspaso_map.get(option + '_LABEL')"
          :rules="[
            (val) => (val && val.length > 0) || 'Este campo es obligatorio.',
          ]"
          dense
          mask="#"
          reverse-fill-mask
          :readonly="view"
        >
          <template v-slot:before>
            <q-icon name="numbers" />
          </template>
        </q-input>

        <q-select
          v-for="option in crits_l2_show"
          :name="option"
          :key="option"
          v-model="crit_l2[option]"
          @update:model-value="onUpdate('2')"
          options-selected-class="bg-indigo-6 text-white"
          :label="traspaso_map.get(option + '_LABEL')"
          :options="traspaso_map.get(option)"
          dense
          :rules="[
            (val) => (val && val.length > 0) || 'Este campo es obligatorio.',
          ]"
          :readonly="view"
          :multiple="crit_simple(option)"
          emit-value
        >
          <template v-slot:before>
            <q-icon name="tune" />
          </template>
        </q-select>
      </q-card-section>
    </q-card>
    <q-card v-if="options_c3.length > 0" bordered class="q-ma-md">
      <q-card-section
        class="bg-primary text-white"
        :class="{ 'bg-negative': c3_pend }"
      >
        <div class="text-h6">Techo</div>
      </q-card-section>
      <q-card-section>
        <q-checkbox
          v-for="option in options_c3"
          :name="option.value"
          :key="option.value"
          v-model="group_c3[option.value]"
          @update:model-value="onUpdate('3')"
          :val="option.value"
          :label="option.label"
          :disable="view"
          class="fit"
        />
      </q-card-section>
    </q-card>
    <q-card
      v-if="crits_l3_show.length > 0 || crits_i3.length > 0"
      bordered
      class="q-ma-md"
    >
      <q-card-section
        class="bg-primary text-white"
        :class="{ 'bg-negative': l3_pend }"
      >
        <div class="text-h6">Techo - Criterios</div>
      </q-card-section>
      <q-card-section>
        <q-input
          v-for="option in crits_i3"
          :name="option"
          :key="option"
          v-model="crit_l3[option]"
          @update:model-value="onUpdate('3')"
          :label="traspaso_map.get(option + '_LABEL')"
          :rules="[
            (val) => (val && val.length > 0) || 'Este campo es obligatorio.',
          ]"
          dense
          mask="#"
          reverse-fill-mask
          :readonly="view"
        >
          <template v-slot:before>
            <q-icon name="numbers" />
          </template>
        </q-input>

        <q-select
          v-for="option in crits_l3_show"
          :name="option"
          :key="option"
          v-model="crit_l3[option]"
          @update:model-value="onUpdate('3')"
          options-selected-class="bg-indigo-6 text-white"
          :label="traspaso_map.get(option + '_LABEL')"
          :options="traspaso_map.get(option)"
          dense
          :rules="[
            (val) => (val && val.length > 0) || 'Este campo es obligatorio.',
          ]"
          :readonly="view"
          :multiple="crit_simple(option)"
          emit-value
        >
          <template v-slot:before>
            <q-icon name="tune" />
          </template>
        </q-select>
      </q-card-section>
    </q-card>
    <q-card v-if="options_c4.length > 0" bordered class="q-ma-md">
      <q-card-section
        class="bg-primary text-white"
        :class="{ 'bg-negative': c4_pend }"
      >
        <div class="text-h6">Yutong</div>
      </q-card-section>
      <q-card-section>
        <q-checkbox
          v-for="option in options_c4"
          :name="option.value"
          :key="option.value"
          v-model="group_c4[option.value]"
          @update:model-value="onUpdate('4')"
          :val="option.value"
          :label="option.label"
          :disable="view"
          class="fit"
        />
      </q-card-section>
    </q-card>
    <q-card
      v-if="crits_l4_show.length > 0 || crits_i4.length > 0"
      bordered
      class="q-ma-md"
    >
      <q-card-section
        class="bg-primary text-white"
        :class="{ 'bg-negative': l4_pend }"
      >
        <div class="text-h6">Yutong - Criterios</div>
      </q-card-section>
      <q-card-section>
        <q-input
          v-for="option in crits_i4"
          :name="option"
          :key="option"
          v-model="crit_l4[option]"
          @update:model-value="onUpdate('4')"
          :label="traspaso_map.get(option + '_LABEL')"
          :rules="[
            (val) => (val && val.length > 0) || 'Este campo es obligatorio.',
          ]"
          dense
          mask="#"
          reverse-fill-mask
          :readonly="view"
        >
          <template v-slot:before>
            <q-icon name="numbers" />
          </template>
        </q-input>

        <q-select
          v-for="option in crits_l4_show"
          :name="option"
          :key="option"
          v-model="crit_l4[option]"
          @update:model-value="onUpdate('4')"
          options-selected-class="bg-indigo-6 text-white"
          :label="traspaso_map.get(option + '_LABEL')"
          :options="traspaso_map.get(option)"
          dense
          :rules="[
            (val) => (val && val.length > 0) || 'Este campo es obligatorio.',
          ]"
          :readonly="view"
          :multiple="crit_simple(option)"
          emit-value
        >
          <template v-slot:before>
            <q-icon name="tune" />
          </template>
        </q-select>
      </q-card-section>
    </q-card>
    <q-card bordered class="q-ma-md">
      <q-card-section
        class="bg-primary text-white"
        :class="{ 'bg-negative': filenames.length < 5 }"
      >
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
            :disable="view"
          >
            <template v-slot:before>
              <q-icon name="photo_camera" />
            </template>
            <template v-slot:after v-if="canUpload">
              <q-btn
                v-if="!view"
                color="primary"
                dense
                icon="cloud_upload"
                round
                @click="onUpload"
                :disable="!canUpload"
                :loading="isUploading"
              />
            </template>
          </q-file>
        </div>
      </q-card-section>
      <q-card-section>
        <q-scroll-area
          v-if="filenames.length > 0"
          style="height: 135px"
          visible
        >
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
              <div class="absolute-bottom row">
                <q-btn
                  v-if="!view"
                  color="white"
                  icon="delete"
                  flat
                  dense
                  @click="deleteImage(index)"
                />
                <q-space />
                <q-btn
                  color="white"
                  icon="fullscreen"
                  flat
                  dense
                  @click="largeImage(filename)"
                />
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
          v-if="version === 'E'"
          v-model="obs_0"
          label="OBSERVACIONES DESCONEXION"
          dense
          input-class="text-uppercase"
          :readonly="view"
          debounce="2000"
          @update:model-value="onUpdateX('0')"
          autogrow
        >
          <template v-slot:before>
            <q-icon name="person" />
          </template>
        </q-input>
        <q-input
          v-model="obs_1"
          label="OBSERVACIONES LOZA"
          dense
          input-class="text-uppercase"
          :readonly="view"
          debounce="2000"
          @update:model-value="onUpdateX('1')"
          autogrow
        >
          <template v-slot:before>
            <q-icon name="person" />
          </template>
        </q-input>
        <q-input
          v-model="obs_2"
          label="OBSERVACIONES POZO"
          dense
          input-class="text-uppercase"
          :readonly="view"
          debounce="2000"
          @update:model-value="onUpdateX('2')"
          autogrow
        >
          <template v-slot:before>
            <q-icon name="person" />
          </template>
        </q-input>
        <q-input
          v-model="obs_3"
          label="OBSERVACIONES TECHO"
          dense
          input-class="text-uppercase"
          :readonly="view"
          debounce="2000"
          @update:model-value="onUpdateX('3')"
          autogrow
        >
          <template v-slot:before>
            <q-icon name="person" />
          </template>
        </q-input>
        <q-input
          v-if="version === 'E'"
          v-model="obs_4"
          label="OBSERVACIONES YUTONG"
          dense
          input-class="text-uppercase"
          :readonly="view"
          debounce="2000"
          @update:model-value="onUpdateX('4')"
          autogrow
        >
          <template v-slot:before>
            <q-icon name="person" />
          </template>
        </q-input>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          label="Guardar"
          @click="onGuardar()"
          color="dark"
          :disable="view"
        />
        <q-btn label="Validar" type="submit" color="primary" :disable="view" />
      </q-card-actions>
    </q-card>
  </q-form>
</template>

<script setup>
import { openURL, useQuasar } from "quasar";
import { traspaso_map } from "traspaso";
import { useTraspmStore } from "@/store/traspmStore";
import { storeToRefs } from "pinia";
import { ref, computed, shallowRef, watch } from "vue";
import { getStorage, ref as refStorage, uploadBytes } from "firebase/storage";
import { customAlphabet } from "nanoid";
import { alphanumeric } from "nanoid-dictionary";
import { useRouter, useRoute } from "vue-router";
import { invoke, useDateFormat } from "@vueuse/core";

const { notify } = useQuasar();
const { update, getbyid } = useTraspmStore();

const { regd_change } = storeToRefs(useTraspmStore());
const files = ref(null);
const isUploading = ref(false);
const filenames = ref([]);
const filenames_ori = ref(new Set());

const preurl =
  "https://storage.googleapis.com/slared.appspot.com/traspaso_mayor/";
const obs_0 = ref(null);
const obs_1 = ref(null);
const obs_2 = ref(null);
const obs_3 = ref(null);
const obs_4 = ref(null);
const placa_patente = ref(null);

const view = ref(false);
const version = ref(null);
const options_c0 = shallowRef([]);
const options_c1 = shallowRef([]);
const options_c2 = shallowRef([]);
const options_c3 = shallowRef([]);
const options_c4 = shallowRef([]);
const group_c0 = ref({});
const group_c1 = ref({});
const group_c2 = ref({});
const group_c3 = ref({});
const group_c4 = ref({});

const crits_l0 = shallowRef([]);
const crits_l1 = shallowRef([]);
const crits_l2 = shallowRef([]);
const crits_l3 = shallowRef([]);
const crits_l4 = shallowRef([]);
const crits_i0 = shallowRef([]);
const crits_i1 = shallowRef([]);
const crits_i2 = shallowRef([]);
const crits_i3 = shallowRef([]);
const crits_i4 = shallowRef([]);

const crit_l0 = ref({});
const crit_l1 = ref({});
const crit_l2 = ref({});
const crit_l3 = ref({});
const crit_l4 = ref({});

const crits_l0_show = computed(() =>
  crits_l0.value.filter(
    (item) =>
      group_c0.value[item.slice(0, -1)] === false || item.slice(-1) !== "C"
  )
);
const crits_l1_show = computed(() =>
  crits_l1.value.filter(
    (item) =>
      group_c1.value[item.slice(0, -1)] === false || item.slice(-1) !== "C"
  )
);
const crits_l2_show = computed(() =>
  crits_l2.value.filter(
    (item) =>
      group_c2.value[item.slice(0, -1)] === false || item.slice(-1) !== "C"
  )
);
const crits_l3_show = computed(() =>
  crits_l3.value.filter(
    (item) =>
      group_c3.value[item.slice(0, -1)] === false || item.slice(-1) !== "C"
  )
);
const crits_l4_show = computed(() =>
  crits_l4.value.filter(
    (item) =>
      group_c4.value[item.slice(0, -1)] === false || item.slice(-1) !== "C"
  )
);

const c0_pend = computed(() =>
  options_c0.value.some((x) => !Object.keys(group_c0.value).includes(x.value))
);
const l0_pend = computed(
  () =>
    crits_l0_show.value.some(
      (x) =>
        !Object.keys(crit_l0.value).includes(x) || crit_l0.value[x].length === 0
    ) || crits_i0.value.some((x) => !crit_l0.value[x])
);
const c1_pend = computed(() =>
  options_c1.value.some((x) => !Object.keys(group_c1.value).includes(x.value))
);
const l1_pend = computed(
  () =>
    crits_l1_show.value.some(
      (x) =>
        !Object.keys(crit_l1.value).includes(x) || crit_l1.value[x].length === 0
    ) || crits_i1.value.some((x) => !crit_l1.value[x])
);
const c2_pend = computed(() =>
  options_c2.value.some((x) => !Object.keys(group_c2.value).includes(x.value))
);
const l2_pend = computed(
  () =>
    crits_l2_show.value.some(
      (x) =>
        !Object.keys(crit_l2.value).includes(x) || crit_l2.value[x].length === 0
    ) || crits_i2.value.some((x) => !crit_l2.value[x])
);
const c3_pend = computed(() =>
  options_c3.value.some((x) => !Object.keys(group_c3.value).includes(x.value))
);
const l3_pend = computed(
  () =>
    crits_l3_show.value.some(
      (x) =>
        !Object.keys(crit_l3.value).includes(x) || crit_l3.value[x].length === 0
    ) || crits_i3.value.some((x) => !crit_l3.value[x])
);
const c4_pend = computed(() =>
  options_c4.value.some((x) => !Object.keys(group_c4.value).includes(x.value))
);
const l4_pend = computed(
  () =>
    crits_l4_show.value.some(
      (x) =>
        !Object.keys(crit_l4.value).includes(x) || crit_l4.value[x].length === 0
    ) || crits_i4.value.some((x) => !crit_l4.value[x])
);

let fecha_inicio_timestamp = null;

const crit_simple = (option) => {
  const simple = traspaso_map.get("CRIT_SIMPLE");
  if (simple.includes(option)) return false;
  else return true;
};

//let charged = false;
//let file_charged = 0;
const canUpload = computed(() => files.value !== null);
const router = useRouter();
const route = useRoute();
const remExt = (fname) => fname.substring(0, fname.lastIndexOf("."));

const onUpdate = (value) => {
  let group_update = null;
  let crit_update = null;
  let c_pend = null;
  let l_pend = null;

  if (value === "0") {
    group_update = group_c0;
    crit_update = crit_l0;
    c_pend = c0_pend;
    l_pend = l0_pend;
  } else if (value === "1") {
    group_update = group_c1;
    crit_update = crit_l1;
    c_pend = c1_pend;
    l_pend = l1_pend;
  } else if (value === "2") {
    group_update = group_c2;
    crit_update = crit_l2;
    c_pend = c2_pend;
    l_pend = l2_pend;
  } else if (value === "3") {
    group_update = group_c3;
    crit_update = crit_l3;
    c_pend = c3_pend;
    l_pend = l3_pend;
  } else if (value === "4") {
    group_update = group_c4;
    crit_update = crit_l4;
    c_pend = c4_pend;
    l_pend = l4_pend;
  }
  //Borramos crits que tienen atributo seleccionado.
  for (const [option, value] of Object.entries(group_update.value)) {
    if (value === true) crit_update.value[option + "C"] = [];
  }

  const payload = {
    uuid: route.params.uuid,
    fecha: useDateFormat(new Date(), "DD/MM/YYYY").value,
    hora: useDateFormat(new Date(), "HH:mm:ss").value,
    fecha_timestamp: Date.now() / 1000,
  };
  payload["group_c" + value] = group_update.value;
  payload["crit_l" + value] = crit_update.value;
  payload["c" + value + "_pend"] = c_pend.value;
  payload["l" + value + "_pend"] = l_pend.value;

  if (!fecha_inicio_timestamp) {
    payload.fecha_inicio = useDateFormat(new Date(), "DD/MM/YYYY").value;
    payload.hora_inicio = useDateFormat(new Date(), "HH:mm:ss").value;
    payload.fecha_inicio_timestamp = Date.now() / 1000;
  }
  update(payload);
};
const onUpdateX = (value) => {
  const payload = {
    uuid: route.params.uuid,
  };
  if (value === "0") payload["obs_0"] = obs_0.value;
  else if (value === "1") payload["obs_1"] = obs_1.value;
  else if (value === "2") payload["obs_2"] = obs_2.value;
  else if (value === "3") payload["obs_3"] = obs_3.value;
  else if (value === "4") payload["obs_4"] = obs_4.value;

  update(payload);
};
const largeImage = (filename) => {
  if (filename.name) openURL(preurl + filename.name);
  else openURL(preurl + filename);
};
const deleteImage = () => {
  /*
  filenames.value.splice(index, 1);
  const payload = {
    uuid: route.params.uuid,
    filenames: filenames.value,
  };
  if (filenames.value.length < 2) {
    payload.fecha_termino = null;
    payload.hora_termino = null;
    payload.fecha_termino_timestamp = null;
  }
  update(payload);
  */
  notify({
    color: "red-6",
    textColor: "white",
    icon: "warning",
    message: `Eliminación de fotos no disponible`,
    timeout: 2500,
  });
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
    const storageRef = refStorage(storage, `traspaso_mayor/${file_name}`);
    const uploadTask = uploadBytes(storageRef, file, {
      customMetadata: {
        uuid: route.params.uuid,
        filename: file_name_ori,
        collection: "traspaso_mayor",
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
      files.value = null;
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
        name: "traspm_list",
      }),
    2500
  );
};
const onError = (el) => {
  notify({
    color: "red-6",
    textColor: "white",
    icon: "warning",
    message: `Inspección con registros faltantes`,
    timeout: 2500,
  });
  el.$el.scrollIntoView({
    behavior: "smooth",
    block: "center",
    inline: "nearest",
  });
};
const onSubmit = () => {
  const options_all = [
    ...Array.from(options_c0.value),
    ...Array.from(options_c1.value),
    ...Array.from(options_c2.value),
    ...Array.from(options_c3.value),
    ...Array.from(options_c4.value),
  ];
  if (filenames.value.length < 5)
    notify({
      color: "red-6",
      textColor: "white",
      icon: "cloud_done",
      message: `Minimo 5 fotos a registrar`,
      timeout: 1000,
    });
  else if (
    Object.keys(group_c0.value).length +
      Object.keys(group_c1.value).length +
      Object.keys(group_c2.value).length +
      Object.keys(group_c3.value).length +
      Object.keys(group_c4.value).length !==
    options_all.length
  )
    notify({
      color: "red-6",
      textColor: "white",
      icon: "warning",
      message: `Inspección con registros faltantes`,
      timeout: 2500,
    });
  else
    notify({
      color: "green-6",
      textColor: "white",
      icon: "cloud_done",
      message: "Inspección completada",
      timeout: 1000,
    });
};

//Llamada que se gatilla al ingresar o refrescar pagina, una vez se hayan cargado los datos.
invoke(async () => {
  const registro = await getbyid(route.params.uuid);
  if (registro) {
    placa_patente.value = registro["placa_patente"];
    version.value = registro["version"];

    options_c0.value = traspaso_map.get(version.value + "C0");
    options_c1.value = traspaso_map.get(version.value + "C1");
    options_c2.value = traspaso_map.get(version.value + "C2");
    options_c3.value = traspaso_map.get(version.value + "C3");
    options_c4.value = traspaso_map.get(version.value + "C4");
    crits_l0.value = traspaso_map.get(version.value + "L0");
    crits_l1.value = traspaso_map.get(version.value + "L1");
    crits_l2.value = traspaso_map.get(version.value + "L2");
    crits_l3.value = traspaso_map.get(version.value + "L3");
    crits_l4.value = traspaso_map.get(version.value + "L4");

    crits_i0.value = traspaso_map.get(version.value + "I0");
    crits_i1.value = traspaso_map.get(version.value + "I1");
    crits_i2.value = traspaso_map.get(version.value + "I2");
    crits_i3.value = traspaso_map.get(version.value + "I3");
    crits_i4.value = traspaso_map.get(version.value + "I4");

    group_c0.value = registro["group_c0"];
    group_c1.value = registro["group_c1"];
    group_c2.value = registro["group_c2"];
    group_c3.value = registro["group_c3"];
    group_c4.value = registro["group_c4"];
    crit_l0.value = registro["crit_l0"];
    crit_l1.value = registro["crit_l1"];
    crit_l2.value = registro["crit_l2"];
    crit_l3.value = registro["crit_l3"];
    crit_l4.value = registro["crit_l4"];

    obs_0.value = registro["obs_0"];
    obs_1.value = registro["obs_1"];
    obs_2.value = registro["obs_2"];
    obs_3.value = registro["obs_3"];
    obs_4.value = registro["obs_4"];

    fecha_inicio_timestamp = registro["fecha_inicio_timestamp"];

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
    if (registro && registro["filenames"].length !== filenames.value.length) {
      filenames.value = registro["filenames"];
    }

    /*
    if (registro) {
      group_c0.value = registro["group_c0"];
      group_c1.value = registro["group_c1"];
      group_c2.value = registro["group_c2"];
      group_c3.value = registro["group_c3"];
      group_c4.value = registro["group_c4"];
      crit_l0.value = registro["crit_l0"];
      crit_l1.value = registro["crit_l1"];
      crit_l2.value = registro["crit_l2"];
      crit_l3.value = registro["crit_l3"];
      crit_l4.value = registro["crit_l4"];

      obs_0.value = registro["obs_0"];
      obs_1.value = registro["obs_1"];
      obs_2.value = registro["obs_2"];
      obs_3.value = registro["obs_3"];
      obs_4.value = registro["obs_4"];

      fecha_inicio_timestamp = registro["fecha_inicio_timestamp"];
    }
      */
  }
);
</script>
<style scoped lang="scss">
@use "@/styles/_criteria" as *;
</style>

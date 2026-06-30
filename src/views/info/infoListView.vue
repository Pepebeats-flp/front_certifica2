<template>
  <div>
    <SmartTable
      :rows="informes_arr"
      :columns="columns"
      row-key="uuid"
      :loading="loading"
      persist-key="info-list"
      search-placeholder="Buscar por unidad de servicio..."
      empty-icon="description"
      empty-text="Aún no hay informes registrados"
      :initial-search="routeSearch"
    >
      <template #top-left>
        <q-btn v-if="!only_view" color="primary" icon="add" to="/info/add" label="Agregar" />
      </template>

      <template #empty-action>
        <q-btn v-if="!only_view" color="primary" icon="add" label="Crear primer informe" to="/info/add" />
      </template>

      <template #body-cell-actions="{ row }">
        <q-btn color="primary" icon="download" flat dense @click="onDownload(row)" :loading="downloading[row.uuid]">
          <q-tooltip>Descargar informe</q-tooltip>
        </q-btn>
        <q-btn v-if="!only_view" color="negative" icon="delete" flat dense @click="onDelete(row)">
          <q-tooltip>Eliminar</q-tooltip>
        </q-btn>
      </template>
    </SmartTable>
  </div>
</template>

<script setup>
import SmartTable from "@/components/shared/SmartTable.vue";
import { useInfoStore } from "@/store/infoStore";
import { useUserStore } from "@/store/userStore";
import { storeToRefs } from "pinia";
import { ref, watch, shallowRef } from "vue";
import { getStorage, ref as fref, getDownloadURL } from "firebase/storage";
import { useQuasar } from "quasar";
import { useRoute } from "vue-router";

const columns = [
  { name: "unidad_servicio", label: "Unidad Servicio", field: "unidad_servicio", align: "center", sortable: true, responsive: ["sm", "md", "lg", "xl"] },
  { name: "tipo", label: "Tipo", field: "tipo", align: "center", sortable: true, responsive: ["sm", "md", "lg", "xl"] },
  { name: "mes_ano", label: "Mes", field: (row) => row.mes + " " + row.ano, align: "center", sortable: true },
  { name: "actions", label: "Acciones", field: "", align: "center", width: "120px" },
];

const { m_informes_change } = storeToRefs(useInfoStore());
const { getall, update } = useInfoStore();
const informes_arr = shallowRef([]);
const { only_view } = useUserStore();
const { notify } = useQuasar();
const route = useRoute();
const routeSearch = route.query.search || "";
const downloading = ref([]);
const loading = ref(true);

const onDownload = async (row) => {
  downloading.value[row.uuid] = true;
  const url = await getDownloadURL(fref(getStorage(), `informes/${row.filename}`));
  window.location.href = url;
  downloading.value[row.uuid] = false;
};

const onDelete = (row) => {
  update({ uuid: row.uuid, estado: 3 });
  notify({ color: "green-6", textColor: "white", icon: "cloud_done", message: "Informe eliminado", timeout: 1000 });
};

watch(
  () => m_informes_change.value,
  async () => {
    informes_arr.value = await getall();
    if (m_informes_change.value > 0) loading.value = false;
  },
  { immediate: true }
);
</script>

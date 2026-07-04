<template>
  <div>
    <SmartTable
      :rows="documentos_arr"
      :columns="columns"
      row-key="uuid"
      :loading="false"
      searchable
      persist-key="docu-list"
      search-placeholder="Buscar por tipo, descripción..."
      empty-icon="description"
      empty-text="No hay documentos disponibles"
    >
      <template #body-cell-actions="{ row }">
        <q-btn color="primary" icon="download" flat dense @click="onDownload(row)" :loading="downloading[row]">
          <q-tooltip>Descargar</q-tooltip>
        </q-btn>
      </template>
    </SmartTable>
  </div>
</template>

<script setup>
import SmartTable from "@/components/shared/SmartTable.vue";
import { ref, computed } from "vue";
import documentos from "@/assets/json/documentos.json";
import { unidad_negocio } from "@/client";
import { getStorage, ref as fref, getDownloadURL } from "firebase/storage";

const columns = [
  { name: "unidad_negocio", label: "Unidad Negocio", field: () => unidad_negocio, align: "center" },
  { name: "tipo", label: "Tipo", field: (row) => row[2], align: "center", sortable: true },
  { name: "descripcion", label: "Descripción", field: (row) => row[0], align: "center", sortable: true },
  { name: "actions", label: "Acciones", field: "", align: "center", width: "80px" },
];

const documentos_arr = computed(() => documentos[unidad_negocio]);
const downloading = ref([]);

const onDownload = async (row) => {
  downloading.value[row] = true;
  const url = await getDownloadURL(fref(getStorage(), `documentos/${row[1]}`));
  window.location.href = url;
  downloading.value[row] = false;
};
</script>

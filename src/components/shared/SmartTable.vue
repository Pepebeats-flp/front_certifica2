<template>
  <div ref="rootRef" class="st-root">
    <div class="st-toolbar row items-center q-px-lg q-pt-lg q-pb-md">
      <div class="row items-center q-gutter-sm">
        <slot name="top-left" />
      </div>
      <q-space />
      <div class="row items-center q-gutter-xs">
        <q-btn-dropdown
          v-if="toggleableColumns.length > 0"
          dense outline
          color="grey-7"
          icon="view_column"
          size="md"
          label="Columnas"
        >
          <q-list dense style="min-width: 200px; max-height: 400px; overflow-y: auto">
            <q-item clickable v-close-popup @click="showAllColumns">
              <q-item-section>Mostrar todas</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="hideAllColumns">
              <q-item-section>Ocultar todas</q-item-section>
            </q-item>
            <q-separator />
            <q-item v-for="col in toggleableColumns" :key="col.name" tag="label" dense>
              <q-item-section>
                <q-item-label>{{ col.label }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-toggle
                  :model-value="!hiddenColumns.has(col.name)"
                  @update:model-value="toggleColumn(col.name)"
                  dense
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
        <q-input
          v-if="searchable && !isMobile"
          v-model="filterText"
          outlined dense
          :debounce="debounce"
          :placeholder="searchPlaceholder"
          clearable
          style="max-width: 260px"
          class="st-search-input"
        >
          <template #prepend><q-icon name="search" /></template>
        </q-input>
        <slot name="top-right" />
      </div>
    </div>

    <div v-if="activeFilterChips.length" class="st-active-filters q-px-lg q-pt-xs q-pb-sm">
      <q-chip
        v-for="chip in activeFilterChips"
        :key="chip.key"
        removable
        color="primary"
        text-color="white"
        @remove="chip.remove"
      >{{ chip.label }}: {{ chip.value }}</q-chip>
      <q-btn v-if="activeFilterChips.length > 1" flat dense label="Limpiar filtros" color="negative" @click="clearAllFilters" />
    </div>

    <div v-if="isMobile" class="st-mobile-controls q-px-lg q-pt-md q-pb-sm">
      <div class="row items-center q-gutter-xs">
        <q-input
          v-if="searchable"
          v-model="filterText"
          outlined dense
          :debounce="debounce"
          :placeholder="searchPlaceholder"
          clearable
          class="col st-search-input st-search-input-mobile"
        >
          <template #prepend><q-icon name="search" /></template>
        </q-input>
      </div>
      <div class="row items-center q-gutter-sm q-mt-sm">
        <q-select
          v-model="mobileSortBy"
          :options="sortableColumns"
          option-label="label"
          option-value="name"
          dense outlined
          label="Ordenar"
          style="min-width: 130px"
          clearable
          class="st-mobile-sort"
        >
          <template #after>
            <q-btn
              v-if="mobileSortBy"
              flat round dense
              :icon="mobileSortDesc ? 'arrow_downward' : 'arrow_upward'"
              color="primary"
              size="sm"
              @click="mobileSortDesc = !mobileSortDesc"
            >
              <q-tooltip>{{ mobileSortDesc ? 'Descendente' : 'Ascendente' }}</q-tooltip>
            </q-btn>
          </template>
        </q-select>

        <q-btn-dropdown
          v-if="filterableColumns.length > 0"
          dense outline
          color="grey-7"
          icon="filter_alt"
          label="Filtrar"
          size="md"
        >
          <q-list dense>
            <q-item
              v-for="col in filterableColumns"
              :key="col.name"
              clickable v-ripple v-close-popup
              @click="openColFilterMobile(col)"
            >
              <q-item-section>{{ col.label }}</q-item-section>
              <q-item-section side>
                <q-icon v-if="hasColFilter(col.name)" name="check" color="primary" size="18px" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>
    </div>

    <div class="st-table-wrapper q-px-lg q-pb-md">
      <div class="st-table-card" :class="{ 'st-table-card-mobile': isMobile }">
      <q-table
        :rows="filteredRows"
        :columns="visibleColumns"
        :filter="filterText"
        :filter-method="customFilter"
        :row-key="rowKey"
        :loading="loading"
        :dense="true"
        :pagination="pagination"
        :rows-per-page-options="rowsPerPageOptions"
        flat
        binary-state-sort
        class="st-table"
        v-if="!isMobile"
        @request="onRequest"
      >
        <template #header-cell="props">
          <q-th :props="props" class="st-th-cell st-th-native">
            <div class="st-th-inner">
              <span>{{ props.col.label }}</span>
              <q-icon
                v-if="props.col.name !== 'actions'"
                name="filter_alt"
                size="14px"
                class="st-filter-icon"
                :class="{ 'filter-active': hasColFilter(props.col.name) }"
                @click.stop="openColFilter($event, props.col)"
              />
            </div>
            <div class="st-resize-grip" @mousedown.stop.prevent="startColResize($event, props.col)" />
          </q-th>
        </template>

        <template #loading>
          <div v-for="i in skeletonRows" :key="'sk-' + i" class="st-skeleton" />
        </template>

        <template #top />

        <template v-for="(_, name) in $slots" :key="name" #[name]="scope">
          <slot v-if="!reservedSlots.includes(name)" :name="name" v-bind="scope || {}" />
        </template>

        <template #no-data>
          <template v-if="!hasEverLoaded && loading">
            <div v-for="i in skeletonRows" :key="'sk-' + i" class="st-skeleton" />
          </template>
          <div v-else class="st-empty-state">
            <q-icon :name="emptyIcon" size="56px" />
            <div class="st-empty-title">{{ emptyText }}</div>
            <slot name="empty-action" />
          </div>
        </template>

        <template #no-results="{ message }">
          <div class="st-empty-state">
            <q-icon name="search_off" size="56px" />
            <div class="st-empty-title">Sin resultados</div>
            <div class="text-grey-6 q-mb-md">{{ message }}</div>
            <q-btn flat color="primary" label="Limpiar búsqueda" @click="filterText = ''" />
          </div>
        </template>

        <template v-for="(_, name) in $slots" :key="name" #[name]="scope">
          <slot v-if="!reservedSlots.includes(name)" :name="name" v-bind="scope || {}" />
        </template>

        <template v-if="error" #top>
          <q-banner rounded class="bg-negative text-white q-mb-md">
            <q-icon name="error" /> {{ errorMessage }}
            <template #action><q-btn flat dense label="Reintentar" @click="$emit('retry')" /></template>
          </q-banner>
        </template>

        <template v-for="col in chipColumns" :key="'chip-' + col.name" #[`body-cell-${col.name}`]="props">
          <q-td :props="props">
            <q-badge
              v-if="props.value"
              :color="typeof col.chipColor === 'function' ? col.chipColor(props.row) : col.chipColor"
              :text-color="getChipTextColor(col, props.row)"
              class="st-chip"
              :outline="col.chipOutline"
            >
              {{ typeof col.format === 'function' ? col.format(props.value, props.row) : props.value }}
            </q-badge>
            <span v-else class="text-grey-5">—</span>
          </q-td>
        </template>

        <template v-if="hasActions" #body-cell-actions="props">
          <q-td :props="props" class="text-no-wrap">
            <slot name="body-cell-actions" :row="props.row" />
          </q-td>
        </template>
      </q-table>

      <div v-else class="st-mobile-cards">
        <template v-if="loading && !hasEverLoaded">
          <div v-for="i in skeletonRows" :key="'sk-' + i" class="st-mobile-skeleton" />
        </template>

        <template v-else-if="filteredRows.length === 0">
          <div class="st-empty-state">
            <q-icon name="search_off" size="48px" />
            <div class="st-empty-title">Sin resultados</div>
            <q-btn v-if="filterText" flat color="primary" label="Limpiar búsqueda" @click="filterText = ''" />
          </div>
        </template>

        <template v-else>
          <div
            v-for="row in paginatedMobileRows"
            :key="row[rowKey]"
            class="st-mobile-card"
            :class="{ 'st-mobile-card-expanded': expandedMobileRows.includes(row[rowKey]) }"
          >
            <div class="st-mobile-card-header" @click="toggleMobileExpand(row[rowKey])">
              <div class="row items-center no-wrap">
                <div v-if="mobileTitleCol" class="text-weight-bold text-h6 col">{{ mobileTitleVal(row) }}</div>
                <q-icon
                  :name="expandedMobileRows.includes(row[rowKey]) ? 'expand_less' : 'expand_more'"
                  size="20px"
                  color="grey-5"
                  class="q-ml-sm"
                />
              </div>
              <div v-if="mobileChipCols.length" class="row q-gutter-xs q-mt-xs items-center">
                <template v-for="col in mobileChipCols" :key="col.name">
                  <q-badge
                    v-if="cellValue(col, row) !== '' && cellValue(col, row) != null"
                    :color="typeof col.chipColor === 'function' ? col.chipColor(row) : col.chipColor"
                    :text-color="getChipTextColor(col, row)"
                    :outline="col.chipOutline"
                    class="st-chip st-mobile-chip"
                  >
                    <span class="st-mobile-chip-label">{{ col.label }}:</span>
                    {{ typeof col.format === 'function' ? col.format(cellValue(col, row), row) : cellValue(col, row) }}
                  </q-badge>
                </template>
              </div>
            </div>
            <div v-if="visibleMobileFields(row).length" class="st-mobile-card-body">
              <div v-for="col in visibleMobileFields(row)" :key="col.name" class="st-mobile-field">
                <span class="st-mobile-field-label">{{ col.label }}</span>
                <span class="st-mobile-field-value">{{ col.format ? col.format(cellValue(col, row), row) : cellValue(col, row) }}</span>
              </div>
            </div>
            <div v-if="!expandedMobileRows.includes(row[rowKey]) && hiddenMobileCount(row) > 0" class="st-mobile-card-show-more text-center">
              <q-btn flat dense color="primary" size="sm" :label="`+${hiddenMobileCount(row)} campos más`" @click.stop="toggleMobileExpand(row[rowKey])" />
            </div>
            <div v-if="hasActions" class="st-mobile-card-actions">
              <slot name="body-cell-actions" :row="row" />
            </div>
          </div>

          <div v-if="mobileTotalPages > 1" class="st-mobile-pagination">
            <q-btn flat dense icon="chevron_left" :disable="mobilePage === 1" @click="mobilePage--" />
            <span class="text-caption text-grey-7">{{ mobilePage }} / {{ mobileTotalPages }}</span>
            <q-btn flat dense icon="chevron_right" :disable="mobilePage === mobileTotalPages" @click="mobilePage++" />
          </div>
        </template>

        <div v-if="error" class="st-mobile-error">
          <q-banner rounded class="bg-negative text-white">
            <q-icon name="error" /> {{ errorMessage }}
            <template #action><q-btn flat dense label="Reintentar" @click="$emit('retry')" /></template>
          </q-banner>
        </div>
      </div>
      </div>
    </div>

    <q-menu v-if="!isMobile" v-model="colFilterMenu" :target="colFilterTarget">
      <q-card class="st-filter-popup">
        <q-card-section class="q-pb-none">
          <div class="text-subtitle2 text-weight-medium">{{ activeFilterCol?.label }}</div>
        </q-card-section>
        <q-card-section>
          <template v-if="activeFilterOptions.length > 0 && activeFilterOptions.length <= 20">
            <div class="st-filter-chips">
              <q-chip
                v-for="opt in activeFilterOptions"
                :key="opt"
                clickable
                :color="isFilterOptSelected(opt) ? 'primary' : 'grey-3'"
                :text-color="isFilterOptSelected(opt) ? 'white' : 'black'"
                size="sm"
                @click="toggleFilterOpt(opt)"
              >{{ opt }}</q-chip>
            </div>
          </template>
          <template v-else-if="activeFilterOptions.length > 20">
            <q-input v-model="colFilterSearch" dense outlined placeholder="Escribe para buscar..." class="q-mb-sm" />
            <div class="st-filter-chips" style="max-height: 180px; overflow-y: auto">
              <q-chip
                v-for="opt in filteredFilterOptions"
                :key="opt"
                clickable
                :color="isFilterOptSelected(opt) ? 'primary' : 'grey-3'"
                :text-color="isFilterOptSelected(opt) ? 'white' : 'black'"
                size="sm"
                @click="toggleFilterOpt(opt)"
              >{{ opt }}</q-chip>
            </div>
          </template>
          <template v-else>
            <div class="text-grey-6 text-center q-py-md">Sin datos para filtrar</div>
          </template>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn v-if="hasColFilter(activeFilterCol?.name)" flat dense label="Limpiar filtro" color="negative" @click="clearColFilter" />
          <q-btn flat dense label="Cerrar" color="grey" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-menu>

    <q-dialog v-else v-model="colFilterMenu" position="bottom">
      <q-card class="st-filter-popup st-filter-popup-mobile" style="border-radius: 16px 16px 0 0; width: 100%; max-width: 100%;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-subtitle2 text-weight-medium">{{ activeFilterCol?.label }}</div>
          <q-space />
          <q-btn flat round dense icon="close" size="sm" v-close-popup />
        </q-card-section>
        <q-card-section>
          <template v-if="activeFilterOptions.length > 0 && activeFilterOptions.length <= 20">
            <div class="st-filter-chips st-filter-chips-mobile">
              <q-chip
                v-for="opt in activeFilterOptions"
                :key="opt"
                clickable
                :color="isFilterOptSelected(opt) ? 'primary' : 'grey-3'"
                :text-color="isFilterOptSelected(opt) ? 'white' : 'black'"
                size="md"
                @click="toggleFilterOpt(opt)"
              >{{ opt }}</q-chip>
            </div>
          </template>
          <template v-else-if="activeFilterOptions.length > 20">
            <q-input v-model="colFilterSearch" dense outlined placeholder="Escribe para buscar..." class="q-mb-sm" />
            <div class="st-filter-chips st-filter-chips-mobile" style="max-height: 240px; overflow-y: auto">
              <q-chip
                v-for="opt in filteredFilterOptions"
                :key="opt"
                clickable
                :color="isFilterOptSelected(opt) ? 'primary' : 'grey-3'"
                :text-color="isFilterOptSelected(opt) ? 'white' : 'black'"
                size="md"
                @click="toggleFilterOpt(opt)"
              >{{ opt }}</q-chip>
            </div>
          </template>
          <template v-else>
            <div class="text-grey-6 text-center q-py-md">Sin datos para filtrar</div>
          </template>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn v-if="hasColFilter(activeFilterCol?.name)" flat dense label="Limpiar filtro" color="negative" @click="clearColFilter" />
          <q-btn flat dense label="Cerrar" color="grey" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch } from "vue";
import { useBreakpoint } from "@/composables/useBreakpoint";

const props = defineProps({
  columns: { type: Array, required: true },
  rows: { type: Array, default: () => [] },
  rowKey: { type: String, default: "uuid" },
  loading: { type: Boolean, default: false },
  error: { type: Boolean, default: false },
  errorMessage: { type: String, default: "Error al cargar datos" },
  rowsPerPage: { type: Number, default: 12 },
  rowsPerPageOptions: { type: Array, default: () => [10, 12, 15, 25, 50] },
  searchable: { type: Boolean, default: true },
  searchPlaceholder: { type: String, default: "Buscar..." },
  debounce: { type: Number, default: 300 },
  emptyIcon: { type: String, default: "inbox" },
  emptyText: { type: String, default: "No hay registros" },
  skeletonRows: { type: Number, default: 6 },
  persistKey: { type: String, default: "" },
  initialSearch: { type: String, default: "" },
});

const emit = defineEmits(["retry"]);
const { isMobile } = useBreakpoint();
const rootRef = ref(null);
const hasEverLoaded = ref(false);

watch(() => props.rows.length, (len) => { if (len > 0) hasEverLoaded.value = true; });
watch(() => props.loading, (val) => { if (!val && props.rows.length > 0) hasEverLoaded.value = true; });

const filterText = ref(props.initialSearch || "");
watch(() => props.initialSearch, (val) => { filterText.value = val || ""; });
const colFilters = reactive({});
const pagination = ref({ sortBy: null, descending: false, page: 1, rowsPerPage: props.rowsPerPage });
const colFilterMenu = ref(false);
const colFilterTarget = ref(null);
const activeFilterCol = ref(null);
const colFilterSearch = ref("");

const hiddenColumns = ref(new Set());
const toggleableColumns = computed(() =>
  props.columns.filter((c) => c.name !== "actions")
);
const visibleColumns = computed(() =>
  props.columns.filter((c) => !hiddenColumns.value.has(c.name))
);

function toggleColumn(name) {
  const cur = new Set(hiddenColumns.value);
  if (cur.has(name)) cur.delete(name);
  else cur.add(name);
  hiddenColumns.value = cur;
}

function showAllColumns() {
  hiddenColumns.value = new Set();
}

function hideAllColumns() {
  hiddenColumns.value = new Set(toggleableColumns.value.map((c) => c.name));
}

if (props.persistKey) {
  try {
    const saved = localStorage.getItem(`st-hidden-${props.persistKey}`);
    if (saved) hiddenColumns.value = new Set(JSON.parse(saved));
  } catch {}
  watch(hiddenColumns, (val) => {
    localStorage.setItem(`st-hidden-${props.persistKey}`, JSON.stringify([...val]));
  }, { deep: true });
}

watch(hiddenColumns, (newVal) => {
  for (const name of newVal) {
    if (colFilters[name]) delete colFilters[name];
  }
});

if (typeof document !== "undefined") {
  colFilterTarget.value = document.body;
}

const openColFilter = (e, col) => {
  if (activeFilterCol.value?.name === col.name && colFilterMenu.value) {
    colFilterMenu.value = false;
    return;
  }
  activeFilterCol.value = col;
  colFilterSearch.value = "";
  colFilterTarget.value = e.currentTarget;
  colFilterMenu.value = false;
  setTimeout(() => { colFilterMenu.value = true; }, 10);
};

const activeFilterOptions = computed(() => {
  if (!activeFilterCol.value) return [];
  const col = activeFilterCol.value;
  const vals = new Set();
  props.rows.forEach((row) => {
    const raw = typeof col.field === "function" ? col.field(row) : row[col.field];
    const formatted = col.format ? col.format(raw, row) : raw;
    if (formatted !== null && formatted !== undefined && formatted !== "") vals.add(String(formatted));
  });
  return [...vals].sort();
});

const filteredFilterOptions = computed(() => {
  const s = colFilterSearch.value.toLowerCase();
  return s ? activeFilterOptions.value.filter((o) => o.toLowerCase().includes(s)) : activeFilterOptions.value;
});

const isFilterOptSelected = (opt) => {
  const vals = activeFilterCol.value ? colFilters[activeFilterCol.value.name] : null;
  return Array.isArray(vals) && vals.includes(opt);
};

const toggleFilterOpt = (opt) => {
  if (!activeFilterCol.value) return;
  const name = activeFilterCol.value.name;
  if (!colFilters[name]) colFilters[name] = [];
  const idx = colFilters[name].indexOf(opt);
  if (idx >= 0) colFilters[name].splice(idx, 1);
  else colFilters[name].push(opt);
};

const hasColFilter = (name) => {
  if (!name) return false;
  const v = colFilters[name];
  return v && (Array.isArray(v) ? v.length > 0 : v !== "" && v !== undefined);
};

const clearColFilter = () => { if (activeFilterCol.value) colFilters[activeFilterCol.value.name] = []; colFilterMenu.value = false; };
const clearAllFilters = () => { for (const k in colFilters) colFilters[k] = []; };

const chipColumns = computed(() => visibleColumns.value.filter((c) => c.chip));
const hasActions = computed(() => props.columns.some((c) => c.name === "actions"));
const reservedSlots = ["loading", "no-data", "no-results", "top", "top-left", "top-right", "body-cell-actions", "header-cell", "empty-action"];

const activeFilterChips = computed(() => {
  const chips = [];
  for (const key in colFilters) {
    const val = colFilters[key];
    if (!val || (Array.isArray(val) && val.length === 0)) continue;
    const col = props.columns.find((c) => c.name === key);
    if (!col) continue;
    chips.push({ key: col.name, label: col.label, value: Array.isArray(val) ? val.join(", ") : val, remove: () => { colFilters[col.name] = []; } });
  }
  return chips;
});

const customFilter = (rows, terms, cols) => {
  const term = (typeof terms === "string" ? terms : "").toLowerCase();
  return rows.filter((row) => {
    for (const key in colFilters) {
      const fv = colFilters[key];
      if (!fv || (Array.isArray(fv) && fv.length === 0)) continue;
      const col = props.columns.find((c) => c.name === key);
      if (!col) continue;
      const raw = typeof col.field === "function" ? col.field(row) : row[col.field];
      const fs = String((col.format ? col.format(raw, row) : raw) ?? "").toLowerCase();
      if (!fv.some((v) => fs === String(v).toLowerCase())) return false;
    }
    if (term) {
      for (const col of cols) {
        const raw = typeof col.field === "function" ? col.field(row) : row[col.field];
        if (String((col.format ? col.format(raw, row) : raw) ?? "").toLowerCase().includes(term)) return true;
      }
      return false;
    }
    return true;
  });
};

const filteredRows = computed(() => props.rows ? customFilter(props.rows, filterText.value, visibleColumns.value) : []);
const onRequest = (req) => { pagination.value = req.pagination; };

const mobileTitleCol = computed(() => {
  const placa = visibleColumns.value.find((c) => c.name === "placa_patente");
  if (placa) return placa;
  return visibleColumns.value.find((c) =>
    c.name !== "actions" && !c.chip && c.name !== "uuid"
  );
});

const mobileTitleVal = (row) => {
  if (!mobileTitleCol.value) return "";
  const col = mobileTitleCol.value;
  const raw = typeof col.field === "function" ? col.field(row) : row[col.field];
  return col.format ? col.format(raw, row) : (raw || "—");
};

const mobileChipCols = computed(() => visibleColumns.value.filter((c) => c.chip));

const expandedMobileRows = ref([]);

const toggleMobileExpand = (key) => {
  const idx = expandedMobileRows.value.indexOf(key);
  if (idx >= 0) expandedMobileRows.value.splice(idx, 1);
  else expandedMobileRows.value.push(key);
};

const mobileFieldsAll = computed(() => {
  return visibleColumns.value.filter((c) =>
    c.name !== "actions" && !c.chip && c !== mobileTitleCol.value && c.name !== "uuid"
  );
});

const visibleMobileFields = (row) => {
  const rowKeyVal = row[props.rowKey];
  if (expandedMobileRows.value.includes(rowKeyVal)) return mobileFieldsAll.value;
  const sm = mobileFieldsAll.value.filter((c) =>
    !c.responsive || c.responsive.length === 0 || c.responsive.includes("sm")
  );
  const others = mobileFieldsAll.value.filter((c) => !sm.includes(c));
  return [...sm, ...others].slice(0, 5);
};

const hiddenMobileCount = (row) => {
  const rowKeyVal = row[props.rowKey];
  if (expandedMobileRows.value.includes(rowKeyVal)) return 0;
  return Math.max(0, mobileFieldsAll.value.length - 5);
};

const mobilePage = ref(1);
const mobileRowsPerPage = 10;
const mobileSortBy = ref(null);
const mobileSortDesc = ref(false);

const sortableColumns = computed(() =>
  visibleColumns.value.filter((c) => c.name !== "actions" && c.sortable !== false)
);

const filterableColumns = computed(() =>
  visibleColumns.value.filter((c) => c.name !== "actions")
);

const openColFilterMobile = (col) => {
  activeFilterCol.value = col;
  colFilterSearch.value = "";
  colFilterMenu.value = true;
};

watch(() => filteredRows.value.length, () => {
  mobilePage.value = 1;
});

const cellValue = (col, row) => {
  if (!col || !row) return "";
  const raw = typeof col.field === "function" ? col.field(row) : row[col.field];
  return raw;
};

const sortedMobileRows = computed(() => {
  if (!mobileSortBy.value) return filteredRows.value;
  const col = mobileSortBy.value;
  const dir = mobileSortDesc.value ? -1 : 1;
  return [...filteredRows.value].sort((a, b) => {
    const va = cellValue(col, a);
    const vb = cellValue(col, b);
    if (va == null) return 1;
    if (vb == null) return -1;
    if (typeof va === "string") return va.localeCompare(String(vb || "")) * dir;
    return (va - vb) * dir;
  });
});

const paginatedMobileRows = computed(() => {
  const start = (mobilePage.value - 1) * mobileRowsPerPage;
  return sortedMobileRows.value.slice(start, start + mobileRowsPerPage);
});

const mobileTotalPages = computed(() =>
  Math.max(1, Math.ceil(filteredRows.value.length / mobileRowsPerPage))
);

const getChipTextColor = (col, row) => {
  if (col.chipTextColor) return typeof col.chipTextColor === "function" ? col.chipTextColor(row) : col.chipTextColor;
  return "white";
};

const resizing = ref(null);
const resizeStartX = ref(0);
const resizeStartW = ref(0);

const startColResize = (e) => {
  const th = e.target.closest("th");
  if (!th) return;
  resizing.value = th;
  resizeStartX.value = e.clientX;
  resizeStartW.value = th.offsetWidth;
  document.addEventListener("mousemove", onResizeMove);
  document.addEventListener("mouseup", onResizeEnd);
  document.body.style.cursor = "col-resize";
  document.body.style.userSelect = "none";
};

const onResizeMove = (e) => {
  if (!resizing.value) return;
  const w = Math.max(50, resizeStartW.value + e.clientX - resizeStartX.value);
  resizing.value.style.width = w + "px";
  resizing.value.style.minWidth = w + "px";
};

const onResizeEnd = () => {
  document.removeEventListener("mousemove", onResizeMove);
  document.removeEventListener("mouseup", onResizeEnd);
  document.body.style.cursor = "";
  document.body.style.userSelect = "";
  resizing.value = null;
};
</script>

<style lang="scss" scoped>
.st-root { width: 100%; }
.st-toolbar { flex-shrink: 0; }

.st-search-input :deep(.q-field__control) {
  border-radius: 10px;
  background: var(--color-background-alt);
  transition: all var(--transition-fast);

  &:before { border-color: transparent !important; }
  &:after { border-color: var(--color-primary) !important; }

  &:hover { background: var(--color-border-light); }
}

.st-table-card {
  background: var(--color-surface);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.st-table-card-mobile {
  background: transparent;
  border: none;
  box-shadow: none;
  border-radius: 0;
  overflow: visible;
}

.st-table-wrapper :deep(.q-table) {
  border-radius: 0;
  border: none;

  td {
    font-size: var(--font-size-base);
    color: var(--color-text-primary);
    border-bottom: 1px solid var(--color-divider);
    padding: 10px 14px;
    background: transparent !important;
    vertical-align: middle;
  }

  tbody tr {
    transition: background var(--transition-fast);

    &:last-child td { border-bottom: none; }

    &:hover td { background: var(--color-primary-surface) !important; }
  }

  .q-table__middle { overflow-x: auto; overflow-y: visible; }

  .q-table__bottom {
    border-top: 1px solid var(--color-border);
    padding: 8px 16px;
    background: transparent;
    min-height: 48px;
  }
}

.st-table-card :deep(th) {
  background: var(--color-background-alt) !important;
  color: var(--color-text-secondary) !important;
  border-bottom: 1px solid var(--color-border);
  font-size: var(--font-size-base);
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: none;
  white-space: nowrap;
  user-select: none;
  padding: 10px 14px !important;
}

.st-table-card :deep(.q-table__top),
.st-table-card :deep(.q-table__top-row) {
  display: none;
}

.st-th-inner {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  vertical-align: middle;
  max-width: 100%;

  span { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
}

.st-th-native :deep(.q-table__sort-icon) {
  display: inline-flex;
  vertical-align: middle;
  font-size: 16px;
  opacity: 0.4;
  margin-right: 4px;
  transition: opacity var(--transition-fast);
}

.st-th-native :deep(.q-table__sort-icon--active) {
  opacity: 0.9;
}

.st-filter-icon {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: color var(--transition-fast);
  &:hover { color: var(--color-primary); }
}

.filter-active { color: var(--color-primary) !important; }

.st-resize-grip {
  position: absolute;
  right: 0; top: 0; bottom: 0;
  width: 5px;
  cursor: col-resize;
  z-index: 2;
  &:hover, &:active { background: var(--color-primary); opacity: 0.15; }
}

.st-chip {
  border-radius: 6px !important;
  padding: 4px 12px !important;
  font-size: inherit !important;
  font-weight: 500 !important;
  min-height: 26px;
  display: inline-flex !important;
  align-items: center;
}

.st-active-filters {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;

  :deep(.q-chip) {
    font-size: 13px;
    min-height: 28px;
  }
}

.st-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  text-align: center;
  color: var(--color-text-tertiary);
  width: 100%;
  grid-column: 1 / -1;

  .st-empty-title {
    font-size: 16px;
    font-weight: 500;
    color: var(--color-text-secondary);
    margin: 16px 0 4px;
  }
}

.st-skeleton {
  height: 40px;
  margin: 2px 0;
  border-radius: 6px;
  background: linear-gradient(90deg, var(--color-background-alt) 25%, var(--color-border-light) 50%, var(--color-background-alt) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  grid-column: 1 / -1;
}

.st-filter-popup {
  min-width: 220px;
  max-width: 300px;
  border-radius: 12px;
  border: 1px solid var(--color-border);
}

.st-filter-chips-mobile {
  .q-chip {
    font-size: 13px;
    padding: 6px 14px;
    min-height: 32px;
  }
}

.st-filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@include xs {
  .st-table-wrapper { padding: 0 8px 12px !important; }
  .st-toolbar { padding: 12px 12px 0 !important; flex-wrap: wrap; gap: 8px; }
  .st-toolbar :deep(.q-btn-dropdown) { font-size: 13px; }

  .st-table-wrapper :deep(th) { padding: 8px; }
  .st-table-wrapper :deep(td) { padding: 6px 8px; font-size: 12.5px; }

  .st-mobile-card-body { grid-template-columns: 1fr; }
}

.st-mobile-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
  gap: 10px;
  padding: 8px 0;
  width: 100%;
}

.st-mobile-controls :deep(.q-field__control) {
  border-radius: 10px;
  font-size: 13px;
}

.st-search-input-mobile {
  max-width: 100% !important;
}

.st-mobile-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: box-shadow var(--transition-fast);
}

.st-mobile-card:active {
  box-shadow: var(--shadow-md);
}

.st-mobile-card-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
  cursor: pointer;
  user-select: none;
}

.st-mobile-chip-label {
  font-size: 10px;
  opacity: 0.7;
  font-weight: 400;
  margin-right: 2px;
}

.st-mobile-chip {
  font-size: 12px !important;
  padding: 4px 10px !important;
  min-height: 24px;
  font-weight: 500;
}

.st-mobile-card-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 16px;
}

.st-mobile-field {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.st-mobile-field-label {
  font-size: 11px;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  font-weight: 600;
}

.st-mobile-field-value {
  font-size: 13px;
  color: var(--color-text-primary);
  word-break: break-word;
}

.st-mobile-card-actions {
  display: flex;
  gap: 4px;
  justify-content: flex-end;
  padding-top: 4px;
  border-top: 1px solid var(--color-divider);
}

.st-mobile-card-show-more {
  padding: 2px 0 0;
}

.st-mobile-card-expanded .st-mobile-card-body {
  max-height: none;
  overflow: visible;
}

.st-mobile-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px 0 4px;
  grid-column: 1 / -1;
}

.st-mobile-skeleton {
  height: 100px;
  border-radius: 12px;
  background: linear-gradient(90deg, var(--color-background-alt) 25%, var(--color-border-light) 50%, var(--color-background-alt) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  grid-column: 1 / -1;
}

.st-mobile-error {
  margin-top: 8px;
  grid-column: 1 / -1;
}
</style>

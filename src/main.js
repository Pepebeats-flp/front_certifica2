import { createApp } from "vue";
import { createPinia } from "pinia";
import { Quasar, Notify } from "quasar";
import quasarLang from "quasar/lang/es";
import VueApexCharts from "vue3-apexcharts";

import "@quasar/extras/roboto-font/roboto-font.css";
import "@quasar/extras/material-icons/material-icons.css";

import "quasar/dist/quasar.css";

import "./styles/app.sass";

import App from "./App.vue";
import router from "./router";
import "./firebase";

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.use(Quasar, {
  plugins: { Notify },
  lang: quasarLang,
  config: {
    brand: {
      primary: "#b91c1c",
      secondary: "#dc2626",
      accent: "#f59e0b",
      dark: "#1a1a1a",
      "dark-page": "#0f0f0f",
      positive: "#16a34a",
      negative: "#dc2626",
      info: "#0ea5e9",
      warning: "#f59e0b",
    },
    notify: {
      position: "top-right",
      timeout: 3000,
      actions: [{ icon: "close", color: "white", round: true }],
    },
  },
});

app.component("apexchart", VueApexCharts);

app.mount("#app");

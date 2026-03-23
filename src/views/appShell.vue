<template>
  <q-layout view="lhr lpR lfr" class="bg_img">
    <q-header bordered class="bg-primary text-white">
      <q-toolbar class="bg_bar">
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          {{ route.meta.desc }}
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" side="left" overlay bordered behavior="mobile" class="text-white">
      <!-- drawer content -->
      <q-scroll-area class="fit nav_bar">
        <q-list padding class="menu-list">
          <q-item>
            <q-item-section avatar>
              <q-icon name="svguse:/images/google_logo.svg#google"></q-icon>
            </q-item-section>
            <q-item-section> {{ name }} </q-item-section>
          </q-item>
          <q-separator dark spaced />
          <q-item v-if="showMenu()" clickable v-ripple active-class="tab-active" to="/home">
            <q-item-section avatar>
              <q-icon name="home"></q-icon>
            </q-item-section>

            <q-item-section> Inicio </q-item-section>
          </q-item>
          <q-expansion-item v-if="showMenu()" expand-separator icon="directions_bike" label="Estado General">
            <q-item clickable v-ripple active-class="tab-active" to="/estadog">
              <q-item-section avatar>
                <q-icon name="chevron_right"></q-icon>
              </q-item-section>
              <q-item-section> Certificación</q-item-section>
            </q-item>
            <q-item clickable v-ripple active-class="tab-active" to="/estadogP">
              <q-item-section avatar>
                <q-icon name="chevron_right"></q-icon>
              </q-item-section>
              <q-item-section> Programación</q-item-section>
            </q-item>
            <q-item v-if="!dtpm" clickable v-ripple active-class="tab-active" to="/estadogR">
              <q-item-section avatar>
                <q-icon name="chevron_right"></q-icon>
              </q-item-section>
              <q-item-section> Reprograma</q-item-section>
            </q-item>
          </q-expansion-item>

          <q-expansion-item v-if="showMenu()" expand-separator icon="engineering" label="Inspección Técnica">
            <q-item clickable v-ripple active-class="tab-active" to="/inspec">
              <q-item-section avatar>
                <q-icon name="chevron_right"></q-icon>
              </q-item-section>
              <q-item-section> Certificación</q-item-section>
            </q-item>
            <q-item clickable v-ripple active-class="tab-active" to="/inspecP">
              <q-item-section avatar>
                <q-icon name="chevron_right"></q-icon>
              </q-item-section>
              <q-item-section> Programación</q-item-section>
            </q-item>
          </q-expansion-item>
          <q-expansion-item v-if="showMenu()" expand-separator icon="checklist" label="Revisión Documental">
            <q-item clickable v-ripple active-class="tab-active" to="/revdocP">
              <q-item-section avatar>
                <q-icon name="chevron_right"></q-icon>
              </q-item-section>
              <q-item-section> Mantenimiento Preventivo</q-item-section>
            </q-item>
            <q-item clickable v-ripple active-class="tab-active" to="/revdocC">
              <q-item-section avatar>
                <q-icon name="chevron_right"></q-icon>
              </q-item-section>
              <q-item-section> Mantenimiento Correctivo</q-item-section>
            </q-item>
            <q-item clickable v-ripple active-class="tab-active" to="/revdocT">
              <q-item-section avatar>
                <q-icon name="chevron_right"></q-icon>
              </q-item-section>
              <q-item-section> Revisión Técnica</q-item-section>
            </q-item>
            <q-item clickable v-ripple active-class="tab-active" to="/revdocI">
              <q-item-section avatar>
                <q-icon name="chevron_right"></q-icon>
              </q-item-section>
              <q-item-section> Incidentes</q-item-section>
            </q-item>
          </q-expansion-item>
          <q-expansion-item v-if="showMenu('trasp')" expand-separator icon="verified_user" label="Inspección Traspaso">
            <q-item clickable v-ripple active-class="tab-active" to="/trasp">
              <q-item-section avatar>
                <q-icon name="chevron_right"></q-icon>
              </q-item-section>
              <q-item-section> Menor</q-item-section>
            </q-item>
            <q-item clickable v-ripple active-class="tab-active" to="/traspM">
              <q-item-section avatar>
                <q-icon name="chevron_right"></q-icon>
              </q-item-section>
              <q-item-section> Mayor</q-item-section>
            </q-item>
          </q-expansion-item>
          <q-expansion-item v-if="showMenu('traspn')" expand-separator icon="verified_user" label="Inspección Traspaso">
            <q-item clickable v-ripple active-class="tab-active" to="/traspN">
              <q-item-section avatar>
                <q-icon name="chevron_right"></q-icon>
              </q-item-section>
              <q-item-section> Menor</q-item-section>
            </q-item>
            <q-item clickable v-ripple active-class="tab-active" to="/traspM">
              <q-item-section avatar>
                <q-icon name="chevron_right"></q-icon>
              </q-item-section>
              <q-item-section> Mayor</q-item-section>
            </q-item>
          </q-expansion-item>
          <q-item v-if="showMenu()" clickable v-ripple active-class="tab-active" to="/repres">
            <q-item-section avatar>
              <q-icon name="hail"></q-icon>
            </q-item-section>

            <q-item-section> Registro Presencial </q-item-section>
          </q-item>
          <q-item v-if="showMenu()" clickable v-ripple active-class="tab-active" to="/hojav">
            <q-item-section avatar>
              <q-icon name="directions_bus"></q-icon>
            </q-item-section>

            <q-item-section> Hoja Vida</q-item-section>
          </q-item>
          <q-expansion-item expand-separator icon="sos" label="Gestión Soporte Local">
            <q-item clickable v-ripple active-class="tab-active" to="/soplocRu">
              <q-item-section avatar>
                <q-icon name="chevron_right"></q-icon>
              </q-item-section>
              <q-item-section> Solicitud Repuestos</q-item-section>
            </q-item>
            <q-item clickable v-ripple active-class="tab-active" to="/soplocRa">
              <q-item-section avatar>
                <q-icon name="chevron_right"></q-icon>
              </q-item-section>
              <q-item-section> Solicitud Reparación</q-item-section>
            </q-item>
            <q-item clickable v-ripple active-class="tab-active" to="/soplocD">
              <q-item-section avatar>
                <q-icon name="chevron_right"></q-icon>
              </q-item-section>
              <q-item-section> Solicitud Diagnóstico</q-item-section>
            </q-item>
          </q-expansion-item>
          <q-item v-if="showMenu()" clickable v-ripple active-class="tab-active" to="/docu">
            <q-item-section avatar>
              <q-icon name="policy"></q-icon>
            </q-item-section>

            <q-item-section>Documentos</q-item-section>
          </q-item>
          <q-item v-if="showMenu()" clickable v-ripple active-class="tab-active" to="/info">
            <q-item-section avatar>
              <q-icon name="description"></q-icon>
            </q-item-section>

            <q-item-section>Informes</q-item-section>
          </q-item>
          <q-expansion-item v-if="showMenu()" expand-separator icon="leaderboard" label="Indicadores">
            <q-item clickable v-ripple active-class="tab-active" to="/indE">
              <q-item-section avatar>
                <q-icon name="chevron_right"></q-icon>
              </q-item-section>
              <q-item-section>Estado Certificación</q-item-section>
            </q-item>
            <q-item v-if="!dtpm" clickable v-ripple active-class="tab-active" to="/indI">
              <q-item-section avatar>
                <q-icon name="chevron_right"></q-icon>
              </q-item-section>
              <q-item-section> Incumplimiento</q-item-section>
            </q-item>
          </q-expansion-item>
          <q-expansion-item v-if="showMenu()" expand-separator icon="place" label="Seguimiento">
            <q-item clickable v-ripple active-class="tab-active" to="/sinop">
              <q-item-section avatar>
                <q-icon name="chevron_right"></q-icon>
              </q-item-section>
              <q-item-section>Sinoptico</q-item-section>
            </q-item>
          </q-expansion-item>
          <q-item v-if="showMenu()" clickable v-ripple active-class="tab-active" :href="dashboard_link" target="_blank">
            <q-item-section avatar>
              <q-icon name="dashboard"></q-icon>
            </q-item-section>

            <q-item-section> Dashboard</q-item-section>
          </q-item>
          <q-item class="justify-center">
            <q-btn class="q-ma-md" color="black" label="Cerrar Sesión" to="/logout" />
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>
    <q-page-container>
      <router-view></router-view>
    </q-page-container>

    <q-footer bordered class="bg-grey-1">
      <q-toolbar>
        <q-toolbar-title class="text-right">
          <q-badge text-color="white">
            <q-icon name="spa" size="20px" />
            {{ version }}
          </q-badge>
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { ref, onUnmounted } from "vue";
import { useUserStore } from "@/store/userStore";
import { useEstadogStore } from "@/store/estadogStore";
import { useEstadogpStore } from "@/store/estadogpStore";
import { useInspecStore } from "@/store/inspecStore";
import { useInspecpStore } from "@/store/inspecpStore";
import { useMprevStore } from "@/store/mprevStore";
import { useMcorrStore } from "@/store/mcorrStore";
import { useIncideStore } from "@/store/incideStore";
import { useRevtecStore } from "@/store/revtecStore";
import { useInfoStore } from "@/store/infoStore";
import { useSdiagStore } from "@/store/sdiagStore";
import { useSrepaStore } from "@/store/srepaStore";
import { useSrepuStore } from "@/store/srepuStore";
import { usePosicionStore } from "@/store/posicionStore";
import { useIncpStore } from "@/store/incpStore";
import { useRepresStore } from "@/store/represStore";
import { useIndicadorStore } from "@/store/indicaStore";
import { useTraspStore } from "@/store/traspStore";
import { useTraspmStore } from "@/store/traspmStore";

import { useRoute } from "vue-router";
import { dashboard_link, client } from "@/client";

// eslint-disable-next-line no-undef
const version = __APP_VERSION__;
const route = useRoute();
const leftDrawerOpen = ref(false);
const { name, dtpm, carro, binduser, unbinduser } = useUserStore();

const { bind: bindest, unbind: unbindest, bind_p: bindest_p, unbind_p: unbindest_p } = useEstadogStore();
const { bind: bindestp, unbind: unbindestp } = useEstadogpStore();

const { bind: bindinsp, unbind: unbindinsp } = useInspecStore();
const { bind: bindinspp, unbind: unbindinspp } = useInspecpStore();

const { bind: bindprev, unbind: unbindprev } = useMprevStore();
const { bind: bindcorr, unbind: unbindcorr } = useMcorrStore();
const { bind: bindinc, unbind: unbindinc } = useIncideStore();
const { bind: bindtec, unbind: unbindtec } = useRevtecStore();

const { bind: binddiag, unbind: unbinddiag } = useSdiagStore();
const { bind: bindrepa, unbind: unbindrepa } = useSrepaStore();
const { bind: bindrepu, unbind: unbindrepu } = useSrepuStore();

const { bind: bindinfo, unbind: unbindinfo } = useInfoStore();
const { bind: bindposicion, unbind: unbindposicion } = usePosicionStore();

const { bind: bindincp, unbind: unbindincp } = useIncpStore();
const { bind: bindrepres, unbind: unbindrepres } = useRepresStore();

const { bind: bindindica, unbind: unbindindica } = useIndicadorStore();
const { bind: bindtrasp, unbind: unbindtrasp } = useTraspStore();
const { bind: bindtraspm, unbind: unbindtraspm } = useTraspmStore();

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

const showMenu = (menu) => {
  if (carro) return false;
  if (menu === "trasp" && !["subus"].includes(client)) return false;
  if (menu === "traspn" && !["conecta", "voy", "granamericas"].includes(client)) return false;
  else return true;
};

if (!carro) {
  bindindica();
  bindest();
  bindestp();
  bindest_p();
  bindinsp();
  bindinspp();
  bindinfo();
  bindposicion();
  bindtec();
  bindinc();
  bindprev();
  bindcorr();
  bindincp();
  bindrepres();
}
if (["voy", "subus", "conecta", "granamericas"].includes(client)) {
  bindtrasp();
  bindtraspm();
}

//General (perfil carroceria tiene acceso a Repuesto, Reparación y Diagnostico)
bindrepu();
bindrepa();
binddiag();
binduser();

onUnmounted(() => {
  unbindest();
  unbindestp();
  unbindest_p();
  unbindinsp();
  unbindinspp();
  unbindprev();
  unbindcorr();
  unbindinc();
  unbindtec();
  unbindinfo();
  unbinddiag();
  unbindrepa();
  unbindrepu();
  unbindposicion();
  unbindincp();
  unbindrepres();
  unbindindica();
  unbindtrasp();
  unbindtraspm();
  unbinduser();
});
</script>
<style lang="scss" scoped>
.bg_bar {
  background: url("/images/appbar.webp");
  background-repeat: no-repeat;
  //background-position: 0% 50%;
}
.nav_bar {
  background: url("/images/navbar.webp");
  background-repeat: no-repeat;
  //background-position: 0% 0%;
  background-size: cover;
}
.bg_img {
  background-image: url("/images/washi.webp");
  height: 100%;
}
.tab-active {
  background-color: rgba(255, 255, 255, 0.25); //semi-transparent white
}
</style>

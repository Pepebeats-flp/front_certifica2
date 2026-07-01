<template>
  <div class="login-root flex flex-center">
    <div class="login-card q-pa-md q-pb-xl">
      <div class="text-center q-mb-lg">
        <q-icon name="directions_bus" size="48px" class="text-primary q-mb-md" />
        <div class="text-h4 text-weight-bold">Certifica</div>
        <div class="text-subtitle1 text-grey-6 q-mt-sm">Sistema de gestion de flota</div>
      </div>

      <div class="q-gutter-md q-mt-lg">
        <q-btn
          unelevated color="dark"
          label="Iniciar con Google"
          icon="img:/images/google_logo.svg"
          class="full-width login-btn"
          @click="login"
        />
        <q-btn
          outline color="primary"
          label="Iniciar con Email"
          icon="mail"
          class="full-width login-btn"
          @click="dialog = true"
        />
      </div>

      <div class="text-center q-mt-lg">
        <span class="text-caption text-grey-6">Acceso exclusivo @SLARED.CL</span>
      </div>
    </div>

    <q-dialog v-model="dialog" transition-show="scale" transition-hide="scale">
      <q-card style="width: 380px; max-width: 90vw" class="radius-lg">
        <q-card-section class="q-pb-none">
          <div class="text-h6 text-weight-medium">Iniciar sesión</div>
        </q-card-section>
        <q-form @submit="login_email" autocomplete="off">
          <q-card-section class="q-gutter-md">
            <q-input
              v-model="email" label="Email" type="email" outlined
              :rules="[(val) => (val && val.length > 0) || 'Requerido', (val) => /.+@SLARED\.CL$/.test(val.toUpperCase()) || 'Debe ser @slared.cl']"
              input-class="text-uppercase" :readonly="submited" lazy-rules
            >
              <template #prepend><q-icon name="person" /></template>
            </q-input>
            <q-input
              v-model="password" label="Contraseña" :type="isPwd ? 'password' : 'text'" outlined
              :rules="[(val) => (val && val.length > 0) || 'Requerido']" :readonly="submited" lazy-rules
            >
              <template #prepend><q-icon name="key" /></template>
              <template #append>
                <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="isPwd = !isPwd" />
              </template>
            </q-input>
          </q-card-section>
          <q-card-actions align="right" class="q-px-md q-pb-md">
            <q-btn flat label="Cancelar" color="grey" v-close-popup :disable="submited" />
            <q-btn unelevated label="Iniciar" type="submit" color="primary" :loading="submited" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { useUserStore } from "@/store/userStore";
import { signInWithPopup, GoogleAuthProvider, browserPopupRedirectResolver, signInWithEmailAndPassword } from "firebase/auth";
import { ref } from "vue";
import { useQuasar } from "quasar";
import { client } from "@/client";
import { useRouter } from "vue-router";
import { auth } from "@/firebase";

const { setuser } = useUserStore();
const { notify } = useQuasar();
const dialog = ref(false);
const email = ref(null);
const password = ref(null);
const submited = ref(false);
const isPwd = ref(true);
const router = useRouter();

const login = () => {
  signInWithPopup(auth, new GoogleAuthProvider(), browserPopupRedirectResolver)
    .then((authResult) => {
      authResult.user.getIdTokenResult().then((tokenResult) => {
        if (tokenResult.claims.allow_access) {
          setuser({ uid: authResult.user.uid, name: authResult.user.displayName, only_view: false, admin: tokenResult.claims.allow_admin ? true : false });
          router.push({ name: "home" });
        } else router.push({ name: "noaccess" });
      });
    })
    .catch(console.log);
};

const login_email = () => {
  submited.value = true;
  signInWithEmailAndPassword(auth, email.value, password.value)
    .then((authResult) => {
      authResult.user.getIdTokenResult().then((tokenResult) => {
        if (tokenResult.claims[client] || tokenResult.claims.dtpm) {
          setuser({ uid: authResult.user.uid, name: email.value, only_view: true, admin: false,
            dtpm: tokenResult.claims.dtpm ? true : false, sumi: tokenResult.claims.sumi ? true : false,
            srepu: tokenResult.claims.srepu ? true : false, srepa: tokenResult.claims.srepa ? true : false,
            sdiag: tokenResult.claims.sdiag ? true : false, carro: tokenResult.claims.carro ? true : false });
          if (tokenResult.claims.carro) router.push({ name: "soploc_listru" });
          else router.push({ name: "home" });
        } else router.push({ name: "noaccess" });
      });
    })
    .catch(() => {
      submited.value = false;
      notify({ color: "negative", icon: "error", message: "Usuario o contraseña inválido." });
    });
};
</script>

<style lang="scss" scoped>
.login-root { min-height: 100vh; background: var(--color-background); padding: 16px; }
.login-card { width: 420px; max-width: 92vw; }
.login-btn { min-height: 52px; border-radius: 12px; font-size: 15px; font-weight: 500; }
.login-btn :deep(.q-btn__content) { gap: 10px; }
.google-icon { flex-shrink: 0; }
.radius-lg { border-radius: 12px; }

@include xs {
  .login-root { padding: 12px; }
  .login-card { width: 100%; max-width: 100%; }
  .login-btn { min-height: 56px; font-size: 14px; }
}
</style>

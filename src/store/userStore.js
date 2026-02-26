import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { client } from "@/client";
import { useRouter } from "vue-router";
import { auth } from "@/firebase";

export const useUserStore = defineStore("userStore", () => {
  const uid = useStorage("uid", null);
  const name = useStorage("name", null);
  const only_view = useStorage("only_view", false);
  const admin = useStorage("admin", false);
  const dtpm = useStorage("dtpm", false);
  const sumi = useStorage("sumi", false);
  const srepu = useStorage("srepu", false);
  const srepa = useStorage("srepa", false);
  const sdiag = useStorage("sdiag", false);
  const carro = useStorage("carro", false);

  let unsubscribe = () => {};
  const router = useRouter();

  const setuser = (payload) => {
    uid.value = payload.uid;
    name.value = payload.name;
    only_view.value = payload.only_view;
    admin.value = payload.admin;
    dtpm.value = payload.dtpm;
    sumi.value = payload.sumi;
    srepu.value = payload.srepu;
    srepa.value = payload.srepa;
    sdiag.value = payload.sdiag;
    carro.value = payload.carro;
  };
  const clearuser = () => {
    uid.value = null;
    name.value = null;
    only_view.value = null;
    admin.value = null;
    dtpm.value = null;
    sumi.value = null;
    srepu.value = null;
    srepa.value = null;
    sdiag.value = null;
    carro.value = null;
    signOut(auth);
    setTimeout(() => router.push({ name: "login" }), 4000);
  };
  const binduser = () => {
    unsubscribe(); //Limpia subscripciones previas
    unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        user
          .getIdTokenResult()
          .then((tokenResult) => {
            if (!tokenResult.claims.allow_access && !tokenResult.claims[client] && !tokenResult.claims.dtpm) clearuser();
          })
          .catch(() => {});
      } else clearuser();
    });
  };
  const unbinduser = () => unsubscribe();

  return {
    uid,
    name,
    only_view,
    admin,
    dtpm,
    sumi,
    srepu,
    srepa,
    sdiag,
    carro,
    setuser,
    clearuser,
    binduser,
    unbinduser,
  };
});

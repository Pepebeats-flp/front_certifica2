import { defineStore } from "pinia";
import { unidad_negocio_arr } from "@/client";
import { ref } from "vue";
import { db } from "@/firebase";
import { doc, collection, query, where, onSnapshot, getDocFromCache } from "firebase/firestore";
export const useIndicadorStore = defineStore("indicadorStore", () => {
  const m_indicador_change = ref(0);
  let unsubscribe = () => {};

  const getindicador = async (payload) => {
    const docRef = await getDocFromCache(doc(db, "indicador", payload.uuid));
    return docRef.data();
  };
  const bind = () => {
    unsubscribe(); //Limpia subscripciones previas
    const q = query(collection(db, "indicador"), where("unidad_negocio", "in", unidad_negocio_arr));
    unsubscribe = onSnapshot(q, () => {
      m_indicador_change.value++;
    });
  };
  const unbind = () => unsubscribe();
  return {
    m_indicador_change,
    getindicador,
    bind,
    unbind,
  };
});

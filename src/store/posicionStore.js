import { defineStore } from "pinia";
import { unidad_negocio_arr } from "@/client";
import { ref } from "vue";
import { db } from "@/firebase";
import { collection, query, where, onSnapshot, getDocsFromCache } from "firebase/firestore";
export const usePosicionStore = defineStore("posicionStore", () => {
  const m_posicion_change = ref(0);
  let unsubscribe = () => {};

  const getall = async () => {
    const q = query(collection(db, "posicion"));
    const docsRef = await getDocsFromCache(q);
    let docs = new Map();
    for (const doc of docsRef.docs) {
      const data = doc.data();
      docs = new Map(Object.entries(data.values));
    }
    return docs;
  };
  const bind = () => {
    unsubscribe(); //Limpia subscripciones previas
    const q = query(collection(db, "posicion"), where("unidad_negocio", "in", unidad_negocio_arr));
    unsubscribe = onSnapshot(q, () => {
      m_posicion_change.value++;
    });
  };
  const unbind = () => unsubscribe();
  return {
    m_posicion_change,
    getall,
    bind,
    unbind,
  };
});

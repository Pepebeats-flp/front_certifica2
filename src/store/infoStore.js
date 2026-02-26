import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";
import { unidad_negocio_arr } from "@/client";
import { ref } from "vue";
import { db } from "@/firebase";
import { doc, setDoc, collection, query, where, onSnapshot, updateDoc, serverTimestamp, getDocsFromCache, orderBy, limit } from "firebase/firestore";
export const useInfoStore = defineStore("infoStore", () => {
  const m_informes_change = ref(0);
  let unsubscribe = () => {};
  //Timestamp debe comenzar con 0. Para garantizar cargar en cache todas las mediciones.
  const date = new Date(0);
  const timestamp = useStorage("informes_timestamp", date);

  const getall = async () => {
    const q = query(collection(db, "informes"), where("estado", "==", 1));
    const docsRef = await getDocsFromCache(q);
    const docs = [];
    for (const doc of docsRef.docs) {
      const data = doc.data();
      data.hasPendingWrites = doc.metadata.hasPendingWrites ? "NO" : "SI";
      docs.push(data);
    }
    return docs;
  };
  //Map por unidad de negocio (estado=1 Activo estado=3 Eliminado)
  const getlast = async () => {
    let last = null;
    const q = query(collection(db, "informes"), where("estado", "==", 1));
    const docsRef = await getDocsFromCache(q);
    for (const doc of docsRef.docs) {
      const data = doc.data();
      if (!last || last.fecha_creacion_timestamp < data.fecha_creacion_timestamp) last = data;
    }
    return last;
  };
  const add = (payload) => {
    payload.timestamp = serverTimestamp();
    setDoc(doc(db, "informes", payload.uuid), payload);
    m_informes_change.value++;
  };
  const update = (payload) => {
    payload.timestamp = serverTimestamp();
    updateDoc(doc(db, "informes", payload.uuid), payload);
    m_informes_change.value++;
  };
  const emptycache = async () => {
    const q = query(collection(db, "informes"), limit(1));
    const snap = await getDocsFromCache(q);
    return snap.empty;
  };
  const bind = async () => {
    unsubscribe(); //Limpia subscripciones previas
    //Si no hay nada en cache reiniciamos fecha. Pasa que no se tiene acceso a persistencia, queda en memoria
    //Pero la fecha queda guardada.. al refrescar no quedan datos
    const empty = await emptycache();
    if (empty) timestamp.value = date;

    const q = query(
      collection(db, "informes"),
      where("unidad_negocio", "in", unidad_negocio_arr),
      where("timestamp", ">", timestamp.value),
      orderBy("timestamp"),
    );
    unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let curr_timestamp = timestamp.value;
        snapshot.docChanges().forEach((change) => {
          const data = change.doc.data();
          if (data.timestamp && data.timestamp.toDate() > curr_timestamp) curr_timestamp = data.timestamp.toDate();
        });
        timestamp.value = curr_timestamp;
        m_informes_change.value++;
      },
      (error) => {
        //Permision denied (En algunos casos se elimnan los registros en cache de forma automatica)
        console.log(error);
        //timestamp.value = date;
      },
    );
  };
  const unbind = () => unsubscribe();
  return {
    m_informes_change,
    getall,
    getlast,
    add,
    update,
    bind,
    unbind,
  };
});

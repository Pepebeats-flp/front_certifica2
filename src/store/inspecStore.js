import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";
import { unidad_negocio_arr, client } from "@/client";
import { ref } from "vue";
import { db, functions } from "@/firebase";
import { httpsCallable } from "firebase/functions";
import { useRoute } from "vue-router";
import {
  doc,
  setDoc,
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  serverTimestamp,
  getDocsFromCache,
  getDocFromCache,
  orderBy,
  limit,
} from "firebase/firestore";
export const useInspecStore = defineStore("inspecStore", () => {
  const m_inspeccion_tecnica_change = ref(0);
  const m_inspeccion_tecnicad_change = ref(0);
  let unsubscribe = () => {};
  const date = new Date();
  date.setMonth(date.getMonth() - 7);
  const timestamp = useStorage("inspeccion_tecnica_timestamp", date);
  const route = useRoute();

  const getbyid = async (uuid) => {
    const docRef = await getDocFromCache(doc(db, "inspeccion_tecnica", uuid));
    return docRef.data();
  };
  const getall = async () => {
    const q = query(collection(db, "inspeccion_tecnica"));
    const docsRef = await getDocsFromCache(q);
    const docs = [];
    for (const doc of docsRef.docs) {
      const data = doc.data();
      if (data.estado === 3) continue; //No mostramos eliminados
      data.hasPendingWrites = doc.metadata.hasPendingWrites ? "NO" : "SI";
      docs.push(data);
    }
    return docs;
  };
  //Map por placa patente (finalizadas)
  const getlastf = async () => {
    const last = new Map();
    const q = query(collection(db, "inspeccion_tecnica"), where("estado", "==", 1));
    const docsRef = await getDocsFromCache(q);
    for (const doc of docsRef.docs) {
      const data = doc.data();
      if (!last.has(data.placa_patente) || last.get(data.placa_patente).fecha_termino_timestamp < data.fecha_termino_timestamp)
        last.set(data.placa_patente, data);
    }
    return last;
  };
  //Historico
  const gethistoric = async () => {
    try {
      const historic = httpsCallable(functions, "historic");
      const registros = await historic({
        client: client,
        collection: "inspeccion_tecnica",
      });
      return registros.data;
    } catch (error) {
      return [];
    }
  };
  const emptycache = async () => {
    const q = query(collection(db, "inspeccion_tecnica"), limit(1));
    const snap = await getDocsFromCache(q);
    return snap.empty;
  };
  const add = (payload) => {
    payload.timestamp = serverTimestamp();
    setDoc(doc(db, "inspeccion_tecnica", payload.uuid), payload);
    m_inspeccion_tecnica_change.value++;
  };
  const update = (payload) => {
    payload.timestamp = serverTimestamp();
    updateDoc(doc(db, "inspeccion_tecnica", payload.uuid), payload);
    m_inspeccion_tecnica_change.value++;
  };
  const bind = async () => {
    unsubscribe(); //Limpia subscripciones previas
    //Si no hay nada en cache reiniciamos fecha
    const empty = await emptycache();
    if (empty) timestamp.value = date;

    const q = query(
      collection(db, "inspeccion_tecnica"),
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
          if (route.params.uuid === data.uuid) m_inspeccion_tecnicad_change.value++;
        });
        timestamp.value = curr_timestamp;
        m_inspeccion_tecnica_change.value++;
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
    m_inspeccion_tecnica_change,
    m_inspeccion_tecnicad_change,
    getbyid,
    getall,
    getlastf,
    gethistoric,
    add,
    update,
    bind,
    unbind,
  };
});

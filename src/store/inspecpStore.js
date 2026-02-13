import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";
import { unidad_negocio_arr, client } from "@/client";
import { ref } from "vue";
import { db, functions } from "@/firebase";
import { httpsCallable } from "firebase/functions";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocsFromCache,
  orderBy,
  limit,
} from "firebase/firestore";
export const useInspecpStore = defineStore("inspecpStore", () => {
  const m_change = ref(0);
  let unsubscribe = () => {};
  const date = new Date();
  date.setMonth(date.getMonth() - 7);
  const timestamp = useStorage("inspeccion_tecnica_prog_timestamp", date);

  //Solo programaciones en proceso
  const getall = async () => {
    const q = query(
      collection(db, "inspeccion_tecnica_prog"),
      where("estado", "==", 0),
      where("fecha_inicio_timestamp", ">=", date.getTime() / 1000)
    );
    const docsRef = await getDocsFromCache(q);
    const docs = [];
    for (const doc of docsRef.docs) {
      const data = doc.data();
      data.hasPendingWrites = doc.metadata.hasPendingWrites ? "NO" : "SI";
      docs.push(data);
    }
    return docs;
  };
  //Solo programaciones en proceso
  const getppu = async (placa_patente) => {
    const q = query(
      collection(db, "inspeccion_tecnica_prog"),
      where("estado", "==", 0),
      where("placa_patente", "==", placa_patente)
    );
    const docsRef = await getDocsFromCache(q);
    if (docsRef.empty) return null;
    else return docsRef.docs[0].data();
  };

  //Historico
  const gethistoric = async () => {
    try {
      const historic = httpsCallable(functions, "historic");
      const registros = await historic({
        client: client,
        collection: "inspeccion_tecnica_prog",
      });
      return registros.data;
    } catch (error) {
      return [];
    }
  };
  const emptycache = async () => {
    const q = query(collection(db, "inspeccion_tecnica_prog"), limit(1));
    const snap = await getDocsFromCache(q);
    return snap.empty;
  };
  const bind = async () => {
    //Si no hay nada en cache reiniciamos fecha. Pasa que no se tiene acceso a persistencia, queda en memoria
    //Pero la fecha queda guardada.. al refrescar no quedan datos
    const empty = await emptycache();
    if (empty) timestamp.value = date;

    const q = query(
      collection(db, "inspeccion_tecnica_prog"),
      where("unidad_negocio", "in", unidad_negocio_arr),
      where("timestamp", ">", timestamp.value),
      orderBy("timestamp")
    );
    unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let curr_timestamp = timestamp.value;
        snapshot.docChanges().forEach((change) => {
          const data = change.doc.data();
          if (data.timestamp && data.timestamp.toDate() > curr_timestamp)
            curr_timestamp = data.timestamp.toDate();
        });
        timestamp.value = curr_timestamp;
        m_change.value++;
      },
      (error) => {
        //Permision denied (En algunos casos se elimnan los registros en cache de forma automatica)
        console.log(error);
        //timestamp.value = date;
      }
    );
  };
  const unbind = () => unsubscribe();

  return {
    m_change,
    getall,
    getppu,
    gethistoric,
    bind,
    unbind,
  };
});

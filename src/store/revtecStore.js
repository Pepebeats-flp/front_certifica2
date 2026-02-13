import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";
import { unidad_negocio_arr, client } from "@/client";
import { ref } from "vue";
import { db, functions } from "@/firebase";
import { httpsCallable } from "firebase/functions";
import { collection, query, where, onSnapshot, doc, writeBatch, serverTimestamp, getDocsFromCache, orderBy, limit } from "firebase/firestore";
export const useRevtecStore = defineStore("revtecStore", () => {
  const m_rev_tecnica_change = ref(0);
  let unsubscribe = () => {};
  //Timestamp debe comenzar con 0. Para garantizar cargar en cache todas las mediciones.
  const date = new Date(0);
  const timestamp = useStorage("rev_tec_timestamp", date);

  const bset = async (payload) => {
    let batch = writeBatch(db);
    let count = 0;
    for (const value of payload.values()) {
      const docRef = doc(collection(db, "revision_tecnica"));
      value.uuid = docRef.id;
      value.timestamp = serverTimestamp();
      batch.set(docRef, value);
      if (++count >= 500) {
        await batch.commit();
        batch = writeBatch(db);
        count = 0;
      }
    }
    await batch.commit();
    m_rev_tecnica_change.value++;
  };
  //Ultimo mes
  const getall = async () => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    date.setDate(1); //Primer dia del mes
    const q = query(collection(db, "revision_tecnica"), where("crt_apertura_timestamp", ">=", date.getTime() / 1000));
    const docsRef = await getDocsFromCache(q);
    const docs = [];
    for (const doc of docsRef.docs) {
      const data = doc.data();
      data.hasPendingWrites = doc.metadata.hasPendingWrites ? "NO" : "SI";
      docs.push(data);
    }
    return docs;
  };
  //Map por placa patente
  const getlast = async () => {
    const last = new Map();
    const q = query(collection(db, "revision_tecnica"));
    const docsRef = await getDocsFromCache(q);
    for (const doc of docsRef.docs) {
      const data = doc.data();
      if (!last.has(data.placa_patente) || last.get(data.placa_patente).crt_apertura_timestamp < data.crt_apertura_timestamp)
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
        collection: "revision_tecnica",
      });
      return registros.data;
    } catch (error) {
      return [];
    }
  };
  const emptycache = async () => {
    const q = query(collection(db, "revision_tecnica"), limit(1));
    const snap = await getDocsFromCache(q);
    return snap.empty;
  };

  const bind = async () => {
    //Si no hay nada en cache reiniciamos fecha
    const empty = await emptycache();
    if (empty) timestamp.value = date;

    const q = query(
      collection(db, "revision_tecnica"),
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
        m_rev_tecnica_change.value++;
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
    m_rev_tecnica_change,
    bset,
    getall,
    getlast,
    gethistoric,
    bind,
    unbind,
  };
});

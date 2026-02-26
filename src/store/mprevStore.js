import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";
import { unidad_negocio_arr, client } from "@/client";
import { ref } from "vue";
import { db, functions } from "@/firebase";
import { httpsCallable } from "firebase/functions";

import { collection, query, where, onSnapshot, doc, writeBatch, serverTimestamp, getDocsFromCache, orderBy, limit } from "firebase/firestore";
export const useMprevStore = defineStore("mprevStore", () => {
  const m_mant_prev_change = ref(0);
  let unsubscribe = () => {};
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  date.setDate(1); //Primer dia del mes
  const timestamp = useStorage("mant_prev_timestamp", date);

  const bupdate = async (payload) => {
    let batch = writeBatch(db);
    let count = 0;
    for (const [key, value] of payload) {
      value.timestamp = serverTimestamp();
      batch.update(doc(db, "mantenimiento_preventivo", key), value);
      if (++count >= 500) {
        await batch.commit();
        batch = writeBatch(db);
        count = 0;
      }
    }
    await batch.commit();
    m_mant_prev_change.value++;
  };
  const bset = async (payload) => {
    let batch = writeBatch(db);
    let count = 0;
    for (const value of payload.values()) {
      const docRef = doc(collection(db, "mantenimiento_preventivo"));
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
    m_mant_prev_change.value++;
  };
  const getall = async () => {
    const q = query(collection(db, "mantenimiento_preventivo"), where("ot_apertura_timestamp", ">=", date.getTime() / 1000));
    const docsRef = await getDocsFromCache(q);
    const docs = [];
    for (const doc of docsRef.docs) {
      const data = doc.data();
      data.hasPendingWrites = doc.metadata.hasPendingWrites ? "NO" : "SI";
      docs.push(data);
    }
    return docs;
  };
  //Incumplimientos
  const getinc = async () => {
    const q = query(
      collection(db, "mantenimiento_preventivo"),
      where("ot_apertura_timestamp", ">=", date.getTime() / 1000),
      where("resultado", "==", false),
      where("estado", "==", 1),
    );
    const docsRef = await getDocsFromCache(q);
    const incumple = new Set();
    for (const doc of docsRef.docs) {
      const data = doc.data();
      incumple.add(data.placa_patente); //Incumplimiento en el mes previo
    }
    return incumple;
  };
  //Historico
  const gethistoric = async () => {
    try {
      const historic = httpsCallable(functions, "historic");
      const registros = await historic({
        client: client,
        collection: "mantenimiento_preventivo",
      });
      return registros.data;
    } catch (error) {
      return [];
    }
  };
  const emptycache = async () => {
    const q = query(collection(db, "mantenimiento_preventivo"), limit(1));
    const snap = await getDocsFromCache(q);
    return snap.empty;
  };

  const bind = async () => {
    unsubscribe(); //Limpia subscripciones previas
    //Si no hay nada en cache reiniciamos fecha
    const empty = await emptycache();
    if (empty) timestamp.value = date;

    const q = query(
      collection(db, "mantenimiento_preventivo"),
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
        m_mant_prev_change.value++;
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
    m_mant_prev_change,
    bset,
    bupdate,
    getall,
    getinc,
    gethistoric,
    bind,
    unbind,
  };
});

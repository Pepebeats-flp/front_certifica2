import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";
import { unidad_negocio_arr, client } from "@/client";
import { ref } from "vue";
import { db, functions } from "@/firebase";
import { httpsCallable } from "firebase/functions";

import { collection, query, where, onSnapshot, doc, writeBatch, serverTimestamp, getDocsFromCache, orderBy, limit } from "firebase/firestore";
export const useIncideStore = defineStore("incideStore", () => {
  const m_incidente_change = ref(0);
  let unsubscribe = () => {};
  //Timestamp debe comenzar con 0. Para garantizar cargar en cache todos los datos
  const date = new Date(0);
  const timestamp = useStorage("incidente_timestamp", date);

  const bupdate = async (payload) => {
    let batch = writeBatch(db);
    let count = 0;
    for (const [key, value] of payload) {
      value.timestamp = serverTimestamp();
      batch.update(doc(db, "incidente", key), value);
      if (++count >= 500) {
        await batch.commit();
        batch = writeBatch(db);
        count = 0;
      }
    }
    await batch.commit();
    m_incidente_change.value++;
  };
  const bset = async (payload) => {
    let batch = writeBatch(db);
    let count = 0;
    for (const value of payload.values()) {
      const docRef = doc(collection(db, "incidente"));
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
    m_incidente_change.value++;
  };
  const getall = async () => {
    const q = query(collection(db, "incidente"));
    const docsRef = await getDocsFromCache(q);
    const docs = [];
    for (const doc of docsRef.docs) {
      const data = doc.data();
      data.hasPendingWrites = doc.metadata.hasPendingWrites ? "NO" : "SI";
      docs.push(data);
    }
    return docs;
  };
  //Map por placa patente (finalizadas)
  const getlasto = async () => {
    const last = new Map();
    const q = query(collection(db, "incidente"), where("estado", "==", 0));
    const docsRef = await getDocsFromCache(q);
    for (const doc of docsRef.docs) {
      const data = doc.data();
      if (!last.has(data.placa_patente) || last.get(data.placa_patente).fecha_inicio_timestamp < data.fecha_inicio_timestamp)
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
        collection: "incidente",
      });
      return registros.data;
    } catch (error) {
      return [];
    }
  };
  const emptycache = async () => {
    const q = query(collection(db, "incidente"), limit(1));
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
      collection(db, "incidente"),
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
        m_incidente_change.value++;
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
    m_incidente_change,
    bset,
    bupdate,
    getall,
    getlasto,
    gethistoric,
    bind,
    unbind,
  };
});

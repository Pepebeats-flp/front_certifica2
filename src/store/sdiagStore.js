import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";
import { useUserStore } from "@/store/userStore";
import { unidad_negocio_arr, client } from "@/client";
import { ref } from "vue";
import { db, functions } from "@/firebase";
import { httpsCallable } from "firebase/functions";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  writeBatch,
  serverTimestamp,
  getDocsFromCache,
  orderBy,
  setDoc,
  updateDoc,
  limit,
} from "firebase/firestore";
export const useSdiagStore = defineStore("sdiagStore", () => {
  const m_solicitud_diagnostico_change = ref(0);
  let unsubscribe = () => {};
  const date = new Date();
  date.setMonth(date.getMonth() - 2);
  date.setDate(1); //Primer dia del mes
  const timestamp = useStorage("solicitud_diagnostico_timestamp", date);
  const bset = async (payload) => {
    let batch = writeBatch(db);
    let count = 0;
    for (const value of payload.values()) {
      const docRef = doc(collection(db, "solicitud_diagnostico"));
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
    m_solicitud_diagnostico_change.value++;
    return true;
  };
  const add = async (payload) => {
    payload.timestamp = serverTimestamp();
    await setDoc(doc(db, "solicitud_diagnostico", payload.uuid), payload);
    m_solicitud_diagnostico_change.value++;
    return true;
  };
  const update = async (payload) => {
    payload.timestamp = serverTimestamp();
    await updateDoc(doc(db, "solicitud_diagnostico", payload.uuid), payload);
    m_solicitud_diagnostico_change.value++;
    return true;
  };
  const getall = async () => {
    const q = query(collection(db, "solicitud_diagnostico"), where("ot_solicitud_timestamp", ">=", date.getTime() / 1000));
    const docsRef = await getDocsFromCache(q);
    const docs = [];
    for (const doc of docsRef.docs) {
      const data = doc.data();
      data.hasPendingWrites = doc.metadata.hasPendingWrites ? "NO" : "SI";
      docs.push(data);
    }
    return docs;
  };
  //Historico
  const gethistoric = async () => {
    try {
      const historic = httpsCallable(functions, "historic");
      const registros = await historic({
        client: client,
        collection: "solicitud_diagnostico",
      });
      return registros.data;
    } catch (error) {
      return [];
    }
  };
  const emptycache = async () => {
    const q = query(collection(db, "solicitud_diagnostico"), limit(1));
    const snap = await getDocsFromCache(q);
    return snap.empty;
  };

  const bind = async () => {
    unsubscribe(); //Limpia subscripciones previas
    //Si no hay nada en cache reiniciamos fecha
    const empty = await emptycache();
    if (empty) timestamp.value = date;

    const { carro } = useUserStore();
    let q = "";
    if (carro)
      q = query(
        collection(db, "solicitud_diagnostico"),
        where("unidad_negocio", "in", unidad_negocio_arr),
        where("dominio", "==", "0"), //Carroceria
        where("timestamp", ">", timestamp.value),
        orderBy("timestamp"),
      );
    else
      q = query(
        collection(db, "solicitud_diagnostico"),
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
        m_solicitud_diagnostico_change.value++;
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
    m_solicitud_diagnostico_change,
    bset,
    add,
    update,
    getall,
    gethistoric,
    bind,
    unbind,
  };
});

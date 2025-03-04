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
} from "firebase/firestore";
export const useSrepaStore = defineStore("srepaStore", () => {
  const m_solicitud_reparacion_change = ref(0);
  let unsubscribe = () => {};
  const date = new Date();
  date.setMonth(date.getMonth() - 2);
  date.setDate(1); //Primer dia del mes
  const timestamp = useStorage("solicitud_reparacion_timestamp", date);
  const bset = async (payload) => {
    let batch = writeBatch(db);
    let count = 0;
    for (const value of payload.values()) {
      const docRef = doc(collection(db, "solicitud_reparacion"));
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
    m_solicitud_reparacion_change.value++;
  };
  const add = async (payload) => {
    payload.timestamp = serverTimestamp();
    await setDoc(doc(db, "solicitud_reparacion", payload.uuid), payload);
    m_solicitud_reparacion_change.value++;
    return true;
  };
  const update = async (payload) => {
    payload.timestamp = serverTimestamp();
    await updateDoc(doc(db, "solicitud_reparacion", payload.uuid), payload);
    m_solicitud_reparacion_change.value++;
    return true;
  };
  const getall = async () => {
    const q = query(
      collection(db, "solicitud_reparacion"),
      where("ot_solicitud_timestamp", ">=", date.getTime() / 1000)
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
  //Historico
  const gethistoric = async () => {
    try {
      const historic = httpsCallable(functions, "historic");
      const registros = await historic({
        client: client,
        collection: "solicitud_reparacion",
      });
      return registros.data;
    } catch (error) {
      return [];
    }
  };
  const bind = () => {
    const { carro } = useUserStore();
    let q = "";
    if (carro)
      q = query(
        collection(db, "solicitud_reparacion"),
        where("unidad_negocio", "in", unidad_negocio_arr),
        where("dominio", "==", "0"), //Carroceria
        where("timestamp", ">", timestamp.value),
        orderBy("timestamp")
      );
    else
      q = query(
        collection(db, "solicitud_reparacion"),
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
        m_solicitud_reparacion_change.value++;
      },
      (error) => {
        //Permision denied (En algunos casos se elimnan los registros en cache de forma automatica)
        console.log(error);
        timestamp.value = date;
      }
    );
  };
  const unbind = () => unsubscribe();

  return {
    m_solicitud_reparacion_change,
    bset,
    add,
    update,
    getall,
    gethistoric,
    bind,
    unbind,
  };
});

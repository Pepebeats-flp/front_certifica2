import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";
import { unidad_negocio_arr, client } from "@/client";
import { ref } from "vue";
import { db, functions } from "@/firebase";
import { httpsCallable } from "firebase/functions";
import { doc, setDoc, collection, query, where, onSnapshot, updateDoc, serverTimestamp, getDocsFromCache, orderBy, limit } from "firebase/firestore";
export const useRepresStore = defineStore("represStore", () => {
  const m_change = ref(0);
  let unsubscribe = () => {};
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  date.setDate(1); //Primer dia del mes
  const timestamp = useStorage("repres_timestamp", date);

  const getall = async () => {
    const q = query(collection(db, "registro_presencial"));
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
        collection: "registro_presencial",
      });
      return registros.data;
    } catch (error) {
      return [];
    }
  };
  const emptycache = async () => {
    const q = query(collection(db, "registro_presencial"), limit(1));
    const snap = await getDocsFromCache(q);
    return snap.empty;
  };
  const add = (payload) => {
    payload.timestamp = serverTimestamp();
    setDoc(doc(db, "registro_presencial", payload.uuid), payload);
    m_change.value++;
  };
  const update = (payload) => {
    payload.timestamp = serverTimestamp();
    updateDoc(doc(db, "registro_presencial", payload.uuid), payload);
    m_change.value++;
  };
  const bind = async () => {
    //Si no hay nada en cache reiniciamos fecha
    const empty = await emptycache();
    if (empty) timestamp.value = date;

    const q = query(
      collection(db, "registro_presencial"),
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
        m_change.value++;
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
    m_change,
    getall,
    gethistoric,
    add,
    update,
    bind,
    unbind,
  };
});

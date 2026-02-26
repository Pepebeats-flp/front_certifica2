import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";
import { useUserStore } from "@/store/userStore";
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
export const useTraspStore = defineStore("traspStore", () => {
  const reg_change = ref(0);
  const regd_change = ref(0);
  let unsubscribe = () => {};
  const date = new Date();
  date.setMonth(date.getMonth() - 4);
  const timestamp = useStorage("traspaso_timestamp", date);
  const route = useRoute();

  const getbyid = async (uuid) => {
    const docRef = await getDocFromCache(doc(db, "traspaso", uuid));
    return docRef.data();
  };
  const getall = async () => {
    const q = query(collection(db, "traspaso"));
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
  //Historico
  const gethistoric = async () => {
    try {
      const historic = httpsCallable(functions, "historic");
      const registros = await historic({
        client: client,
        collection: "traspaso",
      });
      return registros.data;
    } catch (error) {
      return [];
    }
  };
  const emptycache = async () => {
    const q = query(collection(db, "traspaso"), limit(1));
    const snap = await getDocsFromCache(q);
    return snap.empty;
  };
  const add = (payload) => {
    payload.timestamp = serverTimestamp();
    setDoc(doc(db, "traspaso", payload.uuid), payload);
    reg_change.value++;
  };
  const update = (payload) => {
    payload.timestamp = serverTimestamp();
    updateDoc(doc(db, "traspaso", payload.uuid), payload);
    reg_change.value++;
  };
  const bind = async () => {
    unsubscribe(); //Limpia subscripciones previas
    const { dtpm } = useUserStore();
    //Si no hay nada en cache reiniciamos fecha. Pasa que no se tiene acceso a persistencia, queda en memoria
    //Pero la fecha queda guardada.. al refrescar no quedan datos
    const empty = await emptycache();
    if (empty) timestamp.value = date;

    let q = "";
    if (dtpm)
      q = query(
        collection(db, "traspaso"),
        where("unidad_negocio", "in", unidad_negocio_arr),
        where("estado", "in", [1, 2, 3]),
        where("timestamp", ">", timestamp.value),
        orderBy("timestamp"),
      );
    else
      q = query(
        collection(db, "traspaso"),
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
          if (route.params.uuid === data.uuid) regd_change.value++;
        });
        timestamp.value = curr_timestamp;
        reg_change.value++;
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
    reg_change,
    regd_change,
    getbyid,
    getall,
    gethistoric,
    add,
    update,
    bind,
    unbind,
  };
});

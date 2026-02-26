import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";
import { useUserStore } from "@/store/userStore";
import { unidad_negocio_arr, unidad_negocio, client } from "@/client";
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
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  getDocsFromCache,
  getDocFromCache,
  orderBy,
  limit,
} from "firebase/firestore";
export const useEstadogStore = defineStore("estadogStore", () => {
  const m_estado_general_change = ref(0);
  const m_estado_generalp_change = ref(0);
  const m_estado_generald_change = ref(0);
  let unsubscribe = () => {};
  let unsubscribe_p = () => {};
  const date = new Date();
  date.setMonth(date.getMonth() - 4);
  const timestamp = useStorage("estado_general_timestamp", date);
  const route = useRoute();

  const getbyid = async (uuid) => {
    const docRef = await getDocFromCache(doc(db, "estado_general", uuid));
    return docRef.data();
  };
  const getall = async (reprog) => {
    const q = query(collection(db, "estado_general"));
    const docsRef = await getDocsFromCache(q);
    const docs = [];
    for (const doc of docsRef.docs) {
      const data = doc.data();
      if (reprog && ![4, 5, 6].includes(data.estado)) continue;
      if (!reprog && [4, 5, 6].includes(data.estado)) continue;
      if (data.estado === 3) continue; //No mostramos eliminados
      data.hasPendingWrites = doc.metadata.hasPendingWrites ? "NO" : "SI";
      docs.push(data);
    }
    return docs;
  };
  const getestado = async (payload) => {
    const docRef = await getDocFromCache(doc(db, "estado_general_p", payload.uuid));
    return docRef.data().values;
  };
  //Map por placa patente (finalizadas)
  const getlastf = async () => {
    const last = new Map();
    const q = query(collection(db, "estado_general"), where("estado", "==", 1));
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
        collection: "estado_general",
      });
      return registros.data;
    } catch (error) {
      return [];
    }
  };
  const emptycache = async () => {
    const q = query(collection(db, "estado_general"), limit(1));
    const snap = await getDocsFromCache(q);
    return snap.empty;
  };
  const add = (payload) => {
    payload.timestamp = serverTimestamp();
    setDoc(doc(db, "estado_general", payload.uuid), payload);
    m_estado_general_change.value++;
  };
  const addp = (payload) => {
    updateDoc(doc(db, "estado_general_p", payload.uuid), {
      values: arrayUnion(payload.values),
    });
  };
  const removep = (payload) => {
    updateDoc(doc(db, "estado_general_p", payload.uuid), {
      values: arrayRemove(payload.values),
    });
  };
  const update = (payload) => {
    payload.timestamp = serverTimestamp();
    updateDoc(doc(db, "estado_general", payload.uuid), payload);
    m_estado_general_change.value++;
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
        collection(db, "estado_general"),
        where("unidad_negocio", "in", unidad_negocio_arr),
        where("estado", "in", [1, 2, 3]),
        where("timestamp", ">", timestamp.value),
        orderBy("timestamp"),
      );
    else
      q = query(
        collection(db, "estado_general"),
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
          if (route.params.uuid === data.uuid) m_estado_generald_change.value++;
        });
        timestamp.value = curr_timestamp;
        m_estado_general_change.value++;
      },
      (error) => {
        //Permision denied (En algunos casos se elimnan los registros en cache de forma automatica)
        console.log(error);
        //timestamp.value = date;
      },
    );
  };
  const bind_p = () => {
    unsubscribe_p(); //Limpia subscripciones previas
    const q = query(collection(db, "estado_general_p"), where("unidad_negocio", "==", unidad_negocio));
    unsubscribe_p = onSnapshot(q, () => m_estado_generalp_change.value++);
  };
  const unbind = () => unsubscribe();
  const unbind_p = () => unsubscribe_p();

  return {
    m_estado_general_change,
    m_estado_generalp_change,
    m_estado_generald_change,
    getbyid,
    getall,
    getestado,
    getlastf,
    gethistoric,
    add,
    addp,
    removep,
    update,
    bind,
    bind_p,
    unbind,
    unbind_p,
  };
});

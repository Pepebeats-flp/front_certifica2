import { createRouter, createWebHashHistory } from "vue-router";
import { useUserStore } from "@/store/userStore";

const routes = [
  {
    path: "/",
    name: "appshell",
    component: () => import("../views/appShell.vue"),
    redirect: "/home",
    children: [
      {
        path: "home",
        name: "home",
        component: () => import("../views/homeView.vue"),
        meta: {
          requiresAuth: true,
          desc: "Inicio",
        },
      },
      {
        path: "estadog",
        name: "estadog",
        redirect: "/estadog/list",
        meta: {
          requiresAuth: true,
          desc: "Estado General",
        },
        children: [
          {
            path: "add",
            name: "estadog_add",
            component: () => import("../views/estadog/estadogAddView.vue"),
          },
          {
            path: "list",
            name: "estadog_list",
            component: () => import("../views/estadog/estadogListView.vue"),
          },
          {
            path: "det/:uuid/:view?",
            name: "estadog_det",
            component: () => import("../views/estadog/estadogDetView.vue"),
          },
        ],
      },
      {
        path: "estadogP",
        name: "estadogP",
        redirect: "/estadogP/list",
        meta: {
          requiresAuth: true,
          desc: "Estado General",
        },
        children: [
          {
            path: "list",
            name: "estadog_listp",
            component: () => import("../views/estadog/estadogListPView.vue"),
          },
        ],
      },
      {
        path: "estadogR",
        name: "estadogR",
        redirect: "/estadogR/list",
        meta: {
          requiresAuth: true,
          desc: "Reprograma",
        },
        children: [
          {
            path: "list",
            name: "estadog_listr",
            component: () => import("../views/estadog/estadogListRView.vue"),
          },
          {
            path: "det/:uuid/:view?",
            name: "estadog_detr",
            component: () => import("../views/estadog/estadogDetRView.vue"),
          },
        ],
      },
      {
        path: "inspec",
        name: "inspec",
        redirect: "/inspec/list",
        meta: {
          requiresAuth: true,
          desc: "Inspección Técnica",
        },
        children: [
          {
            path: "add",
            name: "inspec_add",
            component: () => import("../views/inspec/inspecAddView.vue"),
          },
          {
            path: "list",
            name: "inspec_list",
            component: () => import("../views/inspec/inspecListView.vue"),
          },
          {
            path: "inspec/:uuid/:view?",
            name: "inspec_det",
            component: () => import("../views/inspec/inspecDetView.vue"),
          },
        ],
      },
      {
        path: "inspecP",
        name: "inspecP",
        redirect: "/inspecP/list",
        meta: {
          requiresAuth: true,
          desc: "Inspección Técnica",
        },
        children: [
          {
            path: "list",
            name: "inspec_listp",
            component: () => import("../views/inspec/inspecListPView.vue"),
          },
        ],
      },
      {
        path: "revdocP",
        name: "revdocP",
        redirect: "/revdocP/list",
        meta: {
          requiresAuth: true,
          desc: "Mantenimiento Preventivo",
        },
        children: [
          {
            path: "list",
            name: "revdoc_listp",
            component: () => import("../views/revdoc/revdocListPView.vue"),
          },
          {
            path: "add",
            name: "revdoc_addp",
            component: () => import("../views/revdoc/revdocAddPView.vue"),
          },
        ],
      },
      {
        path: "revdocC",
        name: "revdocC",
        redirect: "/revdocC/list",
        meta: {
          requiresAuth: true,
          desc: "Mantenimiento Correctivo",
        },
        children: [
          {
            path: "list",
            name: "revdoc_listc",
            component: () => import("../views/revdoc/revdocListCView.vue"),
          },
          {
            path: "add",
            name: "revdoc_addc",
            component: () => import("../views/revdoc/revdocAddCView.vue"),
          },
        ],
      },
      {
        path: "revdocT",
        name: "revdocT",
        redirect: "/revdocT/list",
        meta: {
          requiresAuth: true,
          desc: "Revisión Técnica",
        },
        children: [
          {
            path: "list",
            name: "revdoc_listt",
            component: () => import("../views/revdoc/revdocListTView.vue"),
          },
          {
            path: "add",
            name: "revdoc_addt",
            component: () => import("../views/revdoc/revdocAddTView.vue"),
          },
        ],
      },
      {
        path: "revdocI",
        name: "revdocI",
        redirect: "/revdocI/list",
        meta: {
          requiresAuth: true,
          desc: "Incidentes",
        },
        children: [
          {
            path: "list",
            name: "revdoc_listi",
            component: () => import("../views/revdoc/revdocListIView.vue"),
          },
          {
            path: "add",
            name: "revdoc_addi",
            component: () => import("../views/revdoc/revdocAddIView.vue"),
          },
        ],
      },
      {
        path: "trasp",
        name: "trasp",
        redirect: "/trasp/list",
        meta: {
          requiresAuth: true,
          desc: "Traspaso Menor",
        },
        children: [
          {
            path: "add",
            name: "trasp_add",
            component: () => import("../views/trasp/traspAddView.vue"),
          },
          {
            path: "list",
            name: "trasp_list",
            component: () => import("../views/trasp/traspListView.vue"),
          },
          {
            path: "det/:uuid/:view?",
            name: "trasp_det",
            component: () => import("../views/trasp/traspDetView.vue"),
          },
        ],
      },
      {
        path: "traspN",
        name: "traspN",
        redirect: "/traspn/list",
        meta: {
          requiresAuth: true,
          desc: "Traspaso Menor",
        },
        children: [
          {
            path: "add",
            name: "traspn_add",
            component: () => import("../views/trasp/traspNAddView.vue"),
          },
          {
            path: "list",
            name: "traspn_list",
            component: () => import("../views/trasp/traspNListView.vue"),
          },
          {
            path: "det/:uuid/:view?",
            name: "traspn_det",
            component: () => import("../views/trasp/traspNDetView.vue"),
          },
        ],
      },
      {
        path: "traspM",
        name: "traspM",
        redirect: "/traspm/list",
        meta: {
          requiresAuth: true,
          desc: "Traspaso Mayor",
        },
        children: [
          {
            path: "list",
            name: "traspm_list",
            component: () => import("../views/trasp/traspMListView.vue"),
          },
          {
            path: "det/:uuid/:view?",
            name: "traspm_det",
            component: () => import("../views/trasp/traspMDetView.vue"),
          },
        ],
      },
      {
        path: "repres",
        name: "repres",
        redirect: "/repres/list",
        meta: {
          requiresAuth: true,
          desc: "Registro Presencial",
        },
        children: [
          {
            path: "list",
            name: "repres_list",
            component: () => import("../views/repres/represListView.vue"),
          },
          {
            path: "add",
            name: "repres_add",
            component: () => import("../views/repres/represAddView.vue"),
          },
        ],
      },
      {
        path: "hojav",
        name: "hojav",
        redirect: "/hojav/list",
        meta: {
          requiresAuth: true,
          desc: "Hoja Vida",
        },
        children: [
          {
            path: "list",
            name: "hojav_list",
            component: () => import("../views/hojav/hojavListView.vue"),
          },
        ],
      },
      {
        path: "docu",
        name: "docu",
        redirect: "/docu/list",
        meta: {
          requiresAuth: true,
          desc: "Documentos",
        },
        children: [
          {
            path: "list",
            name: "docu_list",
            component: () => import("../views/docu/docuListView.vue"),
          },
        ],
      },
      {
        path: "info",
        name: "info",
        redirect: "/info/list",
        meta: {
          requiresAuth: true,
          desc: "Informes",
        },
        children: [
          {
            path: "list",
            name: "info_list",
            component: () => import("../views/info/infoListView.vue"),
          },
          {
            path: "add",
            name: "info_add",
            component: () => import("../views/info/infoAddView.vue"),
          },
        ],
      },
      {
        path: "soplocRu",
        name: "soplocRu",
        redirect: "/soplocRu/list",
        meta: {
          requiresAuth: true,
          desc: "Solicitud Repuestos",
        },
        children: [
          {
            path: "list",
            name: "soploc_listru",
            component: () => import("../views/soploc/soplocListRuView.vue"),
          },
          {
            path: "add",
            name: "soploc_addru",
            component: () => import("../views/soploc/soplocAddRuView.vue"),
          },
        ],
      },
      {
        path: "soplocRa",
        name: "soplocRa",
        redirect: "/soplocRa/list",
        meta: {
          requiresAuth: true,
          desc: "Solicitud Reparación",
        },
        children: [
          {
            path: "list",
            name: "soploc_listra",
            component: () => import("../views/soploc/soplocListRaView.vue"),
          },
          {
            path: "add",
            name: "soploc_addra",
            component: () => import("../views/soploc/soplocAddRaView.vue"),
          },
        ],
      },
      {
        path: "soplocD",
        name: "soplocD",
        redirect: "/soplocD/list",
        meta: {
          requiresAuth: true,
          desc: "Solicitud Diagnóstico",
        },
        children: [
          {
            path: "list",
            name: "soploc_listd",
            component: () => import("../views/soploc/soplocListDView.vue"),
          },
          {
            path: "add",
            name: "soploc_addd",
            component: () => import("../views/soploc/soplocAddDView.vue"),
          },
        ],
      },
      {
        path: "indE",
        name: "indE",
        redirect: "/indE/list",
        meta: {
          requiresAuth: true,
          desc: "Estado Certificación",
        },
        children: [
          {
            path: "list",
            name: "ind_liste",
            component: () => import("../views/ind/indListEView.vue"),
          },
        ],
      },
      {
        path: "indI",
        name: "indI",
        redirect: "/indI/list",
        meta: {
          requiresAuth: true,
          desc: "Incumplimiento",
        },
        children: [
          {
            path: "list",
            name: "ind_listi",
            component: () => import("../views/ind/indListIView.vue"),
          },
        ],
      },
      {
        path: "sinop",
        name: "sinop",
        redirect: "/sinop/ecert",
        meta: {
          requiresAuth: true,
        },
        children: [
          {
            path: "ecert",
            name: "sinop_ecert",
            component: () => import("../views/sinop/sinopEcertView.vue"),
            meta: {
              desc: "Sinoptico",
            },
          },
        ],
      },
    ],
  },
  {
    path: "/login",
    name: "login",
    component: () => import("../views/loginView.vue"),
    meta: {
      desc: "Login",
    },
  },
  {
    path: "/logout",
    name: "logout",
    component: () => import("../views/logoutView.vue"),
    meta: {
      desc: "Logout",
    },
  },
  {
    path: "/noaccess",
    name: "noaccess",
    component: () => import("../views/noaccessView.vue"),
    meta: {
      desc: "Noaccess",
    },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "nofound",
    component: () => import("../views/nofoundView.vue"),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to) => {
  const { uid } = useUserStore();
  if (to.meta.requiresAuth && !uid) return "/login";
});

router.afterEach((to) => {
  if (window.gtag) {
    gtag("config", "G-8H3LEL4CLD", { page_path: to.fullPath });
  }
});

export default router;

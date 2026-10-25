import { createRouter, createWebHistory } from 'vue-router'
import WorkView from '../views/WorkView.vue'

const routes = [
  { path: '/', name: 'work', component: WorkView },
  { path: '/project/:slug', name: 'project', component: () => import('../views/ProjectView.vue') },
  { path: '/about', name: 'about', component: () => import('../views/AboutView.vue') },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export default createRouter({
  // BASE_URL otomatis berisi '/portfolio/' dari vite.config.js
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})
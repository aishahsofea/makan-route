import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import MakanSpotsView from '../views/MakanSpotsView.vue'

const router = createRouter({
  history: createWebHistory('/'),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/makan-spots',
      name: 'makan-spots',
      component: MakanSpotsView,
    },
  ],
})

export default router


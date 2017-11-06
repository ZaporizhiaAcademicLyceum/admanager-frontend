import Vue from 'vue'
import Router from 'vue-router'
import AdUsers from '@/components/AdUsers'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Hello',
      component: AdUsers
    }
  ]
})

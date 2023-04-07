import { createRouter, createWebHistory } from 'vue-router'
const routerHistory = createWebHistory()
const router = createRouter({
    history: routerHistory,
    routes: [
        {
            path: '/',
            component: () => import('../App.vue')
        },
        {
            path: '/layout',
            component: () => import('../components/layout/LayoutMain.vue')
        },
        {
            //访问的路径
            path: '/next',
            //vue文件存放路径
            component:() => import('../views/ConfirmForm.vue'),
            //调用的名称
            name: 'confirmForm',
            meta: { title: '下一步' }
        },
    ]
})
export default router

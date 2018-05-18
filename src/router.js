import WorkingTable from './components/WorkingTable.vue'
import Wrongs from './components/Wrongs.vue'
import MistakesDefinition from './components/MistakesDefinition.vue'
import DealersList from './components/DealersList.vue'

const routers = [
    // {
    //     path: '/',
    //     meta: {
    //         title: ''
    //     },
    //     component: (resolve) => require(['./views/index.vue'], resolve)
    // },
    {
        path: '/WorkingTable/:date', name: 'route_wt', component: WorkingTable, props: true
    },
    {
        path: '/Wrongs/:date', name: 'route_mtk', component: Wrongs, props: true
    },
    {
        path: '/MistakesDefinition', name: 'route_mtkdef', component: MistakesDefinition
    },
    {
        path: '/DealersList', name: 'route_dl', component: DealersList
    },
];
export default routers;
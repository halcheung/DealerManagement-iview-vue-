<style scoped lang="less">
    .layout{
        border: none;
        background: #f5f7f9;
        position: fixed;
        top:0;
        left:0;
        width:100%;
        height:100%;
        overflow-x: hidden;
        overflow-y:scroll;
    }
    .layout-header-bar{
        background: #fff;
        box-shadow: 0 1px 1px rgba(0,0,0,.1);
    }
</style>
<template>
    <div class="layout">
        <Sider :style="{position: 'fixed', height: '100%', background: '#22252d', left: 0, overflow: 'auto'}">
            <Menu :active-name="activeName" theme="dark" width="auto" :open-names="['1']" @on-select="handleSelect">
                <Submenu name="1">
                    <template slot="title">
                        <Icon type="android-calendar"></Icon>
                        Working Tables
                    </template>
                    <MenuItem v-for="m in months" :name="'wt-'+m" :key="m">{{m}}</MenuItem>
                </Submenu>
                <Submenu name="2">
                    <template slot="title">
                        <Icon type="close-circled"></Icon>
                        Mistakes
                    </template>
                    <MenuItem v-for="m in months2" :name="'mtk-'+m" :key="m">{{m}}</MenuItem>
                    <MenuItem name="mtk-Definition">Definition</MenuItem>
                </Submenu>
                <Submenu name="3">
                    <template slot="title">
                        <Icon type="person"></Icon>
                        Dealers
                    </template>
                    <MenuItem name="dlr-Dealers_List">Dealers List</MenuItem>
                </Submenu>
            </Menu>
        </Sider>
        <Layout :style="{marginLeft: '200px'}">
            <Content :style="{padding: '0 16px 16px'}">
                <Breadcrumb :style="{margin: '16px 0'}">
                    <BreadcrumbItem>DWTS</BreadcrumbItem>
                    <BreadcrumbItem>{{columnName}}</BreadcrumbItem>
                    <BreadcrumbItem>{{currentBlockTitle}}</BreadcrumbItem>
                </Breadcrumb>
                <Card>
                    <div style="height: 100%;">
                        <router-view></router-view>
                    </div>
                </Card>
            </Content>
        </Layout>
    </div>
</template>
<script>
    export default {
        data(){
            return {
                currentBlockTitle: '',
                activeName: '',
                prefixes: {
                    wt: 'Working Tables',
                    mtk: 'Mistakes',
                    dlr: 'Dealers'
                },
                columnName: 'Working Tables',
                months:[],
                months2:[]
            }
        },
        mounted(){
            this.$nextTick(()=>{
                let d = new Date(), d0, d2;
                d0 = new Date(d.setMonth(d.getMonth()-1));
                d = new Date();
                d2 = new Date(d.setMonth(d.getMonth()+1));
                d = new Date();
                this.months.push(d0.getFullYear()+'-'+('0'+(d0.getMonth()+1)).substr(-2));
                this.months.push(d.getFullYear()+'-'+('0'+(d.getMonth()+1)).substr(-2));
                this.months.push(d2.getFullYear()+'-'+('0'+(d2.getMonth()+1)).substr(-2));
                this.months2.push(d0.getFullYear()+'-'+('0'+(d0.getMonth()+1)).substr(-2));
                this.months2.push(d.getFullYear()+'-'+('0'+(d.getMonth()+1)).substr(-2));

                setTimeout(()=>{
                    this.handleSelect('wt-'+this.months[1]);
                },500);

            });
        },
        methods: {
            handleSelect(name){
                let prefix = name.split('-')[0];
                this.activeName = name;
                this.columnName = this.prefixes[prefix];
                this.currentBlockTitle = name.substr(prefix.length+1).replace('_',' ');
                switch (prefix){
                    case 'wt':
                        this.$router.push('/WorkingTable/'+this.currentBlockTitle);
                        break;
                    case 'mtk':
                        if(this.currentBlockTitle!='Definition') {
                            this.$router.push('/Wrongs/'+this.currentBlockTitle);
                        } else {
                            this.$router.push('/MistakesDefinition');
                        }
                        break;
                    case 'dlr':
                        this.$router.push('/DealersList');
                        break;
                }
            }
        }
    }
</script>

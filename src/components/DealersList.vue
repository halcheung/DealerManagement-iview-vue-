<template>
    <div :class="'dealers-table '+(showLoading?'half-trans':'')">
        <div class="tool">
            <Button type="ghost" shape="circle" icon="refresh" @click="rendDealers">Reload</Button>
        </div>
        <Row :gutter="16">
            <Col span="12">
                <Table :columns="columnsA" :data="dealersA"></Table>
            </Col>
            <Col span="12">
                <Table :columns="columnsB" :data="dealersB"></Table>
            </Col>
        </Row>
    </div>
</template>

<script>
    export default {
        name: "DealersList",
        data () {
            return {
                showLoading: false,
                columnsA: [
                    {
                        title: 'Name',
                        key: 'name'
                    },
                    {
                        title: 'Id',
                        key: 'ydlid'
                    },
                    {
                        title: 'Job',
                        key: 'job'
                    },
                    {
                        title: 'Action',
                        key: 'action',
                        width: 180,
                        align: 'center',
                        render: (h, params) => {
                            return h('div', [
                                h('Button', {
                                    props: {
                                        type: 'primary',
                                        size: 'small',
                                        icon: 'android-create'
                                    },
                                    style: {
                                        marginRight: '2px'
                                    },
                                    on: {
                                        click: () => {
                                            this.modify(0, params.index)
                                        }
                                    }
                                }, ''),
                                h('Button', {
                                    props: {
                                        type: 'error',
                                        size: 'small',
                                        icon: 'android-close'
                                    },
                                    style: {
                                        marginRight: '2px'
                                    },
                                    on: {
                                        click: () => {
                                            this.remove(0, params.index)
                                        }
                                    }
                                }, ''),
                                h('Button', {
                                    props: {
                                        type: 'success',
                                        size: 'small',
                                        icon: 'android-add'
                                    },
                                    style: {
                                        marginRight: '2px'
                                    },
                                    on: {
                                        click: () => {
                                            this.insert(0, params.index)
                                        }
                                    }
                                }, ''),
                                h('Button', {
                                    props: {
                                        type: 'warning',
                                        size: 'small',
                                        icon: 'android-arrow-forward'
                                    },
                                    on: {
                                        click: () => {
                                            this.toRight(0, params.index)
                                        }
                                    }
                                }, '')
                            ]);
                        }
                    },
                ],
                columnsB: [
                    {
                        title: 'Name',
                        key: 'name',
                    },
                    {
                        title: 'Id',
                        key: 'ydlid'
                    },
                    {
                        title: 'Job',
                        key: 'job'
                    },
                    {
                        title: 'Action',
                        key: 'action',
                        width: 180,
                        align: 'center',
                        render: (h, params) => {
                            return h('div', [
                                h('Button', {
                                    props: {
                                        type: 'primary',
                                        size: 'small',
                                        icon: 'android-create'
                                    },
                                    style: {
                                        marginRight: '2px'
                                    },
                                    on: {
                                        click: () => {
                                            this.modify(1, params.index)
                                        }
                                    }
                                }, ''),
                                h('Button', {
                                    props: {
                                        type: 'error',
                                        size: 'small',
                                        icon: 'android-close'
                                    },
                                    style: {
                                        marginRight: '2px'
                                    },
                                    on: {
                                        click: () => {
                                            this.remove(1, params.index)
                                        }
                                    }
                                }, ''),
                                h('Button', {
                                    props: {
                                        type: 'success',
                                        size: 'small',
                                        icon: 'android-add'
                                    },
                                    style: {
                                        marginRight: '2px'
                                    },
                                    on: {
                                        click: () => {
                                            this.insert(1, params.index)
                                        }
                                    }
                                }, ''),
                                h('Button', {
                                    props: {
                                        type: 'warning',
                                        size: 'small',
                                        icon: 'android-arrow-back'
                                    },
                                    on: {
                                        click: () => {
                                            this.toLeft(1, params.index)
                                        }
                                    }
                                }, '')
                            ]);
                        }
                    }
                ],
                dealersA: [
                    {
                        id:0,
                        name: 'SUP AAA',
                        ydlid: 'YDL-00000',
                        job: 'Supervisor',
                        cellClassName:{
                            name: 'name'
                        }
                    }
                ],
                dealersB: [
                    {
                        id:0,
                        name: 'SUP BBB',
                        ydlid: 'YDL-00000',
                        job: 'Supervisor',
                        cellClassName:{
                            name: 'name'
                        }
                    }
                ],
                adding:{
                    id: 0,
                    name: '',
                    ydlid:'',
                    job:''
                }
            }
        },
        mounted(){
            this.$nextTick(()=>{

                let init = ()=>{
                    if(this._G.dealersInfo.length){
                        this.rendDealers();
                    } else {
                        setTimeout(init, 1000);
                    }
                };
                init();

            });
        },
        methods:{
            rendDealers(){
                this.$Loading.start();
                this.showLoading = true;
                this.dealersA.length = 0;
                this.dealersB.length = 0;

                console.log(this._G.dealersInfo);

                for(let i=0;i<this._G.dealersInfo.length;i++){
                    let dlr = this._G.dealersInfo[i];
                    dlr.cellClassName = {name: dlr.job.indexOf('Supervisor')!=-1?'name':'dealer'};
                    if(dlr.shift=='A') {
                        this.dealersA.push(dlr);
                    } else {
                        this.dealersB.push(dlr);
                    }
                }
                setTimeout(()=>{
                    this.$Loading.finish();
                    this.showLoading = false;
                },500);
            },
            saveToDatabase(){
                this.$Loading.start();
                this.showLoading = true;
                let sql = []
                this._G.dealersInfo.length = 0;
                for(let i=0;i<this.dealersA.length;i++){
                    sql.push('INSERT INTO DEALERS (name, ydlid, job, shift) VALUES ("'+this.dealersA[i].name+'", "'+this.dealersA[i].ydlid+'", "'+this.dealersA[i].job+'","A")');
                }
                for(let i=0;i<this.dealersB.length;i++){
                    sql.push('INSERT INTO DEALERS (name, ydlid, job, shift) VALUES ("'+this.dealersB[i].name+'", "'+this.dealersB[i].ydlid+'", "'+this.dealersB[i].job+'","B")');
                }
                this._G.dataBase.transaction((tx)=>{
                    for(let i=0;i<sql.length;i++) {
                        tx.executeSql('DELETE FROM DEALERS',[],(tx)=>{
                            tx.executeSql(sql[i],[],(tx)=>{
                                if(i==sql.length-1){
                                    tx.executeSql('SELECT * FROM DEALERS', [], (tx, results)=>{
                                        let len = results.rows.length, i;
                                        for (i = 0; i < len; i++){
                                            this._G.dealersInfo.push(results.rows.item(i));
                                        }
                                        this.rendDealers();
                                    }, null);
                                }
                            });
                        });
                    }
                });
            },
            remove(x,y){
                if(!x&&!this.dealersA[y].name || x&&!this.dealersB[y].name) return;
                let dlr = !x?this.dealersA[y]:this.dealersB[y];
                if(dlr.job==this._G.dealersTitle[0]) return;
                let id = dlr.id;
                this.$Modal.confirm({
                    title: 'Please confirm:',
                    content: 'Do you want to delete '+dlr.name+'('+dlr.job+': '+dlr.ydlid+')'+'\'s info?',
                    onOk:()=>{
                        if(!x) {
                            this.dealersA.splice(y, 1);
                        } else {
                            this.dealersB.splice(y, 1);
                        }

                        this._G.dataBase.transaction((tx)=>{
                            tx.executeSql('DELETE FROM DEALERS WHERE id='+id,[],(tx)=>{
                                this.saveToDatabase();
                            });
                        });

                    },
                });
            },
            modify(x,y){
                let dlr = !x?this.dealersA[y]:this.dealersB[y];
                if(!dlr.name) return;
                let id=dlr.id;
                this.$Modal.confirm({
                    title: 'Modify staff\'s info:',
                    render: (h) => {
                        return h('div',[
                            h('Input', {
                                props: {
                                    value: dlr.name,
                                    autofocus: true,
                                    placeholder: 'Name'
                                },
                                style: {
                                    marginBottom: '10px'
                                },
                                on: {
                                    input: (val) => {
                                        this.adding.name = val;
                                    }
                                }
                            }),
                            h('Input', {
                                props: {
                                    value: dlr.ydlid,
                                    placeholder: 'Id'
                                },
                                style: {
                                    marginBottom: '10px'
                                },
                                on: {
                                    input: (val) => {
                                        this.adding.ydlid = val;
                                    }
                                }
                            }),
                            h('Select', {
                                props: {
                                    value: dlr.job
                                },
                                on: {
                                    'on-change': (val) => {
                                        console.log(val);
                                        this.adding.job = val;
                                    }
                                }
                            },[
                                h('Option',{
                                    props: {
                                        value: this._G.dealersTitle[0]
                                    }
                                },this._G.dealersTitle[0]),
                                h('Option',{
                                    props: {
                                        value: this._G.dealersTitle[1]
                                    }
                                },this._G.dealersTitle[1]),
                                h('Option',{
                                    props: {
                                        value: this._G.dealersTitle[2]
                                    }
                                },this._G.dealersTitle[2]),
                            ]),
                        ]);
                    },
                    onOk:()=>{
                        let job = this.adding.job ? this.adding.job : dlr.job;
                        let newDealer = {
                            id: id,
                            name: this.adding.name ? this.adding.name : dlr.name,
                            ydlid: this.adding.ydlid ? this.adding.ydlid : dlr.ydlid,
                            job: job,
                            cellClassName: {
                                name: job == this._G.dealersTitle[2] ? 'dealer' : 'name'
                            }
                        };
                        console.log(newDealer);
                        //let sql = '';
                        if(!x){
                            this.dealersA.splice(y,1,newDealer);
                        } else {
                            this.dealersB.splice(y,1,newDealer);
                        }
                        this.saveToDatabase();
                        this.adding = {
                            id: 0,
                            name:'',
                            ydlid:'',
                            job:''
                        };
                    },
                    onCancel:()=>{
                        this.adding = {
                            id: 0,
                            name:'',
                            ydlid:'',
                            job:''
                        };
                    }
                });
            },
            toRight(x,y){
                let dlr = this.dealersA[y];
                if(!dlr.name) return;
                if(!y){
                    let dlr2 = this.dealersB[y];
                    this.dealersB[y] = dlr;
                    this.dealersA[y] = dlr2;
                    this.saveToDatabase();
                    return;
                }
                this.dealersA.splice(y,1);
                this.dealersB.push(dlr);
                this.saveToDatabase();
            },
            toLeft(x,y){
                let dlr = this.dealersB[y];
                if(!dlr.name) return;
                if(!y){
                    let dlr2 = this.dealersA[y];
                    this.dealersA[y] = dlr;
                    this.dealersB[y] = dlr2;
                    this.saveToDatabase();
                    return;
                }
                this.dealersB.splice(y,1);
                this.dealersA.push(dlr);
                this.saveToDatabase();
            },
            insert(x,y){

                this.$Modal.confirm({
                    title: 'Add a staff:',
                    render: (h) => {
                        return h('div',[
                            h('Input', {
                                props: {
                                    value: '',
                                    autofocus: true,
                                    placeholder: 'Name'
                                },
                                style: {
                                    marginBottom: '10px'
                                },
                                on: {
                                    input: (val) => {
                                        this.adding.name = val;
                                    }
                                }
                            }),
                            h('Input', {
                                props: {
                                    value: 'YDL-',
                                    placeholder: 'Id'
                                },
                                style: {
                                    marginBottom: '10px'
                                },
                                on: {
                                    input: (val) => {
                                        this.adding.ydlid = val;
                                    }
                                }
                            }),
                            h('Select', {
                                props: {
                                    value: this._G.dealersTitle[2]
                                },
                                on: {
                                    'on-change': (val) => {
                                        console.log(val);
                                        this.adding.job = val;
                                    }
                                }
                            },[
                                h('Option',{
                                    props: {
                                        value: this._G.dealersTitle[0]
                                    }
                                },this._G.dealersTitle[0]),
                                h('Option',{
                                    props: {
                                        value: this._G.dealersTitle[1]
                                    }
                                },this._G.dealersTitle[1]),
                                h('Option',{
                                    props: {
                                        value: this._G.dealersTitle[2]
                                    }
                                },this._G.dealersTitle[2]),
                            ]),
                        ]);
                    },

                    onOk:()=>{

                        if(!this.adding.name || !this.adding.ydlid){
                            //this.loading = false;
                            this.$Message.info('Please fill info!');
                            return;
                        }

                        let job = this.adding.job ? this.adding.job : this._G.dealersTitle[2];
                        let newDealer = {
                            id: 0,
                            name: this.adding.name,
                            ydlid: this.adding.ydlid,
                            job: job,
                            cellClassName: {
                                name: job == this._G.dealersTitle[2] ? 'dealer' : 'name'
                            }
                        };

                        if(!x){
                            this.dealersA.splice(y+1,0,newDealer);
                        } else {
                            this.dealersB.splice(y+1,0,newDealer);
                        }

                        this.saveToDatabase();

                        this.adding = {
                            id: 0,
                            name:'',
                            ydlid:'',
                            job:''
                        };

                    },
                    onCancel:()=>{
                        this.adding = {
                            id: 0,
                            name:'',
                            ydlid:'',
                            job:''
                        };
                    }
                });

            },
        }
    }
</script>

<style>
    .half-trans {
        transition:all 0.5s;
        opacity: 0.3;
        pointer-events: none;
    }
    .dealers-table .tool {
        padding:0 0 10px 0;
        text-align:right;
    }
    .dealers-table td.name, .dealers-table td.name2 {
        color:#8c0776;
        font-weight:bold;
    }
    .dealers-table td.dealer {
        color:#f60;
        font-weight:bold;
    }
    .dealers-table .col-name2 {
        border-left:solid 1px #ccc;
    }
    .dealers-table td.name2 {
        border-left:solid 1px #ddd;
    }
    .dealers-table td.op {
        width:180px;
    }
    .ivu-modal-confirm-body {
        padding-left:18px;
    }
</style>
<template>
    <div :class="'mtk-def '+(showLoading?'half-trans':'')">
        <div class="tool">
            <Button type="ghost" shape="circle" icon="android-add" @click="add">Add</Button>
        </div>
        <Table :columns="columns1" :data="data1"></Table>
    </div>
</template>

<script>
    export default {
        name: "MistakesDefinition",
        data () {
            return {
                showLoading: false,
                columns1: [
                    {
                        title: 'SN',
                        key: 'sn',
                        width: 60
                    },
                    {
                        title: 'Mistake',
                        key: 'mtk',
                        width: 200,
                    },
                    {
                        title: 'Code',
                        key: 'code',
                        width: 100
                    },
                    {
                        title: 'Money Cut',
                        key: 'cut',
                        width: 100
                    },
                    {
                        title: 'Description',
                        key: 'desc'
                    },
                    {
                        title: 'Action',
                        key: 'action',
                        width: 100,
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
                                            this.modify(params.index)
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
                                            this.remove(params.index)
                                        }
                                    }
                                }, ''),
                            ]);
                        }
                    }
                ],
                data1: [
                    {
                        sn: 1,
                        id: 0,
                        mtk: 'Wrong Game',
                        code: 'WG',
                        cut: '$10',
                        desc: 'ie., open a dragon tiger cards on baccarat table.',
                        cellClassName: {
                            code: 'game-code'
                        }
                    },
                ],
                adding: {
                    sn: 0,
                    mtk: '',
                    code: '',
                    cut: '$10',
                    desc: '',
                    cellClassName: {
                        code: 'game-code'
                    }
                }
            }
        },
        mounted(){
            this.$nextTick(()=>{

                this._G.dataBase.transaction((tx)=>{
                    //tx.executeSql('DROP TABLE MISTAKEDEF');
                    tx.executeSql('CREATE TABLE IF NOT EXISTS MISTAKEDEF (id integer primary key autoincrement, mtk, code, cut, desc)');
                    this.loadDefinitions();
                });
            });
        },
        methods:{
            loadDefinitions(){
                this.startLoading();
                this.data1.length = 0;
                this._G.dataBase.transaction((tx)=>{
                    tx.executeSql('SELECT * FROM MISTAKEDEF ORDER BY id',[],(tx,results)=>{
                        let len = results.rows.length, i;
                        for (i = 0; i < len; i++){
                            console.log(results.rows.item(i));
                            let mtk = results.rows.item(i);
                            mtk.sn = i+1;
                            mtk.cellClassName = {
                                code: 'game-code'
                            };
                            this.data1.push(mtk);
                        }

                        this.endLoading();
                    });
                });

            },
            startLoading(){
                this.$Loading.start();
                this.showLoading=true;
            },
            endLoading(){
                setTimeout(()=>{
                    this.$Loading.finish();
                    this.showLoading=false;
                },500);
            },
            add(){
                this.$Modal.confirm({
                    title: 'Add a mistake definition:',
                    render: (h) => {
                        return h('div',[
                            h('Input', {
                                props: {
                                    value: '',
                                    autofocus: true,
                                    placeholder: 'Mistake Name'
                                },
                                style: {
                                    marginBottom: '10px'
                                },
                                on: {
                                    input: (val) => {
                                        this.adding.mtk = val;
                                    }
                                }
                            }),
                            h('Input', {
                                props: {
                                    value: '',
                                    placeholder: 'Code'
                                },
                                style: {
                                    marginBottom: '10px'
                                },
                                on: {
                                    input: (val) => {
                                        this.adding.code = val;
                                    }
                                }
                            }),
                            h('Input', {
                                props: {
                                    value: '$10',
                                    placeholder: 'Cut Money'
                                },
                                style: {
                                    marginBottom: '10px'
                                },
                                on: {
                                    input: (val) => {
                                        this.adding.cut = val;
                                    }
                                }
                            }),
                            h('Input', {
                                props: {
                                    value: '',
                                    placeholder: 'Description'
                                },
                                on: {
                                    input: (val) => {
                                        this.adding.desc = val;
                                    }
                                }
                            }),
                        ]);
                    },

                    onOk:()=>{

                        if(!this.adding.mtk || !this.adding.code || !this.adding.cut || !this.adding.desc){
                            this.$Message.info('Please fill info!');
                            return;
                        }


                        let newMTK = {
                            sn: this.data1.length+1,
                            mtk: this.adding.mtk,
                            code: this.adding.code,
                            cut: this.adding.cut,
                            desc: this.adding.desc,
                            cellClassName: {
                                code: 'game-code'
                            }
                        };

                        //this.data1.push(newMTK);

                        this.adding = {
                            sn: 0,
                            mtk: '',
                            code: '',
                            cut: '$10',
                            desc: '',
                            cellClassName: {
                                code: 'game-code'
                            }
                        };

                        let sql = 'INSERT INTO MISTAKEDEF (mtk, code, cut, desc) VALUES ("'+newMTK.mtk+'","'+newMTK.code+'","'+newMTK.cut+'","'+newMTK.desc+'")';
                        this._G.dataBase.transaction((tx)=>{
                            tx.executeSql(sql,[],(tx)=>{
                                this.loadDefinitions();
                            });
                        });

                    },
                    onCancel:()=>{
                        this.adding = {
                            sn: 0,
                            name: '',
                            code: '',
                            cut: '$10',
                            desc: '',
                            cellClassName: {
                                code: 'game-code'
                            }
                        };
                    }
                });
            },
            modify(idx){
                let mtk = this.data1[idx], id = mtk.id;

                this.adding = {
                    sn: mtk.sn,
                    mtk: mtk.mtk,
                    code: mtk.code,
                    cut: mtk.cut,
                    desc: mtk.desc,
                    cellClassName: {
                        code: 'game-code'
                    }
                };

                this.$Modal.confirm({
                    title: 'Modify mistake definition:',
                    render: (h) => {
                        return h('div',[
                            h('Input', {
                                props: {
                                    value: mtk.mtk,
                                    autofocus: true,
                                    placeholder: 'Mistake Name'
                                },
                                style: {
                                    marginBottom: '10px'
                                },
                                on: {
                                    input: (val) => {
                                        this.adding.mtk = val;
                                    }
                                }
                            }),
                            h('Input', {
                                props: {
                                    value: mtk.code,
                                    placeholder: 'Code'
                                },
                                style: {
                                    marginBottom: '10px'
                                },
                                on: {
                                    input: (val) => {
                                        this.adding.code = val;
                                    }
                                }
                            }),
                            h('Input', {
                                props: {
                                    value: mtk.cut,
                                    placeholder: 'Cut Money'
                                },
                                style: {
                                    marginBottom: '10px'
                                },
                                on: {
                                    input: (val) => {
                                        this.adding.cut = val;
                                    }
                                }
                            }),
                            h('Input', {
                                props: {
                                    value: mtk.desc,
                                    placeholder: 'Description'
                                },
                                on: {
                                    input: (val) => {
                                        this.adding.desc = val;
                                    }
                                }
                            }),
                        ]);
                    },

                    onOk:()=>{

                        if(!this.adding.mtk || !this.adding.code || !this.adding.cut || !this.adding.desc){
                            this.$Message.info('Please fill info!');
                            return;
                        }


                        let newMTK = {
                            sn: this.data1.length+1,
                            mtk: this.adding.mtk,
                            code: this.adding.code,
                            cut: this.adding.cut,
                            desc: this.adding.desc,
                            cellClassName: {
                                code: 'game-code'
                            }
                        };

                        console.log(newMTK);

                        this.adding = {
                            sn: 0,
                            mtk: '',
                            code: '',
                            cut: '$10',
                            desc: '',
                            cellClassName: {
                                code: 'game-code'
                            }
                        };

                        let sql = 'UPDATE MISTAKEDEF SET mtk="'+newMTK.mtk+'", code="'+newMTK.code+'", cut="'+newMTK.cut+'", desc="'+newMTK.desc+'" WHERE id='+mtk.id;
                        this._G.dataBase.transaction((tx)=>{
                            tx.executeSql(sql,[],(tx)=>{
                                this.loadDefinitions();
                            });
                        });

                    },
                    onCancel:()=>{
                        this.adding = {
                            sn: 0,
                            name: '',
                            code: '',
                            cut: '$10',
                            desc: '',
                            cellClassName: {
                                code: 'game-code'
                            }
                        };
                    }
                });
            },
            remove(idx){
                let mtk = this.data1[idx];

                this.$Modal.confirm({
                    title: 'Confirm:',
                    content: 'Are you sure you want to delete this mistake definition ('+mtk.mtk+')?',
                    onOk:()=>{

                        let sql = 'DELETE FROM MISTAKEDEF WHERE id='+mtk.id;
                        this._G.dataBase.transaction((tx)=>{
                            tx.executeSql(sql,[],(tx)=>{
                                this.loadDefinitions();
                            });
                        });

                    },
                    onCancel:()=>{
                        //
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
    .mtk-def {

    }
    .mtk-def .tool {
        padding:0 0 10px 0;
        text-align:right;
    }
    .game-code {
        color:#f23000;
    }
</style>
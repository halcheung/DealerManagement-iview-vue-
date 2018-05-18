<template>

    <div :class="'mtk '+(showLoading?'half-trans':'')">
        <div class="tool">
            <h1 :class="'month '+monthClass">{{this.$route.params.date}}</h1>
            <Button type="ghost" shape="circle" icon="android-print"></Button>
        </div>
        <table class="wrong-table">
            <thead>
                <tr>
                    <th v-for="col in columns">{{col}}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(ds,idx) in datas">
                    <td v-for="(d,index) in ds" :class="d=='0'&&index>0?'zero':''"><span @click="setTimes" :data-idy="idx" :data-idx="index" v-show="!!index">-</span>{{d}}<b @click="setTimes" :data-idy="idx" :data-idx="index" v-show="!!index">+</b></td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
    export default {
        name: "Wrongs",
        data(){
            return {
                showLoading: false,
                monthClass: 'current',
                columns: [
                    'Name'
                ],
                datas: [
                    ['A', 0],
                    ['B', 0],
                    ['C', 0],
                ],
                mtkCodes: [],
                codeLoaded: false,
            }
        },
        mounted(){
            this.$nextTick(()=>{

                this._G.dataBase.transaction((tx)=>{
                    //tx.executeSql('DROP TABLE MISTAKES');
                    tx.executeSql('CREATE TABLE IF NOT EXISTS MISTAKES (id integer primary key autoincrement, name, month, mistakes)');
                    this.init();
                });



            });
        },
        methods:{
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
            init(){

                this._G.dataBase.transaction((tx)=>{
                    tx.executeSql('SELECT * FROM MISTAKEDEF',[],(tx,result)=>{
                        let len = result.rows.length, i;
                        // mtk, code, cut, desc
                        for(i=0;i<len;i++){
                            let mtk = result.rows.item(i);
                            this.columns.push(
                                mtk.code.toUpperCase()
                            );
                        }
                        this.fetchDate();
                    });
                });

            },
            fetchDate(){

                this.startLoading();

                this.y = parseInt(this.$route.params.date.split('-')[0],10);
                this.m = parseInt(this.$route.params.date.split('-')[1],10);
                let theDate = new Date(this.y, this.m-1, 1);

                let d = new Date();
                if(d.getMonth() == theDate.getMonth()){
                    this.monthClass = 'current';
                } else if(d.getMonth() < theDate.getMonth()){
                    this.monthClass = 'next';
                } else {
                    this.monthClass = 'last';
                }

                this.datas.length = 0;

                let i=0, db = this._G.dataBase;
                let loadMtk = ()=>{

                    let dlr = this._G.dealersInfo[i];

                    db.transaction((tx)=>{
                        tx.executeSql('SELECT * FROM MISTAKES WHERE name="'+dlr.name+'" AND month="'+this.$route.params.date+'"',[],(tx,result)=>{
                            let len = result.rows.length;

                            if(len){

                                let mtk = JSON.parse(result.rows.item(0).mistakes.replace(/”/gi, '"'));
                                let mtks = [dlr.name,...mtk];
                                if(this.columns.length>mtks.length){
                                    for(let k=0;k<this.columns.length-mtks.length;k++){
                                        mtks.push('0');
                                        mtk.push('0');
                                    }
                                    tx.executeSql('UPDATE MISTAKES SET mistakes="'+JSON.stringify(mtk).replace(/"/gi,'”')+'" WHERE name="'+dlr.name+'" AND month="'+this.$route.params.date+'"');
                                }
                                this.datas.push(mtks);

                                i++;
                                if(i<this._G.dealersInfo.length){
                                    loadMtk();
                                }
                            } else {

                                let mtks = [], mtk = [];
                                for(let j=0;j<this.columns.length;j++){
                                    if(!j) {
                                        mtks.push(dlr.name);
                                    } else {
                                        mtks.push('0');
                                        mtk.push('0');
                                    }
                                }
                                this.datas.push(mtks);

                                tx.executeSql('INSERT INTO MISTAKES (name, month, mistakes) VALUES ("'+dlr.name+'","'+this.$route.params.date+'","'+JSON.stringify(mtk).replace(/"/gi,'”')+'")',[],(tx)=>{
                                    i++;
                                    if(i<this._G.dealersInfo.length){
                                        loadMtk();
                                    }
                                });
                            }
                        });
                    });


                };
                if(!i){
                    loadMtk();
                }


                console.log(this.$route.params.date);

                this.endLoading();
            },
            setTimes(event){
                let x = event.target.dataset.idx*1, y = event.target.dataset.idy*1, beh = event.target.innerHTML;
                console.log(this.datas[y][x]);

                if(beh=='+'){
                    this.datas[y][x] = this.datas[y][x]*1+1;
                } else {
                    if(this.datas[y][x]*1<=0) return;
                    this.datas[y][x] = this.datas[y][x]*1-1;
                }
                console.log(this.datas[y][x]);

                this.datas.splice(0,0);

                let origin = JSON.parse(JSON.stringify(this.datas[y]));
                let name = origin.splice(0,1);

                this._G.dataBase.transaction((tx)=>{
                    tx.executeSql('UPDATE MISTAKES SET mistakes="'+JSON.stringify(origin).replace(/"/gi,'”')+'" WHERE name="'+name[0]+'" AND month="'+this.$route.params.date+'"');
                });
            }
        },
        watch: {
            "$route": "fetchDate"
        }
    }
</script>

<style>
    .wrong-table {
        border-spacing: 1px;
        width: 100%;
        border:none;
        background-color:#e9eaec;
        border-radius:2px;
    }
    .wrong-table th, .wrong-table td {
        padding:6px 8px;
        font-size:12px;
    }
    .wrong-table th {
        background-color:#f8f8f9;
    }
    .wrong-table td {
        background-color:#fff;
        text-align: center;
        cursor: pointer;
        position: relative;
        color:#f33;
        font-weight:bold;
    }
    .wrong-table tr>td:first-child {
        color:#555;
    }
    .wrong-table td.zero {
        color:#ccc;
        font-weight:normal;
    }
    .wrong-table td:hover {
        /*background-color:#fcfcfc;*/
    }
    .wrong-table td>span, .wrong-table td>b {
        display:block;
        position: absolute;
        height:100%;
        width:30px;
        top:0;
        left:0;
        border-right:solid 1px #eee;
        background-color:#f9f9f9;
        line-height:30px;
        overflow: hidden;
        text-align: center;
        cursor: pointer;
        font-weight: normal;
        opacity: 0;
        z-index:0;
    }
    .wrong-table td>b {
        left:auto;
        right:0;
        border-right:none;
        border-left:solid 1px #eee;
        z-index:1;
    }
    .wrong-table td:active>span, .wrong-table td:active>b {
        background-color:#f3f3f3;
    }
    .wrong-table td:hover>span, .wrong-table td:hover>b {
        opacity: 0.7;
    }
    .wrong-table>thead>tr>th:first-child, .wrong-table>tbody>tr>td:first-child  {
        width:180px;
    }
    .half-trans {
        transition:all 0.5s;
        opacity: 0.3;
        pointer-events: none;
    }
    .mtk {

    }
    .mtk .tool {
        padding:0 0 0 0;
        text-align:right;
        overflow:hidden;
    }

    .game-code {
        color:#f23000;
    }
    .mtk .tool>.month {
        font-size:32px;
        display: block;
        float: left;
        transform:translateY(-5px);
    }

    .mtk .last {
        color:#aaa;
    }
    .mtk .current {
        color:#39f;
    }
    .mtk .next {
        color:#199b72;
    }

</style>
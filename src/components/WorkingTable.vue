<template>
    <div :class="'working-tables '+(showLoading?'half-trans':'')">
        <div class="tool">
            <h1 :class="'month '+monthClass">{{this.$route.params.date}}</h1>
            <Button type="ghost" shape="circle" icon="shuffle" @click="switchShift" v-show="monthClass!='last'">Switch Shift</Button>
            <Button type="ghost" shape="circle" icon="android-print" @click="print"></Button>
        </div>
        <table class="working-table">
            <thead>
                <tr>
                    <th v-for="col in columns" :style="'color:#'+((col.wd==0||col.wd==6)?'f66':'555')+';'">{{col.day}}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(ds,idx) in data1">
                    <td v-for="(d,index) in ds" :data-idy="idx" :data-idx="index" :style="'width:'+(!index?200:gridWidth)+'px;'" :class="d.cls" v-html="d.sign" @click="selectDate"></td>
                </tr>
            </tbody>
        </table>
        <Card :style="'width:'+cardWidth+'px;position:absolute;top:'+cardTop+'px;left:'+cardLeft+'px;'" v-show="cardTop>=0">
            <p slot="title">{{selectedDealer}} <span class="selected-date">{{selectedDate}}</span></p>
            <p>
                <span class="blk night" @click="selectWT">N</span>
                <span class="blk day" @click="selectWT">A</span>
                <span class="blk off" @click="selectWT">OFF</span>
                <span class="blk mc" @click="selectWT">MC</span>
                <span class="blk ul" @click="selectWT">UL</span>
                <span class="blk al" @click="selectWT">AL</span>
            </p>
            <span class="arrow"></span>
            <Button style="position: absolute; top:10px;right:8px;z-index:100;transform:scale(0.7);" type="error" shape="circle" icon="close-round" size="small" @click="hideSelection"></Button>
        </Card>
    </div>
</template>

<script>
    export default {
        name: "WorkingTable",
        data(){
            return {
                showLoading: false,
                columns: [],
                data1: [],
                wk: 0,
                isPast: false,
                cardWidth: 200,
                originTop: 115,
                originLeft: 204,
                cardTop: this.originTop,
                cardLeft: this.originLeft - this.cardWidth,
                gridWidth: 0,
                gridHeight: 25,
                daysOfMonth: 0,
                y: 0,
                m: 0,
                selectedDealer: '',
                selectedDate: '',
                currentPosition: {x:0,y:0},
                monthClass: 'current'
            }
        },
        mounted(){
            this.$nextTick(()=>{

                this._G.dataBase.transaction((tx)=>{
                    tx.executeSql('CREATE TABLE IF NOT EXISTS WORKINGTABLE (id integer primary key autoincrement, name, ydlid, month, shift, schedule)',[],(tx)=>{
                        this.fetchDate();
                    });
                    tx.executeSql('SELECT * FROM WROKINGTABLE',[],(tx,result)=>{
                        console.log(result.rows.length);
                    });
                });

            });
        },
        methods: {
            startLoading(){
                this.$Loading.start();
                this.showLoading=true;
            },
            refreshNameList(){
                this.startLoading();
                let dlrs = this.data1.slice(), lastDlr;
                this.firstRendTable();

                console.log(dlrs.length);
                console.log(this.data1.length);

                let x=0;
                for(let i=0;i<this.data1.length;i++){
                    let dsn = this.data1[i][0].sign;
                    let dlr = dlrs.find((v)=>{
                        return v[0].sign == dsn;
                    });
                    if(dlr){
                        this.data1[i] = dlr;
                    } else {
                        let s = JSON.stringify(this.data1[i][0]);
                        this.data1[i] = JSON.parse(JSON.stringify(this.data1[i-1]));
                        this.data1[i][0] = JSON.parse(s);
                    }
                }
                this.endLoading();
                this.saveWorkingTable();
            },
            print(){

                let $layout = document.getElementsByClassName('layout')[0];
                $layout.style.display = 'none';

                let $tab = document.createElement('div');
                $tab.className = 'print-container';
                $tab.innerHTML = '<div class="print-title">'+this.$route.params.date+'</div><table>'+document.getElementsByClassName('working-table')[0].innerHTML+'</table>';

                document.body.appendChild($tab);

                $tab.addEventListener('click',()=>{
                    document.body.removeChild($tab);
                    $layout.style.display = '';
                });

                //window.print();
            },
            fetchDate(){
                let d = new Date();
                d = new Date(d.getFullYear(), d.getMonth(), 1);
                let d2 = new Date(this.$route.params.date.split('-')[0]*1, this.$route.params.date.split('-')[1]*1-1, 1);

                console.log('d2<d', d2, d);
                this.isPast = d2<d;

                console.log('this.isPast', this.isPast);

                this.startLoading();

                this.rendColumns();

                this.rendTable();

                this.endLoading();
            },
            saveWorkingTable(){






            },
            endLoading(){
                setTimeout(()=>{
                    this.$Loading.finish();
                    this.showLoading=false;
                },500);
            },
            rendColumns(){

                this.wk = 0;
                this.y = parseInt(this.$route.params.date.split('-')[0],10);
                this.m = parseInt(this.$route.params.date.split('-')[1],10);
                let theDate = new Date(this.y, this.m-1, 1);
                console.log(theDate);
                this.daysOfMonth = new Date(this.y, this.m, 0).getDate();
                this.gridWidth = Math.round((document.documentElement.offsetWidth - 434 - 34)/this.daysOfMonth);

                let d = new Date();
                if(d.getMonth() == theDate.getMonth()){
                    this.monthClass = 'current';
                } else if(d.getMonth() < theDate.getMonth()){
                    this.monthClass = 'next';
                } else {
                    this.monthClass = 'last';
                }

                this.columns.length = 0;
                this.columns.push({day:'Name',wd:4});
                this.data1.length = 0;
                for(let i=1;i<=this.daysOfMonth;i++){
                    let dy = new Date(this.y,this.m-1,i);
                    this.columns.push({day:('0'+i).substr(-2),wd:dy.getDay()});
                }
            },
            rendTable(){

                let ns = 0, dlrA = [], dlrB = [], i = 0;

                for(i=0;i<this._G.dealersInfo.length;i++){
                    if(this._G.dealersInfo[i].shift=='A') {
                        dlrA.push(this._G.dealersInfo[i]);
                    } else {
                        dlrB.push(this._G.dealersInfo[i]);
                    }
                }
                let dlrs = [...dlrA,...dlrB];

                if(this.isPast){

                    this._G.dataBase.transaction((tx)=>{
                        tx.executeSql('SELECT * FROM WORKINGTABLE WHERE month="'+this.$route.params.date+'"',[],(tx,result)=>{
                            for(let m=0;m<result.rows.length;m++){
                                let days = [], elm0, ydlid;
                                ydlid = result.rows.item(m).ydlid;
                                ydlid = ydlid.indexOf('-')!=-1?ydlid.split('-')[1]:ydlid;
                                elm0 = {sign: result.rows.item(m).name + ' ('+ydlid+')', cls: 'dealer'};
                                days = [elm0, ...JSON.parse(result.rows.item(m).schedule.replace(/”/gi,'"'))];
                                this.data1.push(days);
                            }
                        });
                    });

                    return;
                }


                i=0;
                let rendDLR = ()=>{
                    //console.log('rendDLR...');
                    let dlr = dlrs[i], days = [];
                    if(dlr.name) {
                        if (dlr.job == 'Supervisor') ns++;
                        this.wk = 0;
                        for (let j = 0; j <= this.daysOfMonth; j++) {
                            if (!j) {
                                days.push({
                                    sign: dlr.name + ' (' + dlr.ydlid.replace(/YDL-/gi, '') + ')',
                                    cls: dlr.job.toLowerCase()
                                });
                            } else {
                                if (this.wk % 2 == 0) {
                                    days.push(
                                        {sign: (ns == 1 ? 'A' : 'N'), cls: (ns == 1 ? 'day' : 'night')}
                                    );
                                } else {
                                    days.push(
                                        {sign: (ns == 1 ? 'N' : 'A'), cls: (ns == 1 ? 'night' : 'day')}
                                    );
                                }
                            }
                            if (this.columns[j].wd == 6) {
                                this.wk++;
                            }
                        }
                        this.data1.push(days);
                        let d = JSON.parse(JSON.stringify(days));
                        let _d = d.splice(0,1);
                        //console.log('_d ', _d);
                        d = JSON.stringify(d);

                        this._G.dataBase.transaction((tx)=>{
                            let sql1 = 'SELECT * FROM WORKINGTABLE WHERE month="'+this.$route.params.date+'" AND name="'+dlr.name+'"';
                            //console.log('executeSql: '+sql1);
                            tx.executeSql(sql1,[],(tx,result)=>{
                                //console.log('result.len: ' + result.rows.length);
                                let len = result.rows.length, k;
                                if(len) {
                                    let _days = '';
                                    for (k = 0; k < len; k++) {
                                        //console.log(result.rows.item(k).schedule);
                                        _days = JSON.parse(result.rows.item(k).schedule.replace(/”/gi,'"'));
                                        _days = [..._d, ..._days];
                                        this.data1[this.data1.length - 1] = _days;
                                    }
                                    i++;
                                    if(i<dlrs.length){
                                        rendDLR();
                                    }
                                } else {
                                    let sql2 = 'INSERT INTO WORKINGTABLE (name, ydlid, month, shift, schedule) VALUES ("'+dlr.name+'","'+dlr.ydlid+'","'+this.$route.params.date+'","","'+d.replace(/"/gi,'”')+'")';
                                    //console.log('inserting...', sql2);
                                    tx.executeSql(sql2,[],(tx)=>{
                                        //console.log('inserted');
                                        i++;
                                        if(i<dlrs.length){
                                            rendDLR();
                                        }
                                    });
                                }
                            },(tx,error)=>{
                                console.log('error:',error);
                            });
                        });

                    } else {
                        i++;
                        if(i<dlrs.length){
                            rendDLR();
                        }
                    }

                };
                if(!i) {
                    console.log('rendDLR()');
                    rendDLR();
                }


            },
            switchShift(){
                for(let i=0;i<this.data1.length;i++){
                    for(let j=0;j<this.data1[i].length;j++){
                        if(this.data1[i][j].sign == 'A'){
                            this.data1[i][j].sign = 'N';
                            this.data1[i][j].cls = 'night';
                        } else if(this.data1[i][j].sign == 'N'){
                            this.data1[i][j].sign = 'A';
                            this.data1[i][j].cls = 'day';
                        }
                    }
                }
                this.saveWorkingTable();
            },
            selectDate(event){
                let idx = event.target.dataset.idx*1, idy = event.target.dataset.idy*1;
                console.log(idx);
                if(!idx) return;
                let left = idx*this.gridWidth + (this.originLeft - this.cardWidth),
                    top = this.originTop + this.gridHeight*idy;
                console.log(idx, idy+1);
                this.cardLeft = left;
                this.cardTop = top;
                this.selectedDealer = this._G.dealersInfo[idy].name;
                this.selectedDate = this.y + '-' + ('0'+this.m).substr(-2) +'-'+('0'+idx).substr(-2);
                this.currentPosition = {x:idx*1,y:idy};
            },
            hideSelection(){
                this.cardTop = -1;
            },
            selectWT(event){
                console.log(this.currentPosition);
                let sign = event.target.innerText,
                    cls = event.target.className.split(' ')[1];
                this.data1[this.currentPosition.y][this.currentPosition.x].sign = sign;
                this.data1[this.currentPosition.y][this.currentPosition.x].cls = cls;
                this.hideSelection();

                let copy = JSON.parse(JSON.stringify(this.data1[this.currentPosition.y]));
                let _d = copy.splice(0,1);

                this._G.dataBase.transaction((tx)=>{
                    let name = _d[0].sign.split('(')[0].trim(),
                        ydlid = _d[0].sign.split('(')[1].trim();
                    ydlid = ydlid.substr(0,ydlid.length - 1);
                    copy = JSON.stringify(copy);
                    let sql1 = 'UPDATE WORKINGTABLE SET schedule="'+copy.replace(/"/gi,'”')+'" WHERE name="'+name+'" AND month="'+this.$route.params.date+'"';
                    tx.executeSql(sql1);
                });
            },
        },
        watch: {
            "$route": "fetchDate"
        }
    }
</script>

<style>
    .half-trans {
        transition:all 0.5s;
        opacity: 0.3;
        pointer-events: none;
    }
    .working-table {
        border-spacing: 1px;
        width: 100%;
        border:none;
        background-color:#e9eaec;
        border-radius:2px;
    }
    .working-table th, .working-table td {
        padding:3px 5px;
        font-size:12px;
    }
    .working-table th {
        background-color:#f8f8f9;
    }
    .working-table td {
        background-color:#fff;
        text-align: center;
        cursor: pointer;
    }
    .working-table td:hover {
        background-color:#fcfcfc;
    }
    .working-table td:active {
        background-color:#f3f3f3;
    }
    .working-table>thead>tr>th:first-child, .working-table>tbody>tr>td:first-child  {
        width:200px;
    }
    .working-tables .tool {
        padding:0 0 10px 0;
        text-align:right;
    }
    .working-tables .last {
        color:#aaa;
    }
    .working-tables .current {
        color:#39f;
    }
    .working-tables .next {
        color:#199b72;
    }
    .working-tables .tool>a {
        display: block;
        margin-bottom: 5px;
    }
    .working-tables .day {
        color:#2d8cf0;
    }
    .working-tables .night {
        color:#8c0776;
    }
    .working-tables .supervisor {
        color:#ff7200;
    }
    .working-tables .tool>.month {
        font-size:32px;
        display: block;
        float: left;
        transform:translateY(-5px);
    }
    .working-tables .blk {
        display:inline-block;
        width:40px;
        height:36px;
        border:solid 1px #ccc;
        border-radius:3px;
        line-height:36px;
        font-size:18px;
        text-align:center;
        cursor: pointer;
        margin:0 10px 10px 0;
    }
    .working-tables .blk:hover {
        box-shadow:0 0 0 5px #f99;
    }
    .working-tables .blk:active {
        box-shadow:0 0 0 2px #c00;
    }
    .working-tables .off {
        color:#f00;
        font-weight: bold;
        letter-spacing: -2px;
    }
    .working-tables .mc, .working-tables .mc:hover {
        color:#300;
        background-color:#ff0;
    }
    .working-tables .ul, .working-tables .ul:hover {
        color:#fff;
        background-color:#f66;
    }
    .working-tables .al, .working-tables .al:hover {
        color:#fff;
        background-color:#39c;
    }
    .working-tables .mc:hover, .working-tables .ul:hover, .working-tables .al:hover {
        opacity: 0.8;
    }
    .working-tables .mc:active, .working-tables .ul:active, .working-tables .al:active {
        opacity: 0.6;
    }
    .working-tables .arrow {
        display: block;
        position: absolute;
        top:-6px;
        right:12px;
        width:10px;
        height:10px;
        border-top:solid 1px #ccc;
        border-left:solid 1px #ccc;
        background-color:#fff;
        z-index:99;
        transform:rotateZ(45deg);
    }
    .working-tables .selected-date {
        position: absolute;
        top:32px;
        left:17px;
        display: block;
        font-size:12px;
        font-weight: normal;
        color:#555;
    }

    .print-container {
        position: absolute;
        top:0;
        left:0;
        width:100%;
        height:100%;
        z-index:99999999;
    }
    .print-title {
        height:60px;
        font-size:32px;
        font-weight: bold;
        color:#000;
    }
    .print-container>table {
        border-spacing: 1px;
        width: 100%;
        border:solid 1px #000;
        background-color:#e9eaec;
        border-radius:2px;
    }
    .print-container>table th, .print-container>table td {
        padding:3px 2px;
        font-size:18px;
    }
    .print-container>table th {
        background-color:#f8f8f9;
        cursor: default;
    }
    .print-container>table td {
        background-color:#fff;
        text-align: center;
        cursor: default;
    }
    .print-container>table>thead>tr>th:first-child, .print-container>table>tbody>tr>td:first-child  {
        width:200px;
        white-space: nowrap;
        overflow: hidden;
    }
    .print-container>table .off {
        color:#f00;
        font-weight: bold;
        letter-spacing: -2px;
    }
    .print-container>table .mc {
        color:#300;
        background-color:#ff0;
    }
    .print-container>table .ul {
        color:#fff;
        background-color:#f66;
    }
    .print-container>table .al {
        color:#fff;
        background-color:#39c;
    }
    .print-container>table .day {
        color:#2d8cf0;
    }
    .print-container>table .night {
        color:#8c0776;
    }
    @media print {
        .print-container {
            position: absolute;
            top:0;
            left:0;
            width:100%;
            height:100%;
            z-index:99999999;
        }
        .print-title {
            height:60px;
            font-size:32px;
            font-weight: bold;
            color:#000;
        }
        .print-container>table {
            border-spacing: 1px;
            width: 100%;
            border:solid 1px #000;
            background-color:#666;
            border-radius:2px;
        }
        .print-container>table th, .print-container>table td {
            padding:3px 2px;
            font-size:18px;
        }
        .print-container>table th {
            background-color:#f8f8f9;
        }
        .print-container>table td {
            background-color:#fff;
            text-align: center;
            cursor: pointer;
        }
        .print-container>table>thead>tr>th:first-child, .print-container>table>tbody>tr>td:first-child  {
            width:200px;
            white-space: nowrap;
            overflow: hidden;
            color:#000;
        }
        .print-container>table .off {
            color:#f00;
            font-weight: bold;
            letter-spacing: -2px;
        }
        .print-container>table .mc {
            color:#300;
            background-color:#ff0;
        }
        .print-container>table .ul {
            color:#fff;
            background-color:#f66;
        }
        .print-container>table .al {
            color:#fff;
            background-color:#39c;
        }
        .print-container>table .day {
            color:#2d8cf0;
        }
        .print-container>table .night {
            color:#8c0776;
        }
    }
</style>
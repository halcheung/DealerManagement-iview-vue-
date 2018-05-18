<template>
    
</template>

<script>
    const dealersTitle = [
        'Supervisor', 'Assist Supervisor', 'Dealer'
    ];
    let dealersInfo = [];
    // if(localStorage.getItem('dealers')){
    //     dealersInfo = JSON.parse(localStorage.getItem('dealers').toString());
    // } else {
    //     dealersInfo = [
    //         {name: 'XXX YYY', id: 'YDL-00000', job: dealersTitle[0]},//
    //         {name: 'YYY XXX', id: 'YDL-00000', job: dealersTitle[0]},//
    //     ];
    // }
    let dataBase = openDatabase('dealersdb', '1.0', 'DB of all Dealers Management', 10 * 1024 * 1024);
    dataBase.transaction((tx) => {
        //tx.executeSql('DROP TABLE DEALERS');
        tx.executeSql('CREATE TABLE IF NOT EXISTS DEALERS (id integer primary key autoincrement, name, ydlid, job, shift)');
        tx.executeSql('SELECT * FROM DEALERS', [], (tx, results)=>{
            let len = results.rows.length;
            if(!len){
                tx.executeSql('INSERT INTO DEALERS (name, ydlid, job, shift) VALUES ("VIRTUAL SP. A", "YDL-00000", "'+dealersTitle[0]+'","A")');
                tx.executeSql('INSERT INTO DEALERS (name, ydlid, job, shift) VALUES ("VIRTUAL SP. B", "YDL-00000", "'+dealersTitle[0]+'","B")');
            }
            console.log(len);
        }, null);

        tx.executeSql('SELECT * FROM DEALERS', [], (tx, results)=>{
            let len = results.rows.length, i;
            for (i = 0; i < len; i++){
                console.log(results.rows.item(i));
                dealersInfo.push(results.rows.item(i));
            }
        }, null);
    });

    export default
    {
        dealersInfo,
        dealersTitle,
        dataBase
    }
</script>

<style scoped>

</style>
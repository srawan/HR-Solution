
const noOfCpu = require('os').cpus().length;
const cluster = require('cluster');

if(cluster.isMaster){

    console.log(` master cluster is ${process.pid} `);

    const worker = cluster.fork();
    let timeout;
    worker.on('listening', (address) => {
        worker.send('shutdown');
        worker.disconnect();
        timeout=setTimeout(()=> {
            worker.kill();
        }, 2000);
    });

    //keep track of http request

    let numReqs = 0;
    setImmediate(() => {

        console.log(`numReqs = ${numReqs}`);
    }, 1000);

    //count request 

    function messageHandler(msg){
        if(msg.cmd && msg.cmd === 'notifyRequest'){
            numReqs +=1;
        }
    }

// fork the cluster
    for(let i = 0; i <noOfCpu; i++){
        cluster.fork();
    }

    for(const id in cluster.workers) {
        cluster.workers[id].on('message', messageHandler);
    }

    cluster.on('exit', (worker, code, signal)=> {
        console.log(`worker ${worker.process.pid} is died`);
    });

    cluster.on('disconnect', () => {
        clearTimeout(timeout);
    }); 

} else {
    const express = require('express');
    const app = express();

    const winston = require('winston');
    require('./startup/logging');
    require('./startup/db')();
    require('./startup/prod')(app);
    require('./startup/routes')(app);
    require('./startup/validation');
    require('./startup/config');
    
    const port = process.env.PORT | 3000;
    process.send({cmd : 'notifyRequest'});
    app.listen(port, ()=> {console.info(`app is running on ${port} number`)})
}
const  amqp = require('amqplib/callback_api')


const AMQP_URL = "amqp://ehlbpomi:AODIFxJKO0QmTUqke2_FHjy5AKKcQ5ed@wasp.rmq.cloudamqp.com/ehlbpomi"
amqp.connect(AMQP_URL, function(err, conn){
    if(err) throw err;

    conn.createChannel(function(err,ch){
        const exchange = "audio"
        // const msg = {
        //     room: 'room1',
        //     state: 'open'
        // }
        const msg = {
            device: "local",
            classification: "camera",
            class: "6"
        }
        ch.assertExchange(exchange, 'fanout', {durable: false})

        ch.publish(exchange, '', new Buffer(JSON.stringify(msg)));
        console.log('Sent message')
    })

    setTimeout(function() { conn.close(); process.exit(0) }, 500);
});
const  amqp = require('amqplib/callback_api')
const firebase = require('firebase')
const request = require('request')

var config = {
    apiKey: "AIzaSyBHHXfc9-TGQqGBoHYzT5pVe1lT13bBCLg",
    authDomain: "fourthyear-d5634.firebaseapp.com",
    databaseURL: "https://fourthyear-d5634.firebaseio.com",
    projectId: "fourthyear-d5634",
    storageBucket: "fourthyear-d5634.appspot.com",
    messagingSenderId: "127657070211"
  };

var app = firebase.initializeApp(config)

var database  = firebase.database();

const AMQP_URL = "amqp://ehlbpomi:AODIFxJKO0QmTUqke2_FHjy5AKKcQ5ed@wasp.rmq.cloudamqp.com/ehlbpomi"
amqp.connect(AMQP_URL, function(err, conn){
    if(err) throw err;

    conn.createChannel(function(err,ch){
        const exchange = "audio"
        ch.assertExchange(exchange, 'fanout', {durable: false})

        ch.assertQueue('', {exchange:true}, function(err,q){
            console.log("Waiting for messages...")
            ch.bindQueue(q.queue, exchange, '');

            ch.consume(q.queue, function(message){
                checkCommands(JSON.parse(message.content))
                storeLogs(JSON.parse(message.content));
                // saveToFirebase(JSON.parse(message.content))
            }, {noAck:true});
        })
    })
});

function checkCommands(message){
    checkAlert(message.class)
    checkRoom(message)
}

const url = 'https://cryptic-sands-49288.herokuapp.com/api/v1/'

function checkAlert(message){
    request(url+'notifications?case='+message,function(error, response, body){
        if(error) throw error
        let b = JSON.parse(body)
        for(var i = 0; i < b.length; i++){

            request(url+'contacts?role='+b[i].notify, function(error, response, body){
                if(error) throw error
                var d = JSON.parse(body)
                console.log(d)
                for (var index = 0; index < d.length; index++) {
                    // console.log('student: ', d[index])
                    notify(d[index].role,d[index].email)
                    
                }
            })
        }

    })
}

function notify(who, email){
    request(url+'emails/'+who+'/'+email, function(error, response, body){
        if(error) throw error
        console.log(body)
    })
}

function checkRoom(message) {
    saveToFirebase(message)
}

function saveToFirebase(message) {
    database.ref('lock/'+message.room).set(message)
}

function storeLogs(message){
    database.ref('logs/'+message.classification).push(message).key
}
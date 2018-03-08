const express = require('express');
// var app = express();
// var http = require('http').createServer(app);
const mongo = require('mongodb').MongoClient;
const io = require('socket.io').listen(4000).sockets;


var users =[];
var connections=[];
//
// app.get('/',(req, res)=>{
//   res.sendFile(__dirname + '/index.html');
// });

//connect to mongodb
mongo.connect("mongodb://127.0.0.1/chat",(err,client)=>{
  if (err) {
    throw err;
  }

  console.log('MongoDb connected');
  //connect to socket.io
  io.on('connection', (socket)=>{
    connections.push(socket);
      console.log('a user connected');
      console.log('There is: '+connections.length+" users connected");
      var db = client.db("chat");
      db.collection("messages").find().toArray(function(err, result) {
      if (err) throw err;
      //send the messages to the client
      socket.emit('messages',result);

      //function to send the status message
      sendMessageStatus= (s)=>{
        socket.emit('messsage-status',s)
      }

      //console.log(result);
    });
    //deal with user input events
      socket.on('input',(data)=>{
        let name = data.name;
        let message = data.message;

        //check if valid input
        if (message === ''|| name==='') {
          //send error message
          sendRequestStatus('Please enter a name and message');
        }else {
          //insert message into mongo chat db
          var messageCollection = db.collection('messages');
          messageCollection.insert({name:name,message:message},(data)=>{
            socket.emit('output',[data]);
            sendMessageStatus({
              message:"Message Sent",
            });
          });
        }
      });
      //db.close();
      //disconnect
      socket.on('disconnect', function(data){
        connections.splice(connections.indexOf(socket),1)
        console.log('User disconnect There is: '+connections.length+" users connected");
      });
  });

});

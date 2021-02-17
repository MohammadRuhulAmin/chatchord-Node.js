const path = require('path');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {userJoin,getCurrentUser,userLeave,getRoomUsers} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
//set static folder 

 app.use(express.static(path.join(__dirname,'public')));
 const botName = 'TeamBravo';

const PORT = 3000 || process.env.PORT;

//run when client connects 
io.on('connection',socket=>{
    socket.on('joinRoom',({username,room})=>{
        const user = userJoin(socket.id,username,room);
        socket.join(user.room);

        // welcome current User
    socket.emit('message',formatMessage(botName,'Welcome to Chat Cord!'));
    // Broadcast when a user connects 
    socket.broadcast.to(user.room).emit('message',formatMessage(botName,`${user.username} has joined the chat`));

        // Send user and room info 
        io.to(user.room).emit('roomUsers',{
            room : user.room,
            users:getRoomUsers(user.room),
        });
});
    

    

  

    //Listen for chat Message
    socket.on('chatMessage',(msg)=>{
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message',formatMessage(user.username,msg));
    });
      // Ruhs when client disconnects !
      socket.on('disconnect',()=>{
          const user = userLeave(socket.id);
          if(user){
            
            io.to(user.room).emit('message',formatMessage(botName,`${user.username} has left the chat!`));
            // Send user and room info 
            io.to(user.room).emit('roomUsers',{
                room : user.room,
                users:getRoomUsers(user.room),
            });
        }
       
    });
});

server.listen(PORT,()=>console.log(`server running on port ${PORT}`));


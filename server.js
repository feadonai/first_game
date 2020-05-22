var express = require('express');

var app = express();

var http = require('http').Server(app);

var io = require('socket.io')(http);

var shortId = require('shortid');

//app.use(express.static(_dirname));

var playerOnline = {};
var quantPlayerOnlline = 0;

io.on('connection', function(socket){
  var currentPlayer;
  console.log(socket.id +"alguem conectou");
  socket.on("JOIN_GAME", function(pack){
    console.log(pack.nome + " solicitou entrar no jogo");
    currentPlayer = {
         nomePlayer: pack.nome,
         id: socket.id
    };
    quantPlayerOnlline = 0;
    for(key in playerOnline){
      quantPlayerOnlline++;
    }
    playerOnline[currentPlayer.id] = {
      nomePlayer: currentPlayer.nomePlayer,
      id: currentPlayer.id,
      tag: (quantPlayerOnlline+1)
    };
    console.log(pack.nome +" entrou no jogo. ID: " + playerOnline[currentPlayer.id].nomePlayer + "tag:" +playerOnline[currentPlayer.id].tag);
    socket.emit("JOIN_GAME_SUCESS", playerOnline[currentPlayer.id]);
    socket.broadcast.emit('SPAW_PLAYER', playerOnline[currentPlayer.id]);
    for (client in playerOnline){
      if (playerOnline[client].id != currentPlayer.id){
        socket.emit('SPAW_PLAYER', playerOnline[client]);
     }
    }


  });//end JOIN_GAME

  socket.on("SET_POS", function(pack){
  currentPlayer = {
    id: currentPlayer.id,
    posX: pack.posX,
    posY: pack.posY,
    speedX: pack.speedX,
    speedY: pack.speedY
  };

  socket.broadcast.emit("UPDATE_POS",  currentPlayer);

})//end setPos

socket.on("SET_ANIM", function(pack){
  currentPlayer = {
    id: currentPlayer.id,
    animation: pack.animation
  };
  socket.broadcast.emit("UPDATE_ANIM", currentPlayer);

});//end setAmin

socket.on("disconnect", function(){
for(key in playerOnline){
  if (playerOnline[key].id == currentPlayer.id){
    console.log(playerOnline[key].nome +" saiu do jogo. ID: " + playerOnline[key].nomePlayer + ". tag: " +playerOnline[key].tag);
    socket.broadcast.emit("PLAYER_EXIT", {id: playerOnline[key].id});
    delete playerOnline[key];
  }
}

})//end disconected
});//end io.on("conection")





//process.env.PORT ||
http.listen(process.env.PORT || 3000, function(){
  console.log("server listen in 3000");
});
  console.log("-----------------------server is running-----------------------");

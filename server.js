var express = require('express');

var app = express();

var http = require('http').Server(app);

var io = require('socket.io')(http);

var shortId = require('shortid');

//app.use(express.static(_dirname));

var playerOnline = {};
var quantPlayerOnlline = 0;
var placar = {
  player1: 0,
  player2: 0
};

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
    quantPlayerOnlline = 0;
    for(key in playerOnline){
      quantPlayerOnlline++;
    }
    console.log(pack.nome +" entrou no jogo. ID: " + playerOnline[currentPlayer.id].nomePlayer + "tag:" +playerOnline[currentPlayer.id].tag);
    socket.emit("JOIN_GAME_SUCESS", playerOnline[currentPlayer.id]);
    socket.broadcast.emit('SPAW_PLAYER', playerOnline[currentPlayer.id]);
    for (client in playerOnline){
      if (playerOnline[client].id != currentPlayer.id){
        socket.emit('SPAW_PLAYER', playerOnline[client]);
     }
    }
    if (quantPlayerOnlline >= 2){
      for(key in playerOnline){
        var IdTag1;
        var IdTag2;
        if (playerOnline[key].tag == "1"){
          IdTag1 = playerOnline[key].id;
        }else if (playerOnline[key].tag == "2"){
          IdTag2 = playerOnline[key].id;
        }
      }
      placar = {
        player1: placar.player1,
        player2: placar.player2,
        idTag1: IdTag1,
        idTag2: IdTag2
      }
      console.log("placar atual: " + placar.player1 + "/" + placar.player2);
      socket.emit("UPDATE_PLACAR", placar);
      socket.broadcast.emit("UPDATE_PLACAR", placar);
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

socket.on("SET_ATTACK", function(pack){
  console.log(pack.name + " tomou " + pack.Damage + " de dano");
  for(key in playerOnline){
    if (playerOnline[key].nomePlayer == pack.name && playerOnline[key].tag == pack.tag){
      console.log("seu ID eh : " + playerOnline[key].id);
      var dadosAttack = {
        id: playerOnline[key].id,
        Damage: pack.Damage,
        x: pack.x,
        y: pack.y,
        z: pack.z
      }
      socket.emit("UPDATE_ATTACK_PLAYER", dadosAttack);
      socket.broadcast.emit("UPDATE_ATTACK_PLAYER", dadosAttack);
    }
  }
  });//end setAttack
  socket.on("SET_PLACAR", function(pack){
    console.log(pack.name + " MORREU");
    console.log("placar antes: " + placar.player1 + "/" + placar.player2);
    for(key in playerOnline){
      var idTag1;
      var idTag2;
      if (playerOnline[key].tag == "1"){
        idTag1 = playerOnline[key].id;
      }else if (playerOnline[key].tag == "2"){
        idTag2 = playerOnline[key].id;
      }
    }
    for(key in playerOnline){
        if (playerOnline[key].tag == pack.tag){
          if (pack.tag =="1"){
            placar = {
              player1: placar.player1,
              player2: (placar.player2+1)
            }
          }
          else if (pack.tag =="2"){
            placar = {
              player1: (placar.player1+1),
              player2: placar.player2
            }
          }
          placar = {
            player1: placar.player1,
            player2: placar.player2,
            idTag1: idTag1,
            idTag2: idTag2
          }
          console.log("placar atual: " + placar.player1 + "/" + placar.player2);
          socket.emit("UPDATE_PLACAR", placar);
          socket.broadcast.emit("UPDATE_PLACAR", placar);
         }
       }
  });//end SET_PLACAR

socket.on("disconnect", function(){
for(key in playerOnline){
  if (playerOnline[key].id == currentPlayer.id){
    console.log(playerOnline[key].nomePlayer +" saiu do jogo. ID: " + playerOnline[key].id + ". tag: " +playerOnline[key].tag);
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

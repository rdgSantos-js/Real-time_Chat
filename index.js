//Arquivo de manutenção e configuração das ações do server

//Invocando módulos: Express.js e Socket.io
let express = require('express')
let app = express();
let http = require('http').createServer(app);
let io = require('socket.io')(http);

//Entregando página estática "index.html" da pasta view quando o usuário acessa o diretório "/"
app.use('/', express.static('view'))

//Preparando o socket.io para o disparo e recebimento de eventos e informações vindas do client
io.on('connection', (socket) => {

  //Evento disparado quando o usuário se conecta ao chat ("user-connect")
  socket.on('user-connect', (userName) => {
    console.log(userName + ' has connected');
 	  io.emit('user-online', userName + ' entrou');
    console.log('');
  });

  //Evento disparado quando o usuário se desconecta ao chat ("user-disconnect")
  socket.on('user-disconnect', (userName) => {
    if(userName){
    	console.log(userName + ' has disconnected');
 		io.emit('user-offline', userName + ' saiu');
    }
    console.log('');
  });

  //Evento dispara mensagem dos usuários no chat ("chat-connect")
  socket.on('chat-message', (msg) => {
  	console.log(msg.user + ': ' + msg.value)
  	console.log(msg.date)
    console.log('');
    io.emit('chat-message', msg);
  });

});

//Rodando o server na porta 3000
http.listen(3000, () => {
  console.log('Chat rodando na porta 3000');
});
//Arquivo de manutenção e configuração das ações do server

//Invocando módulos: Express.js e Socket.io
let nedb = require('nedb')
let db = new nedb({ filename: 'banco.db', autoload: true })
let express = require('express')
let app = express()
let http = require('http').createServer(app)
let io = require('socket.io')(http)

//Permite o servidor gerar respostas em JSON
app.use(express.json())

//Entregando página estática "index.html" da pasta view quando o usuário acessa o diretório "/"
app.use('/', express.static('view'))

//Preparando o socket.io para o disparo e recebimento de eventos e informações vindas do client
io.on('connection', (socket) => {

  //Evento disparado quando o usuário se conecta ao chat ("user-connect")
  socket.on('user-connect', (userObj) => {

    if(userObj.value){
        console.log(userObj.value)
        console.log('')
        // Insere informações no banco de dados
        db.insert(userObj, err=>{
        if(!err){  
          io.emit('user-online', userObj.value)
        }
      })
    }

  })

  //Evento disparado quando o usuário se desconecta ao chat ("user-disconnect")
  socket.on('user-disconnect', (userObj) => {

    console.log(userObj.value)
    console.log('')

    if(userObj){
      // Insere informações no banco de dados
      db.insert(userObj, err=>{
        if(!err){  
          io.emit('user-offline', userObj.value)
        }
      })

    }

  })

  //Evento dispara mensagem dos usuários no chat ("chat-connect")
  socket.on('chat-message', (msg) => {
  	console.log(msg.user + ': ' + msg.value)
  	console.log(msg.createdAt.date, msg.createdAt.date)
    console.log('')
    // Insere informações no banco de dados
    db.insert(msg, err=>{
      if(!err){
        io.emit('chat-message', msg)
      }
    })
  })

})

// Rota com retorno do JSON de eventos
app.get('/msg', (req, res)=>{
  db.find({}).sort({ createdAt: 2 }).exec((err, messages)=>{
   if(err) console.log(err)
   res.send(messages)
   res.end()
  })
})

//Rodando o server na porta 8080
http.listen(8080, () => {
  console.log('Chat rodando na porta 8080')
})
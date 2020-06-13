/* Arquivo das configurações do client-side */

//Invoca o socket.io no lado do cliente
let socket = io();

// Instância Vue.js
let chatView = new Vue({
	el: '#app',
	data:{
		// Array de objetos, cada objeto é uma mensagem ou evento
		eventList: [],
		// Nome do usuário
		user: ''
	},
	watch:{

		// Quando o usuário entra no chat, a informação é disparada para o socket.io no server-side
		user: (newName)=>{
			if(newName){
				socket.emit('user-connect', newName);
			}	
		},

		/*  Configuração das características da barra de rolagem do chat. 
			Por exemplo, quando o chat recebe uma mensagem ou evento
			este watcher faz com que a tela acompanhe(foque) a ultima mensagem enviada. 
			Outro exemplo: quando o usuário está procurando uma mensagem mais antiga e um evento/mensagem é injetada no chat,
			este watcher também evita que a tela foque na ultima mensagem enviada. 
		*/
		eventList: ()=>{

				let ul = document.querySelector('#chat ul').getBoundingClientRect().bottom
				let main = document.querySelector('main').getBoundingClientRect().bottom
				let lastMsg = document.querySelector('#chat ul#messages li:last-child')


				if(lastMsg !== null){

					let lastMsgPos = lastMsg.getBoundingClientRect().bottom

					if((main + 20) > lastMsgPos && lastMsgPos > (main - 20)){

						setTimeout(e=>{

							lastMsg = document.querySelector('#chat ul#messages li:last-child')					
							lastMsg.scrollIntoView()

						},50)

					}

				}
		}
	},
	filters:{

		// Configura a maneira que a data e a hora é mostrada ao usuário
		time: function (time) {
			return time.substring(0,5)
		},
		date: function (date) {

			let msgDay = date.substring(0,2)
			let msgMonth = date.substring(4,5)

			let d = new Date()
			let day = d.getDate()
			let month = d.getMonth() + 1

			if(msgDay == day && msgMonth == month){
				return 'Hoje - '
			}
			else if(msgDay == day - 1 && msgMonth == month){
				return 'Hoje - '
			}else{
				return date;
			}
		}
	},
	methods:{

		// Método para login e logout do usuário
		userLogIn(e){
			e.preventDefault();
			let newUser = e.target[0].value;
			if(newUser){
				this.user = newUser
				e.target[0].value = ''
			}
		},
		userLogOut(){
			socket.emit('user-disconnect', this.user)
			this.user = '';
		},

		// Método de envio de mensagens
		submitMessage(e){
			e.preventDefault()

			let value = e.target[0].value
			e.target[0].value = ''

			if(value!==''){
				let d = new Date()	
				let user = this.user;

				let msgObject = {
					user,
					value,
					date: this.getFormattedDate(d)
				}

				socket.emit('chat-message', msgObject)

			}

		},

		// Retorna a data e a hora
		getFormattedDate(d){
			let day, createdTime, month, year = d.getFullYear()
			d.getDate() < 10 ? day = '0' + d.getDate() : day = d.getDate()
			d.getMonth() < 10 ? month = '0' + (d.getMonth() + 1) : month = d.getMonth()

			let date = day + '-' + month + '-' + year
			let time = d.toLocaleTimeString() 

			createdTime = {
				date,
				time
			}

			return createdTime
		}
	},
	created(){

		/* Quando a página é criada, também são criado estes receptores que
		   capturam as informações de mensagens, login e logout dos usuários
		   vindas do socket.io no server-side, criando a interação dos clients dos usuários conectados.
		*/
		socket.on('chat-message', (msgInfo)=>{
      		this.eventList.push({
      			user: msgInfo.user,
      			value: msgInfo.value,
      			createdAt: msgInfo.date,
      			type: 'eventMsg'
      		})
    	})
    	socket.on('user-online', (userInfo)=>{
      		this.eventList.push({
      			value: userInfo,
      			type: 'infoMsg'
      		})
    	})
    	socket.on('user-offline', (userInfo)=>{
      		this.eventList.push({
      			value: userInfo,
      			type: 'infoMsg'
      		})
    	})

	}
})
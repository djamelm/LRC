(function() {
	// Int code
	var audio, agent;

	// Navigateur
	agent = navigator.userAgent.toLowerCase();
	if(agent.indexOf('firefox') != -1 || agent.indexOf('opera') != -1) {
		//ext = ".ogg";
	}

	// Audio Object
	var audio = window.audio = new Audio();
	audio.loop = false;
	audio.volume = (Cookies.get('volume')==undefined)?0.8:Number(Cookies.get('volume'))/100

	// App
	var vm = window.app = new Vue({
		el: '#app',
		data: {
			timecur: {xx:"00",ss:"00",mm:"00"},
			timedur: {xx:"00",ss:"00",mm:"00"},
			curtime: 0,
			durtime: 0,
			vol: audio.volume*100,
			mute: false,
			speed: "1.00",
			playbackRate: 1,
			playbtn: false,
			page: "edit",
			ligne:[
				{time: '0', xx:'00', ss:'00', mm:'00', text:''}
			]
		},
		methods: {
			goto: function(event){
				audio.currentTime = event.target.dataset.time/100
			},
			playPause: function(){
				if(audio.paused){
					audio.play();
					this.playbtn = true
				} else {
					audio.pause();
					this.playbtn = false
				}
			},
			muted: function(){
				if(audio.muted){
					audio.muted = false;
					this.mute = false;
				} else {
					audio.muted = true;
					this.mute = true;
				}
			},
			speedbtn: function(){
				audio.playbackRate = 1
				this.playbackRate = 1
				this.speed = '1.00'
			},
			replay: function(){
				audio.currentTime = audio.currentTime - 5 * audio.playbackRate;
			},
			forward: function(){
				audio.currentTime = audio.currentTime + 5 * audio.playbackRate;
			},
			lyrics: function(event){
				var text = event.target.value
				//vm.ligne=[]
				a=text.split("\n")
				$.each(a, function(n, elem) {
					if(vm.ligne.length<n+1){
						vm.ligne.push({time: '0', xx:'00', ss:'00', mm:'00', text:elem})
					}else{
						vm.ligne[n].text=elem
					}
				})
				$.each(vm.ligne, function(n, elem) {
					if(a.length<n+1){
						vm.ligne.splice(n,1)
					}
				})
			},
			timer: function(event){
				var l =event.target.dataset.index
				this.ligne[l].time=Math.floor(audio.currentTime*100);
				var mm = Math.floor(audio.currentTime / 60);
				var ss = Math.floor(audio.currentTime - mm * 60);
				var xx = Math.floor((audio.currentTime - mm * 60 - ss) * 100);
				this.ligne[l].xx=(xx < 10)?"0"+xx:xx
				this.ligne[l].ss=(ss < 10)?"0"+ss:ss
				this.ligne[l].mm=(mm < 10)?"0"+mm:mm
			},
			goto: function(event){
				audio.currentTime = event.target.dataset.time/100
			}
		},
		computed: {
		    annee: {
		        get: function(){
	                moy=[0,0,0], coef=0, cre=[0,0,0]
	                $.each(this.clcunite, function(i, v){
	                    moy[1] += Number(v.moy[0])*Number(v.coef)
	                    moy[2] += Number(v.moy[1])*Number(v.coef)
	                    coef += Number(v.coef)
	                    cre[1] += Number(v.cre[0])
	                    cre[2] += Number(v.cre[1])
	                })
	                moy[1] = Number((moy[1]/coef).toFixed(2))
	                moy[2] = Number((moy[2]/coef).toFixed(2))
	                moy[0] = Number(((Number(moy[1])+Number(moy[2]))/2).toFixed(2))
	                if(moy[1]>=10||moy[0]>=10){
	                    cre[1] = 30
	                }else if(moy[2]>=10||moy[0]>=10){
	                    cre[2] = 30
	                }
	                cre[0]=cre[1]+cre[2]
	                this.moyenne = moy
	                return {moy:moy,cre:cre}
		        }
		    }
        }
	})
	// Event
	$(audio).on("ended", function(){
		switchTrack(audio.src);
	});
	$(audio).on('loadeddata', function() {
		audio.play()
		timeupdate()
	});
	$(audio).on('timeupdate', function(){
		timeupdate()
		if(audio.paused){
			vm.playbtn = false
		} else {
			vm.playbtn = true
		}
	});
	$(".time-line-slider>input").on("click mouseup mousedown", function(event){
		audio.pause();
		audio.currentTime = this.value/100
		audio.play();
	})
	$(".volume-slider-slider>input").on("mouseup", function(event){
		audio.volume = this.value/100
		Cookies.set('volume', this.value)
	})
	$(".playbackrate-slider>input").on("mouseup", function(event){
		audio.playbackRate = this.value
		vm.speed = Number(this.value).toFixed(2)
	})
	// Function
	Number.prototype.time = function() {
		var t,
			mm = Math.floor((this/100) / 60),
			ss = Math.floor((this/100) - mm * 60),
			xx = Math.floor(((this/100) - mm * 60 - ss) * 100)
		return {xx:(xx < 10)?"0"+xx:xx,ss:(ss < 10)?"0"+ss:ss,mm:(mm < 10)?"0"+mm:mm}
	}
	function timeupdate(){
		vm.durtime = Number(audio.duration*100)
		vm.curtime = Number(audio.currentTime*100)
		vm.timedur = Number(audio.duration*100).time()
		vm.timecur = Number(audio.currentTime*100).time()
	}
	function switchTrack(e){
		var file, objectUrl;
		if(typeof e === "object"){
			file = e.currentTarget.files[0];
			if (file) {
				objectUrl = URL.createObjectURL(file);
			}
		} else {
			file = e;
			objectUrl = file;
		}
		if (file) {
			audio.src = objectUrl;
		}
	}
document.querySelector("#open").addEventListener("change", switchTrack);
})()
$('#modal_settings_input_downloadTracksLocation').on('click', function () {
	let originalValue = $(this).val();
	let newValue = dialog.showOpenDialog({
		properties: ['openDirectory']
	})
	if (typeof newValue !== 'undefined'){
		$(this).val(newValue);
	}
});
//var file = new File(["Hello, world!"], "hello world.txt", {type: "text/plain;charset=utf-8"});
//FileSaver.saveAs(file);
shortcut.add("ctrl + k", function() {
	if(audio.paused){
		audio.play();
	} else {
		audio.pause();
	}
});
/********************************************************************/
audio.src = "/assets/mp3/02. Hayce Lemsi - Havana"
	/*var dialog = remote.dialog;
let newValue = dialog.showOpenDialog({
		properties: ['openDirectory']
	})
	console.log(newValue)*/

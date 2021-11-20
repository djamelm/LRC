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
	audio.src = "01. El Houcine Haddadh - Electronique.mp3";
	audio.loop = false;
	audio.volume = (Cookies.get('volume')==undefined)?0.8:Number(Cookies.get('volume'))/100

	// App
	var vm = window.app = new Vue({
		el: '#app',
		data: {
			audio: {
				curtime: 0,
				durtime: 0,
				vol: audio.volume*100,
				mute: false,
				playbackRate: 1,
				playbtn: true,
			},
			page: "edit",
			lrc:[
				{time: '0', xx:'00', ss:'00', mm:'00', text:''}
			],
			metadata:{
				title: '',
				artist: '',
				composer: '',
				copyright: '',
				album_artist: '',
				album: '',
				speed: '',
				genre: '',
				Cover: '',
				piste: '',
				cdmax: '',
				lang: '',
				year: '',
				lrc:''
			},

		},
		methods: {
			goto: function(event){
				audio.currentTime = event.target.dataset.time/100
			},
			playPause: function(){
				if(audio.paused){
					audio.play();
				} else {
					audio.pause();
				}
			},
			muted: function(){
				audio.muted = !audio.muted;
				this.audio.mute = audio.muted;
			},
			speedbtn: function(){
				audio.playbackRate = 1
				this.audio.playbackRate = 1
			},
			replay: function(){
				audio.currentTime = audio.currentTime - 5 * audio.playbackRate;
			},
			forward: function(){
				audio.currentTime = audio.currentTime + 5 * audio.playbackRate;
			},
			lyrics: function(event){
				var text = event.target.value
				a=text.split("\n")
				$.each(a, function(n, elem) {
					if(vm.lrc.length<n+1){
						vm.lrc.push({time: '0', xx:'00', ss:'00', mm:'00', text:elem})
					}else{
						vm.lrc[n].text=elem
					}
				})
				$.each(vm.lrc, function(n, elem) {
					if(a.length<n+1){
						vm.lrc.splice(n,1)
					}
				})
			},
			timer: function(event){
				var l =event.target.dataset.index
				this.lrc[l]=time(Math.floor(audio.currentTime*100));
				this.lrc[l].time=Math.floor(audio.currentTime*100);
			},
			time: function(val) {
				mm = Math.floor((val/100) / 60),
				ss = Math.floor((val/100) - mm * 60),
				xx = Math.floor(((val/100) - mm * 60 - ss) * 100)
				return {xx:(xx < 10)?"0"+xx:xx,ss:(ss < 10)?"0"+ss:ss,mm:(mm < 10)?"0"+mm:mm}
			}
		},
		computed: {
			speed: function () {
			  return Number(this.audio.playbackRate).toFixed(2);
			},
			durtime: function () {
				val=this.audio.durtime
				mm = Math.floor((val/100) / 60),
				ss = Math.floor((val/100) - mm * 60),
				xx = Math.floor(((val/100) - mm * 60 - ss) * 100)
				return {xx:(xx < 10)?"0"+xx:xx,ss:(ss < 10)?"0"+ss:ss,mm:(mm < 10)?"0"+mm:mm}
			},
			curtime: function () {
				val=this.audio.curtime
				mm = Math.floor((val/100) / 60),
				ss = Math.floor((val/100) - mm * 60),
				xx = Math.floor(((val/100) - mm * 60 - ss) * 100)
				return {xx:(xx < 10)?"0"+xx:xx,ss:(ss < 10)?"0"+ss:ss,mm:(mm < 10)?"0"+mm:mm}
			}
        }
	})
	// Event
	$(audio).on("ended", function(){
		switchTrack(audio.src);
	});
	$(audio).on('loadeddata', function() {
		timeupdate()
	});
	$(audio).on('timeupdate', function(){
		timeupdate()
	});
	$(audio).on('pause', function(){
		vm.audio.playbtn = false
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
	})
	// Function
	window.time = function(val) {
			mm = Math.floor((val/100) / 60),
			ss = Math.floor((val/100) - mm * 60),
			xx = Math.floor(((val/100) - mm * 60 - ss) * 100)
		return {xx:(xx < 10)?"0"+xx:xx,ss:(ss < 10)?"0"+ss:ss,mm:(mm < 10)?"0"+mm:mm}
	}
	function timeupdate(){
		vm.audio.durtime = Number(audio.duration*100)
		vm.audio.curtime = Number(audio.currentTime*100)
		vm.audio.playbtn = !audio.paused
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
shortcut.add("ctrl + k", function() {
	if(audio.paused){
		audio.play();
	} else {
		audio.pause();
	}
});
document.querySelector('input[type="file"]').onchange = function(e) {
	var reader = new FileReader();
	reader.onload = function(e) {
		var dv = new jDataView(this.result);
		// "TAG" starts at byte -128 from EOF.
		// See http://en.wikipedia.org/wiki/ID3
		if (dv.getString(3, dv.byteLength - 128) == 'TAG') {
			var title = dv.getString(30, dv.tell());
			var artist = dv.getString(30, dv.tell());
			var album = dv.getString(30, dv.tell());
			var year = dv.getString(4, dv.tell());
			app.metadata.title=title;
			app.metadata.artist=artist;
			app.metadata.album_artist=artist;
			app.metadata.album=album;
			app.metadata.year=year;
		}
   	};
   	reader.readAsArrayBuffer(this.files[0]);
	var data = "[ti:titre]\n[ar:artiste]\n[al:album]"
	var file = new Blob([data], {type: "text/plain;charset=utf-8"});
	saveAs(file, app.metadata.artist+" - "+app.metadata.title+".lrc");
 };
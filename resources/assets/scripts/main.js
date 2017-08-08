/* define variables */
var leftchannel = [];
var rightchannel = [];
var recorder = null;
var recording = false;
var recordingLength = 0;
var volume = null;
var audioInput = null;
var sampleRate = null;
var audioContext = null;
var context = null;
var outputElement = document.getElementById('output');
var outputString;
var averageVol;

/* watson communication object */
var watson = {
	query: function(question, callback) {
		var _token = $('[name="_token"]').val();
		$.ajax({
			method: "POST",
			url: "/",
			data: { search: question, _token: _token},
			success:function(message) {
				return callback(message);
			},
			error: function(e) {
				console.log(e);
			}
		});
	},

	playSound: function(file) {
		var audio = new Audio('../generated/t2s/' + file);
		var audioSrc = context.createMediaElementSource(audio);
		var analyser = context.createAnalyser();

		// we have to connect the MediaElementSource with the analyser
		audioSrc.connect(analyser);
		audioSrc.connect(context.destination);

		// frequencyBinCount tells you how many values you'll receive from the analyser
		var frequencyData = new Uint8Array(analyser.frequencyBinCount);

		// we're ready to receive some data!
		// loop
		function renderFrame() {
			requestAnimationFrame(renderFrame);
			analyser.getByteFrequencyData(frequencyData);
			var values = 0;
	        var length = frequencyData.length;
	        // get all the frequency amplitudes
	        for (var i = 0; i < length; i++) {
	            values += frequencyData[i];
	        }
	        averageVol = values / length;
		}

		audio.play();
		renderFrame();
	},

	doText:function (message) {
    	var requestString = '';
	    var responseString = '';

	    if(message) {
	    	$('img').removeClass('active');
	    	var requestString = '<li class="watson watsonRequest"><p>' + message.replace(/['"]+/g, '') + "</p></li>";

	   	 	$('ul').append(requestString);
	   	 	$("ul").animate({ scrollTop: $("ul")[0].scrollHeight }, 2000);
	   	 	$('li').addClass('active');

	   	 	$('#search').val('').focus();

	    	watson.query(message, function(data){
		    	var response = JSON.parse(data).response;

		    	$.each(response, function( key, value ) {
		    		responseString += value + "<br/>";
				});

		    	watson.playSound(JSON.parse(data).audio);

		    	if(typeof JSON.parse(data).image != 'undefined') {
		    		responseString = '<li style="max-height:13rem;height:13rem;" class="watson watsonResponse"><p>' + responseString + " <img style='padding: 1rem;height: 8rem; position: absolute; right: 0; bottom: rem;top: 3rem;' src='" + JSON.parse(data).image +"' /></p></li>";
		    	} else {
		    		responseString = '<li class="watson watsonResponse"><p>' + responseString + "</p></li>";
		    	}

		    	$('ul').append(responseString);
				$("ul").animate({ scrollTop: $("ul")[0].scrollHeight }, 2000);
				$('li').addClass('active');
		    });
	    }
    }
};

/* Define Sound Procecessor */
var soundProcessor = {

	init: function() {
		if (!navigator.getUserMedia) {
			 navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
		                      navigator.mozGetUserMedia || navigator.msGetUserMedia;
		                  }
		if (navigator.getUserMedia){
		    navigator.getUserMedia({audio:true}, this.success, function(e) {
		    	alert('Error capturing audio.');
		    });
		} else {
			alert('getUserMedia not supported in this browser.');
		}
	},

	success: function(e){
	    audioContext = window.AudioContext || window.webkitAudioContext;
	    context = new audioContext();

	    // retrieve the current sample rate to be used for WAV packaging
	    sampleRate = context.sampleRate;

	    // creates a gain node
	    volume = context.createGain();
	    audioInput = context.createMediaStreamSource(e);

	    audioInput.connect(volume);

	    var bufferSize = 2048;
	    recorder = context.createScriptProcessor(bufferSize, 2, 2);

	    recorder.onaudioprocess = function(e){
	        var left = e.inputBuffer.getChannelData (0);
	        var right = e.inputBuffer.getChannelData (1);

	        // we clone the samples
	        leftchannel.push (new Float32Array (left));
	        rightchannel.push (new Float32Array (right));
	        recordingLength += bufferSize;
	    }

	    // we connect the recorder
	    volume.connect (recorder);
	    recorder.connect (context.destination);
	},

	mergeBuffers: function(channelBuffer, recordingLength){
		var result = new Float32Array(recordingLength);
		var offset = 0;
		var lng = channelBuffer.length;

		for (var i = 0; i < lng; i++){
			var buffer = channelBuffer[i];
			result.set(buffer, offset);
			offset += buffer.length;
		}
		return result;
	},

	interleave:function(leftChannel, rightChannel){
		var length = leftChannel.length + rightChannel.length;
		var result = new Float32Array(length);

		var inputIndex = 0;

		for (var index = 0; index < length; ){
			result[index++] = leftChannel[inputIndex];
			result[index++] = rightChannel[inputIndex];
			inputIndex++;
		}
		return result;
	},

	writeUTFBytes:function(view, offset, string){
		var lng = string.length;
		for (var i = 0; i < lng; i++){
			view.setUint8(offset + i, string.charCodeAt(i));
		}
	}
}
/* On load calls */
$(document).ready(function ($) {
    "use strict"

    soundProcessor.init();

   	$('#record').on('click', function(e) {
   		if(recording === false) {
   			$('.circle').addClass('recording');

	        recording = true;
	        leftchannel.length = rightchannel.length = 0;
	        recordingLength = 0;
   		} else {
   			$('.circle').removeClass('recording');

	        recording = false;

	        // we flat the left and right channels down
	        var leftBuffer = soundProcessor.mergeBuffers(leftchannel,recordingLength );
	        var rightBuffer = soundProcessor.mergeBuffers(rightchannel,recordingLength );
	        // we interleave both channels together
	        var interleaved = soundProcessor.interleave (leftBuffer, rightBuffer);

	        // we create our wav file
	        var buffer = new ArrayBuffer(44 + interleaved.length * 2);
	        var view = new DataView(buffer);

	        // RIFF chunk descriptor
	        soundProcessor.writeUTFBytes(view, 0, 'RIFF');
	        view.setUint32(4, 44 + interleaved.length * 2, true);
	        soundProcessor.writeUTFBytes(view, 8, 'WAVE');

	        // FMT sub-chunk
	        soundProcessor.writeUTFBytes(view, 12, 'fmt ');
	        view.setUint32(16, 16, true);
	        view.setUint16(20, 1, true);
	        // stereo (2 channels)
	        view.setUint16(22, 2, true);
	        view.setUint32(24, sampleRate, true);
	        view.setUint32(28, sampleRate * 4, true);
	        view.setUint16(32, 4, true);
	        view.setUint16(34, 16, true);
	        // data sub-chunk
	        soundProcessor.writeUTFBytes(view, 36, 'data');
	        view.setUint32(40, interleaved.length * 2, true);

	        // write the PCM samples
	        var lng = interleaved.length;
	        var index = 44;
	        var volume = 1;
	        for (var i = 0; i < lng; i++){
	            view.setInt16(index, interleaved[i] * (0x7FFF * volume), true);
	            index += 2;
	        }

	        // our final binary blob
	        var blob = new Blob ([view], { type : 'audio/wav' } );
			var url = (window.URL || window.webkitURL).createObjectURL(blob);
		    var fd = new FormData();

			uploadAudio(blob)

			function uploadAudio(blob) {
				var reader = new FileReader();
				// $('img').addClass('active');

				reader.onload = function(event){
					var fd = {};
					fd["fname"] = "test.wav";
					fd["data"] = event.target.result;
					$.ajax({
						type: 'POST',
						url: '/uploads',
						data: fd,
						dataType: 'text'
					}).done(function(message) {
						watson.doText(message);
					});
				};

				reader.readAsDataURL(blob);
			}
		}
   	});

    $('form').on('submit', function(e){
    	e.preventDefault();
	    var message = $('#search').val();

	    watson.doText(message);
    });
});

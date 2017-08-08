(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

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
	query: function query(question, callback) {
		var _token = $('[name="_token"]').val();
		$.ajax({
			method: "POST",
			url: "/",
			data: { search: question, _token: _token },
			success: function success(message) {
				return callback(message);
			},
			error: function error(e) {
				console.log(e);
			}
		});
	},

	playSound: function playSound(file) {
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

	doText: function doText(message) {
		var requestString = '';
		var responseString = '';

		if (message) {
			$('img').removeClass('active');
			var requestString = '<li class="watson watsonRequest"><p>' + message.replace(/['"]+/g, '') + "</p></li>";

			$('ul').append(requestString);
			$("ul").animate({ scrollTop: $("ul")[0].scrollHeight }, 2000);
			$('li').addClass('active');

			$('#search').val('').focus();

			watson.query(message, function (data) {
				var response = JSON.parse(data).response;

				$.each(response, function (key, value) {
					responseString += value + "<br/>";
				});

				watson.playSound(JSON.parse(data).audio);

				if (typeof JSON.parse(data).image != 'undefined') {
					responseString = '<li style="max-height:13rem;height:13rem;" class="watson watsonResponse"><p>' + responseString + " <img style='padding: 1rem;height: 8rem; position: absolute; right: 0; bottom: rem;top: 3rem;' src='" + JSON.parse(data).image + "' /></p></li>";
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

	init: function init() {
		if (!navigator.getUserMedia) {
			navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
		}
		if (navigator.getUserMedia) {
			navigator.getUserMedia({ audio: true }, this.success, function (e) {
				alert('Error capturing audio.');
			});
		} else {
			alert('getUserMedia not supported in this browser.');
		}
	},

	success: function success(e) {
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

		recorder.onaudioprocess = function (e) {
			var left = e.inputBuffer.getChannelData(0);
			var right = e.inputBuffer.getChannelData(1);

			// we clone the samples
			leftchannel.push(new Float32Array(left));
			rightchannel.push(new Float32Array(right));
			recordingLength += bufferSize;
		};

		// we connect the recorder
		volume.connect(recorder);
		recorder.connect(context.destination);
	},

	mergeBuffers: function mergeBuffers(channelBuffer, recordingLength) {
		var result = new Float32Array(recordingLength);
		var offset = 0;
		var lng = channelBuffer.length;

		for (var i = 0; i < lng; i++) {
			var buffer = channelBuffer[i];
			result.set(buffer, offset);
			offset += buffer.length;
		}
		return result;
	},

	interleave: function interleave(leftChannel, rightChannel) {
		var length = leftChannel.length + rightChannel.length;
		var result = new Float32Array(length);

		var inputIndex = 0;

		for (var index = 0; index < length;) {
			result[index++] = leftChannel[inputIndex];
			result[index++] = rightChannel[inputIndex];
			inputIndex++;
		}
		return result;
	},

	writeUTFBytes: function writeUTFBytes(view, offset, string) {
		var lng = string.length;
		for (var i = 0; i < lng; i++) {
			view.setUint8(offset + i, string.charCodeAt(i));
		}
	}
};
/* On load calls */
$(document).ready(function ($) {
	"use strict";

	soundProcessor.init();

	$('#record').on('click', function (e) {
		if (recording === false) {
			$('.circle').addClass('recording');

			recording = true;
			leftchannel.length = rightchannel.length = 0;
			recordingLength = 0;
		} else {
			var uploadAudio = function uploadAudio(blob) {
				var reader = new FileReader();
				// $('img').addClass('active');

				reader.onload = function (event) {
					var fd = {};
					fd["fname"] = "test.wav";
					fd["data"] = event.target.result;
					$.ajax({
						type: 'POST',
						url: '/uploads',
						data: fd,
						dataType: 'text'
					}).done(function (message) {
						watson.doText(message);
					});
				};

				reader.readAsDataURL(blob);
			};

			$('.circle').removeClass('recording');

			recording = false;

			// we flat the left and right channels down
			var leftBuffer = soundProcessor.mergeBuffers(leftchannel, recordingLength);
			var rightBuffer = soundProcessor.mergeBuffers(rightchannel, recordingLength);
			// we interleave both channels together
			var interleaved = soundProcessor.interleave(leftBuffer, rightBuffer);

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
			for (var i = 0; i < lng; i++) {
				view.setInt16(index, interleaved[i] * (0x7FFF * volume), true);
				index += 2;
			}

			// our final binary blob
			var blob = new Blob([view], { type: 'audio/wav' });
			var url = (window.URL || window.webkitURL).createObjectURL(blob);
			var fd = new FormData();

			uploadAudio(blob);
		}
	});

	$('form').on('submit', function (e) {
		e.preventDefault();
		var message = $('#search').val();

		watson.doText(message);
	});
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJyZXNvdXJjZXMvYXNzZXRzL3NjcmlwdHMvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7OztBQ0NBLElBQUksY0FBYyxFQUFkO0FBQ0osSUFBSSxlQUFlLEVBQWY7QUFDSixJQUFJLFdBQVcsSUFBWDtBQUNKLElBQUksWUFBWSxLQUFaO0FBQ0osSUFBSSxrQkFBa0IsQ0FBbEI7QUFDSixJQUFJLFNBQVMsSUFBVDtBQUNKLElBQUksYUFBYSxJQUFiO0FBQ0osSUFBSSxhQUFhLElBQWI7QUFDSixJQUFJLGVBQWUsSUFBZjtBQUNKLElBQUksVUFBVSxJQUFWO0FBQ0osSUFBSSxnQkFBZ0IsU0FBUyxjQUFULENBQXdCLFFBQXhCLENBQWhCO0FBQ0osSUFBSSxZQUFKO0FBQ0EsSUFBSSxVQUFKOzs7QUFHQSxJQUFJLFNBQVM7QUFDWixRQUFPLGVBQVMsUUFBVCxFQUFtQixRQUFuQixFQUE2QjtBQUNuQyxNQUFJLFNBQVMsRUFBRSxpQkFBRixFQUFxQixHQUFyQixFQUFULENBRCtCO0FBRW5DLElBQUUsSUFBRixDQUFPO0FBQ04sV0FBUSxNQUFSO0FBQ0EsUUFBSyxHQUFMO0FBQ0EsU0FBTSxFQUFFLFFBQVEsUUFBUixFQUFrQixRQUFRLE1BQVIsRUFBMUI7QUFDQSxZQUFRLGlCQUFTLE9BQVQsRUFBa0I7QUFDekIsV0FBTyxTQUFTLE9BQVQsQ0FBUCxDQUR5QjtJQUFsQjtBQUdSLFVBQU8sZUFBUyxDQUFULEVBQVk7QUFDbEIsWUFBUSxHQUFSLENBQVksQ0FBWixFQURrQjtJQUFaO0dBUFIsRUFGbUM7RUFBN0I7O0FBZVAsWUFBVyxtQkFBUyxJQUFULEVBQWU7QUFDekIsTUFBSSxRQUFRLElBQUksS0FBSixDQUFVLHNCQUFzQixJQUF0QixDQUFsQixDQURxQjtBQUV6QixNQUFJLFdBQVcsUUFBUSx3QkFBUixDQUFpQyxLQUFqQyxDQUFYLENBRnFCO0FBR3pCLE1BQUks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b250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyogZGVmaW5lIHZhcmlhYmxlcyAqL1xudmFyIGxlZnRjaGFubmVsID0gW107XG52YXIgcmlnaHRjaGFubmVsID0gW107XG52YXIgcmVjb3JkZXIgPSBudWxsO1xudmFyIHJlY29yZGluZyA9IGZhbHNlO1xudmFyIHJlY29yZGluZ0xlbmd0aCA9IDA7XG52YXIgdm9sdW1lID0gbnVsbDtcbnZhciBhdWRpb0lucHV0ID0gbnVsbDtcbnZhciBzYW1wbGVSYXRlID0gbnVsbDtcbnZhciBhdWRpb0NvbnRleHQgPSBudWxsO1xudmFyIGNvbnRleHQgPSBudWxsO1xudmFyIG91dHB1dEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnb3V0cHV0Jyk7XG52YXIgb3V0cHV0U3RyaW5nO1xudmFyIGF2ZXJhZ2VWb2w7XG5cbi8qIHdhdHNvbiBjb21tdW5pY2F0aW9uIG9iamVjdCAqL1xudmFyIHdhdHNvbiA9IHtcblx0cXVlcnk6IGZ1bmN0aW9uKHF1ZXN0aW9uLCBjYWxsYmFjaykge1xuXHRcdHZhciBfdG9rZW4gPSAkKCdbbmFtZT1cIl90b2tlblwiXScpLnZhbCgpO1xuXHRcdCQuYWpheCh7XG5cdFx0XHRtZXRob2Q6IFwiUE9TVFwiLFxuXHRcdFx0dXJsOiBcIi9cIixcblx0XHRcdGRhdGE6IHsgc2VhcmNoOiBxdWVzdGlvbiwgX3Rva2VuOiBfdG9rZW59LFxuXHRcdFx0c3VjY2VzczpmdW5jdGlvbihtZXNzYWdlKSB7XG5cdFx0XHRcdHJldHVybiBjYWxsYmFjayhtZXNzYWdlKTtcblx0XHRcdH0sXG5cdFx0XHRlcnJvcjogZnVuY3Rpb24oZSkge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhlKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSxcblxuXHRwbGF5U291bmQ6IGZ1bmN0aW9uKGZpbGUpIHtcblx0XHR2YXIgYXVkaW8gPSBuZXcgQXVkaW8oJy4uL2dlbmVyYXRlZC90MnMvJyArIGZpbGUpO1xuXHRcdHZhciBhdWRpb1NyYyA9IGNvbnRleHQuY3JlYXRlTWVkaWFFbGVtZW50U291cmNlKGF1ZGlvKTtcblx0XHR2YXIgYW5hbHlzZXIgPSBjb250ZXh0LmNyZWF0ZUFuYWx5c2VyKCk7XG5cblx0XHQvLyB3ZSBoYXZlIHRvIGNvbm5lY3QgdGhlIE1lZGlhRWxlbWVudFNvdXJjZSB3aXRoIHRoZSBhbmFseXNlclxuXHRcdGF1ZGlvU3JjLmNvbm5lY3QoYW5hbHlzZXIpO1xuXHRcdGF1ZGlvU3JjLmNvbm5lY3QoY29udGV4dC5kZXN0aW5hdGlvbik7XG5cblx0XHQvLyBmcmVxdWVuY3lCaW5Db3VudCB0ZWxscyB5b3UgaG93IG1hbnkgdmFsdWVzIHlvdSdsbCByZWNlaXZlIGZyb20gdGhlIGFuYWx5c2VyXG5cdFx0dmFyIGZyZXF1ZW5jeURhdGEgPSBuZXcgVWludDhBcnJheShhbmFseXNlci5mcmVxdWVuY3lCaW5Db3VudCk7XG5cblx0XHQvLyB3ZSdyZSByZWFkeSB0byByZWNlaXZlIHNvbWUgZGF0YSFcblx0XHQvLyBsb29wXG5cdFx0ZnVuY3Rpb24gcmVuZGVyRnJhbWUoKSB7XG5cdFx0XHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUocmVuZGVyRnJhbWUpO1xuXHRcdFx0YW5hbHlzZXIuZ2V0Qnl0ZUZyZXF1ZW5jeURhdGEoZnJlcXVlbmN5RGF0YSk7XG5cdFx0XHR2YXIgdmFsdWVzID0gMDtcblx0ICAgICAgICB2YXIgbGVuZ3RoID0gZnJlcXVlbmN5RGF0YS5sZW5ndGg7XG5cdCAgICAgICAgLy8gZ2V0IGFsbCB0aGUgZnJlcXVlbmN5IGFtcGxpdHVkZXNcblx0ICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG5cdCAgICAgICAgICAgIHZhbHVlcyArPSBmcmVxdWVuY3lEYXRhW2ldO1xuXHQgICAgICAgIH1cblx0ICAgICAgICBhdmVyYWdlVm9sID0gdmFsdWVzIC8gbGVuZ3RoO1xuXHRcdH1cblxuXHRcdGF1ZGlvLnBsYXkoKTtcblx0XHRyZW5kZXJGcmFtZSgpO1xuXHR9LFxuXG5cdGRvVGV4dDpmdW5jdGlvbiAobWVzc2FnZSkge1xuICAgIFx0dmFyIHJlcXVlc3RTdHJpbmcgPSAnJztcblx0ICAgIHZhciByZXNwb25zZVN0cmluZyA9ICcnO1xuXG5cdCAgICBpZihtZXNzYWdlKSB7XG5cdCAgICBcdCQoJ2ltZycpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcblx0ICAgIFx0dmFyIHJlcXVlc3RTdHJpbmcgPSAnPGxpIGNsYXNzPVwid2F0c29uIHdhdHNvblJlcXVlc3RcIj48cD4nICsgbWVzc2FnZS5yZXBsYWNlKC9bJ1wiXSsvZywgJycpICsgXCI8L3A+PC9saT5cIjtcblxuXHQgICBcdCBcdCQoJ3VsJykuYXBwZW5kKHJlcXVlc3RTdHJpbmcpO1xuXHQgICBcdCBcdCQoXCJ1bFwiKS5hbmltYXRlKHsgc2Nyb2xsVG9wOiAkKFwidWxcIilbMF0uc2Nyb2xsSGVpZ2h0IH0sIDIwMDApO1xuXHQgICBcdCBcdCQoJ2xpJykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuXG5cdCAgIFx0IFx0JCgnI3NlYXJjaCcpLnZhbCgnJykuZm9jdXMoKTtcblxuXHQgICAgXHR3YXRzb24ucXVlcnkobWVzc2FnZSwgZnVuY3Rpb24oZGF0YSl7XG5cdFx0ICAgIFx0dmFyIHJlc3BvbnNlID0gSlNPTi5wYXJzZShkYXRhKS5yZXNwb25zZTtcblxuXHRcdCAgICBcdCQuZWFjaChyZXNwb25zZSwgZnVuY3Rpb24oIGtleSwgdmFsdWUgKSB7XG5cdFx0ICAgIFx0XHRyZXNwb25zZVN0cmluZyArPSB2YWx1ZSArIFwiPGJyLz5cIjtcblx0XHRcdFx0fSk7XG5cblx0XHQgICAgXHR3YXRzb24ucGxheVNvdW5kKEpTT04ucGFyc2UoZGF0YSkuYXVkaW8pO1xuXG5cdFx0ICAgIFx0aWYodHlwZW9mIEpTT04ucGFyc2UoZGF0YSkuaW1hZ2UgIT0gJ3VuZGVmaW5lZCcpIHtcblx0XHQgICAgXHRcdHJlc3BvbnNlU3RyaW5nID0gJzxsaSBzdHlsZT1cIm1heC1oZWlnaHQ6MTNyZW07aGVpZ2h0OjEzcmVtO1wiIGNsYXNzPVwid2F0c29uIHdhdHNvblJlc3BvbnNlXCI+PHA+JyArIHJlc3BvbnNlU3RyaW5nICsgXCIgPGltZyBzdHlsZT0ncGFkZGluZzogMXJlbTtoZWlnaHQ6IDhyZW07IHBvc2l0aW9uOiBhYnNvbHV0ZTsgcmlnaHQ6IDA7IGJvdHRvbTogcmVtO3RvcDogM3JlbTsnIHNyYz0nXCIgKyBKU09OLnBhcnNlKGRhdGEpLmltYWdlICtcIicgLz48L3A+PC9saT5cIjtcblx0XHQgICAgXHR9IGVsc2Uge1xuXHRcdCAgICBcdFx0cmVzcG9uc2VTdHJpbmcgPSAnPGxpIGNsYXNzPVwid2F0c29uIHdhdHNvblJlc3BvbnNlXCI+PHA+JyArIHJlc3BvbnNlU3RyaW5nICsgXCI8L3A+PC9saT5cIjtcblx0XHQgICAgXHR9XG5cblx0XHQgICAgXHQkKCd1bCcpLmFwcGVuZChyZXNwb25zZVN0cmluZyk7XG5cdFx0XHRcdCQoXCJ1bFwiKS5hbmltYXRlKHsgc2Nyb2xsVG9wOiAkKFwidWxcIilbMF0uc2Nyb2xsSGVpZ2h0IH0sIDIwMDApO1xuXHRcdFx0XHQkKCdsaScpLmFkZENsYXNzKCdhY3RpdmUnKTtcblx0XHQgICAgfSk7XG5cdCAgICB9XG4gICAgfVxufTtcblxuLyogRGVmaW5lIFNvdW5kIFByb2NlY2Vzc29yICovXG52YXIgc291bmRQcm9jZXNzb3IgPSB7XG5cblx0aW5pdDogZnVuY3Rpb24oKSB7XG5cdFx0aWYgKCFuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhKSB7XG5cdFx0XHQgbmF2aWdhdG9yLmdldFVzZXJNZWRpYSA9IG5hdmlnYXRvci5nZXRVc2VyTWVkaWEgfHwgbmF2aWdhdG9yLndlYmtpdEdldFVzZXJNZWRpYSB8fFxuXHRcdCAgICAgICAgICAgICAgICAgICAgICBuYXZpZ2F0b3IubW96R2V0VXNlck1lZGlhIHx8IG5hdmlnYXRvci5tc0dldFVzZXJNZWRpYTtcblx0XHQgICAgICAgICAgICAgICAgICB9XG5cdFx0aWYgKG5hdmlnYXRvci5nZXRVc2VyTWVkaWEpe1xuXHRcdCAgICBuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhKHthdWRpbzp0cnVlfSwgdGhpcy5zdWNjZXNzLCBmdW5jdGlvbihlKSB7XG5cdFx0ICAgIFx0YWxlcnQoJ0Vycm9yIGNhcHR1cmluZyBhdWRpby4nKTtcblx0XHQgICAgfSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGFsZXJ0KCdnZXRVc2VyTWVkaWEgbm90IHN1cHBvcnRlZCBpbiB0aGlzIGJyb3dzZXIuJyk7XG5cdFx0fVxuXHR9LFxuXG5cdHN1Y2Nlc3M6IGZ1bmN0aW9uKGUpe1xuXHQgICAgYXVkaW9Db250ZXh0ID0gd2luZG93LkF1ZGlvQ29udGV4dCB8fCB3aW5kb3cud2Via2l0QXVkaW9Db250ZXh0O1xuXHQgICAgY29udGV4dCA9IG5ldyBhdWRpb0NvbnRleHQoKTtcblxuXHQgICAgLy8gcmV0cmlldmUgdGhlIGN1cnJlbnQgc2FtcGxlIHJhdGUgdG8gYmUgdXNlZCBmb3IgV0FWIHBhY2thZ2luZ1xuXHQgICAgc2FtcGxlUmF0ZSA9IGNvbnRleHQuc2FtcGxlUmF0ZTtcblxuXHQgICAgLy8gY3JlYXRlcyBhIGdhaW4gbm9kZVxuXHQgICAgdm9sdW1lID0gY29udGV4dC5jcmVhdGVHYWluKCk7XG5cdCAgICBhdWRpb0lucHV0ID0gY29udGV4dC5jcmVhdGVNZWRpYVN0cmVhbVNvdXJjZShlKTtcblxuXHQgICAgYXVkaW9JbnB1dC5jb25uZWN0KHZvbHVtZSk7XG5cblx0ICAgIHZhciBidWZmZXJTaXplID0gMjA0ODtcblx0ICAgIHJlY29yZGVyID0gY29udGV4dC5jcmVhdGVTY3JpcHRQcm9jZXNzb3IoYnVmZmVyU2l6ZSwgMiwgMik7XG5cblx0ICAgIHJlY29yZGVyLm9uYXVkaW9wcm9jZXNzID0gZnVuY3Rpb24oZSl7XG5cdCAgICAgICAgdmFyIGxlZnQgPSBlLmlucHV0QnVmZmVyLmdldENoYW5uZWxEYXRhICgwKTtcblx0ICAgICAgICB2YXIgcmlnaHQgPSBlLmlucHV0QnVmZmVyLmdldENoYW5uZWxEYXRhICgxKTtcblxuXHQgICAgICAgIC8vIHdlIGNsb25lIHRoZSBzYW1wbGVzXG5cdCAgICAgICAgbGVmdGNoYW5uZWwucHVzaCAobmV3IEZsb2F0MzJBcnJheSAobGVmdCkpO1xuXHQgICAgICAgIHJpZ2h0Y2hhbm5lbC5wdXNoIChuZXcgRmxvYXQzMkFycmF5IChyaWdodCkpO1xuXHQgICAgICAgIHJlY29yZGluZ0xlbmd0aCArPSBidWZmZXJTaXplO1xuXHQgICAgfVxuXG5cdCAgICAvLyB3ZSBjb25uZWN0IHRoZSByZWNvcmRlclxuXHQgICAgdm9sdW1lLmNvbm5lY3QgKHJlY29yZGVyKTtcblx0ICAgIHJlY29yZGVyLmNvbm5lY3QgKGNvbnRleHQuZGVzdGluYXRpb24pO1xuXHR9LFxuXG5cdG1lcmdlQnVmZmVyczogZnVuY3Rpb24oY2hhbm5lbEJ1ZmZlciwgcmVjb3JkaW5nTGVuZ3RoKXtcblx0XHR2YXIgcmVzdWx0ID0gbmV3IEZsb2F0MzJBcnJheShyZWNvcmRpbmdMZW5ndGgpO1xuXHRcdHZhciBvZmZzZXQgPSAwO1xuXHRcdHZhciBsbmcgPSBjaGFubmVsQnVmZmVyLmxlbmd0aDtcblxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbG5nOyBpKyspe1xuXHRcdFx0dmFyIGJ1ZmZlciA9IGNoYW5uZWxCdWZmZXJbaV07XG5cdFx0XHRyZXN1bHQuc2V0KGJ1ZmZlciwgb2Zmc2V0KTtcblx0XHRcdG9mZnNldCArPSBidWZmZXIubGVuZ3RoO1xuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9LFxuXG5cdGludGVybGVhdmU6ZnVuY3Rpb24obGVmdENoYW5uZWwsIHJpZ2h0Q2hhbm5lbCl7XG5cdFx0dmFyIGxlbmd0aCA9IGxlZnRDaGFubmVsLmxlbmd0aCArIHJpZ2h0Q2hhbm5lbC5sZW5ndGg7XG5cdFx0dmFyIHJlc3VsdCA9IG5ldyBGbG9hdDMyQXJyYXkobGVuZ3RoKTtcblxuXHRcdHZhciBpbnB1dEluZGV4ID0gMDtcblxuXHRcdGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBsZW5ndGg7ICl7XG5cdFx0XHRyZXN1bHRbaW5kZXgrK10gPSBsZWZ0Q2hhbm5lbFtpbnB1dEluZGV4XTtcblx0XHRcdHJlc3VsdFtpbmRleCsrXSA9IHJpZ2h0Q2hhbm5lbFtpbnB1dEluZGV4XTtcblx0XHRcdGlucHV0SW5kZXgrKztcblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fSxcblxuXHR3cml0ZVVURkJ5dGVzOmZ1bmN0aW9uKHZpZXcsIG9mZnNldCwgc3RyaW5nKXtcblx0XHR2YXIgbG5nID0gc3RyaW5nLmxlbmd0aDtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGxuZzsgaSsrKXtcblx0XHRcdHZpZXcuc2V0VWludDgob2Zmc2V0ICsgaSwgc3RyaW5nLmNoYXJDb2RlQXQoaSkpO1xuXHRcdH1cblx0fVxufVxuLyogT24gbG9hZCBjYWxscyAqL1xuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCQpIHtcbiAgICBcInVzZSBzdHJpY3RcIlxuXG4gICAgc291bmRQcm9jZXNzb3IuaW5pdCgpO1xuXG4gICBcdCQoJyNyZWNvcmQnKS5vbignY2xpY2snLCBmdW5jdGlvbihlKSB7XG4gICBcdFx0aWYocmVjb3JkaW5nID09PSBmYWxzZSkge1xuICAgXHRcdFx0JCgnLmNpcmNsZScpLmFkZENsYXNzKCdyZWNvcmRpbmcnKTtcblxuXHQgICAgICAgIHJlY29yZGluZyA9IHRydWU7XG5cdCAgICAgICAgbGVmdGNoYW5uZWwubGVuZ3RoID0gcmlnaHRjaGFubmVsLmxlbmd0aCA9IDA7XG5cdCAgICAgICAgcmVjb3JkaW5nTGVuZ3RoID0gMDtcbiAgIFx0XHR9IGVsc2Uge1xuICAgXHRcdFx0JCgnLmNpcmNsZScpLnJlbW92ZUNsYXNzKCdyZWNvcmRpbmcnKTtcblxuXHQgICAgICAgIHJlY29yZGluZyA9IGZhbHNlO1xuXG5cdCAgICAgICAgLy8gd2UgZmxhdCB0aGUgbGVmdCBhbmQgcmlnaHQgY2hhbm5lbHMgZG93blxuXHQgICAgICAgIHZhciBsZWZ0QnVmZmVyID0gc291bmRQcm9jZXNzb3IubWVyZ2VCdWZmZXJzKGxlZnRjaGFubmVsLHJlY29yZGluZ0xlbmd0aCApO1xuXHQgICAgICAgIHZhciByaWdodEJ1ZmZlciA9IHNvdW5kUHJvY2Vzc29yLm1lcmdlQnVmZmVycyhyaWdodGNoYW5uZWwscmVjb3JkaW5nTGVuZ3RoICk7XG5cdCAgICAgICAgLy8gd2UgaW50ZXJsZWF2ZSBib3RoIGNoYW5uZWxzIHRvZ2V0aGVyXG5cdCAgICAgICAgdmFyIGludGVybGVhdmVkID0gc291bmRQcm9jZXNzb3IuaW50ZXJsZWF2ZSAobGVmdEJ1ZmZlciwgcmlnaHRCdWZmZXIpO1xuXG5cdCAgICAgICAgLy8gd2UgY3JlYXRlIG91ciB3YXYgZmlsZVxuXHQgICAgICAgIHZhciBidWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoNDQgKyBpbnRlcmxlYXZlZC5sZW5ndGggKiAyKTtcblx0ICAgICAgICB2YXIgdmlldyA9IG5ldyBEYXRhVmlldyhidWZmZXIpO1xuXG5cdCAgICAgICAgLy8gUklGRiBjaHVuayBkZXNjcmlwdG9yXG5cdCAgICAgICAgc291bmRQcm9jZXNzb3Iud3JpdGVVVEZCeXRlcyh2aWV3LCAwLCAnUklGRicpO1xuXHQgICAgICAgIHZpZXcuc2V0VWludDMyKDQsIDQ0ICsgaW50ZXJsZWF2ZWQubGVuZ3RoICogMiwgdHJ1ZSk7XG5cdCAgICAgICAgc291bmRQcm9jZXNzb3Iud3JpdGVVVEZCeXRlcyh2aWV3LCA4LCAnV0FWRScpO1xuXG5cdCAgICAgICAgLy8gRk1UIHN1Yi1jaHVua1xuXHQgICAgICAgIHNvdW5kUHJvY2Vzc29yLndyaXRlVVRGQnl0ZXModmlldywgMTIsICdmbXQgJyk7XG5cdCAgICAgICAgdmlldy5zZXRVaW50MzIoMTYsIDE2LCB0cnVlKTtcblx0ICAgICAgICB2aWV3LnNldFVpbnQxNigyMCwgMSwgdHJ1ZSk7XG5cdCAgICAgICAgLy8gc3RlcmVvICgyIGNoYW5uZWxzKVxuXHQgICAgICAgIHZpZXcuc2V0VWludDE2KDIyLCAyLCB0cnVlKTtcblx0ICAgICAgICB2aWV3LnNldFVpbnQzMigyNCwgc2FtcGxlUmF0ZSwgdHJ1ZSk7XG5cdCAgICAgICAgdmlldy5zZXRVaW50MzIoMjgsIHNhbXBsZVJhdGUgKiA0LCB0cnVlKTtcblx0ICAgICAgICB2aWV3LnNldFVpbnQxNigzMiwgNCwgdHJ1ZSk7XG5cdCAgICAgICAgdmlldy5zZXRVaW50MTYoMzQsIDE2LCB0cnVlKTtcblx0ICAgICAgICAvLyBkYXRhIHN1Yi1jaHVua1xuXHQgICAgICAgIHNvdW5kUHJvY2Vzc29yLndyaXRlVVRGQnl0ZXModmlldywgMzYsICdkYXRhJyk7XG5cdCAgICAgICAgdmlldy5zZXRVaW50MzIoNDAsIGludGVybGVhdmVkLmxlbmd0aCAqIDIsIHRydWUpO1xuXG5cdCAgICAgICAgLy8gd3JpdGUgdGhlIFBDTSBzYW1wbGVzXG5cdCAgICAgICAgdmFyIGxuZyA9IGludGVybGVhdmVkLmxlbmd0aDtcblx0ICAgICAgICB2YXIgaW5kZXggPSA0NDtcblx0ICAgICAgICB2YXIgdm9sdW1lID0gMTtcblx0ICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxuZzsgaSsrKXtcblx0ICAgICAgICAgICAgdmlldy5zZXRJbnQxNihpbmRleCwgaW50ZXJsZWF2ZWRbaV0gKiAoMHg3RkZGICogdm9sdW1lKSwgdHJ1ZSk7XG5cdCAgICAgICAgICAgIGluZGV4ICs9IDI7XG5cdCAgICAgICAgfVxuXG5cdCAgICAgICAgLy8gb3VyIGZpbmFsIGJpbmFyeSBibG9iXG5cdCAgICAgICAgdmFyIGJsb2IgPSBuZXcgQmxvYiAoW3ZpZXddLCB7IHR5cGUgOiAnYXVkaW8vd2F2JyB9ICk7XG5cdFx0XHR2YXIgdXJsID0gKHdpbmRvdy5VUkwgfHwgd2luZG93LndlYmtpdFVSTCkuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuXHRcdCAgICB2YXIgZmQgPSBuZXcgRm9ybURhdGEoKTtcblxuXHRcdFx0dXBsb2FkQXVkaW8oYmxvYilcblxuXHRcdFx0ZnVuY3Rpb24gdXBsb2FkQXVkaW8oYmxvYikge1xuXHRcdFx0XHR2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcblx0XHRcdFx0Ly8gJCgnaW1nJykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuXG5cdFx0XHRcdHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbihldmVudCl7XG5cdFx0XHRcdFx0dmFyIGZkID0ge307XG5cdFx0XHRcdFx0ZmRbXCJmbmFtZVwiXSA9IFwidGVzdC53YXZcIjtcblx0XHRcdFx0XHRmZFtcImRhdGFcIl0gPSBldmVudC50YXJnZXQucmVzdWx0O1xuXHRcdFx0XHRcdCQuYWpheCh7XG5cdFx0XHRcdFx0XHR0eXBlOiAnUE9TVCcsXG5cdFx0XHRcdFx0XHR1cmw6ICcvdXBsb2FkcycsXG5cdFx0XHRcdFx0XHRkYXRhOiBmZCxcblx0XHRcdFx0XHRcdGRhdGFUeXBlOiAndGV4dCdcblx0XHRcdFx0XHR9KS5kb25lKGZ1bmN0aW9uKG1lc3NhZ2UpIHtcblx0XHRcdFx0XHRcdHdhdHNvbi5kb1RleHQobWVzc2FnZSk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0cmVhZGVyLnJlYWRBc0RhdGFVUkwoYmxvYik7XG5cdFx0XHR9XG5cdFx0fVxuICAgXHR9KTtcblxuICAgICQoJ2Zvcm0nKS5vbignc3VibWl0JywgZnVuY3Rpb24oZSl7XG4gICAgXHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdCAgICB2YXIgbWVzc2FnZSA9ICQoJyNzZWFyY2gnKS52YWwoKTtcblxuXHQgICAgd2F0c29uLmRvVGV4dChtZXNzYWdlKTtcbiAgICB9KTtcbn0pO1xuIl19
import AudioRecorder from './audioRecorder';
require("./css/style.css");

(() => {
var context, audioRecorder;

function prepareRecording(s) {
    var streamSource = context.createMediaStreamSource(s);
    audioRecorder = new AudioRecorder(streamSource);
}

function startRecording(button) {
    audioRecorder.startRecord();
    console.log("Recorging started...");
    document.getElementById('status').textContent = 'Recording...';
}

function stopRecording(button) {
    audioRecorder.stopRecord();
    console.log("Recorging stopped");
    document.getElementById('status').textContent = 'Stopped';
    saveRecord();
}

function saveRecord() {
    audioRecorder.exportRecord(function (data) {
        var url = URL.createObjectURL(data);
        var link = document.getElementById('downloadLink') || document.createElement('a');
        link.id = 'downloadLink';
        link.href = url;
        link.download = 'record.wav';
        link.textContent = 'Download Record';
        document.getElementById('root').appendChild(link);
        document.getElementById('status').textContent = 'Completed';
    });

}

function init() {

    window.URL = window.URL || window.webkitURL;
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

    var startRecordingButton = document.getElementById('startRecording');
    var stopRecordingButton = document.getElementById('stopRecording');

    startRecordingButton.addEventListener('click', function () {
        startRecording();
    })

    stopRecordingButton.addEventListener('click', function () {
        stopRecording();
    });

    context = new AudioContext;

    if (navigator.getUserMedia) {
        navigator.getUserMedia({ audio: true }, prepareRecording, function () {
            console.log("Microphone input not found");
        });
    } else {
        console.log("UserMedia not supported");
    }
}

window.onload = init;

})()

let bufferLength = 4096;
let channels = 2;
let inProgress = false;
let exportCallback = () => { };

export default class AudioRecorder {

    constructor(source) {
        this.context = source.context;
        this.processor = this.context.createScriptProcessor(
            bufferLength,
            channels,
            channels);


        this.processor.onaudioprocess = (e) => {
            if (!inProgress) return;

            var buffer = [];

            for (var c = 0; c < channels; c++) {
                buffer.push(e.inputBuffer.getChannelData(c));
            }

            this.worker.postMessage({
                command: 'record',
                buffer: buffer
            });
        };

        source.connect(this.processor);
        
        this.processor.connect(this.context.destination);

        let Worker = require("worker!./webworkers/wavRecorder");
        this.worker = new Worker;

        this.worker.postMessage({
            command: 'init',
            config: {
                sampleRate: this.context.sampleRate,
                numChannels: channels
            }
        });

        this.worker.onmessage = function (e) {
            switch (e.data.command) {
                case 'exportRecord':
                    exportCallback(e.data.data);
                    break;
                default:
                    break;
            }
        };
    }

    startRecord() {
        inProgress = true;
    }

    stopRecord() {
       inProgress = false;
    }

    clearBuffer() {
        this.worker.postMessage({ command: 'clear' });
    }

    exportRecord(callback) {
        let mimeType = 'audio/wav';
        exportCallback = callback;
        this.worker.postMessage({
            command: 'exportRecord',
            type: mimeType
        });

        this.clearBuffer();
    }
}

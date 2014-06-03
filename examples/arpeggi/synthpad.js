var SynthPad = (function() {
    // Notes
    var LOW_NOTE = 261.63; // C4
    var HIGH_NOTE = 893.88; 

    var SynthPad = function(width, height) {
        this.audioContext = new webkitAudioContext();

        this.width = width || 8;
        this.height = height || 8;

        this.oscillator = {};
        this.gainNode = {};
    };
    
    SynthPad.prototype.playSound = function(x, y) {
        var id = x + '' + y,
            self = this;

        if(!!this.oscillator[id])
            return;
        
        this.oscillator[id] || (this.oscillator[id] = this.audioContext.createOscillator());
        this.gainNode[id] || (this.gainNode[id] = this.audioContext.createGainNode());
    
        this.oscillator[id].onended = (function(id) {
            return function() {
                self.oscillator[id] = undefined;
            };
        })(id);

        this.oscillator[id].type = 'triangle';
    
        this.gainNode[id].connect(this.audioContext.destination);
        this.oscillator[id].connect(this.gainNode[id]);
    
        this.calculateFrequency(x, y);
        this.oscillator[id].start(0);
    };
    
    SynthPad.prototype.stopSound = function(x, y) {
        var id = x + '' + y;
        this.oscillator[id] && this.oscillator[id].stop(0);
    };
     
    SynthPad.prototype.calculateNote = function(posX) {
        var noteDifference = HIGH_NOTE - LOW_NOTE;
        var noteOffset = (noteDifference / this.width) * posX;
        return LOW_NOTE + noteOffset;
    };
    
    SynthPad.prototype.calculateVolume = function(posY) {
        var volumeLevel = 1 - (((100 / this.height) * posY) / 100);
        return volumeLevel;
    };

    SynthPad.prototype.calculateFrequency = function(x, y) {
        var id = x + '' + y;
        var noteValue = this.calculateNote(x);
        var volumeValue = this.calculateVolume(y);
    
        this.oscillator[id].frequency.value = noteValue;
        this.gainNode[id].gain.value = volumeValue;
    
        console.log('Freq: ', Math.floor(noteValue) + ' Hz', ', Vol: ', Math.floor(volumeValue * 100) + '%')
    };
    
    return SynthPad;
})();

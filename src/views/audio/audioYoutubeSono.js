import sono from 'sono';

const NUM_SAMPLES = 256;
const NUM_SAMPLES_HALF = NUM_SAMPLES / 2;
import Analyzer from './audioAnalysis';
import BeatDetectorr from './BeatDetectorr';

class AudioYoutubeSono {
  constructor(el) {
    this.mediaEl = el;
    this.context = sono.context;
    //this.bpm = audioTrack.get('echonest').audio_summary.tempo;
    // let source = this.context.createMediaElementSource(this.mediaEl);
    // let gainNode = this.context.createGain();
    // source.connect(gainNode);
    // gainNode.connect(this.context.destination);
    //console.log(source)
    this._beat = new BeatDetectorr();
    this.sound = sono.createSound(this.mediaEl);
    console.log(this.sound);
    // this.beatDetector = new BeatDetector(this.sound, (b) => {
    //   console.log(b)
    // });
    //console.log(this.sound);
    this.analyser = this.sound.effect.analyser(NUM_SAMPLES);
    //Analyzer
    //this.sound.play();
    //  this.sound.playbackRate = 0.5;
    //	console.log(this.sound)
    this.updateBound = this._onUpdate.bind(this);
    this.pitchBound = this._onPitchBound.bind(this);
    this._ampCallback;
    this._pitchCallback;
  }

  getAmplitude(callback){
  	this._ampCallback = callback;
   return this.analyser.getAmplitude(this.updateBound);
  }

  getPitch(callback){
  	this._pitchCallback = callback;
   return this.analyser.getPitch(this.pitchBound);
  }

  _onUpdate(amp){
  	this._beat.setAmp(amp);
  	this._ampCallback(amp);
  }

  _onPitchBound(pitch){
  	this._pitchCallback(pitch);
  }

  isBeat(){
  	return this._beat.isBeat;
  }

  getContext() {
  	return this.sound.context;
  }
}

export default AudioYoutubeSono;

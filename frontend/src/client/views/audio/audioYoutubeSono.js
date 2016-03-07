import sono from '@stinkdigital/sono';

const NUM_SAMPLES = 256;
const NUM_SAMPLES_HALF = NUM_SAMPLES / 2;
import Analyzer from './audioAnalysis';
import BeatDetector from './BeatDetector';

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
    this.sound = sono.createSound(this.mediaEl);
    this.beatDetector = new BeatDetector(this.sound, (b) => {
      console.log(b)
    });
    this.analyser = this.sound.effect.analyser(NUM_SAMPLES);
    //Analyzer
    //this.sound.play();
    //  this.sound.playbackRate = 0.5;
    //	console.log(this.sound)
  }

  update() {
    
    console.log(this._sum);
    //this.beatDetector.update();
  }

  getAmplitude(){
  	let f = this.analyser.getFrequencies();

    let sum = 0;
    for (let i = 0; i < f.length; i++) {
      sum += f[i]
    }

    sum /= f.length;
    return sum / NUM_SAMPLES_HALF;
  }

  analyzeAudio(vo) {
    // Analyzer.getBpm(vo).then(data =>{
    // 	console.log(data);
    // })
  }
}

export default AudioYoutubeSono;
import EaseNumber from './EaseNumber';

const NUM_SAMPLES = 256;
const ON_BEAT = 'onBeat';


class BeatDetector {
	constructor(sound, beatCallback, isDebugging=false) {

		this._hasSoundLoaded = false;
		this._sum = 0;
		this._beatCallback = beatCallback;
		this._easeSum = new EaseNumber(0.0, .1);
		this._isDebugging = isDebugging;
		this.threshold = 50;

		this.sound = sound;
		this._hasSoundLoaded = true;
		this.analyser        = this.sound.effect.analyser(NUM_SAMPLES);
		this.frequencies     = this.analyser.getFrequencies();

	}

	update() {
		let f = this.analyser.getFrequencies();

		let sum = 0;
		for(let i=0; i<f.length; i++) {
			sum += f[i]
		}

		sum /= f.length;
		this._sum = sum/128;
		this.frequencies = f;

		if(sum > this._easeSum.value + this.threshold) {
			this._easeSum.setTo(sum);
			this._easeSum.value = 0;

			if(this._beatCallback) {
				this._beatCallback(sum/128);
			}
		}

	}


	get amplitude() 			{	return this._sum;	}
	get beatAmplitude() 		{	return this._easeSum.value/128; }
	get hasSoundLoaded() {	return this._hasSoundLoaded;	}
}

BeatDetector.ON_BEAT = ON_BEAT;


export default BeatDetector;

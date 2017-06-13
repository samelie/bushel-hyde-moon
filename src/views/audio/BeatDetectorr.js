const THRESH = 0.02;
class BeatDetectorr {
    constructor() {
        this._amp = 0;
        this._isBeat = false;
    }
    setAmp(amp) {
        if (amp > this._amp + THRESH) {
            this._isBeat = true;
        } else {
            this._isBeat = false;
        }
        this._amp = amp;
    }

    get isBeat() {
        return this._isBeat;
    }
}
export default BeatDetectorr;

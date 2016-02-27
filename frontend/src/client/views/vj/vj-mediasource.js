'use strict';

import Channel from 'channel';
import THREE from 'three';
import Signals from 'signals';

const VERBOSE = false;
const BUFFER_MARGIN = 3;
const BUFFER_MARGIN_2 = 0.7;;

class VjMediaSource {
    constructor(el, id) {
        this.el = el;
        this.id = id;
        if (!MediaSource) {
            throw new Error('NO MEDIASOURCE!');
        }
        //booleans
        this.updatedStarted, this.locked, this.starting = true;

        //playback info
        this.segDuration = 0,
            this.totalDuration = 0,
            this.requestingNewVo = false,
            this.playOffset = 0,
            this.segmentIndex = 0,
            this.totalSegments = 0,
            this.paused = false,
            this.ended = false,
            this.currentCodec = "",
            this.skipCount = 0;
        ////-----------------
        //SETUP
        ////-----------------
        this._currentVo;
        this.mediaSource;
        this.sourceBuffer;
        this._effects;
        this.currentVideoId;

        this.endingSignal = new Signals();
        this.endedSignal = new Signals();

        this.videoElement = el;

        this.onBufferUpdateStartBound = this.onBufferUpdateStart.bind(this);
        this.onBufferUpdateEndBound = this.onBufferUpdateEnd.bind(this);
        this.onInitAddedBound = this._onInitAdded.bind(this);
        this.onTimeUpdateBound = this._onTimeUpdate.bind(this);


        this.mediaSource = new MediaSource();
        let url = URL.createObjectURL(this.mediaSource);
        this.videoElement.src = url;

        this.videoElement.addEventListener("timeupdate", this.onTimeUpdateBound, false);
        this.videoElement.addEventListener("ended", this._onVideoEnded, false);
        this.videoElement.addEventListener("loadeddata", () => {
            if (VERBOSE) {
                console.log("Loaded data");
            }
        });
        this.videoElement.addEventListener("playing", () => {
            if (VERBOSE) {
                console.log("Playing");
            }
        });
        this.videoElement.addEventListener("waiting", () => {
            if (VERBOSE) {
                console.log("waiting");
            }
        });

        this.mediaSource.addEventListener('error', this._onSourceError, false);
        this.mediaSource.addEventListener('sourceopen', this._onSourceOpen, false);

        this.xhr;
    }

    _onSourceError(e) {}

    _onSourceOpen(e) {
        this.starting = false;
    }

    newBufferSouce(codecs) {
        this.mediaSource.removeEventListener('sourceopen', this._onSourceOpen);
        this.currentCodec = codecs;
        this.sourceBuffer = this.mediaSource.addSourceBuffer('video/mp4; codecs="' + codecs + '"');
        this.sourceBuffer.addEventListener('updatestart', this.onBufferUpdateStartBound);
        this.sourceBuffer.addEventListener('updateend', this.onBufferUpdateEndBound);
    }

    ////-----------------
    //VIDEO HANDLERS
    ////-----------------

    pause() {
        this.videoElement.pause();
    }

    play() {
        this.videoElement.play();
    }

    _onVideoEnded(e) {
        if (VERBOSE) {
            console.warn('Video Ended');
        }
    }

    _onTimeUpdate() {
        if (this.videoElement.currentTime >= (this.totalDuration - (this.currentChunk.duration * BUFFER_MARGIN_2))) {
            if (!this.requestingNewVo) {
                this.requestingNewVo = true;
                console.log(this.currentVo.chunks.length);
                if (this.currentVo.chunks.length > 0) {
                    this._addChunk(this.currentVo.chunks.shift());
                } else {
                    if (VERBOSE) {
                        console.log(this.id, "Requesting new vo");
                    }
                    this.endingSignal.dispatch();
                }
            }
        }
        // if (this.videoElement.currentTime > this.totalDuration - 0.5) {
        //   if (!this.ended) {
        //     this.ended = true;
        //     this.endedSignal.dispatch();
        //   }
        // }
    }

    ////-----------------
    //API
    ////-----------------

    setCurrentVideoId(id) {
        this.currentVideoId = id;
    }

    getCurrentVideoId(id) {
        return this.currentVideoId;
    }


    addVo(currentVo) {
        this.currentVo = currentVo;
        if (VERBOSE) {
            console.log("CurrentCodec: ", this.currentCodec, "new codec:", currentVo.codecs, this.sourceBuffer);
        }
        console.log(this.currentVo);

        if (!this.sourceBuffer) {
            this.newBufferSouce(this.currentVo.codecs);
        } else if (this.currentCodec !== this.currentVo.codecs) {
            this._resetMediasource();
            //this.addVo(currentVo);
        }
        
        this.setCurrentVideoId(this.currentVo.id);
        this._addChunk(this.currentVo.chunks.shift());
        this.videoElement.play();
        this.mediaSource.duration = this.totalDuration;
    }

    ////-----------------
    //BUFFER HANDLERS
    ////-----------------


    onBufferUpdateStart() {
        this.updatedStarted = true;
        this.requestingNewVo = false;
        this.ended = false;
    }

    onBufferUpdateEnd() {
        this.updatedStarted = false;
    }

    _setNewTimestamdOffset() {
        let off = 0;
        if (this.sourceBuffer.buffered.length > 0) {
            off = this.sourceBuffer.buffered.end(this.sourceBuffer.buffered.length - 1);
        }
        console.log(off);
        this._trySettingOffset(off);
        try {
            this.sourceBuffer.timestampOffset -= this.currentVo['timestampOffset'];
        } catch (e) {
            this._resetMediasource();
        }
    }

    _trySettingOffset(off) {
        try {
            this.sourceBuffer.timestampOffset = off || 0;
        } catch (e) {
            if (VERBOSE) {
                console.log("Error _trySettingOffset");
            }
            this._resetMediasource();
        }
    }


    _addChunk(chunk) {
        console.log(chunk);
        this.currentChunk = chunk;
        this.totalDuration += this.currentChunk.duration;
        let formData = new FormData();
        if (VERBOSE) {
            console.log(this.id, this.currentChunk.byteRange, this.currentChunk.byteLength, this.currentChunk.duration);
        }
        formData.append('url', this.currentVo.url);
        formData.append('byteRange', this.currentChunk.byteRange);
        formData.append('byteRangeMax', this.currentChunk.byteLength);

        this.xhr = new XMLHttpRequest();
        this.xhr.open('POST', process.env.SERVER_BASE + 'getVideo', true);
        this.xhr.responseType = 'arraybuffer';
        this.xhr.send(formData);
        this.xhr.addEventListener("readystatechange", () => {
            if (this.xhr.readyState == this.xhr.DONE) {
                console.log("Finsihed");
                this.segResp = new Uint8Array(this.xhr.response);
                let off = 0;
                if (this.sourceBuffer.buffered.length > 0) {
                    off = this.sourceBuffer.buffered.end(this.sourceBuffer.buffered.length - 1);
                }
                this._makeInitialRequest();
            }
        });
    }

    _makeInitialRequest() {
        this.xhr = new XMLHttpRequest();
        let formData = new FormData();
        formData.append('url', this.currentVo.url);
        formData.append('indexRange', this.currentVo.indexRange);
        formData.append('indexRangeMax', this.currentVo.indexRangeMax);
        this.xhr.open('POST', process.env.SERVER_BASE + 'getVideoIndex', true);
        this.xhr.send(formData);
        this.xhr.responseType = 'arraybuffer';
        try {
            this.xhr.addEventListener("readystatechange", () => {
                if (this.xhr.readyState == this.xhr.DONE) { // wait for video to load
                    this._addInitReponse(new Uint8Array(this.xhr.response));
                }
            }, false);
        } catch (e) {
            log(e);
        }
    }

    _addInitReponse(initResp) {
        console.log(this.mediaSource.readyState);
        if (this.mediaSource.readyState === 'open' && this.sourceBuffer) {
            this.sourceBuffer.removeEventListener('updatestart', this.onBufferUpdateStartBound);
            this.sourceBuffer.removeEventListener('updateend', this.onBufferUpdateEndBound);
            this.sourceBuffer.addEventListener('updateend', this.onInitAddedBound);
            try {
                if (VERBOSE) {
                }
                this.sourceBuffer.appendBuffer(initResp);
                console.log("Init response added: ", this.currentVideoId);
            } catch (e) {
                if (VERBOSE) {
                    console.log(e);
                }
                this._resetMediasource();
            }
        }
    }

    _onInitAdded() {
      console.log("Init added, ", this.mediaSource.readyState);
        if (this.mediaSource.readyState === 'open' && this.sourceBuffer) {
            this.sourceBuffer.removeEventListener('updateend', this.onInitAddedBound);
            this.sourceBuffer.addEventListener('updateend', this.onBufferUpdateEndBound);
            this.sourceBuffer.addEventListener('updatestart', this.onBufferUpdateStartBound);
            try {
                this.sourceBuffer.appendBuffer(this.segResp);
            } catch (e) {
                this._resetMediasource();
            }
        }
    }


    //crash

    _removeSourceBuffer() {
        if (this.sourceBuffer) {
            this.sourceBuffer.removeEventListener('updateend', this.onBufferUpdateEndBound);
            this.sourceBuffer.removeEventListener('updatestart', this.onBufferUpdateStartBound);
            try {
                this.sourceBuffer.remove(0, this.mediaSource.duration);
                mediaSource.removeSourceBuffer(this.sourceBuffer);
                if (VERBOSE) {
                    console.warn('Removed buffer source');
                }
            } catch (e) {
                if (VERBOSE) {
                    console.log(e);
                }
            }
        }
    }

    _resetMediasource() {
        if (this.starting || !this.mediaSource) {
            return;
        }
        if (VERBOSE) {
            console.log(this.mediaSource.readyState !== 'open' || this.mediaSource.updating)
        }
        if (this.mediaSource.readyState !== 'open' || this.mediaSource.updating) {
            return;
        }
        if (VERBOSE) {
            console.warn('Reset buffer source');
        }
        _removeSourceBuffer();
        this.sourceBuffer = null;
        this.mediaSource.duration = 0;
        this.enterFrameCounter = 0;
        videoElement.currentTime = 0;
        this.segDuration = this.playOffset = 0;
    }

}

export default VjMediaSource;
// Parallax.js

'use strict'
import _ from 'lodash';

import Utils from 'utils';
import Emitter from 'emitter';
import Channel from 'channel';
import Signals from 'signals';

import ControlPerameters from './vj-control-perameters';
import VjMediaSource from './vj-mediasource';
import VjVideoCanvas from './vj-video-canvas';
import VjPlaylist from './vj-youtube-playlist';
import VjUtils from './vj-utils';

class VjManager {

  constructor(parent, options = {}) {
    this.options = options;
    _.merge(this.options, {
      readySignal: new Signals(),
      videoStartedSignal: new Signals(),
      endingSignal: new Signals(),
      endedSignal: new Signals()
    });
    this.parent = parent;
    this.boundUpdate = this._update.bind(this);

    this.mediaSources = [];
    this.videoCanvases = [];
    this.playlists = [];

    this._createElements(options.count);

    this._update();

    this.options.videoStartedSignal.add(()=>{
    });
  }

  _createElements(count) {
    for (let i = 0; i < count; i++) {
      let el = document.createElement("video");
      el.setAttribute('autoplay', 'true');
      el.setAttribute('controls', 'true');
      if (this.options.verbose) {
        this.parent.appendChild(el);
      }
      this.mediaSources.push(new VjMediaSource(el, this.options));
      this.videoCanvases.push(new VjVideoCanvas(el, this.options));
      this.playlists.push(new VjPlaylist(this.mediaSources[i], this.options));
    }
  }

  _getRandomTerm() {
    let r = Math.floor(Math.random() * TERMS.length - 1);
    return TERMS[r];
  }

  // _getNext(mediaSource) {
  //     let self = this;
  //     let currentId = mediaSource.getCurrentVideoId();
  //     console.log("Get Next", currentId);
  //     Channel.trigger('mediasource:nextvideo', currentId, mediaSource.addVo);
  // }

  _update() {
    for (let i = 0; i < this.options.count; i++) {
      this.videoCanvases[i].update();
    }
    if (this.options.autoUpdate) {
      this.requestId = window.requestAnimationFrame(this.boundUpdate);
    }
  }

  onWindowResize(w, h) {
    for (let i = 0; i < this.options.count; i++) {
      this.videoCanvases[i].onResize(w, h);
    }
  }

  update() {
    this.boundUpdate();
  }

  getCanvasAt(index) {
    return this.videoCanvases[index].getCanvas();
  }
}

export default VjManager;

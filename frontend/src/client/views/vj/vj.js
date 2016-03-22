// Parallax.js

'use strict'
import TWEEN from 'tween.js';

import Utils from 'utils';
import Emitter from 'emitter';
import Channel from 'channel';


import VjMediaSource from './vj-mediasource';
import VjVideoCanvas from './vj-video-canvas';
import VjRenderer from './vj-fx-renderer';
import VjUtils from './vj-utils';

const TRANSITION_DUR = 1000;
const TRANSITION_DELAY = 300;

class VJ {
  constructor(parent, renderEl) {
    this.parent = parent;
    this.el1 = document.createElement("video");
    this.el1.setAttribute('autoplay', 'true');
    this.el1.setAttribute('controls', 'true');
    this.parent.appendChild(this.el1);

    this.mediaSources = [
      new VjMediaSource(this.el1, "One")
    ];

    this.videoCanvases = [
      new VjVideoCanvas(this.el1)
    ];
    this.mediaSourceIndex = 0;

    this.renderer = new VjRenderer(renderEl);

    this.renderer.setTextures([
      this.videoCanvases[0].getCanvas()
    ]);

    this.boundUpdate = this._update.bind(this);
    this.boundAddVo = this.addVo.bind(this);

    this.tweenData = {
      blendOpacity: 0
    };

    this.boundUpdate();

    this._init();
  }

  _getRandomTerm() {
    let r = Math.floor(Math.random() * TERMS.length - 1);
    return TERMS[r];
  }

  _init() {
    let m1 = this.mediaSources[0];

    m1.endingSignal.add(()=>{
      Channel.trigger('mediasource:nextvideo', this.addVo);
    });

    m1.endedSignal.add(()=>{
      m1.pause();
    });
  }

  _update() {
    TWEEN.update();
    this.videoCanvases[0].update();
    this.renderer.update();
    this.requestId = window.requestAnimationFrame(this.boundUpdate);
  }

  addVo(vo) {
    let index = this.mediaSourceIndex;
    console.log("Adding vo on index", index);
    let active = this.mediaSources[index];
    active.addVo(vo);
    this.mediaSourceIndex = (this.mediaSourceIndex + 1) % this.mediaSources.length;
  }

  onWindowResize(w,h){
    this.renderer.onWindowResize(w,h);
    for (var i = 0; i < this.videoCanvases.length; i++) {
      this.videoCanvases[i].onResize(w,h);
    }
  }

  _transition(target) {
    setTimeout(()=>{
      let tween = new TWEEN.Tween(this.tweenData)
        .to({
          blendOpacity: target
        }, TRANSITION_DUR)
        .onUpdate(() => {
          this.renderer.setBlendOpacity(this.tweenData.blendOpacity);
        })
        .start();
    }, TRANSITION_DELAY);
  }


}

export default VJ;

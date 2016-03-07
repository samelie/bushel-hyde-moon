'use strict';

// Vendor dependencies
import Marionette from 'backbone.marionette';
import $ from 'jquery';

import template from './audio.ejs';

import Channel from 'channel';
import Utils from 'utils';

import SythAudio from './synthAudio';
import AudioYoutubeSono from './audioYoutubeSono';
import VjMediaSource from '../vj/vj-mediasource';
import VjUtils from '../vj/vj-utils';
import SpotifyService from 'spotifyService';
import YoutubeService from 'youtubeService';
import ServerService from 'serverService';

const DISNEY_AUDIO_PLAYLIST = "PLR1m37W9Dc9kBc5qKkUOWqkc8rPseKbUL";
const DISNEY_PLAYLIST = "PLdSMQMuTYK4A2e67n5JcmjQQODoRK4S-6";
const DR_DOG_PLAYLIST = "PL60A35E06A9EA1BFB";

// Define
class AudioView extends Marionette.LayoutView {

  template() {
    return template;
  }

  ui() {
    return {
      videoEl: 'audio'
    }
  }

  events() {
    return {}
  }

  regions() {
    return {
      centerRegion: '[data-region="center"]'
    }
  }

  initialize() {
    // auto render
    Channel.on('audio:playlist:set', this.setPlaylist, this);
    Channel.on('mediasource:nextvideo', (id, addVo) => {
      //this._getNext(id, addVo);
    });


  }

  onRender() {

    //this.sythAudio = new SythAudio();
  }

  onShow() {
    this.audioSource = new VjMediaSource(this.ui.videoEl[0]);
    this.audioSono = new AudioYoutubeSono(this.ui.videoEl[0]);

    this.audioSource.endingSignal.add(() => {
      this._getNext();
    });

    //this.boundUpdate = this.update.bind(this);
    //window.requestAnimationFrame(this.boundUpdate);
  }

  setPlaylist(playlist) {
    this.playlistIndex = -1;
    this.playlist = playlist;
    this._getNext();
  }

  _getPlaylistVideos() {

  }

  getAmplitude() {
    if (this.audioSono) {
      return this.audioSono.getAmplitude();
    }
  }

  _getNext() {
    this.playlistIndex++;
    if (!this.playlist) {
      return;
    }
    var vId = this.playlist[this.playlistIndex].id;
    return ServerService.getSidx(vId, {
      chooseBest: true,
      audioonly: true
    }).then((results) => {
      let vo = VjUtils.createVo(results, {
        all: true
      });
      //this.audioSono.analyzeAudio(vo);
      console.log(vo);
      this.audioSource.addVo(vo);
    }).catch(err => {
      console.log(err)
    });
  }

  onDestroy() {}


};

export default AudioView;
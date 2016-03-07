// Parallax.js

'use strict'
import TWEEN from 'tween.js';
import _ from 'lodash';
import Q from 'bluebird';

import Utils from 'utils';
import Emitter from 'emitter';
import Channel from 'channel';

import YoutubeService from 'youtubeService';
import ServerService from 'serverService';
import PlaylistUtils from './vj-youtube-playlist-utils';
import VjUtils from './vj-utils';

class MediaPlaylist {
  constructor(mediaSource, options) {

    this.mediaSource = mediaSource;
    this.options = options;

    this.playlistUtils = new PlaylistUtils();

    this.playlistReferenceIndex = 0;
    this.sidxIndexReferences = this.playlistUtils.referenceIndexs;

    this.youtubeItems = [];
    this.sidxResults = [];

    this.mediaSource.endingSignal.add(() => {
      this._getNext();
    });

    if (this.mediaSource.getReadyState() !== 'open') {
      this.mediaSource.readySignal.addOnce(() => {
        this._init();
      });
    } else {
      this._init();
    }
  }

  _init() {
    if (this.options.playlists) {
      Q.map(this.options.playlists, (id) => {
        return YoutubeService.playlistItems({
            playlistId: id
          })
          .then(results => {
            this.youtubeItems = this.youtubeItems.concat(results.items);
            return Q.map(this.youtubeItems, (item) => {
              let vId = Utils.getIdFromItem(item);
              return this._getSidx(vId);
            }, {
              concurrency: 1
            }).then(results => {
              this.sidxResults = [...this.sidxResults, ...results];
              return this._createReferenceIndexFromResults(results);
            });
          });
      }, {
        concurrency: 1
      }).then((referenceIndexs)=>{
        this._start();
      });
    }
  }

  _start() {
    this._getNext();
  }

  _getNext() {
    let referenceIndex = this.sidxIndexReferences[this.playlistReferenceIndex];
    let split = referenceIndex.split('_');
    let playlistItemIndex = split[0];
    let playlistItemReferenceIndex = split[1];

    let sidxPlaylistItem = this.sidxResults[playlistItemIndex];
    let vo = VjUtils.getReferenceVo(sidxPlaylistItem, playlistItemReferenceIndex);
    this.mediaSource.addVo(vo);
    this.playlistReferenceIndex++;
  }

  // _mixInSidxReferences(references){
  //     this.playlistItemIndex++;
  //     if(this.playlistItemIndex > 2){
  //         return;
  //     }
  //     PlaylistUtils.mixSidxReferences(this.sidxIndexReferences, this.playlistItemIndex, references);
  // }

  _createReferenceIndexFromResults(results) {
    _.each(results, (item) => {
      this.playlistUtils.mix(item.sidx.references);
    });
    return this.sidxIndexReferences;
  }

  _getSidx(vId) {
    return ServerService.getSidx(vId, this.options.quality)
      .then((results) => {
        return results;
      });
  }
}

export default MediaPlaylist;
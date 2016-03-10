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

    this.options.videoStartedSignal.add((currentVo) => {
      this.currentVo = currentVo;
      Channel.trigger('videostarted', this._getTitleFromId(currentVo.videoId));
    });

    Channel.on('addrelatedtocurrent', this._getRelatedTo, this);
    Channel.on('adddeeper', this._getDeeper, this);
  }

  _init() {
    if (this.options.playlists) {
      Q.map(this.options.playlists, (id) => {
        return YoutubeService.playlistItems({
            playlistId: id
          })
          .then(results => {
            this.youtubeItems = [...this.youtubeItems, ...results.items]
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
      }).then((referenceIndexs) => {
        this._start();
      });
    }
  }

  _start() {
    this._getNext();
  }

  _getDeeper() {
    return YoutubeService.videoComments({
      videoId: this.currentVo.videoId
    }).then((results) => {
      console.log(results);
      if (results.items.length) {
        let userProfile = {
          uploads: [],
          likes: []
        };
        return ServerService.channelUploadsFromComments(results, userProfile)
          .finally(() => {
            let _ups = userProfile.uploads;
            let _likes = userProfile.likes;
            let indexOf = _ups.indexOf(this.currentVo.videoId);
            if (indexOf > -1) {
              _ups.splice(indexOf, 1);
            }
            console.log(_ups);
            let _chosen = _ups.length ? _ups : _likes;
            console.log(_chosen);
            let newVideoId = Utils.getRandom(_chosen);
            console.log(_chosen);
            console.log(newVideoId);
            return _getSidxAndAdd(newVideoId);
          });
      } else {
        return this._getRelatedTo();
      }
    });
  }

  _getRelatedTo() {
    YoutubeService.relatedToVideo({
        part: 'snippet',
        id: this.currentVo.videoId,
        order: 'relevance',
      })
      .then(data => {
        this.youtubeItems = [...this.youtubeItems, ...data.items]
        var item = Utils.getRandom(data.items);
        var vId = Utils.getIdFromItem(item);
        return _getSidxAndAdd(vId);
      });
  }

  _getSidxAndAdd(vId) {
    return this._getSidx(vId).then((sidx) => {
      this.sidxResults = [...this.sidxResults, sidx];
      return this._createReferenceIndexFromResults([sidx]);
    });
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

  _getTitleFromId(vId) {
    var ytItem;
    _.each(this.youtubeItems, (item) => {
      if (Utils.getIdFromItem(item) === vId) {
        ytItem = item;
      }
    });
    return ytItem;
  }

  _createReferenceIndexFromResults(results) {
    _.each(results, (item) => {
      this.playlistUtils.mix(item.sidx, this.options);
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

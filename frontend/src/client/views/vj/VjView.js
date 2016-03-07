'use strict';
import './vj.scss';
// Vendor dependencies
import Marionette from 'backbone.marionette';
import Emitter from 'emitter';
import Utils from 'utils';
import VjUtils from './vj-utils';
// Core dependencies
// App dependencies
import template from './vj.ejs';

import Channel from 'channel';
import Playlist from 'playlist';
import Session from 'session';
import YoutubeService from 'youtubeService';
import SpotifyService from 'spotifyService';
import EchoService from 'echonestService';
import KnowledgeService from 'knowledgeService';
import ServerService from 'serverService';

//import VJ from './vj';
import VJManager from './vj-mediasource-manager';
import VjRenderer from './vj-fx-renderer';

const PLAY_VJ = "PLOnhHR5nulMPisi4X15rmPpEVp2Q-MIY0";
const TRENDING_TODAY = "PLbpi6ZahtOH7h9OULR1AVb4i8zo0ctwEr";

// Define
class VjView extends Marionette.ItemView {

  ui() {
    return {
      btn: '.btn-primary',
      threeEl: '#three'
    }
  }

  events() {
    return {
      'click @ui.btn': 'btnClick'
    }
  }

  template() {
    return template;
  }

  initialize() {
    window.addEventListener('resize', () => {
      if (this.vj) {
        let w = window.innerWidth;
        let h = window.innerHeight;
        this.vj.onWindowResize(w, h);
        this.renderer.onWindowResize(w,h);
      }
    });

    this.boundUpdate = this._update.bind(this);
  }

  onShow() {
    this.vj = new VJManager(this.el, {
            count: 1,
            playlists: [PLAY_VJ],
            quality:{
                chooseBest:true,
                resolution:'360p'
            },
            verbose: false
        });

     this.renderer = new VjRenderer(this.ui.threeEl[0]);

    this.renderer.setTextures([
      this.vj.getCanvasAt(0)
    ]);

    this.boundUpdate();
    //this.vj = new VJ(this.el, this.ui.threeEl[0]);
    // this.imagePlayer = new ImagePlayer({
    //   el: this.el
    // });

    // ServerService.getManifest().then(data => {
    //   let urls = Playlist.getUrlsByType(data, 'minerals');
    //   this.imagePlayer.setImages(urls);
    //   this.imagePlayer.init();
    //   window.requestAnimationFrame(u);
    // });

    // YoutubeService.playlistItems({
    //     playlistId: TRENDING_TODAY
    //   })
    //   .then(results => {
    //     console.log(results);
    //     this.defaultPlaylistItems = results;
    //     this._getNext();
    //   });
  }

  _update() {
    this.vj.update();
    this.renderer.update();
    this.requestId = window.requestAnimationFrame(this.boundUpdate);
  }


  // _getNext(id) {
  //   let self = this;
  //   let data;

  //   console.log("Requesting next", id);
  //   if (!id) {
  //     data = this.defaultPlaylistItems;
  //     var item = Utils.getRandom(data.items);
  //     var vId = Utils.getIdFromItem(item);
  //     return this._getSidxAndAdd(vId, this.vj.addVo);
  //   } else {
  //     return YoutubeService.relatedToVideo({
  //         part: 'snippet',
  //         id: id,
  //         order: 'viewCount'
  //       })
  //       .then(data => {
  //         var item = Utils.getRandom(data.items);
  //         console.log(item);
  //         var vId = Utils.getIdFromItem(item);
  //         this._getTopicDetails(item.snippet.title, vId).then(value => {
  //           console.log(value);
  //         });
  //         return this._getSidxAndAdd(vId);
  //       });
  //   }
  // }

  // _getSidxAndAdd(vId) {
  //   return ServerService.getSidx(vId).then((data) => {
  //     let vo = VjUtils.createVo(data);
  //     console.log("Adding ", vo.id);
  //     this.vj.addVo(vo);
  //   }).catch(err => {
  //     console.log(err)
  //     self._getNext(id);
  //   });
  // }


};

// Export
export default VjView;
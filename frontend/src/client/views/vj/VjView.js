'use strict';
import './vj.scss';
// Vendor dependencies
import Marionette from 'backbone.marionette';
import ServerService from 'serverService';
import Emitter from 'emitter';
import Utils from 'utils';
import VjUtils from './vj-utils';
// Core dependencies
// App dependencies
import template from './vj.ejs';

import Channel from 'channel';
import Session from 'session';
import YoutubeService from 'youtubeService';
import SpotifyService from 'spotifyService';
import EchoService from 'echonestService';
import KnowledgeService from 'knowledgeService';

import VJ from './vj';

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
        Channel.on('mediasource:nextvideo', (id) => {
            this._getNext(id);
        });

        window.addEventListener('resize', () => {
            if (this.vj) {
                let w = window.innerWidth;
                let h = window.innerHeight;
                this.vj.onWindowResize(w, h);
            }
        });
    }

    onShow() {
        this.vj = new VJ(this.el, this.ui.threeEl[0]);

        YoutubeService.playlistItems({
                playlistId: TRENDING_TODAY
            })
            .then(results => {
                console.log(results);
                this.defaultPlaylistItems = results;
                this._getNext();
            });
    }
    _getNext(id) {
        let self = this;
        let data;

        console.log("Requesting next", id);
        if (!id) {
            data = this.defaultPlaylistItems;
            var item = Utils.getRandom(data.items);
            var vId = Utils.getIdFromItem(item);
            return this._getSidxAndAdd(vId, this.vj.addVo);
        } else {
            return YoutubeService.relatedToVideo({
                    part: 'snippet',
                    id: id,
                    order: 'viewCount'
                })
                .then(data => {
                    var item = Utils.getRandom(data.items);
                    console.log(item);
                    var vId = Utils.getIdFromItem(item);
                    this._getTopicDetails(item.snippet.title, vId).then(value => {
                        console.log(value);
                    });
                    return this._getSidxAndAdd(vId);
                });
        }
    }

    _getSidxAndAdd(vId) {
        return ServerService.getSidx(vId).then((data) => {
            let vo = VjUtils.createVo(data);
            console.log("Adding ", vo.id);
            this.vj.addVo(vo);
        }).catch(err => {
            console.log(err)
            self._getNext(id);
        });
    }


};

// Export
export default VjView;
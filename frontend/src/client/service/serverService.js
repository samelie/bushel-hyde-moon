import $ from 'jquery';
import Q from 'bluebird';

import BlueBirdQueue from './bluebirdQueue';

import Session from 'session';
'use strict';

let _requestQueue = new BlueBirdQueue({
    concurrency: 1
});


const MOON_BASE = "https://s3-eu-west-1.amazonaws.com/rad-moon/";


const _addRequest = function(prom) {
    _requestQueue.add(prom);
    _requestQueue.start();
    return prom;
}


const ServerService = {

    getManifest() {
        return fetch(`${MOON_BASE}rad-moon-manifest`).then(response => {
            return response.json();
        });
    },

    getNextSidx(id) {
        let p = Q.resolve($.get(process.env.SERVER_BASE + 'getNextVideoSidx', {
            id: id
        }));
        return _addRequest(p);
    },

    getNextYoutubeSearch(id, options) {
        let p = Q.resolve($.get(process.env.SERVER_BASE + 'getNextVideo', {
            id: id,
            ...options
        }));
        return _addRequest(p);
    },

    getNextYoutubeFromPlaylist(obj, options) {
        let p = Q.resolve($.get(process.env.SERVER_BASE + 'getNextVideoFromPlaylist', {
            ...obj,
            ...options
        }));
        return _addRequest(p);
    },

    getSidx(id, options) {
        let p = new Q((resolve, reject) => {
            $.get(process.env.SERVER_BASE + 'getVideoSidx', {
                id: id,
                ...options
            }).then((data) => {
                if (data.status === 500) {
                    reject();
                } else {
                    resolve({
                        data: data,
                        videoId: id
                    });
                }
            });
        });
        return _addRequest(p);
    }

};
export default ServerService;
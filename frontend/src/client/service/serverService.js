import $ from 'jquery';
import Q from 'bluebird';
import Utils from 'utils';

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
          data[0].videoId = id;
          resolve(data[0]);
        }
      });
    });
    return _addRequest(p);
  },

  channelUploadsFromComments(results, userProfile) {
    let channelIds = [];
    _.each(results.items, (item) => {
      let channelId = item.snippet.topLevelComment.snippet.authorChannelId.value;
      channelIds.push(channelId);
    });
    console.log(channelIds);
    let mapped = Q.map(channelIds, (chId) => {
      console.log(chId);
      let chUpload = this.channelUploads(chId)
        .then(data => {
          if (data.length) {
            _.each(data, (item) => {
              //is not a likes video
              let vId = Utils.extractVideoIdFromUpload(item.img);
              if (item.content.indexOf('by ') === -1) {
                userProfile.uploads.push(vId);
              } else {
                userProfile.likes.push(vId);
              }
            });
            if (channelIds.indexOf(chId) > 5 && !userProfile.uploads.length) {
              return chUpload.cancel();
            } else if (userProfile.uploads.length) {
              return chUpload.cancel();
            }
            return data;
          }
          console.log("No uploads ");
          return data;
        });
      return chUpload;
    }, { concurrency: 1 });
    return mapped;
  },

  channelUploads(channelId) {
    let p = new Q((resolve, reject) => {
      $.get(process.env.SERVER_BASE + 'channelUploads', {
        channelId: channelId
      }).then((data) => {
        resolve(data);
        // if (data.status === 500) {
        //   reject();
        // } else {
        //   data[0].videoId = id;
        //   resolve(data[0]);
        // }
      });
    });
    return _addRequest(p);
  }

};
export default ServerService;

import $ from 'jquery';
import Q from 'bluebird';
import Spotify from 'spotify-web-api-js';

import Session from 'session';

//import {getPlaylistTracks}  from 'spotifyServiceUtils';
const QUERY_LIMIT = 50;
const Spot = new Spotify();
Spot.setPromiseImplementation(Q);

'use strict';

function _recursivePlaylistQuery(id) {
  return new Q((resolve, reject) => {
    let items = [];

    function __q(options = {
      limit: QUERY_LIMIT
    }) {
      Spot.getUserPlaylists(id, options)
        .then((results) => {
          items = items.concat(results.items);
          if (results.next) {
            __q(_.merge(options, {
              offset: items.length
            }));
          } else {
            resolve(_.assign({}, results, {
              items
            }));
          }
        })
        .catch((e) => {
          reject(e);
        });
    }
    //check
    if(!id || id === ''){
      reject();
    }else{
      __q();
    }
  });
}

function _recursivePlaylistTrackQuery(id,playlistId ) {
  return new Q((resolve, reject) => {
    let items = [];

    function __q(options = {
      limit: QUERY_LIMIT
    }) {
      Spot.getPlaylistTracks(id,playlistId, options)
        .then((results) => {
          items = items.concat(results.items);
          if (results.next) {
            __q(_.merge(options, {
              offset: items.length
            }));
          } else {
            resolve(_.assign({}, results, {
              items
            }));
          }
        })
        .catch((e) => {
          reject(e);
        });
    }
    __q();
  });
}

function getMe(){
  return Spot.getMe().then(me => {
    Session.spotify.me = me;
    return me;
  });
}

function getUserPlaylists(id){
  return _recursivePlaylistQuery(id);
}

export function getPlaylistTracks(id, playlistId){
  return _recursivePlaylistTrackQuery(id, playlistId);
}

export default {
  setAccessToken:Spot.setAccessToken,
  getMe,
  getUserPlaylists,
  getPlaylistTracks
}

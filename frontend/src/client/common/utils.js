'use strict';
import QS from 'query-string';
import _ from 'lodash';
import Cookies from 'js-cookie';

// Define
const Utils = {

};

Utils.parseQueryString = function (string){
  return QS.parse(string);
}


Utils.urlParams = function() {
  var query;
  var pos = window.location.href.indexOf("?");
  if (pos == -1) return [];
  query = window.location.href.substr(pos + 1);
  var result = {};
  query.split("&").forEach(function(part) {
    if (!part) return;
    var item = part.split("=");
    var key = item[0];
    var from = key.indexOf("[");
    if (from == -1) result[key] = decodeURIComponent(item[1]);
    else {
      var to = key.indexOf("]");
      var index = key.substring(from + 1, to);
      key = key.substring(0, from);
      if (!result[key]) result[key] = [];
      if (!index) result[key].push(item[1]);
      else result[key][index] = item[1];
    }
  });
  return result;
};

Utils.getRandom = (list) => {
  let v = undefined;
  while (!v) {
    let r = Math.floor(Math.random() * list.length - 1);
    v = list[r];
  }
  return v;
};

Utils.getIdFromItem = (item)=>{
  if(_.isObject(item.id)){
    return item.id.videoId;
  }else if(_.isObject(item.snippet.resourceId)){
    return item.snippet.resourceId.videoId;
  }else{
    return;
  }
};

Utils.getSpotifyAccessToken = function(){
  return Cookies.get('rad-spotifyAccess');
};

Utils.getYoutubeAccessToken = function(){
  return Cookies.get('rad-youtubeAccess');
};

// Export
export default Utils;

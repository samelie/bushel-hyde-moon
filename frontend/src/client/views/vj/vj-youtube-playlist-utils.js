'use strict';

const HALF_PI = Math.PI / 2;

function PlaylistUtils() {
  let _videoIndex = 0;
  let _referenceIndexs = [];

  function _sineOut(t) {
    return Math.sin(t * HALF_PI);
  }

  var SPREAD = 0.5;

  function _spread(references) {
    if(!references){
        return _referenceIndexs;
    }
    var l = references.length;
    var totalIndex = _referenceIndexs.length;
    for (var i = 0; i < l; i++) {
      var n = _sineOut(i / l);
      var targetIndex = Math.min(i + Math.floor(totalIndex * (n * SPREAD / 2)), _referenceIndexs.length);
      _referenceIndexs.splice(targetIndex, 0, `${_videoIndex}_${i}`);
    }
    _videoIndex++;
    return _referenceIndexs;
  }

  function mix(references) {
    return _spread(references);
  }

  function clear() {
    _referenceIndexs.length = 0;
  }

  return {
    referenceIndexs: _referenceIndexs,
    clear: clear,
    mix: mix
  }
}


export default PlaylistUtils;
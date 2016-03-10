'use strict';

const HALF_PI = Math.PI / 2;

function PlaylistUtils() {
  let _videoIndex = 0;
  let _referenceIndexs = [];

  function _sineOut(t) {
    return Math.sin(t * HALF_PI);
  }

  var SPREAD = 0.5;

  function _spread(references, options) {
    if (!references) {
      return _referenceIndexs;
    }
    var l = references.length;
    var totalIndex = _referenceIndexs.length;
    for (var i = options.startIndex; i < options.endIndex; i++) {
      var n = _sineOut(i / l);
      var targetIndex = Math.min(i + Math.floor(totalIndex * (n * SPREAD / 2)), _referenceIndexs.length);
      _referenceIndexs.splice(targetIndex, 0, `${_videoIndex}_${i}`);
    }
    _videoIndex++;
    console.log(_referenceIndexs);
    return _referenceIndexs;
  }

  function mix(sidx, options = {}) {
    let refs = sidx.references;
    let refDur = refs[0].durationSec;
    let totalTime = refDur * refs.length;

    options.maxVideoTime = options.maxVideoTime || (totalTime - refDur);

    let max = Math.max(totalTime / options.maxVideoTime, 0);
    let startTime = Math.floor(max / 2) * options.maxVideoTime;
    let startIndex = Math.max(Math.floor(startTime / refDur), 0);
    let endIndex = Math.min(Math.floor(options.maxVideoTime / refDur) + startIndex, refs.length - 1);

    return _spread(sidx.references, { startIndex, endIndex });
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
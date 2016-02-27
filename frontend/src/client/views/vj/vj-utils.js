'use strict';
const Utils = {};
/*
options
all
duration: in seconds
*/
Utils.createVo = (vo, options = {}) => {
    var startIndex = 0;
    var totalSegments = Math.floor(Math.random() * 5) + 8;
    var endIndex =0;
    var duration = 0;
    var data = vo.data;
    if (!data.sidx) {
        return;
    }
    var references = data.sidx.references;

    startIndex = Math.floor(references.length / 2) - Math.ceil(totalSegments / 2);
    startIndex = Math.max(startIndex, 0);

    endIndex = startIndex + Math.max(Math.ceil(totalSegments / 2), 1);
    endIndex = Math.min(endIndex, references.length -1);

    var sRef = references[startIndex];
    var eRef = references[endIndex];
    var size = 0;

    let chunks = [];
    startIndex = 0;
    console.log(startIndex, endIndex, totalSegments);

    for (var j = startIndex; j < endIndex; j++) {
        let nextRef = references[j + 1];
        let ref = references[j];
        var brEnd = (parseInt(nextRef['mediaRange'].split('-')[0], 10) - 1);
        var brStart = ref['mediaRange'].split('-')[0];
        
        chunks.push({
            byteRange: brStart + '-' + brEnd,
            byteLength: ref.size,
            duration: ref['durationSec']
        });

        duration += references[j]['durationSec'];
        size += references[j].size;
    }

    var brEnd = (parseInt(eRef['mediaRange'].split('-')[0], 10) - 1);
    var brMax = brEnd + 1;
    var videoVo = {};
    videoVo['url'] = data['url'];
    videoVo['byteRange'] = sRef['mediaRange'].split('-')[0] + '-' + brEnd;
    videoVo['chunks'] = chunks;
    videoVo['byteRangeMax'] = brMax;
    videoVo['byteLength'] = size;
    videoVo['codecs'] = data['codecs'];
    videoVo['firstOffset'] = data.sidx['firstOffset'];
    videoVo['indexRange'] = data['indexRange'];
    videoVo['indexRangeMax'] = Number(videoVo['indexRange'].split('-')[1]) + 1;
    videoVo['timestampOffset'] = sRef['startTimeSec'];
    videoVo['duration'] = duration;
    videoVo['id'] = vo.videoId;
    return videoVo;
}
export default Utils;
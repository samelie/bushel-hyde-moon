import _ from 'lodash';
import Utils from 'utils';
import path from 'path';
// Define
const Playlist = (() => {

    const ITEM_VO = {
    		paths:undefined,
        speaker: '',
        heard: false
    };

    let interview;
    let playlistItems = {};
    let _audioData;

    function _pathsFromFile(file) {
        return [`${file}.ogg`, `${file}.mp3`];
    }

    function generate(audioData) {
        var keys = _.keys(audioData);
        _.forIn(audioData, (obj, key) => {
            //interview
            if (obj.file) {
                interview = _.clone(ITEM_VO);
                interview.paths = _pathsFromFile(obj.file);
                interview.cuepoints = obj.cuepoints;
            } else {
                _.each(obj, (clip) => {
                    let vo = _.clone(ITEM_VO);
                    vo.speaker = key;
                    vo.paths = _pathsFromFile(clip.file);
                    playlistItems[key] = playlistItems[key] || [];
                    playlistItems[key].push(vo);
                });
            }
        });
        console.log("The clip VOs");
        console.log(playlistItems);
        return interview;
    }

    function getClip(currentTime) {
        let foundClip
        for (var i = 0; i < interview.cuepoints.length; i++) {
            let cuepoint = interview.cuepoints[i];
            if (currentTime > cuepoint.time && !cuepoint.past) {
            		cuepoint.past = true;
            		console.log(cuepoint);
                let speaker = cuepoint.speaker;
                let clips = playlistItems[speaker];
                _.each(clips, (vo) => {
                    if (!vo.heard) {
                        foundClip = vo;
                				foundClip.heard = true;
                				return false;
                    }	
                });
                break;
            }
        }
        return foundClip;
    }

    return {
        generate: generate,
        getClip: getClip
    }
})();

// Export
export default Playlist;
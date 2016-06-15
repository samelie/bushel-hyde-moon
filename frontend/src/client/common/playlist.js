import _ from 'lodash';
import Utils from 'utils';
import path from 'path';
// Define
const Playlist = (() => {
    const STORAGE = 'https://storage.googleapis.com/samrad-moon/downloads/'

    function getUrlsByType(data, type) {
        let urls = [];
        _.forIn(data, mission => {
            _.forIn(mission, group => {
                _.each(group, path => {
                    if (path.indexOf('-r') < 0) {
                        urls.push(`${STORAGE}${path}`);
                    }
                })
            })
        })
        return urls;
    }

    return {
        getUrlsByType: getUrlsByType
    }
})();

// Export
export default Playlist;
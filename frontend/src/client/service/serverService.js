import $ from 'jquery';
import Q from 'bluebird';

import QS from 'query-string';
import fetch from 'isomorphic-fetch';

const MOON_BASE = "https://s3-eu-west-1.amazonaws.com/rad-moon/"
const ServerService = {

    getAudioData() {
        return fetch(`${MOON_BASE}rad-moon-manifest`).then(response => {
            return response.json();
        });
    }


};
export default ServerService;
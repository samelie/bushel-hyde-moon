import Q from 'bluebird';
import _ from 'lodash';
import QS from 'query-string';
import fetch from 'isomorphic-fetch';

import BlueBirdQueue from './bluebirdQueue';
'use strict';

const URL = "https://kgsearch.googleapis.com/v1/entities:search";

const DEFAULTS = {
  key: process.env.YOUTUBE_API_KEY
};

const K = {
	searchById(options = {}) {
			//just use the first one
      let params = `ids=${options.ids[0]}&key=${DEFAULTS.key}`;
			console.log(params);
			return fetch(`${URL}?${params}`).then(response => {
				return response.json();
			});
		},
    searchByQuery(options = {}) {
  			//just use the first one
        let params = `query=${options.query}&key=${DEFAULTS.key}&limit=100`;
  			return fetch(`${URL}?${params}`).then(response => {
  				return response.json();
  			});
  		}
};
export default K;

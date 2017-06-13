import $ from 'jquery';
import Q from 'bluebird';

import Session from 'session';
'use strict';

const API = "ZBQTSD4KGRLBYNP5Y";
const BASE = 'http://developer.echonest.com/api/v4/track/profile';

const ECHO = {

	search: (id) => {
		return Q.resolve($.get(`${BASE}`, {
			api_key: API,
			format: 'json',
			id: id,
			bucket: 'audio_summary'
		})).then((data) => {
			return data.response.track;
		});
	}

};

export default ECHO;

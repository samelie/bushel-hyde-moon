import $ from 'jquery';
import Q from 'bluebird';
import Utils from 'utils';
import QS from 'query-string';
import BlueBirdQueue from './bluebirdQueue';

import Session from 'session';
'use strict';

let _requestQueue = new BlueBirdQueue({
	concurrency: 1
});


const MOON_BASE = "assets/";

const DEFAULTS = {
  maxResults:50
};


const _addRequest = function(prom) {
	_requestQueue.add(prom);
	_requestQueue.start();
	return prom;
}


const ServerService = {

	getManifest() {
		return fetch(`images.json`).then(response => {
			return response.json();
		});
	},

	getNextSidx(id) {
		let p = Q.resolve($.get(process.env.SERVER_BASE + 'getNextVideoSidx', {
			id: id
		}));
		return _addRequest(p);
	},

	getNextYoutubeSearch(id, options) {
		let p = Q.resolve($.get(process.env.SERVER_BASE + 'getNextVideo', {
			id: id,
			...options
		}));
		return _addRequest(p);
	},

	getNextYoutubeFromPlaylist(obj, options) {
		let p = Q.resolve($.get(process.env.SERVER_BASE + 'getNextVideoFromPlaylist', {
			...obj,
			...options
		}));
		return _addRequest(p);
	},

	getSidx(id, options) {
		let p = new Q((resolve, reject) => {
			$.get(process.env.SERVER_BASE + 'getVideoSidx', {
				id: id,
				...options
			}).then((data) => {
				if (data.status === 500) {
					reject({ message: `Failed on ${id}`, id: id });
				} else {
					let _d = data[0];
					if (!_d) {
						reject({ message: `Failed on ${id}`, id: id });
					} else {
						_d.videoId = id;
						resolve(_d);
					}
				}
			});
		});
		return _addRequest(p);
	},

	playlistItems(options){
			let params = QS.stringify(_.assign({}, {
				part: 'snippet',
				videoDuration: 'any',
				maxResults: 50,
				type: 'video',
				safeSearch: 'none'
			}, DEFAULTS, options));

			return fetch(`${process.env.SERVER_BASE}youtube/playlistItems?${params}`).then(response => {
				return response.json();
			});
		},

	channelUploadsFromComments(results, userProfile, existingIds) {
		let channelIds = [];
		_.each(results.items, (item) => {
			//Uncaught (in promise) TypeError: Cannot read property 'value' of undefined(…)
			let channelId = item.snippet.topLevelComment.snippet.authorChannelId.value;
			channelIds.push(channelId);
		});
		let mapped = Q.map(channelIds, (chId) => {
			let chUpload = this.channelUploads(chId)
				.then(data => {
					if (data.length) {
						_.each(data, (item) => {
							//is not a likes video
							let vId = Utils.extractVideoIdFromUpload(item.img);
							let _views = Utils.extractViewsFromScrape(item.content);
							if (existingIds.indexOf(vId) < 0) {
								if (item.content.indexOf('by ') === -1) {
									userProfile.uploads.push({ videoId: vId, views: _views });
								} else {
									userProfile.likes.push({ videoId: vId, views: _views });
								}
							} else {
								console.log(`Skip, has ${vId}`);
							}
						});
						if (channelIds.indexOf(chId) > 5 && !userProfile.uploads.length) {
							console.log("Couldn't find any uploads, using likes");
							return chUpload.cancel();
						} else if (userProfile.uploads.length) {
							console.log(`Found uploads of ${chId}`);
							return chUpload.cancel();
						}
						return data;
					}
					console.log(`No uploads on ${chId}`);
					return data;
				});
			return chUpload;
		}, { concurrency: 1 });
		return mapped;
	},

	channelUploads(channelId) {
		let p = new Q((resolve, reject) => {
			$.get(process.env.SERVER_BASE + 'channelUploads', {
				channelId: channelId
			}).then((data) => {
				resolve(data);
			});
		});
		return _addRequest(p);
	}

};
export default ServerService;

'use strict';
import './app.scss';
// Vendor dependencies
import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import $ from 'jquery';
import Q from 'bluebird';
import EaseNumbers from 'ease-number';

import template from './app.ejs';

import Channel from 'channel';

import LoginView from './login/LoginView';
import VjView from './vj/VjView';
import AudioView from './audio/audioView';

import SpotifyService from 'spotifyService';
import YoutubeService from 'youtubeService';

const SPOTIFY_PLAYLIST = "72EGtLR6ZPqk0WdMTX21As";
// Define
class AppView extends Marionette.LayoutView {

	constructor() {
		super();
	}

	template() {
		return template;
	}

	ui() {
		return {}
	}

	events() {
		return {}
	}

	regions() {
		return {
			centerRegion: '[data-region="center"]',
			audioRegion: '[data-region="audio"]',
			youtubeRegion: '[data-region="youtube"]'
		}
	}

	initialize() {
		Q.config({
			cancellation: true
		});
		// auto render
		// Channel.on(Channel.VJ_START, this.onVjStart, this);

		// Channel.on('spotify:login:success', (auth) => {
		//   SpotifyService.setAccessToken(auth.accessToken);
		//   SpotifyService.getMe().then(me => {
		//     console.log(me);
		//     YoutubeService.getYoutubeAudioTracks(SPOTIFY_PLAYLIST).then((results)=>{
		//       Channel.trigger('audio:playlist:set', results);
		//     }).done();
		//   });
		// });

		// this.searchRegion.show(new SearchView());

		Channel.on('youtube:login:success', (auth) => {

			
		});
		

		this.boundUpdate = this.update.bind(this);
		this.boundOnAmplitude = this._onAmplitude.bind(this);
		this.boundOnPitch = this._onPitch.bind(this);

		this._audioAnalyzeVo = {
			beat:0,
			amplitude:0
		};
		this.boundUpdate();
	}

	onRender() {
		//this.centerRegion.show(new LoginView());
		this.audioView = new AudioView();
			this.audioRegion.show(this.audioView);

			this.vjView = new VjView();
			this.vjView.setAudioAnalyzeVo(this._audioAnalyzeVo);
			this.youtubeRegion.show(this.vjView);
	}

	onShow() {

	}

	update() {
		EaseNumbers.update();
		if (this.audioView) {
			this.audioView.update();
			this.audioView.getAmplitude(this.boundOnAmplitude);
			this.audioView.getPitch(this.boundOnPitch);
		}

		if (this.vjView) {
			this.vjView.update();
		}
		window.requestAnimationFrame(this.boundUpdate);
	}

	_onAmplitude(amp) {
		let _b = this.audioView.isBeat();
		this._audioAnalyzeVo.beat = _b;
		this._audioAnalyzeVo.amplitude = amp;
	}

	_onPitch(pitch){
		this._audioAnalyzeVo.hertz = pitch.hertz;
		this._audioAnalyzeVo.note = pitch.noteIndex;
	}

	showUserPlaylists(playlists) {
		//this.youtubeRegion.show(new YoutubeView(playlists.items));
	}

	onDestroy() {}

	onVjStart() {
		window.requestAnimationFrame(this.boundUpdate);
	}


};

export default AppView;

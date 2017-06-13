'use strict';
import './login.scss';
// Vendor dependencies
import Marionette from 'backbone.marionette';
import Backbone from 'backbone';
import Utils from 'utils';
import Channel from 'channel';
import Session from 'session';
import GSAP from 'gsap';

// Core dependencies
// App dependencies
import template from './login.ejs';

import popupService from 'popupService';
import SpotifyService from 'spotifyService';

// Define
class LoginView extends Marionette.ItemView {

  ui() {
    return {
      btn: '.youtube',
      loginTitle: '.login-title',
      loginInstruc: '.login-instruc',
      btnSpot: '.spotify',
      vj: '.vj'
    }
  }

  events() {
    return {
      'click @ui.btn': 'btnClick',
      'click @ui.btnSpot': 'spotifyLogin',
      'click @ui.vj': 'goToVj'
    }
  }

  template() {
    return template;
  }

  initialize() {
    let spotifyAccess = Utils.getSpotifyAccessToken();
    let youtubeAccess = Utils.getYoutubeAccessToken();

    if (spotifyAccess) {
      SpotifyService.setAccessToken(spotifyAccess);
      Channel.trigger('spotify:login:success', Session.spotify.auth);
    }

    if (youtubeAccess) {
      Channel.trigger('youtube:login:success', Session.youtube.auth);
    }
  }


  btnClick(e) {
    popupService.youtubeLogin();

  }

  goToVj() {
    Backbone.history.navigate('/vj', {
      trigger: true
    });
  }

  spotifyLogin(e) {
    popupService.spotifyLogin();
  }
};

// Export
export default LoginView;

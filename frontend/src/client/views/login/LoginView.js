'use strict';
import './login.scss';
// Vendor dependencies
import Marionette from 'backbone.marionette';
import Backbone from 'backbone';

// Core dependencies
// App dependencies
import template from './login.ejs';

import popupService from 'popupService';

// Define
class LoginView extends Marionette.ItemView {

  ui() {
    return {
      btn: '.youtube',
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

  btnClick(e) {
    popupService.youtubeLogin();

  }

  goToVj(){
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

'use strict';

// Vendor dependencies
import Marionette from 'backbone.marionette';
import Backbone from 'backbone';

import Utils from 'utils';
import Channel from 'channel';

// Define
class AppRouter extends Marionette.AppRouter {

  constructor(options) {
    super(options);

  }

  routes() {
    return {
      '': 'onRootChanged',
      '/': 'onRootChanged'
    }
  }

  initialize() {
    this.start();
  }

  start() {
    Backbone.history.start({
      pushState: true
    });
  }
  onRootChanged(s) {
  }


};

// Export
export default AppRouter;

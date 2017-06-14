'use strict';

// Vendor dependencies
import $ from 'jquery';
import _ from 'lodash';
import shim from 'shim';
import Backbone from 'backbone';
import Radio from 'backbone.radio';
import Marionette from 'backbone.marionette';


// Core dependencies
// App dependencies
import AppRouter from './routers/AppRouter';
import AppView from './views/AppView';

/*var rm = new Marionette.RegionManager();

var region = rm.addRegions({
  "main":{
    selector: "#app",
  },
  "centerRegion": {
    selector: '[data-region="center"]',
  },
  "audioRegion": {
    selector: '[data-region="audio"]',
  },
  "youtubeRegion": {
    selector: '[data-region="youtube"]'
  }
});*/

// Define
// TODO: double-check if there's any advantage in extending Marionette.Application
class App extends Marionette.Application {

  constructor() {
    super();
  }

  /*getRegionManager() {
    // custom logic
    return rm
  }*/

  regions() {
    return {
      "main": '#app'
    }
  }

  initialize() {
    const appView = new AppView();
    this.main.show(appView)
    //console.log(this._regionManager._regions.main.show);
    //this._regionManager._regions.main.show(appView);
    const appRouter = new AppRouter();
  }

};

// Export
export default App;

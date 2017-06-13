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

// Define
// TODO: double-check if there's any advantage in extending Marionette.Application
class App extends Marionette.Application {

  constructor() {
    super();
  }

  initialize() {
    const appView = new AppView();
    this.addRegions({
      "main": 'body'
    });
    this.main.show(appView);
    const appRouter = new AppRouter();
  }

};

// Export
export default App;

'use strict';

import App from './App';

let _app

function _init() {
    _app = new App()
}

if (document.body) {
  _init();
} else {
  window.addEventListener('DOMContentLoaded', _init);
}

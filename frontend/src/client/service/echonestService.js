import $ from 'jquery';
import Q from 'bluebird';

import Session from 'session';
'use strict';

const ECHO = {

  search(id) {
      return Q.resolve($.post(process.env.SERVER_BASE + 'echonest/search', {
        id: id
      })).then((data) => {
        return JSON.parse(data.body);
      }).catch((e) => {
        console.log(e);
      });
    }
};

export default ECHO;

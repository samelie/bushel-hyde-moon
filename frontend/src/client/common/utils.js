'use strict';
import QS from 'query-string';
import _ from 'lodash';

// Define
const Utils = {

};

Utils.parseQueryString = function(string) {
    return QS.parse(string);
}


Utils.urlParams = function() {
    var query;
    var pos = window.location.href.indexOf("?");
    if (pos == -1) return [];
    query = window.location.href.substr(pos + 1);
    var result = {};
    query.split("&").forEach(function(part) {
        if (!part) return;
        var item = part.split("=");
        var key = item[0];
        var from = key.indexOf("[");
        if (from == -1) result[key] = decodeURIComponent(item[1]);
        else {
            var to = key.indexOf("]");
            var index = key.substring(from + 1, to);
            key = key.substring(0, from);
            if (!result[key]) result[key] = [];
            if (!index) result[key].push(item[1]);
            else result[key][index] = item[1];
        }
    });
    return result;
};

Utils.shuffle = function(a) {
    var j, x, i;
    for (i = a.length; i; i -= 1) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
    return a;
};

// Export
export default Utils;
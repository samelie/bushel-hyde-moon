import $ from 'jquery';
import Q from 'bluebird';
import Backbone from 'backbone';
import Cookies from 'js-cookie';
import { parseQueryString } from 'utils';

import Utils from 'utils';

import Session from 'session';
import Channel from 'channel';
'use strict';

const POPUP = {

    spotifyLogin() {
        return new Q((resolve, reject) => {
            let url = process.env.SERVER_BASE + 'auth/spotify'
            let width = 650;
            let height = 530;
            let windowFeatures = "status=no,height=" + height + ",width=" + width + ",resizable=yes,toolbar=no,menubar=no,scrollbars=yes,location=no,directories=no";
            let win = window.open(url, '_blank', windowFeatures);

            let _authenticationInterval = setInterval(() => {
                let href;
                try {
                    href = win.location.href;
                } catch (e) {

                }
                if (href) {
                    let hasCode = href.indexOf('access_token=') !== -1;
                    if (hasCode) {
                        let q = Utils.parseQueryString(href);
                        let accessToken = '';
                        _.forIn(q, (val, key) => {
                            if (key.indexOf('access_token') !== -1) {
                                accessToken = val;
                            }
                        });
                        let expires = q.expires_in; //sec
                        let days = expires / 60 / 60 / 24;
                        Cookies.set('rad-spotifyAccess', accessToken, { expires: days });
                        Cookies.set('rad-spotifyRefresh', q.refresh_token, { expires: days });

                        Session.spotify.auth = {
                            accessToken,
                            refreshToken: q.refresh_token
                        };

                        Channel.trigger('spotify:login:success', Session.spotify.auth);

                        clearInterval(_authenticationInterval);
                        win.close();
                    }
                }
            }, 40);
        });
    },

    youtubeLogin() {
        return new Q((resolve, reject) => {
            let url = process.env.SERVER_BASE + 'auth/youtube';
            let width = 650;
            let height = 530;
            let windowFeatures = "status=no,height=" + height + ",width=" + width + ",resizable=yes,toolbar=no,menubar=no,scrollbars=yes,location=no,directories=no";
            let win = window.open(url, '_blank', windowFeatures);

            let _authenticationInterval = setInterval(() => {
                let href;
                try {
                    href = win.location.href;
                } catch (e) {

                }
                console.log(href);
                if (href) {
                    let hasCode = href.indexOf('access_token=') !== -1;
                    if (hasCode) {
                        let q = Utils.parseQueryString(href);
                        let access_token = '';
                        _.forIn(q, (val, key) => {
                            if (key.indexOf('access_token') !== -1) {
                                access_token = val;
                            }
                        });

                        let expires = q.expires_in; //sec
                        let days = expires / 60 / 60 / 24;
                        Cookies.set('rad-youtubeAccess', access_token, { expires: days });
                        Cookies.set('rad-youtubeRefresh', q.refresh_token, { expires: days });

                        Session.youtube.auth = {
                            access_token,
                            refresh_token: q.refresh_token
                        };

                        Channel.trigger('youtube:login:success', Session.youtube.auth);

                        clearInterval(_authenticationInterval);
                        win.close();
                    }
                }
            }, 40);
        });
    }

};
export default POPUP;
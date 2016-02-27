import Q from 'bluebird';

class SpotifyServiceUtils {

  export function getPlaylistTracks(Spot, id, playlistId, offset) {
    Spot.getPlaylist(this.me.id, id, {
        limit: 50,
        offset: offset
      })
      .then(function(data) {
        var res = data['body'];
        unfiltered = unfiltered.concat(res['tracks']['items']);
        if (res['tracks']['next']) {
          __scanPlaylist(50);
        } else {
          _.each(unfiltered, function(track) {
            playVO['temp'].push(track['track']['id']);
          });
          var newIds = _newIds(playVO);
          var promises = [];
          if (newIds.length > 0) {
            //get the details on the new tracks
            _.each(newIds, function(id) {
              console.log('\t', id);
              promises.push(__getTrackInfo(id));
            });
            Q.all(promises)
              .then(function(results) {
                clearTimeout(scanTimeout);
                clearInterval(scanInterval);

                var finalNewVos = [];
                _.each(results, function(newVo) {
                  finalNewVos.push(newVo);
                });
                //send back & stop poll
                callback({
                  playlist_id: manifestData['playlist_id'],
                  tracks: _.flatten(finalNewVos.concat(manifestData['manifest']))
                });

              })
              .catch(function(err) {
                console.log("ERROR");
                defer.resolve(error);
              })
              .done();
          }
          playVO['playlist'] = _.clone(playVO['temp']);
          unfiltered = [];
          playVO['temp'] = [];

          scanTimeout = setTimeout(function() {
            __scanPlaylist();
          }, 4000);
        }
      }, function(err) {
        console.log(err);
      });
  }
}
}

export default SpotifyServiceUtils;
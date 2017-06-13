// export
import Q from 'bluebird';

const AUDIO_ANALYSIS = (function() {

  // Create offline context
  let OfflineContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  let offlineContext = new OfflineContext(1, 2, 44100);
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  let OnlineContext = new AudioContext();

  let analyser;
  let bars = Array(300);
  let average, previousAverage;

  let peaks,
    dropThreshhold = 1.1,
    initialThresold = 0.9,
    thresold = initialThresold,
    minThresold = 0.3,
    minPeaks = 30;

  function analyseTracks(manifest) {
    let proz = [];
    console.log(manifest.length);
    _.each(manifest, function(item) {
      proz.push(analyseTrack(item['url']));
    });
    /*
    Q.all(proz).then(functi
    	console.log(res);
    }).done();*/
  }

  function getBuffer(vo) {
    return new Q((resolve, reject) => {
      let formData = new FormData();
      formData.append('url', vo.url);
      formData.append('byteRange', vo.byteRange);
      formData.append('byteRangeMax', vo.byteLength);

      let xhr = new XMLHttpRequest();
      //xhr.open('POST', process.env.SERVER_BASE + 'getVideo', true);
      xhr.open('GET', 'audio/guitar/c_0.ogg', true);
      xhr.responseType = 'arraybuffer';
      //xhr.send(formData);
      xhr.send();
      xhr.addEventListener("readystatechange", () => {
        if (xhr.readyState == xhr.DONE) {
          console.log("DONE")
          console.log(xhr.response)
          OnlineContext.decodeAudioData(xhr.response, function(buffer) {
            console.log("Decoded")
            resolve(buffer);
          });
        }
      });
    });
  }

  function analyseBuffer(buffer) {
    analyser = OnlineContext.createAnalyser();
    analyser.smoothingTimeConstant = 0.3;
    analyser.fftSize = 2048;

    let source = OnlineContext.createBufferSource();
    source.buffer = buffer;
    console.log("Duration: ", buffer.duration);
    source.connect(analyser);
    analyser.connect(OnlineContext.destination);
    let gainNode = OnlineContext.createGain();
    //gainNode.gain.value = 0;
    source.connect(gainNode);
    source.start(0);

    update();
  }

  function getAverageVolume(array) {
    let values = 0;
    let average;

    let length = array.length;

    // get all the frequency amplitudes
    for (let i = 0; i < length; i++) {
      values += array[i];
    }

    average = values / length;
    return average;
  }


  function update() {
    // get the average, bincount is fftsize / 2
    let array = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(array);
    let average = getAverageVolume(array);

    if (previousAverage) {
      if (average / previousAverage > 2.5) {
        console.log("Beat!");
      }
    }

    previousAverage = average;

    requestAnimationFrame(update);
  }


  function getBpm(vo) {
    return getBuffer(vo).then((buffer)=>{
      // Create buffer source
      console.log("BUFFER")
      let source = offlineContext.createBufferSource();
      source.buffer = buffer;
      console.log(source)
      // Create filter
      let filter = offlineContext.createBiquadFilter();
      filter.type = "lowpass";

      // Pipe the song into the filter, and the filter into the offline context
      source.connect(filter);
      filter.connect(offlineContext.destination);

      // Schedule the song to start playing at time:0
      source.start(0);

      do {
        peaks = _getPeaksAtThreshold(buffer.getChannelData(0), thresold);
        thresold -= 0.05;
      } while (peaks.length < minPeaks && thresold >= minThresold);

      let intervals = _countIntervalsBetweenNearbyPeaks(peaks);

      let groups = _groupNeighborsByTempo(intervals, buffer.sampleRate);

      let top = groups.sort((intA, intB) => {
        return intB.count - intA.count;
      }).splice(0, 5);

      return top;

      //  resolve(top);

    });
  }

  // Function to identify peaks
  function _getDrops(data) {
    let dropArrays = [];
    let interval = 11025;
    let length = data.length;
    console.log(length / 44100);
    for (let i = 0; i < length;) {
      let diff = data[i] - (data[i - interval] || 0);
      if (diff > dropThreshhold) {
        console.log(diff, dropThreshhold);
        dropArrays.push(i / 44100);
      }
      i += interval;
    }
    return dropArrays;
  }

  // Function to identify peaks
  function _getPeaksAtThreshold(data, threshold) {
    let peaksArray = [];
    let length = data.length;
    for (let i = 0; i < length;) {
      if (data[i] > threshold) {
        peaksArray.push(i);
        // Skip forward ~ 1/4s to get past this peak.
        i += 10000;
      }
      i++;
    }
    return peaksArray;
  }

  // Function used to return a histogram of peak intervals
  function _countIntervalsBetweenNearbyPeaks(peaks) {
    let intervalCounts = [];
    peaks.forEach(function(peak, index) {
      for (let i = 0; i < 10; i++) {
        let interval = peaks[index + i] - peak;
        let foundInterval = intervalCounts.some(function(intervalCount) {
          if (intervalCount.interval === interval)
            return intervalCount.count++;
        });
        if (!foundInterval) {
          intervalCounts.push({
            interval: interval,
            count: 1
          });
        }
      }
    });
    return intervalCounts;
  }

  function _groupNeighborsByTempo(intervalCounts, sampleRate) {
    let tempoCounts = [];
    intervalCounts.forEach(function(intervalCount, i) {
      if (intervalCount.interval !== 0) {
        // Convert an interval to tempo
        let theoreticalTempo = 60 / (intervalCount.interval / sampleRate);

        // Adjust the tempo to fit within the 90-180 BPM range
        while (theoreticalTempo < 90) theoreticalTempo *= 2;
        while (theoreticalTempo > 180) theoreticalTempo /= 2;

        theoreticalTempo = Math.round(theoreticalTempo);
        let foundTempo = tempoCounts.some(function(tempoCount) {
          if (tempoCount.tempo === theoreticalTempo)
            return tempoCount.count += intervalCount.count;
        });
        if (!foundTempo) {
          tempoCounts.push({
            tempo: theoreticalTempo,
            count: intervalCount.count
          });
        }
      }
    });
    return tempoCounts;
  }

  return {
    getBuffer: getBuffer,
    analyseBuffer: analyseBuffer,
    getBpm: getBpm
  }

})();

export default AUDIO_ANALYSIS;

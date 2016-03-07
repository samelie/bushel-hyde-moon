import sono from '@stinkdigital/sono';
import _ from 'lodash';

let SynthAudio = function(){
  const FOLDERS = ['guitar', 'beep1', 'deep1', 'dung1'];
  const NOTES = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];
  const OCTAVES = ['0'];

  let loadPaths = [];
  _.each(FOLDERS, (folder) => {
    _.each(NOTES, (note) => {
      _.each(OCTAVES, (octave) => {
        loadPaths.push([`audio/${folder}/${note}_${octave}.ogg`, `audio/${folder}/${note}_${octave}.mp3`])
      });
    });
  });


  var lookahead = 25.0; // How frequently to call scheduling function
  //(in milliseconds)

  const audioContext = sono.context;
  let _bpm = 70;
  const scheduleAheadTime = 0.1;
  let nextNoteTime = 0;
  let current16thNote = 0;
  let _quarterBeatCounter = -1;
  let notesInQueue = [];
  var noteLength = 0.05;



  let currentNote = -1;
  let _updateCounter = 0;
  const SAMPLE_FREQ_MIN = 2;
  const SAMPLE_FREQ_MAX = 14;
  //const OCTAVES = 2;
  //const NOTES = 7;
  const SIMULTANEOUS = 2;
  const SAME_NOTE_PLAY_INTERVAL_MIN = 2;
  const SAME_NOTE_PLAY_INTERVAL_MAX = 6;

  let _playCounters = [];

  let _sameNotePlayInterval;
  let _previousPlayIndex;

  let _position = {
    x: 0,
    y: 0
  };

  let _velocity = 0;

  let _sounds = [];


  /*
  Group the sounds * simulanteous into arrays of notes, grouped into array of folders
  */
  var folderIndex = -1;
  let _soundGroups = [];
  _.each(loadPaths, (paths, pathIndex)=>{
    var noteIndex =  pathIndex % NOTES.length;
    if(noteIndex % (NOTES.length) === 0){
      folderIndex++;
      _soundGroups.push([]);
    }
    var folderArray = _soundGroups[_soundGroups.length-1];
    for (var i = 0; i < SIMULTANEOUS; i++) {
      let s = sono.createSound({
        id: folderIndex + '_' + noteIndex,
        src: paths,
        loop: false,
        volume: sono.volume,
        webAudio: true
      });
      if(i === 0){
        folderArray.push([]);
      }
      var noteArray = folderArray[folderArray.length-1];
      noteArray.push(s);
    }
  });


  let timerWorker = new Worker('synthAudioWorker.js');
  console.log(timerWorker)

  timerWorker.onmessage = function(e) {
    if (e.data == "tick") {
      scheduler();
    } else
      console.log("message: " + e.data);
  };
  timerWorker.postMessage({
    "interval": lookahead
  });

  timerWorker.postMessage("start");


  function _play(index) {
    let f = false;
    let i = 0;
    let currentTime = 0;
    let indexCloserToFinising = 0;
    for (i; i < SIMULTANEOUS; i++) {
      if (_previousPlayIndex !== index) {
        if (!_sounds[index][i].playing) {
          f = true;
          _sounds[index][i].play();
          _playCounters[index] = 0;
          break;
        }
        if (_sounds[index][i].currentTime > currentTime) {
          currentTime = _sounds[index][i].currentTime;
          indexCloserToFinising = i;
        }
      }
    }
    i = 0;
    if (!f && _previousPlayIndex !== index) {
      if (_playCounters[index] > _sameNotePlayInterval) {
        _sounds[index][indexCloserToFinising].stop();
        _sounds[index][indexCloserToFinising].play();
        _playCounters[index] = 0;
      }
    }
    _previousPlayIndex = index;
  }

  function _map(v, a, b, x, y) {
    return (v === a) ? x : (v - a) * (y - x) / (b - a) + x;
  }

  function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
  }


  function setPosition(msg) {
    if (_position.x === msg.x) {
      return;
    }
    _position.x = msg.x;
    _position.y = msg.y * -1;
  }

  function setVelocity(v) {
    if (v > _velocity) {
      _velocity = v;
    }
    _velocity += -v * 0.1;
  }

  function setBpm(bpm){
    _bpm = bpm;
  }

  function _playNote() {
    var noteIndex = clamp(Math.floor(_map(_position.x, -1, 1, 0, NOTES)), 0, NOTES);
    var octave = 0;
    if (_position.y > 0) {
      octave = NOTES;
    }
    let index = noteIndex + octave;
    _play(index);
  }


  function update() {
    return;
    if (_updateCounter % 60 === 0) {}
    _updateCounter++;

    let sampleFrequency = Math.max((SAMPLE_FREQ_MAX - (SAMPLE_FREQ_MAX * _velocity)), SAMPLE_FREQ_MIN);
    _sameNotePlayInterval = Math.max((SAME_NOTE_PLAY_INTERVAL_MAX - (SAME_NOTE_PLAY_INTERVAL_MAX * _velocity)), SAME_NOTE_PLAY_INTERVAL_MIN);
    if (_updateCounter > sampleFrequency) {
      _updateCounter = 0;
      _playNote();
    }
    for (var i = 0; i < NOTES * OCTAVES; i++) {
      _playCounters[i]++;
    }


    //new
    var currentTime = audioContext.currentTime;
    while (notesInQueue.length && notesInQueue[0].time < currentTime) {
      currentNote = notesInQueue[0].note;
      notesInQueue.splice(0, 1); // remove note from queue
    }
  }

  //*********************
  //web audio
  //*********************


  function _getSixteenthSound(){
    var folder = 3;
    var note = Math.floor(Math.random() * NOTES.length);
    return _soundGroups[folder][note][0];

  }

  function _getQuarterSound(){
    var folder = 0;
    var note = Math.floor(Math.random() * NOTES.length);
    return _soundGroups[folder][note][0];
  }

  function _getHalfSound(){
     var folder = 1;
    var note = Math.floor(Math.random() * NOTES.length);
    return _soundGroups[folder][note][0];
  }


  function scheduler() {
    // while there are notes that will need to play before the next interval,
    // schedule them and advance the pointer.
    while (nextNoteTime < audioContext.currentTime + scheduleAheadTime) {
      scheduleNote(current16thNote, nextNoteTime);
      nextNote();
    }
  }

  function scheduleNote(beatNumber, time) {
    // push the note on the queue, even if we're not playing.
    notesInQueue.push({
      note: beatNumber,
      time: time
    });

    var note = Math.floor(beatNumber % NOTES.length);

    var folder = beatNumber % FOLDERS.length;
    var sound = _soundGroups[folder][note][0];
    if(sound.playing){
      sound = _soundGroups[folder][note][1];
    }

    let sixteenthSound = _getSixteenthSound();
    let quarterSound;
    let halfSound;
    //quarter
    if (beatNumber % 4 === 0){
      quarterSound = _getQuarterSound();
      _quarterBeatCounter++;
    }

    if(_quarterBeatCounter % 2 === 0){
      //on beat
    }else{
      //off beat
    }

    //half
    if (beatNumber % 8 === 0){
      halfSound = _getHalfSound();
    }
    sixteenthSound.play();
    if(halfSound){
      halfSound.play();
    }
    if(quarterSound){
      quarterSound.play();
    }
  }

  function nextNote() {
    // Advance current note and time by a 16th note...
    var secondsPerBeat = 60.0 / _bpm; // Notice this picks up the CURRENT
    // _bpm value to calculate beat length.
    nextNoteTime += 0.25 * secondsPerBeat; // Add beat length to last beat time

    current16thNote++; // Advance the beat number, wrap to zero
    if (current16thNote == 16) {
      current16thNote = 0;
    }
  }

  function play() {
    isPlaying = !isPlaying;

    if (isPlaying) { // start playing
      current16thNote = 0;
      nextNoteTime = audioContext.currentTime;
      timerWorker.postMessage("start");
      return "stop";
    } else {
      timerWorker.postMessage("stop");
      return "play";
    }
  }

  return {
    setPosition: setPosition,
    setVelocity: setVelocity,
    setBpm: setBpm,
    update: update
  }
};

export default SynthAudio;

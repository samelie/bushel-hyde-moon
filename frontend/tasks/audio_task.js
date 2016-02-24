'use strict';

var async = require('async');
var del = require('del');
var path = require('path');
var changeCase = require('change-case');
var ffmpeg = require('gulp-fluent-ffmpeg');
var gulp = require('gulp');
var _ = require('lodash');
var rename = require('gulp-rename');
var argv = require('yargs').argv;
var readDir = require('readdir');



var paths = {
    src: './src/audio/**/*',
    dist: './build/audio/'
};

var bitRate = argv.b || '320';
//deciv
var decible = argv.v || '5';

var JSON_OUTPUT = path.join(paths.dist, 'audio.json');

function formatName() {
    return rename(function(path) {
        path.basename = path.basename;
        path.dirname = path.dirname

    });
}
console.log("Converting at ", bitRate);

function mp3() {
    return gulp.src(paths.src)
        .pipe(ffmpeg('mp3', function(cmd) {
            return cmd
                .audioBitrate(bitRate + 'k')
                .audioFilters("volume="+decible+"dB")
                .audioChannels(1)
                .audioCodec('libmp3lame');
        }))
        .pipe(formatName())
        .pipe(gulp.dest(paths.dist));
}

function ogg() {
    console.log(paths.src);
    return gulp.src(paths.src)
        .pipe(ffmpeg('ogg', function(cmd) {
            return cmd
                .audioBitrate(bitRate + 'k')
                .audioFilters("volume="+decible+"dB")
                .audioChannels(2)
                .audioCodec('libvorbis');
        }))
        .pipe(formatName())
        .pipe(gulp.dest(paths.dist));
}

var fs = require('fs');
// var path = require('path');

/*IGNORE THIS*/
function ls(cb) {

    var json = [];

    var filesArray = readDir.readSync('build/audio/', ['**.ogg', '**.mp3']);
    _.each(filesArray, (file) => {
        var parsed = path.parse(file);
        var dirs = parsed.dir.split('/');

        var objs = [];
        var previousObj;
        var filePath;
        var dir
        var fileArray;
        for (var i = 0; i < dirs.length; i++) {
            var dirName = dirs[i];
            if (dirs[i + 1]) {
                if (previousObj) {
                    previousObj.files = previousObj.files || [];
                    filePath[dirName] = filePath[dirName];
                    console.log(filePath);
                    if(filePath.files.indexOf(filePath) < 0){
                        previousObj.files.push(filePath);
                    }
                } else {
                    previousObj = json[dirName] = json[dirName] || {};
                    previousObj.files = previousObj.files || [];
                    previousObj.dirName = dirName;
                    if(json.indexOf(previousObj) < 0){
                        json.push(previousObj);
                    }
                }
            } else {
                fileArray = previousObj.files= previousObj.files || [];
            }
        }
        fileArray.push(path.join(paths.dist, file));
    });
    fs.writeFile(JSON_OUTPUT, JSON.stringify(json, null, 4), function(err) {
        if (err) {
            console.error(err);
        }
        cb();
    });
}
/*IGNORE THIS*/

function convert() {
    async.series([
            function(callback) {
                ogg()
                .on('end', function () {
                    callback(null, 'ogg');
                });
            },
            function(callback) {
                mp3()
                .on('end', function () {
                    callback(null, 'mp3');
                });
            }
        ],
        function(err, results) {
            console.log('convert audio done:', results.join(' > '));
        });
}

module.exports = {
    convert: convert
};
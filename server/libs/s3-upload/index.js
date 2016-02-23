var Q = require('bluebird');
var fs = require('fs');
var s3 = require('s3');
var path = require('path');
var _ = require('lodash');

module.exports = function(config) {

    var client = s3.createClient({
        maxAsyncS3: 20, // this is the default 
        s3RetryCount: 3, // this is the default 
        s3RetryDelay: 1000, // this is the default 
        multipartUploadThreshold: 20971520 * 100, // this is the default (20 MB) 
        multipartUploadSize: 15728640 * 100, // this is the default (15 MB) 
        s3Options: config
    });

    function _uploadDirectory(dirPath, params) {
        return new Q(function(resolve, reject) {
            var uploader = client.uploadDir(params);
            uploader.on('error', function(err) {
                console.error("unable to sync:", err.stack);
                reject(err);
            });
            uploader.on('progress', function() {});
            uploader.on('end', function() {
                console.log("done uploading");
                resolve();
            });
        });
    }

    /*
    {accessKeyId: 'akid', secretAccessKey: 'secret'}
    */
    function config(config) {

    }

    /*
    s3Params: {
        Bucket: "rad-moon"
    },
    recursive: true
    */
    function listOjects(params) {
        return new Q(function(resolve, reject) {
            var objects = [];
            var list = client.listObjects(params);
            list.on('error', function(err) {
                reject(err);
            });
            list.on('progress', () => {});
            list.on('data', (data) => {
                objects.push(data);
            });
            list.on('end', () => {
                resolve(objects);
            });
        });
    }

    /*
        var params = {
        localDir: path.join(PATH, 'apollo15'),
        deleteRemoved: true, // default false, whether to remove s3 objects 
        // that have no corresponding local file. 
        s3Params: {
            Bucket: "rad-moon",
            Prefix: "",
            ACL: 'public-read'
        }
        };
        */
    function uploadDirectories(dirPaths, params) {
        return Q.map(dirPaths, (dir) => {
            return _uploadDirectory(dir, params);
        }, { concurrency: 1 });
    }

    function uploadFile(params) {
        console.log(params);
        return new Q(function(resolve, reject) {
            var uploader = client.uploadFile(params);
            uploader.on('error', function(err) {
                console.log(err);
            });
            uploader.on('progress', function() {
            });
            uploader.on('end', function(r) {
                console.log("UPLOADED");
                console.log(r);
                resolve();
            });
        });
    }

    /*
    { Bucket: "rad-moon" }
    */
    function deleteDir(params) {
        return new Q(function(resolve, reject) {
            var deleter = client.deleteDir(params);
            deleter.on('error', function(err) {
                console.error("unable to sync:", err.stack);
                reject(err);
            });
            deleter.on('progress', function() {});
            deleter.on('end', function() {
                console.log("done uploading");
                resolve();
            });
        });
    }

    function urlsFromList(bucket, objects) {
        var urls = [];
        _.each(objects, (dir) => {
            _.each(dir.Contents, (obj) => {
                urls.push(s3.getPublicUrlHttp(bucket, obj.Key));
            });
        });
        return urls;
    }

    return {
        config: config,
        urlsFromList: urlsFromList,
        listOjects: listOjects,
        deleteDir: deleteDir,
        uploadDirectories: uploadDirectories,
        uploadFile: uploadFile,
        getPublicUrlHttp:s3.getPublicUrlHttp
    }
};
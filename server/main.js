var _ = require('lodash');
var Q = require('bluebird');
var fs = require('fs');
var path = require('path');
var aws = require('aws-sdk');
var DB = require('./libs/database');
var DB_API = require('./database/api');
var S3 = require('./libs/s3-upload');

var TYPES = ['minerals'];

var ROCK_VO = {
    url: undefined,
    type: undefined
};
var BUCKET = "rad-moon";

require('dotenv').config({
    path: path.join(process.cwd(), 'envvars')
});

aws.config.update({
    region: process.env.AWS_REGION
});

var database = new DB({ force: false });
var s3 = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});


var db_api = new DB_API(database);
console.log(db_api);

var uploadOptions = {
    s3Params: {
        Bucket: "rad-moon",
        ACL: 'public-read'
    }
};

function createDatabaseEntries(vos) {
    return Q.map(vos, (vo) => {
        return db_api.createContent(vo);
    }, { concurrency: 1 });
}

s3.listOjects({
    s3Params: {
        Bucket: BUCKET
    },
    recursive: true
}).then((objects) => {
    var urls = s3.urlsFromList("rad-moon", objects);
    var uploadVos = [];
    console.log(urls.length);
    _.each(urls, (url) => {
        var vo = _.clone(ROCK_VO);
        vo.url = url;
        var parsed = path.parse(url);
        var type = parsed.dir.split('/');
        type = type[type.length - 1];
        _.each(TYPES, (t) => {
            if (type === t) {
                vo.type = type;
                return;
            }
        });
        uploadVos.push(vo);
    });

    var manifestP = 'rad-moon-manifest.json';
    var manifestKey = "rad-moon-manifest";
    fs.writeFileSync(manifestP, JSON.stringify(uploadVos), null, 4);
    var o = _.merge({
        s3Params: {
            Key: manifestKey
        }
    }, uploadOptions);
    s3.uploadFile(_.assign({}, o, { localFile: manifestP }));
    db_api.createContent({
        url: s3.getPublicUrlHttp(BUCKET, manifestKey),
        type: 'manifest'
    });
    //return createDatabaseEntries(uploadVos);
});
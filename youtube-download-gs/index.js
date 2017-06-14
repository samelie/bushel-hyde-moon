require('shelljs/global');
const GS = require('google-cloudstorage-commands');
const SIDX = require('node-dash-sidx');
const path = require('path');
const B = require('bluebird');
const fs = require('fs');
const _ = require('lodash');

const c = exec(`ls *.mp4`).stdout.split('\n')


function upload() {
  c.forEach(p => {
    if (p.length) {
      exec(`gsutil cp ${path.join(__dirname, p)} gs://samrad-moon`)
      exec(`gsutil acl ch -u AllUsers:R gs://samrad-moon/${p}`)
    }
  })
}

function sidx(){
  B.map(c, p => {
      if (p.length) {
        const url = `https://storage.googleapis.com/samrad-moon/${p}.mp4`
        const o = {}
        return SIDX.start({ id: p, itags: ['133'] })
      } else {
        return null
      }
    }, { concurrency: 1 })
    .then(all => {
      _.flatten(_.compact(all)).forEach(sidx => {
        sidx.url = `https://storage.googleapis.com/samrad-moon/${sidx.videoId}`
      })
      const o = 'moon2.json'
      fs.writeFileSync(o, JSON.stringify(all))
      exec(`gsutil rm gs://samrad-moon/${o}`)
      exec(`gsutil cp ${path.join(__dirname, o)} gs://samrad-moon`)
      exec(`gsutil acl ch -u AllUsers:R gs://samrad-moon/${o}`)
    })
}


'use strict';
import './app.scss';
// Vendor dependencies
import THREE from 'three';
import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import $ from 'jquery';

import template from './app.ejs';

import Emitter from 'emitter';
import Channel from 'channel';
import ServerServise from 'serverService';
import ImagePlayer from './imagePlayer';

var SHADERS = {
  'blend': {
    uniforms: {
      "background": {
        type: "t",
        value: null
      },
      "foreground": {
        type: "t",
        value: null
      },
      "blendMode": {
        type: "i",
        value: 9
      },
      "blendDirection": {
        type: "i",
        value: 1
      },
      "blendOpacity": {
        type: "f",
        value: 0.5
      },
      "bgOpacity": {
        type: "f",
        value: 0.0
      },
      "fgOpacity": {
        type: "f",
        value: 1.0
      }
    },
    fragmentShader: require("../glsl/blend.frag"),
    vertexShader: require("../glsl/basic.vert")
  }
};

// Define
class AppView extends Marionette.LayoutView {

  constructor() {
    super();
  }

  template() {
    return template;
  }

  ui() {
    return {
      'playBtn': '.playBtn'
    }
  }

  events() {
    return {
      'click': 'onClick'
    }
  }

  regions() {
    return {}
  }

  initialize() {
    this.canActivateClip = false;
  }

  onRender() {}

  onShow() {
    this.imagePlayer = new ImagePlayer();

    ServerServise.getManifest().then(data => {
      console.log(data);
      //this.imagePlayer.setImages(data);
      //this.imagePlayer.init();
    });
    var VIDEO_WIDTH = 1280;
    var VIDEO_HEIGHT = 720;
    var renderer = new THREE.WebGLRenderer({
      antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('three').appendChild(renderer.domElement);

    var camera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerHeight / 2, window.innerHeight * 0.5, window.innerHeight * -0.5, 0, 1000);
    var scene = new THREE.Scene();

    var texture1 = new THREE.Texture(c1);
    texture1.minFilter = THREE.LinearFilter;
    texture1.magFilter = THREE.LinearFilter;
    var texture2 = new THREE.Texture(c2);
    texture2.minFilter = THREE.LinearFilter;
    texture2.magFilter = THREE.LinearFilter;

    SHADERS.blend.uniforms["background"].value = texture1;
    SHADERS.blend.uniforms["foreground"].value = texture2;


    var newMaterial = new THREE.ShaderMaterial({
      uniforms: SHADERS.blend.uniforms,
      vertexShader: SHADERS.blend.vertexShader,
      fragmentShader: SHADERS.blend.fragmentShader,
      side: THREE.DoubleSide
    });

    var quadgeometry = new THREE.PlaneBufferGeometry(VIDEO_WIDTH, VIDEO_HEIGHT, 4, 4);
    var mesh = new THREE.Mesh(quadgeometry, newMaterial);


  }

  update() {}

  onWindowResize() {
    var w = window.innerWidth;
    var h = window.innerHeight;
    var a = h / w;
    var scale;
    if (a < VIDEO_HEIGHT / VIDEO_WIDTH) {
      scale = w / VIDEO_WIDTH;
    } else {
      scale = h / VIDEO_HEIGHT;
    }
    camera.left = w / -2;
    camera.right = w / 2;
    camera.top = h / 2;
    camera.bottom = h / -2;
    camera.updateProjectionMatrix();
    mesh.scale.x = mesh.scale.y = scale;
    renderer.setSize(w, h);
  }

  threeRender(transitionValue, isUp) {
    //var t = 1 - transitionValue;
    texture1.needsUpdate = true;
    texture2.needsUpdate = true;
    SHADERS.blend.uniforms["blendOpacity"].value = transitionValue;
    //console.log(Math.sin(0), Math.sin(6.28));
    SHADERS.blend.uniforms["blendDirection"].value = isUp;
    renderer.render(scene, camera, null, true);
  }

  onClick() {}
  onDestroy() {}


};

export default AppView;
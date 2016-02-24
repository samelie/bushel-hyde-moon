'use strict';
import './app.scss';
// Vendor dependencies
import THREE from 'three';
import dat from 'dat-gui';
import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import $ from 'jquery';

import template from './app.ejs';

import Emitter from 'emitter';
import Playlist from 'playlist';
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

var VIDEO_WIDTH = 1280;
var VIDEO_HEIGHT = 720;

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
        this.updateBound = this.update.bind(this);
    }

    onRender() {}


    onShow() {
        this.imagePlayer = new ImagePlayer();

        let options = {
            transitionTime: 1000,
            imageHold: 1000
        };

        this.gui = new dat.GUI();
        this.gui.add(options, 'transitionTime', 10, 2000).onChange((val) => {
            this.imagePlayer.setTransitionTime(val);
        });
        this.gui.add(options, 'imageHold', 1, 2000).onChange((val) => {
            this.imagePlayer.setImageHold(val);
        });


        ServerServise.getManifest().then(data => {
            let urls = Playlist.getUrlsByType(data, 'minerals');
            this.imagePlayer.setImages(urls);
            this.imagePlayer.init();
            setTimeout(()=>{

            this.setupThree();
            window.requestAnimationFrame(this.updateBound);
            },200)
        });


    }

    setupThree() {
        var c1 = this.imagePlayer.canvas[0];
        var c2 = this.imagePlayer.canvas[1];
        console.log(c1, c2);

        this.renderer = new THREE.WebGLRenderer({
            antialias: true
        });

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById('three').appendChild(this.renderer.domElement);

        this.camera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerHeight / 2, window.innerHeight * 0.5, window.innerHeight * -0.5, 0, 1000);
        this.scene = new THREE.Scene();

        this.texture1 = new THREE.Texture(c1);
        this.texture1.minFilter = THREE.LinearFilter;
        this.texture1.magFilter = THREE.LinearFilter;
        this.texture2 = new THREE.Texture(c2);
        this.texture2.minFilter = THREE.LinearFilter;
        this.texture2.magFilter = THREE.LinearFilter;

        SHADERS.blend.uniforms["background"].value = this.texture1;
        SHADERS.blend.uniforms["foreground"].value = this.texture2;

        var newMaterial = new THREE.ShaderMaterial({
            uniforms: SHADERS.blend.uniforms,
            vertexShader: SHADERS.blend.vertexShader,
            fragmentShader: SHADERS.blend.fragmentShader,
            side: THREE.DoubleSide
        });

        var quadgeometry = new THREE.PlaneBufferGeometry(VIDEO_WIDTH, VIDEO_HEIGHT, 4, 4);
        this.mesh = new THREE.Mesh(quadgeometry, newMaterial);

        this.scene.add(this.mesh);

        this.onWindowResize();

        window.addEventListener('resize', ()=>{
          this.onWindowResize();
        })
    }

    update() {
        this.imagePlayer.update();
        this.threeRender(this.imagePlayer.getTransitionValue());
        window.requestAnimationFrame(this.updateBound);
    }

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
        this.camera.left = w / -2;
        this.camera.right = w / 2;
        this.camera.top = h / 2;
        this.camera.bottom = h / -2;
        this.camera.updateProjectionMatrix();
        this.mesh.scale.x = this.mesh.scale.y = scale;
        this.renderer.setSize(w, h);
    }

    threeRender(transitionValue, isUp) {
        //var t = 1 - transitionValue;
        this.texture1.needsUpdate = true;
        this.texture2.needsUpdate = true;
        SHADERS.blend.uniforms["blendOpacity"].value = transitionValue;
        //console.log(Math.sin(0), Math.sin(6.28));
        SHADERS.blend.uniforms["blendDirection"].value = isUp;
        this.renderer.render(this.scene, this.camera, null, true);
    }

    onClick() {}
    onDestroy() {}


};

export default AppView;
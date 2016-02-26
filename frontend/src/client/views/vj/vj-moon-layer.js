'use strict';
import THREE from 'three';
import Playlist from 'playlist';
import dat from 'dat-gui';
import FxComposer from './vj-fx-composer';
import Shaders from './shaders/shaders';
import ShaderLib from './shaders/shader_lib';
import ImagePlayer from './imagePlayer';
import ServerServise from 'serverService';

const FPS = 30;

class MoonLayer {
    constructor(renderer, camera) {
        this.counter = 0;
        let VIDEO_WIDTH =  659;
        let VIDEO_HEIGHT =  480;

        // Setup scene
        this.scene = new THREE.Scene();
        this.scene.add(new THREE.AmbientLight(0xffffff));

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
        });

        let renderTargetParameters = {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBFormat,
            stencilBuffer: false
        };

        this.fbo = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, renderTargetParameters);
        this.fbo.texture.minFilter = THREE.LinearFilter;
        this.fbo.texture.magFilter = THREE.LinearFilter;

        this.texture1 = new THREE.Texture(this.imagePlayer.canvas[0]);
        this.texture1.minFilter = THREE.LinearFilter;
        this.texture1.magFilter = THREE.LinearFilter;
        this.texture2 = new THREE.Texture(this.imagePlayer.canvas[1]);
        this.texture2.minFilter = THREE.LinearFilter;
        this.texture2.magFilter = THREE.LinearFilter;

        this.mixPass = new THREE.ShaderPass(Shaders.blend, this.camera);
        this.mixPass.uniforms['background'].value = this.texture1;
        this.mixPass.uniforms['foreground'].value = this.texture2;

        let videoMaterial = new THREE.MeshBasicMaterial({
            map: this.fbo
        });

        var planeGeometry = new THREE.PlaneBufferGeometry(VIDEO_WIDTH, VIDEO_HEIGHT, 2, 2);
        this._mesh = new THREE.Mesh(planeGeometry, videoMaterial);
        this.scene.add(this._mesh);

        var renderPass = new THREE.RenderPass(this.scene, camera);
        var effectCopy = new THREE.ShaderPass(Shaders.copy, camera);
        this.composer = new THREE.EffectComposer(renderer, this.fbo);
        this.composer.addPass(renderPass);
        this.composer.addPass(this.mixPass);
        this.composer.addPass(effectCopy);
        this.fx = new FxComposer(this.scene, camera, renderer, this._mesh, this.fbo);
    }

    render(rtt) {
        this.mixPass.uniforms["blendOpacity"].value = this.imagePlayer.getTransitionValue();
        this.imagePlayer.update();
        if (this.counter % 2 === 0) {
            this.texture1.needsUpdate = true;
            this.texture2.needsUpdate = true;
        } else {
            this.texture1.needsUpdate = true;
            this.texture2.needsUpdate = false;
        }

        this.fx.render();
        this.composer.render();
        this.counter++;
    }


    resize(w, h, scale) {
        this._mesh.scale.x = this._mesh.scale.y = scale;
        this.fbo.setSize(w, h);
    }
};

export default MoonLayer;
//

import THREE from 'three';
import $ from 'jquery';
import ShaderLib from './shaders/shader_lib';
import Shaders from './shaders/shaders';
import EaseNumbers from 'ease-number';

//import FxComposer from './vj-fx-layer';
import ControlPerameters from './vj-control-perameters';
import ServerServise from 'serverService';
import FxLayer from './vj-fx-layer';
import MoonLayer from './vj-moon-layer';
import ShapeLayer from './vj-shape-layer';
import TextCanvas from './vj-text-layer';


import {
    createShaderPass
}
from './vj-shader-pass';

const VIDEO_WIDTH = 853;
const VIDEO_HEIGHT = 480;
//const FXComposer = require('three-fx-composer').FXComposer(THREE)

class Renderer {
    constructor(parentEl) {
        this.time = 0;
        this.renderer = new THREE.WebGLRenderer({
            antialias: false
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        parentEl.appendChild(this.renderer.domElement);

        this._init();
    }

    _init() {
        this.camera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerHeight / 2, window.innerHeight * 0.5, window.innerHeight * -0.5, 0, 1000);
        this.scene = new THREE.Scene();
        this.scene.add(new THREE.AmbientLight(0xffffff));

        this.beatEase = EaseNumbers.addNew(0, 0.1);

    }

    setTextures(textures) {

        this.layer1 = new FxLayer(
            textures[0],
            this.renderer,
            this.camera, {
                width: VIDEO_WIDTH,
                height: VIDEO_HEIGHT
            });
        this.moonLayer = new MoonLayer(this.renderer, this.camera);
        let renderTargetParameters = {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBFormat,
            stencilBuffer: false
        };

        // this.fbo = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, renderTargetParameters);
        // this.fbo.texture.minFilter = THREE.LinearFilter;
        // this.fbo.texture.magFilter = THREE.LinearFilter;

        var renderPass = new THREE.RenderPass(this.scene, this.camera);
        var effectCopy = new THREE.ShaderPass(Shaders.copy, this.camera);

        // this.composer = new THREE.EffectComposer(this.renderer, this.fbo);
        // this.mixPass = new THREE.ShaderPass(Shaders.simpleFrag, this.camera);
        // this.mixPass.uniforms['tDiffuse'].value = this.layer1.fbo;

        // this.textPass = new THREE.ShaderPass(Shaders.textStencil);
        // this.textPass.uniforms['tDiffuse'].value = this.fbo;
        // this.textPass.uniforms['tText'].value = this.textCanvas.getTexture();
        //
        // this.shapePass = new THREE.ShaderPass(Shaders.shape1);
        // this.shapePass.uniforms['tDiffuse'].value = this.layer2.fbo;
        // this.shapePass.uniforms['tTwo'].value = this.layer1.fbo;
        //
        // this.shapePass = new THREE.ShaderPass(Shaders.shape1);
        // this.shapePass.uniforms['tDiffuse'].value = this.layer2.fbo;
        // this.shapePass.uniforms['tTwo'].value = this.layer1.fbo;
        //
        // this.rayPass = new THREE.ShaderPass(Shaders.raymarch);
        // this.rayPass.uniforms['tDiffuse'].value = this.fbo;
        //this.rayPass.uniforms['t_tex0'].value = THREE.load;
        //this.rayPass.uniforms['tTwo'].value = this.layer1.fbo;

        //this.textPass = new THREE.TextPass(this.fbo, this.textCanvas.getTexture());
        //this.texPass = new THREE.TexturePass(this.fbo);
        //this.rayPass = new THREE.ShaderPass(Shaders.raymarch);

        // this.composer.addPass(renderPass);
        // this.composer.addPass(this.mixPass);
        // //this.composer.addPass(this.shapePass);
        // //  this.composer.addPass(this.rayPass);
        // //this.composer.addPass(this.textPass);
        // this.composer.addPass(effectCopy);

        let chroma = ShaderLib['blendMoon']();
        let shader = chroma['shader'];
        this.uniforms = chroma['uniforms'];
        //this.uniforms['uMixRatio'].value = 0.8;
        //this.uniforms['uThreshold'].value = 0.15;
        this.uniforms['blendMode'].value = 18;
        this.uniforms['background'].value = this.moonLayer.fbo;
        this.uniforms['foreground'].value = this.layer1.fbo;
        //this.uniforms['tTwo'].value = this.shapeLayer.fbo;
        //this.uniforms['tMix'].value = this.shapeLayer.fbo;

        let parameters = {
            fragmentShader: shader.fragmentShader,
            vertexShader: shader.vertexShader,
            uniforms: this.uniforms
        };

        let videoMaterial = new THREE.ShaderMaterial(parameters);
        // let videoMaterial = new THREE.MeshBasicMaterial({
        //   map: this.moonLayer.fbo
        //     //color:0xff0000
        // });

        let quadgeometry = new THREE.PlaneBufferGeometry(VIDEO_WIDTH, VIDEO_HEIGHT, 2, 2);
        this.mesh = new THREE.Mesh(quadgeometry, videoMaterial);
        this.scene.add(this.mesh);

        this.onWindowResize();

        /*
   this.texture1.needsUpdate = true;
        this.texture2.needsUpdate = true;
        SHADERS.blend.uniforms["blendOpacity"].value = transitionValue;
        //console.log(Math.sin(0), Math.sin(6.28));
        SHADERS.blend.uniforms["blendDirection"].value = isUp;
        */
    }

    setBlendOpacity(o) {
        //this.mixPass.uniforms['blendOpacity'].value = o;
    }

    update() {
        this._audioUniforms();
        this._threeRender();
        this.time++;
    }

    _audioUniforms() {
        let _p = ControlPerameters.analyzeVo;
        if (_p.beat) {
        	//console.log("BEAR");
            this.beatEase.target = 1.0;
        }else{
            this.beatEase.target = 0.5;
        }
        this.uniforms['blendOpacity'].value = this.beatEase.value;
        this.uniforms['rockOpacity'].value = _p.amplitude * ControlPerameters.rockIntensity;
    }

    onWindowResize(w, h) {
        var w = w || window.innerWidth;
        var h = h || window.innerHeight;
        var a = h / w;
        var cameraWidth, cameraHeight;
        var scale;
        if (a < VIDEO_HEIGHT / VIDEO_WIDTH) {
            scale = w / VIDEO_WIDTH;
        } else {
            scale = h / VIDEO_HEIGHT;
        }
        cameraHeight = VIDEO_HEIGHT * scale;
        cameraWidth = VIDEO_WIDTH * scale;
        this.camera.left = cameraWidth / -2;
        this.camera.right = cameraWidth / 2;
        this.camera.top = cameraHeight / 2;
        this.camera.bottom = cameraHeight / -2;
        this.camera.updateProjectionMatrix();
        this.layer1.resize(w, h, VIDEO_WIDTH, VIDEO_HEIGHT, scale);
        this.moonLayer.resize(w, h, VIDEO_WIDTH, VIDEO_HEIGHT, scale);
        this.mesh.scale.x = this.mesh.scale.y = scale;
        this.renderer.setSize(cameraWidth, cameraHeight);
    }

    _threeRender() {
        this.layer1.render();
        this.moonLayer.render();
        //this.composer.render();
        //this.rayPass.uniforms['u_time'].value = this.time;
        this.renderer.render(this.scene, this.camera, null, true);
    }
}

export default Renderer

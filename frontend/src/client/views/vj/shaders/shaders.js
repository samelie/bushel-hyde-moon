import THREE from 'three';
import CopyShader from '../post/CopyShader';
import EffectComposer from '../post/EffectComposer';
import MaskPass from '../post/MaskPass';
import TextPass from '../post/TextPass';
import TexturePass from '../post/TexturePass';
import RenderPass from '../post/RenderPass';
import ShaderPass from '../post/ShaderPass';

import basicVert from "./vert/basic.vert";
import mixFrag from './frag/mix.frag';
import blendFrag from "./frag/blend.frag";
import colorFrag from "./frag/color.frag";
import saturationFrag from "./frag/saturation.frag";
import chromaFrag from "./frag/chroma.frag";
import chromaSimpleFrag from "./frag/chroma_simple.frag";
import raymarchFrag from "./frag/raymarch02.frag";
import textStencilFrag from "./frag/textStencil.frag";
import shape1Frag from "./frag/shape1.frag";

const Shaders =  {
  'mix': {
    uniforms: THREE.UniformsUtils.merge([{
      "background": {
        type: "t",
        value: null
      },
      "foreground": {
        type: "t",
        value: null
      },
      "blendOpacity": {
        type: "f",
        value: 0.
      }
    }]),
    fragmentShader: mixFrag,
    vertexShader: basicVert
  },
  'blend': {
    uniforms: THREE.UniformsUtils.merge([{
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
        value: 15
      },
      "blendOpacity": {
        type: "f",
        value: 0.5
      }
    }]),
    fragmentShader: blendFrag,
    vertexShader: basicVert
  },
  'color': {
    uniforms: THREE.UniformsUtils.merge([{
      "tDiffuse": {
        type: "t",
        value: null
      },
      "uMaxSaturation": {
        type: "f",
        value: 8.0
      },
      "uSaturation": {
        type: "f",
        value: 0.1
      },
      "uMaxContrast": {
        type: "f",
        value: 4.0
      },
      "uContrast": {
        type: "f",
        value: 0.0
      },
      "uDesaturate": {
        type: "f",
        value: 0.0
      },
      "uBrightness": {
        type: "f",
        value: 0.0
      },
      "uHue": {
        type: "f",
        value: 0.0
      }
    }]),
    fragmentShader: colorFrag,
    vertexShader: basicVert
  },
  'saturation': {
    uniforms: THREE.UniformsUtils.merge([{
      "tDiffuse": {
        type: "t",
        value: null
      },
      "uSaturation": {
        type: "f",
        value: 1.0
      }
    }]),
    fragmentShader: saturationFrag,
    vertexShader: basicVert
  },
  'chroma': {
    uniforms: THREE.UniformsUtils.merge([{
      "uMixRatio": {
        type: "f",
        value: 0.5
      },
      "uThreshold": {
        type: "f",
        value: 0.5
      },
      "tDiffuse": {
        type: "t",
        value: null
      },
      "tTwo": {
        type: "t",
        value: null
      },
      "tMix": {
        type: "t",
        value: null
      }

    }]),
    fragmentShader: chromaFrag,
    vertexShader: basicVert
  },
  'chromaSimple': {
    uniforms: THREE.UniformsUtils.merge([{
      "uMixRatio": {
        type: "f",
        value: 0.5
      },
      "uThreshold": {
        type: "f",
        value: 0.5
      },
      "tDiffuse": {
        type: "t",
        value: null
      },
      "tTwo": {
        type: "t",
        value: null
      }
    }]),
    fragmentShader: chromaSimpleFrag,
    vertexShader: basicVert
  },
  'raymarch': {
    uniforms: {
      "tDiffuse": {
        type: "t",
        value: null
      },
      "u_time": {
        type: "f",
        value: 0.5
      }
    },
    fragmentShader: raymarchFrag,
    vertexShader: basicVert
  },
  'textStencil': {
    uniforms: {
      "tDiffuse": {
        type: "t",
        value: null
      },
      "tText": {
        type: "t",
        value: null
      }
    },
    fragmentShader: textStencilFrag,
    vertexShader: basicVert
  },
  'shape1': {
    uniforms: {
      "tDiffuse": {
        type: "t",
        value: null
      },
      "tTwo": {
        type: "t",
        value: null
      },
      "amp": {
        type: "f",
        value: 0.5
      }
    },
    fragmentShader: shape1Frag,
    vertexShader: basicVert
  },
  bit: require('./BitShader'),
  copy: CopyShader
};

export default Shaders;

const {
  join,
  resolve
} = require('path')

const constants = require('./webpack.constants')

const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');
const postcssEasings = require('postcss-easings');


const DefineENV = new webpack.DefinePlugin({
  'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
})

const CSS_LOADERS = {
  css: '',
  scss: '!sass-loader'
};

const ASSETS_DIR = "https://storage.googleapis.com/samrad-deuxtube/www-assets/assets/www-assets/"

const ENV_VARS = {
  //SERVER_BASE: '"http://0.0.0.0:1337/"',
  SERVER_BASE: '"https://rad.wtf/chewb/"',
  IS_APP: true,
  //SOCKET_SERVER: '"https://rad.wtf/chewb"',
  //APP_HOST: '"https://add.dog/"',
  APP_DOMAIN: '"/"',
  ASSETS_DIR: '"https://storage.googleapis.com/samrad-moon/"',
  REMOTE_ASSETS_DIR: `"${ASSETS_DIR}"`
}


module.exports = env => {
  const isDev = !!env.dev
  const isProd = !!env.prod
  const isTest = !!env.test
  console.log("--------------");
  console.log(isDev, isProd, isTest);
  console.log("--------------");
  const addPlugin = (add, plugin) => add ? plugin : undefined
  const ifDev = plugin => addPlugin(env.dev, plugin)
  const ifProd = plugin => addPlugin(env.prod, plugin)
  const ifNotTest = plugin => addPlugin(!env.test, plugin)
  const removeEmpty = array => array.filter(i => !!i)

  const stylesLoaders = () => {
    let _l = Object.keys(CSS_LOADERS).map(ext => {
      const prefix = 'css-loader?url=false!postcss-loader';
      const extLoaders = prefix + CSS_LOADERS[ext];
      const loader = isDev ? `style-loader!${extLoaders}` : ExtractTextPlugin.extract({ use: `${extLoaders}` })
      return {
        loader,
        test: new RegExp(`\\.(${ext})$`),
      };
    });
    console.log(_l);
    return _l
  }

  return {
    entry: {
      app: './main.js',
    },
    output: {
      filename: 'bundle.[name].[chunkhash].js',
      path: resolve(__dirname, constants.DIST),
      publicPath: "",
      pathinfo: !env.prod,
    },
    context: constants.SRC_DIR,
    devtool: env.prod ? 'source-map' : 'eval',
    devServer: {
      host: '0.0.0.0',
      inline: true,
      hot: true,
      stats: {
        colors: true
      },
      contentBase: resolve(__dirname, constants.DIST),
      historyApiFallback: !!env.dev,
      port: 8081
    },
    bail: env.prod,
    resolve: {
      extensions: ['.js', '.jsx'],
      alias: {
        //underscore: 'lodash',
        'echonestService': require.resolve(join(constants.SRC_DIR, 'service/echonestService.js')),
        'youtubeService': require.resolve(join(constants.SRC_DIR, 'service/youtubeService.js')),
        'spotifyService': require.resolve(join(constants.SRC_DIR, 'service/spotifyService.js')),
        'popupService': require.resolve(join(constants.SRC_DIR, 'service/popupService.js')),
        'serverService': require.resolve(join(constants.SRC_DIR, 'service/serverService.js')),
        'knowledgeService': require.resolve(join(constants.SRC_DIR, 'service/knowledgeService.js')),
        'shim': require.resolve(join(constants.SRC_DIR, 'common/shim.js')),
        'ease-number': require.resolve(join(constants.SRC_DIR, 'common/ease-numbers.js')),
        'utils': require.resolve(join(constants.SRC_DIR, 'common/utils.js')),
        'channel': require.resolve(join(constants.SRC_DIR, 'common/channel.js')),
        'playlist': require.resolve(join(constants.SRC_DIR, 'common/playlist.js')),
        'sonoPlayer': require.resolve(join(constants.SRC_DIR, 'common/sonoPlayer.js')),
        'session': require.resolve(join(constants.SRC_DIR, 'common/session.js')),
        'emitter': require.resolve(join(constants.SRC_DIR, 'common/emitter.js'))
      }
      /*alias: {
        'assets': resolve('dist')
      }*/
    },
    module: {
      /*rules: [{
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [
          'url-loader?limit=10000',
          'img-loader'
        ]
      }],*/
      loaders: [{
          test: /\.svg$/,
          loader: 'svg-inline-loader'
        }, {
          loader: 'url-loader?limit=100000',
          test: /\.(gif|jpg|png)$/
        }, {
          loader: 'url-loader?limit=100000',
          test: /\.(ttf|eot|woff(2)?)(\?[a-z0-9]+)?$/,
          include: [`${join(constants.ASSETS_DIR, '/font/')}`]
        }, {
          test: /\.json$/,
          loader: 'json-loader'
        }, {
          test: /\.(js|jsx)$/,
          loader: 'babel-loader',
          exclude: /node_modules(?!\/dis-gui)/
        }, {
        test: /\.ejs$/,
        loader: "ejs-loader"
      }, {
        test: /\.(glsl|frag|vert)$/,
        loader: 'raw-loader',
        exclude: /node_modules/
      }, {
        test: /\.(glsl|frag|vert)$/,
        loader: 'glslify-loader',
        exclude: /node_modules/
      }]
        .concat(stylesLoaders()),
    },
    plugins: removeEmpty([
      new webpack.DefinePlugin({
        'process.env': ENV_VARS
      }),
      ifDev(new HtmlWebpackPlugin({
        template: './index.html'
      })),
      ifProd(new HtmlWebpackPlugin({
        assetsUrl: `"${ASSETS_DIR}`,
        template: './index.ejs', // Load a custom template (ejs by default see the FAQ for details)
      })),
      ifProd(new ExtractTextPlugin({ filename: './css/[name].css', disable: false, allChunks: true })),
      ifProd(new webpack.LoaderOptionsPlugin({
        minimize: true,
        debug: false,
        quiet: true,
      })),
      // saves 65 kB with Uglify!! Saves 38 kB without
      DefineENV,
      // saves 711 kB!!
      /*ifProd(new webpack.optimize.UglifyJsPlugin({
        compress: {
          screw_ie8: true, // eslint-disable-line
          warnings: false,
        },
      })),*/
      ifNotTest(new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor'
      })),
      ifNotTest(new webpack.optimize.CommonsChunkPlugin({
        name: 'common',
        fileName: 'bundle.common.js'
      })),
      new webpack.LoaderOptionsPlugin({
        options: {
          postcss: () => [
            autoprefixer({
              browsers: [
                'last 2 versions',
                'iOS >= 8',
                'Safari >= 8',
              ]
            }),
            postcssEasings
          ],
        }
      }),
      new webpack.LoaderOptionsPlugin({
        options: {
          sassLoader: {
            assetsUrl: `"${ASSETS_DIR}"`,
            includePaths: [
              join(constants.SRC_DIR, '/base'),
              join(constants.SRC_DIR, '/base/vars')
            ],
          },
        }
      })
    ]),
  }
}

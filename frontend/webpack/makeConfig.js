import ExtractTextPlugin from 'extract-text-webpack-plugin';
import autoprefixer from 'autoprefixer';
import postcssEasings from 'postcss-easings';
import constants from './constants';
import path from 'path';
import webpack from 'webpack';
import ip from 'ip';
import AssetsPlugin from 'assets-webpack-plugin';

// let assetsPluginInstance = new AssetsPlugin();

// cheap-module-eval-source-map, because we want original source, but we don't
// care about columns, which makes this devtool faster than eval-source-map.
// http://webpack.github.io/docs/configuration.html#devtool
const devtools = 'cheap-module-eval-source-map';

/*eslint-disable */
const loaders = {
	'css': '',
	'scss': '!sass-loader'
};
/*eslint-enable */


// get computers ip address
const serverIp = ip.address();

export default function makeConfig(isDevelopment) {

	function stylesLoaders() {
		return Object.keys(loaders).map(ext => {
			const prefix = 'css-loader!postcss-loader';
			const extLoaders = prefix + loaders[ext];
			const loader = isDevelopment ? `style-loader!${extLoaders}` : ExtractTextPlugin.extract('style-loader', extLoaders);
			return {
				loader: loader,
				test: new RegExp(`\\.(${ext})$`)
			};
		});
	}

	const config = {
		hotPort: constants.HOT_RELOAD_PORT,
		cache: isDevelopment,
		debug: isDevelopment,
		devtool: isDevelopment ? devtools : '',
		entry: {
			app: isDevelopment ? [
				`webpack-hot-middleware/client?path=http://${serverIp}:${constants.HOT_RELOAD_PORT}/__webpack_hmr`,
				path.join(constants.SRC_DIR, 'client/main.js')
			] : [
				path.join(constants.SRC_DIR, 'client/main.js')
			]
		},
		module: {
			loaders: [{
				loader: 'url-loader?limit=100000',
				test: /\.(gif|jpg|png|woff|woff2|eot|ttf|svg)$/
			}, {
				test: /\.ejs$/,
				loader: "ejs-loader"
			}, {
				exclude: /node_modules/,
				loader: 'babel',
				query: {
					cacheDirectory: true,
					presets: ['es2015', 'stage-1']
				},
				test: /\.js$/
			}, {
				test: /\.(glsl|frag|vert)$/,
				loader: 'raw',
				exclude: /node_modules/
			}, {
				test: /\.(glsl|frag|vert)$/,
				loader: 'glslify',
				exclude: /node_modules/
			}].concat(stylesLoaders())
		},
		sassLoader: {
			includePaths: [
				path.join(constants.SRC_DIR, 'client/base'),
				path.join(constants.SRC_DIR, 'client/base/vars')
			]
		},
		output: isDevelopment ? {
			path: constants.BUILD_DIR,
			filename: '[name].js',
			chunkFilename: '[name]-[chunkhash].js',
			publicPath: `http://${serverIp}:${constants.HOT_RELOAD_PORT}/`
		} : {
			path: constants.BUILD_DIR,
			filename: '[name].js',
			chunkFilename: '[name]-[chunkhash].js'
		},
		plugins: (() => {
			const plugins = [
				new webpack.DefinePlugin({
					'process.env': {
						NODE_ENV: JSON.stringify(isDevelopment ? 'development' : 'production'),
						SERVER_BASE: JSON.stringify(`http://localhost:9999/`),
						//SERVER_BASE: JSON.stringify(`http://52.6.39.117/`), //good
						//SERVER_BASE: JSON.stringify(`http://moon.mars.wtf/`),
						//SERVER_BASE: JSON.stringify(`http://${serverIp}:9999/`),
						IS_BROWSER: true
					}
				})
			];
			if (isDevelopment) plugins.push(
				new webpack.optimize.OccurenceOrderPlugin(),
				new webpack.HotModuleReplacementPlugin(),
				new webpack.NoErrorsPlugin()
			);
			else plugins.push(
				// Render styles into separate cacheable file to prevent FOUC and
				// optimize for critical rendering path.
				new ExtractTextPlugin(isDevelopment ?'app-[hash].css' : 'app.css', {
					allChunks: true
				}),
				new AssetsPlugin({
					path: './',
					filename: 'assets.json',
					prettyPrint: false,
					update: true
				}),
				new webpack.optimize.DedupePlugin(),
				new webpack.optimize.OccurenceOrderPlugin(),
				new webpack.optimize.UglifyJsPlugin({
					compress: {
						screw_ie8: true, // eslint-disable-line camelcase
						warnings: false // Because uglify reports irrelevant warnings.
					}
				})
			);
			return plugins;
		})(),
		postcss: () => [
			autoprefixer({
				browsers: 'last 2 version'
			}),
			postcssEasings
		],
		resolve: {
			extensions: ['', '.js', '.json'],
			modulesDirectories: ['src', 'node_modules'],
			root: constants.ABSOLUTE_BASE,
      alias:{
        underscore: 'lodash',
        'echonestService': require.resolve(path.join(constants.SRC_DIR, 'client/service/echonestService.js')),
        'youtubeService': require.resolve(path.join(constants.SRC_DIR, 'client/service/youtubeService.js')),
        'spotifyService': require.resolve(path.join(constants.SRC_DIR, 'client/service/spotifyService.js')),
        'popupService': require.resolve(path.join(constants.SRC_DIR, 'client/service/popupService.js')),
        'serverService': require.resolve(path.join(constants.SRC_DIR, 'client/service/serverService.js')),
        'knowledgeService': require.resolve(path.join(constants.SRC_DIR, 'client/service/knowledgeService.js')),
        'shim': require.resolve(path.join(constants.SRC_DIR, 'client/common/shim.js')),
        'ease-number': require.resolve(path.join(constants.SRC_DIR, 'client/common/ease-numbers.js')),
        'utils': require.resolve(path.join(constants.SRC_DIR, 'client/common/utils.js')),
        'channel': require.resolve(path.join(constants.SRC_DIR, 'client/common/channel.js')),
        'playlist': require.resolve(path.join(constants.SRC_DIR, 'client/common/playlist.js')),
        'sonoPlayer': require.resolve(path.join(constants.SRC_DIR, 'client/common/sonoPlayer.js')),
        'session': require.resolve(path.join(constants.SRC_DIR, 'client/common/session.js')),
        'emitter': require.resolve(path.join(constants.SRC_DIR, 'client/common/emitter.js'))
      }
		}
	};

	return config;

};

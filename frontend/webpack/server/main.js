import webpack from 'webpack';
import webpackDev from 'webpack-dev-middleware';
import webpackHot from 'webpack-hot-middleware';
import makeWebpackConfig from '../makeConfig';
import express from 'express';
import constants from '../constants';

const app = express();

const webpackConfig = makeWebpackConfig(true);
const compiler = webpack(webpackConfig);

app.use(webpackDev(compiler, {
	headers: {'Access-Control-Allow-Origin': '*'},
	noInfo: true,
	publicPath: webpackConfig.output.publicPath
}));

app.use(webpackHot(compiler));

app.listen(webpackConfig.hotPort, () => {
	console.log('Hot server started at port %d', webpackConfig.hotPort); // eslint-disable-line no-console
});

app.use(express.static('build'));

app.get('*', (req, res) => {
	res.sendFile(`${constants.BUILD_DIR}/index.html`)
});

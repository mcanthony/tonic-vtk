var webpack = require('webpack'),
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    path = require("path");
    fs = require("fs");

var demos = {
    ImageDeliveryViewport : "./lib/demo/ImageDeliveryViewport/index.js",
};

// ----------------------------------------------------------------------------

var args = process.argv.slice(2);
if (args.length === 0) {
    buildAll('""');
} else if (args[0] === 'list') {
    console.log('__AVAILABLE DEMOS__');
    Object.keys(demos)
        .sort()
        .forEach(function(el) {
            console.log('  ' + el);
        });
}
else {
    var list = [],
        baseUrl = '""';

    args.forEach(function(arg) {
        if(arg.indexOf('-url=') === 0) {
           baseUrl = arg.split('=')[1];
           baseUrl = '"' + baseUrl + '"';
        } else {
           list.push(arg);
        }
    });

    if(list.length) {
        buildSet(list, baseUrl);
    } else {
        buildAll(baseUrl);
    }
}

// ----------------------------------------------------------------------------

function buildWebpackConfiguration(name, basepath) {
    var path = demos[name],
        config = {
            plugins: [],
            entry: path,
        output: {
          path: './dist/' + name,
          filename: name + '.js',
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: './docs/demo/demoTemplate.html',
                inject: 'body',
                title: name
            }),
            new webpack.DefinePlugin({
                __BASE_PATH__: '' + basepath
            })
        ],
        module: {
          loaders: [
            { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader?limit=60000&mimetype=application/font-woff" },
            { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader?limit=60000" },
            { test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192'},
            { test: /\.css$/, loader: "style!css!autoprefixer?browsers=last 2 version" },
            { test: /\.js$/i, exclude: /node_modules/, loader: "babel" },
            { test: /\.js$/i, include: /node_modules\/tonic-/, loader: "babel" },
            { test: /\.c$/i, include: /node_modules\/tonic-/, loader: "shader" },
            { test: /\.json$/, loader: "json" }
          ]
        }
    };

    return config;
}

// ----------------------------------------------------------------------------

function buildSet(demoNames, baseUrl) {
    var keys = Object.keys(demos);
    demoNames.forEach(function(el) {
        var demoIdx = keys.indexOf(el);
        if ( demoIdx !== -1) {
            build(el, baseUrl);
        } else {
            console.warn('"' + el + '" not in demos list.');
        }
    });
}

// ----------------------------------------------------------------------------

function buildAll(baseUrl) {
    Object.keys(demos).forEach(function(el) {
        build(el, baseUrl);
    });
}

// ----------------------------------------------------------------------------

function build(name, baseUrl) {
    var options = buildWebpackConfiguration(name, baseUrl);
    console.log('building ' + name);
    webpack(options, function(err, stats){
        if (err) {
            console.error(name + ' has errors.');
            throw err;
        }
        var jsonStats = stats.toJson();
        if (stats.hasErrors()) {
            console.error('Error building ' + name + ', at ' + demos[name]);
            throw jsonStats.errors;
        } else if (stats.hasWarnings()) {
            console.warn(name + ' built with warnings.');
            console.warn(jsonStats.warnings);
        } else {
            console.log(name + ' built.');
        }
    });
}

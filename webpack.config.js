const babelrc = require('./.babelrc.js');

module.exports = function () {
    return {
        mode: 'none',
        module: {
            rules: [
                {
                    test: /\.js$/,
                    loader: 'babel-loader',
                    options: babelrc,
                }, {
                    test: /\.svg$/,
                    loader: 'svg-inline-loader',
                    exclude: /node_modules/,
                    options: {
                        removeSVGTagAttrs: false,
                    },
                },
            ],
        },
    };
};

const path = require("path");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    entry: "./src/React/app.js",
    output: {
        path: path.join(__dirname, "/public/"),
        filename: "js/app.js"
    },
    module: {
        rules: [
            {
                test: /\.less$/,
                use: [
                    {
                        loader: 'style-loader',
                    }, {
                        loader: 'css-loader', // translates CSS into CommonJS
                    }, {
                        loader: 'less-loader', // compiles Less to CSS
                        options: {
                            lessOptions: { // If you are using less-loader@5 please spread the lessOptions to options directly
                                modifyVars: {
                                    'border-radius-base': '8px',
                                    'height-base': '38px'
                                },
                                javascriptEnabled: true,
                            },
                        },
                    }
                ],
            },

            {
                test: /\.js$|jsx/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                },
            },
            {
                test:/\.(s*)css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader?url=false',
                    'sass-loader',
                ]
            },
            {
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                use: [
                    {
                        loader: 'babel-loader',
                    },
                    {
                        loader: '@svgr/webpack',
                        options: {
                            babel: false,
                            icon: true,
                        },
                    },
                ],
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'css/app.css',
        }),
    ]
};

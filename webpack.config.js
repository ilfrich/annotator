const webpack = require("webpack")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const path = require("path")

const BUILD_DIR = path.resolve(__dirname, "static")
const APP_DIR = path.resolve(__dirname, "frontend", "src")

const HTMLWebpackPluginConfig = new HtmlWebpackPlugin({
    template: "frontend/index.html",
    filename: "../templates/index.html",
    inject: true,
})

// Enable multi-pass compilation for enhanced performance
// in larger projects. Good default
const HotModuleReplacementPluginConfig = new webpack.HotModuleReplacementPlugin({
    multiStep: false,
})

// See https://medium.com/@kimberleycook/intro-to-webpack-1d035a47028d#.8zivonmtp for
// a step-by-step introduction to reading a webpack config
const config = {
    entry: `${APP_DIR}/index.js`,
    output: {
        path: BUILD_DIR,
        filename: "index.js",
        publicPath: "/static",
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: ["babel-loader"],
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.(png|jpg|jpeg)$/,
                use: [
                    {
                        loader: "url-loader",
                        options: {
                            limit: 65536,
                        },
                    },
                ],
            },
        ],
    },
    plugins: [HTMLWebpackPluginConfig, HotModuleReplacementPluginConfig],
}

module.exports = config

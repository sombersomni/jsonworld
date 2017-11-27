var path = require("path");

module.exports = {
    context: path.resolve(__dirname, "src"),
    entry: "./index.js",
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "babel-loader",
                        options: {
                            presets: [ "env", "react" ]
                        }
                    }
                ]
            }
        ]
    },
    output: {
        path: path.resolve(__dirname, "public", "js"),
        filename: "bundle.js"
    },
    watch: true
}
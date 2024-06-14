module.exports = {
    output: "standalone",
    webpack: (config) => {
        config.module.rules.push({
            test: /\.graphql$/i,
            loader: "raw-loader",
        });

        return config;
    }
};
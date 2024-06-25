const isProd = process.env.NODE_ENV === "production";

module.exports = {
    output: "standalone",
    assetPrefix: isProd ? "https://appbudgetstieind.com" : undefined,
    webpack: (config) => {
        config.module.rules.push({
            test: /\.graphql$/i,
            loader: "raw-loader",
        });

        return config;
    }
};
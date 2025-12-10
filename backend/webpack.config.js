module.exports = function (options, webpack) {
  return {
    ...options,
    externals: {
      // Ignore bcrypt's optional dependencies
      'mock-aws-s3': 'mock-aws-s3',
      'aws-sdk': 'aws-sdk',
      'nock': 'nock',
    },
    plugins: [
      ...options.plugins,
      // Ignore optional dependencies
      new webpack.IgnorePlugin({
        checkResource(resource) {
          const lazyImports = [
            '@mapbox/node-pre-gyp',
            'mock-aws-s3',
            'aws-sdk',
            'nock',
          ];
          if (!lazyImports.includes(resource)) {
            return false;
          }
          try {
            require.resolve(resource);
          } catch (err) {
            return true;
          }
          return false;
        },
      }),
    ],
  };
};

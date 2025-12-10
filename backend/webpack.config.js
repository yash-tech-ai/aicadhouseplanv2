module.exports = function (options, webpack) {
  const lazyImports = [
    '@mapbox/node-pre-gyp',
    'mock-aws-s3',
    'aws-sdk',
    'nock',
  ];

  return {
    ...options,
    externals: [
      ...options.externals,
      // Don't bundle bcrypt - it's a native module
      'bcrypt',
    ],
    plugins: [
      ...options.plugins,
      new webpack.IgnorePlugin({
        checkResource(resource, context) {
          // Ignore all files in nw-pre-gyp directory
          if (context && context.includes('@mapbox/node-pre-gyp')) {
            return lazyImports.some(item => resource.includes(item) || resource.includes('nw-pre-gyp'));
          }
          return false;
        },
      }),
    ],
  };
};

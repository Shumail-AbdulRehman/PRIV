const path = require('path');

// ONNX Runtime 1.24.3 carries legacy Expo module metadata as well as a React
// Native package. Expo 54 otherwise compiles its Android classes but omits the
// ReactPackage, leaving NativeModules.Onnxruntime null when a fixture is shot.
module.exports = {
  dependencies: {
    'onnxruntime-react-native': {
      root: path.join(__dirname, 'node_modules/onnxruntime-react-native'),
      platforms: {
        android: {
          sourceDir: 'android',
          packageImportPath: 'import ai.onnxruntime.reactnative.OnnxruntimePackage;',
          packageInstance: 'new OnnxruntimePackage()',
        },
      },
    },
  },
};

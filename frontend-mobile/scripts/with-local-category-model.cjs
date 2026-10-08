// ONNX is deliberately a bundled native resource. Never fetch it at capture time.
const { withDangerousMod, withXcodeProject, withProjectBuildGradle, withPodfile, IOSConfig } = require('expo/config-plugins');
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const MODEL = 'clip-vision-int8.onnx';
const SHA = '583fd1110a514667812fee7d684952aaf82a99b959760c8d7dca7e0ab9839299';
async function verifiedModel(root) {
  const source = path.join(root, 'assets/models', MODEL);
  if (crypto.createHash('sha256').update(await fs.readFile(source)).digest('hex') !== SHA) {
    throw new Error('Local category model missing or changed. Run scripts/local-category/prepare.py.');
  }
  return source;
}
module.exports = function withLocalCategoryModel(config) {
  // The RN package declares latest.integration native artifacts. Pin the matching runtime
  // rather than letting a future Maven/CocoaPods release silently change native behavior.
  config = withProjectBuildGradle(config, config => {
    const marker = '// HygeneOps pinned ONNX native runtime';
    if (!config.modResults.contents.includes(marker)) {
      config.modResults.contents += `\n${marker}\nallprojects {\n  configurations.configureEach {\n    resolutionStrategy.force 'com.microsoft.onnxruntime:onnxruntime-android:1.24.3'\n  }\n}\n`;
    }
    const ndkMarker = '// HygeneOps shared NDK across native libraries';
    if (!config.modResults.contents.includes(ndkMarker)) {
      // expo-sqlite otherwise takes AGP's default NDK instead of the Expo app's NDK.
      config.modResults.contents += `\n${ndkMarker}\nallprojects { nativeProject ->\n  nativeProject.pluginManager.withPlugin('com.android.library') {\n    if (nativeProject.rootProject.ext.has('ndkVersion')) {\n      nativeProject.extensions.getByName('android').ndkVersion = nativeProject.rootProject.ext.ndkVersion\n    }\n  }\n}\n`;
    }
    return config;
  });
  config = withPodfile(config, config => {
    const pin = "  pod 'onnxruntime-c', '1.24.3' # HygeneOps pinned ONNX native runtime";
    if (!config.modResults.contents.includes('HygeneOps pinned ONNX native runtime')) {
      const target = /target ['"][^'"]+['"] do/;
      if (!target.test(config.modResults.contents)) throw new Error('Cannot locate iOS app target to pin ONNX Runtime.');
      config.modResults.contents = config.modResults.contents.replace(target, match => `${match}\n${pin}`);
    }
    return config;
  });
  config = withDangerousMod(config, ['android', async config => {
    const source = await verifiedModel(config.modRequest.projectRoot);
    const destination = path.join(config.modRequest.platformProjectRoot, 'app/src/main/assets');
    await fs.mkdir(destination, { recursive: true });
    await fs.copyFile(source, path.join(destination, MODEL));
    await fs.copyFile(path.join(config.modRequest.projectRoot, 'assets/models/CLIP-LICENSE.txt'), path.join(destination, 'CLIP-LICENSE.txt'));
    return config;
  }]);
  return withXcodeProject(config, async config => {
    const source = await verifiedModel(config.modRequest.projectRoot);
    IOSConfig.XcodeUtils.ensureGroupRecursively(config.modResults, 'Resources');
    IOSConfig.XcodeUtils.addResourceFileToGroup({
      filepath: path.relative(config.modRequest.platformProjectRoot, source),
      groupName: 'Resources', project: config.modResults, isBuildFile: true,
    });
    IOSConfig.XcodeUtils.addResourceFileToGroup({
      filepath: path.relative(config.modRequest.platformProjectRoot, path.join(config.modRequest.projectRoot, 'assets/models/CLIP-LICENSE.txt')),
      groupName: 'Resources', project: config.modResults, isBuildFile: true,
    });
    return config;
  });
};

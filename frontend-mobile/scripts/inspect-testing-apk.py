"""Inspect a real APK; this does not certify runtime or physical sensor accuracy."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import struct
import subprocess
import xml.etree.ElementTree as ET
import zipfile


def defined_dex_classes(data):
    if not data.startswith(b'dex\n'):
        raise ValueError('Expected standard Android DEX')
    string_count, strings_offset, type_count, types_offset = struct.unpack_from('<IIII', data, 56)
    class_count, classes_offset = struct.unpack_from('<II', data, 96)
    result = set()
    for index in range(class_count):
        type_index = struct.unpack_from('<I', data, classes_offset + index * 32)[0]
        if type_index >= type_count:
            raise ValueError('Invalid DEX type index')
        string_index = struct.unpack_from('<I', data, types_offset + type_index * 4)[0]
        if string_index >= string_count:
            raise ValueError('Invalid DEX string index')
        offset = struct.unpack_from('<I', data, strings_offset + string_index * 4)[0]
        while data[offset] & 0x80:
            offset += 1
        offset += 1  # Skip ULEB128 UTF-16 length; descriptors are ASCII.
        descriptor = data[offset:data.index(b'\0', offset)].decode('ascii')
        result.add(descriptor[1:-1].replace('/', '.'))
    return result


def inspect(apk, api_url, commit):
    sdk = os.environ.get('ANDROID_HOME') or os.environ.get('ANDROID_SDK_ROOT')
    if not sdk:
        raise ValueError('Set ANDROID_HOME to inspect the compiled APK manifest')
    analyzer = Path(sdk) / 'cmdline-tools/latest/bin/apkanalyzer'
    manifest = subprocess.check_output([str(analyzer), 'manifest', 'print', str(apk)], text=True)
    root = ET.fromstring(manifest)
    android = '{http://schemas.android.com/apk/res/android}'
    package = root.get('package')
    if package != 'com.hygeneops.staff':
        raise ValueError(f'Unexpected application ID: {package}')
    permissions = {node.get(android + 'name') for node in root.findall('uses-permission')}
    required_permissions = {'android.permission.CAMERA', 'android.permission.ACCESS_COARSE_LOCATION',
                           'android.permission.ACCESS_FINE_LOCATION', 'android.permission.INTERNET'}
    if not required_permissions <= permissions or 'android.permission.RECORD_AUDIO' in permissions:
        raise ValueError('Required camera/location/network permissions or microphone removal failed')
    application = root.find('application')
    metadata = {node.get(android + 'name'): node.get(android + 'value')
                for node in application.findall('meta-data')}
    if metadata.get('com.google.ar.core') != 'optional':
        raise ValueError('ARCore must remain optional for unsupported-device fallback')
    if api_url.startswith('http:') and application.get(android + 'usesCleartextTraffic') != 'true':
        raise ValueError('Configured HTTP test API would be blocked by the manifest')
    required_modules = {
        'expo.modules.spatialtracking.SpatialTrackingModule',
        'expo.modules.capturequality.CaptureQualityModule', 'expo.modules.camera.CameraViewModule',
        'expo.modules.location.LocationModule', 'expo.modules.sqlite.SQLiteModule',
        'expo.modules.securestore.SecureStoreModule', 'expo.modules.filesystem.FileSystemModule',
        'expo.modules.filesystem.legacy.FileSystemLegacyModule', 'expo.modules.crypto.CryptoModule',
        'com.reactnativecommunity.netinfo.NetInfoModule',
    }
    with zipfile.ZipFile(apk) as archive:
        names = archive.namelist()
        classes = set()
        for name in names:
            if name.startswith('classes') and name.endswith('.dex'):
                classes.update(defined_dex_classes(archive.read(name)))
        if not required_modules <= classes:
            raise ValueError(f'Native module classes missing: {sorted(required_modules - classes)}')
        normalized_url = api_url.strip().rstrip('/')
        if not normalized_url.endswith('/api'):
            normalized_url += '/api'
        bundle = archive.read('assets/index.android.bundle')
        if normalized_url.encode() not in bundle:
            raise ValueError('Expected phone-accessible API URL missing from bundled JavaScript')
        storage_fix_markers = [b'The saved-photo database directory is unavailable.',
                               b'Secure photo storage could not open.']
        if not all(marker in bundle for marker in storage_fix_markers):
            raise ValueError('Device storage fixes missing from bundled JavaScript')
        abis = {name.split('/')[1] for name in names if name.startswith('lib/') and name.endswith('.so')}
        for abi in ('arm64-v8a', 'armeabi-v7a'):
            required_libraries = {f'lib/{abi}/libarcore_sdk_jni.so', f'lib/{abi}/libexpo-sqlite.so'}
            if not required_libraries <= set(names):
                raise ValueError(f'Missing ARCore/SQLite native libraries for {abi}')
            if b'cipher_version' not in archive.read(f'lib/{abi}/libexpo-sqlite.so'):
                raise ValueError(f'SQLCipher version probe missing from native SQLite for {abi}')
    size = apk.stat().st_size
    if not 10 * 1024 * 1024 < size < 500 * 1024 * 1024:
        raise ValueError(f'Unexpected APK size: {size} bytes')
    return {'applicationId': package, 'versionName': root.get(android + 'versionName'),
            'versionCode': int(root.get(android + 'versionCode')), 'deviceStorageFixesBundled': True,
            'sizeBytes': size, 'sha256': hashlib.file_digest(apk.open('rb'), 'sha256').hexdigest(),
            'apiBaseUrl': normalized_url, 'commit': commit, 'abis': sorted(abis),
            'permissions': sorted(permissions), 'arCore': 'optional',
            'nativeModules': sorted(required_modules), 'sqlCipherNativeProbePresent': True,
            'spatialAutomaticAcceptance': False, 'cleanlinessAutomaticPassing': False,
            'physicalSensorAccuracyValidated': False, 'signingPurpose': 'testing/debug key'}


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('apk', type=Path)
    parser.add_argument('--api-url', required=True)
    parser.add_argument('--commit', default='unknown')
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    result = inspect(args.apk.resolve(), args.api_url, args.commit)
    args.output.write_text(json.dumps(result, indent=2) + '\n')
    print(json.dumps(result, indent=2))

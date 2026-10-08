import ExpoModulesCore
import UIKit
import Darwin
import CryptoKit
public class CaptureQualityModule: Module {
  public func definition() -> ModuleDefinition {
    Name("CaptureQuality")
    AsyncFunction("categoryModelPath") { () -> String in
      guard let model = Bundle.main.url(forResource: "clip-vision-int8", withExtension: "onnx") else {
        throw NSError(domain: "BundledCategoryModel", code: 1)
      }
      let bytes = try Data(contentsOf: model, options: .mappedIfSafe)
      let sha = SHA256.hash(data: bytes).map { String(format: "%02x", $0) }.joined()
      guard sha == "583fd1110a514667812fee7d684952aaf82a99b959760c8d7dca7e0ab9839299" else {
        throw NSError(domain: "BundledCategoryModel", code: 2)
      }
      return model.path
    }
    AsyncFunction("categoryTensor") { (uri: String) -> String in
      guard let url = URL(string: uri), url.isFileURL, let image = UIImage(contentsOfFile: url.path) else {
        throw NSError(domain: "CategoryTensor", code: 1)
      }
      // UIImage.draw respects camera EXIF orientation; scale-to-fill performs a center crop.
      let format = UIGraphicsImageRendererFormat(); format.scale = 1; format.opaque = true
      let renderer = UIGraphicsImageRenderer(size: CGSize(width: 224, height: 224), format: format)
      let rendered = renderer.image { _ in
        let scale = max(224 / image.size.width, 224 / image.size.height)
        let size = CGSize(width: image.size.width * scale, height: image.size.height * scale)
        image.draw(in: CGRect(x: (224 - size.width) / 2, y: (224 - size.height) / 2, width: size.width, height: size.height))
      }
      guard let source = rendered.cgImage else { throw NSError(domain: "CategoryTensor", code: 2) }
      var pixels = [UInt8](repeating: 0, count: 224 * 224 * 4)
      let success = pixels.withUnsafeMutableBytes { bytes -> Bool in
        guard let context = CGContext(data: bytes.baseAddress, width: 224, height: 224, bitsPerComponent: 8,
          bytesPerRow: 224 * 4, space: CGColorSpaceCreateDeviceRGB(),
          bitmapInfo: CGBitmapInfo.byteOrder32Big.rawValue | CGImageAlphaInfo.premultipliedLast.rawValue) else { return false }
        context.interpolationQuality = .high
        context.draw(source, in: CGRect(x: 0, y: 0, width: 224, height: 224)); return true
      }
      guard success else { throw NSError(domain: "CategoryTensor", code: 3) }
      let mean: [Float] = [0.48145466, 0.4578275, 0.40821073]
      let std: [Float] = [0.26862954, 0.26130258, 0.27577711]
      var tensor = [Float](repeating: 0, count: 3 * 224 * 224)
      for channel in 0..<3 { for i in 0..<(224 * 224) {
        tensor[channel * 224 * 224 + i] = (Float(pixels[i * 4 + channel]) / 255 - mean[channel]) / std[channel]
      }}
      return tensor.withUnsafeBytes { Data($0).base64EncodedString() }
    }
    Function("clock") { () -> [String: Any] in
      var boot = timeval(); var size = MemoryLayout<timeval>.size
      guard sysctlbyname("kern.boottime", &boot, &size, nil, 0) == 0 else { throw NSError(domain: "CaptureClock", code: 1) }
      var info = mach_timebase_info_data_t(); mach_timebase_info(&info)
      let elapsed = Double(mach_continuous_time()) * Double(info.numer) / Double(info.denom) / 1_000_000
      return ["bootId": "ios-\(boot.tv_sec)-\(boot.tv_usec)", "elapsedMs": elapsed]
    }
    AsyncFunction("inspect") { (uri: String) -> [String: Any] in
      guard let url = URL(string: uri), url.isFileURL, let image = UIImage(contentsOfFile: url.path), let source = image.cgImage else {
        throw NSError(domain: "CaptureQuality", code: 1)
      }
      let width = 128, height = max(3, Int(Double(source.height) / Double(source.width) * 128))
      var pixels = [UInt8](repeating: 0, count: width * height * 4)
      let rendered = pixels.withUnsafeMutableBytes { bytes -> Bool in
        guard let context = CGContext(data: bytes.baseAddress, width: width, height: height, bitsPerComponent: 8,
          bytesPerRow: width * 4, space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue) else { return false }
        context.draw(source, in: CGRect(x: 0, y: 0, width: width, height: height)); return true
      }
      guard rendered else { throw NSError(domain: "CaptureQuality", code: 2) }
      let luma = (0..<(width * height)).map { i in
        .2126 * Double(pixels[i * 4]) + .7152 * Double(pixels[i * 4 + 1]) + .0722 * Double(pixels[i * 4 + 2])
      }
      var sum = 0.0, sumSq = 0.0, n = 0.0
      for y in 1..<(height - 1) { for x in 1..<(width - 1) {
        let i = y * width + x
        let v = luma[i-1] + luma[i+1] + luma[i-width] + luma[i+width] - 4 * luma[i]
        sum += v; sumSq += v * v; n += 1
      }}
      return ["width": source.width, "height": source.height,
        "luminance": luma.reduce(0,+) / Double(luma.count),
        "laplacianVariance": max(0, sumSq / n - pow(sum / n, 2)),
        "clipping": Double(luma.filter { $0 < 5 || $0 > 250 }.count) / Double(luma.count)]
    }
  }
}

package expo.modules.capturequality
import android.graphics.BitmapFactory
import android.graphics.Bitmap
import android.graphics.Matrix
import android.media.ExifInterface
import android.net.Uri
import android.util.Base64
import android.os.SystemClock
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.security.MessageDigest

class CaptureQualityModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("CaptureQuality")
    AsyncFunction("categoryModelPath") {
      val context = appContext.reactContext ?: error("Application unavailable")
      val expected = "583fd1110a514667812fee7d684952aaf82a99b959760c8d7dca7e0ab9839299"
      val model = File(context.filesDir, "clip-vision-int8-$expected.onnx")
      val existing = model.exists()
      // Only packaged assets are read. A missing model must never trigger a network download.
      if (!model.exists()) {
        val temporary = File(context.filesDir, "clip-vision-int8.partial")
        val digest = MessageDigest.getInstance("SHA-256")
        try {
          context.assets.open("clip-vision-int8.onnx").use { input ->
            temporary.outputStream().use { output ->
              val buffer = ByteArray(65536)
              while (true) {
                val n = input.read(buffer)
                if (n < 0) break
                digest.update(buffer, 0, n); output.write(buffer, 0, n)
              }
              output.fd.sync()
            }
          }
          val sha = digest.digest().joinToString("") { "%02x".format(it.toInt() and 255) }
          check(sha == expected) { "Bundled category model integrity check failed" }
          check(temporary.renameTo(model)) { "Unable to prepare bundled category model" }
        } finally { temporary.delete() }
      }
      check(model.length() == 89117001L) { "Bundled category model is incomplete" }
      if (existing) {
        val digest = MessageDigest.getInstance("SHA-256")
        model.inputStream().use { input ->
          val buffer = ByteArray(65536)
          while (true) { val n = input.read(buffer); if (n < 0) break; digest.update(buffer, 0, n) }
        }
        check(digest.digest().joinToString("") { "%02x".format(it.toInt() and 255) } == expected) { "Bundled category model integrity check failed" }
      }
      model.absolutePath
    }
    AsyncFunction("categoryTensor") { uri: String ->
      val parsed = Uri.parse(uri)
      check(parsed.scheme == "file") { "Category check requires a local file URI" }
      val path = parsed.path ?: error("Invalid local image")
      val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
      BitmapFactory.decodeFile(path, bounds)
      check(bounds.outWidth > 0 && bounds.outHeight > 0) { "Unable to decode photo" }
      var sample = 1
      while (minOf(bounds.outWidth, bounds.outHeight) / (sample * 2) >= 448) sample *= 2
      var bitmap = BitmapFactory.decodeFile(path, BitmapFactory.Options().apply { inSampleSize = sample }) ?: error("Unable to decode photo")
      try {
        val orientation = ExifInterface(path).getAttributeInt(ExifInterface.TAG_ORIENTATION, ExifInterface.ORIENTATION_NORMAL)
        val matrix = Matrix()
        when (orientation) {
          ExifInterface.ORIENTATION_ROTATE_90 -> matrix.postRotate(90f)
          ExifInterface.ORIENTATION_ROTATE_180 -> matrix.postRotate(180f)
          ExifInterface.ORIENTATION_ROTATE_270 -> matrix.postRotate(270f)
          ExifInterface.ORIENTATION_FLIP_HORIZONTAL -> matrix.postScale(-1f, 1f)
          ExifInterface.ORIENTATION_FLIP_VERTICAL -> matrix.postScale(1f, -1f)
          ExifInterface.ORIENTATION_TRANSPOSE -> { matrix.postRotate(90f); matrix.postScale(-1f, 1f) }
          ExifInterface.ORIENTATION_TRANSVERSE -> { matrix.postRotate(270f); matrix.postScale(-1f, 1f) }
        }
        if (!matrix.isIdentity) {
          val oriented = Bitmap.createBitmap(bitmap, 0, 0, bitmap.width, bitmap.height, matrix, true)
          if (oriented !== bitmap) { bitmap.recycle(); bitmap = oriented }
        }
        val side = minOf(bitmap.width, bitmap.height)
        val crop = Bitmap.createBitmap(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side)
        val resized = Bitmap.createScaledBitmap(crop, 224, 224, true)
        try {
          val pixels = IntArray(224 * 224); resized.getPixels(pixels, 0, 224, 0, 0, 224, 224)
          val mean = floatArrayOf(.48145466f, .4578275f, .40821073f)
          val std = floatArrayOf(.26862954f, .26130258f, .27577711f)
          val buffer = ByteBuffer.allocate(3 * pixels.size * 4).order(ByteOrder.LITTLE_ENDIAN)
          for (channel in 0..2) for (pixel in pixels) {
            val value = (pixel shr (16 - channel * 8)) and 255
            buffer.putFloat((value / 255f - mean[channel]) / std[channel])
          }
          Base64.encodeToString(buffer.array(), Base64.NO_WRAP)
        } finally {
          if (resized !== crop && resized !== bitmap) resized.recycle()
          if (crop !== bitmap) crop.recycle()
        }
      } finally { bitmap.recycle() }
    }
    Function("clock") {
      val context = appContext.reactContext ?: error("Application unavailable")
      val boot = Settings.Global.getInt(context.contentResolver, Settings.Global.BOOT_COUNT, -1)
      if (boot < 0) error("Boot clock unavailable; reconnect before capturing")
      mapOf("bootId" to "android-$boot", "elapsedMs" to SystemClock.elapsedRealtime().toDouble())
    }
    AsyncFunction("inspect") { uri: String ->
      val path = Uri.parse(uri).path ?: error("Invalid local image")
      val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
      BitmapFactory.decodeFile(path, bounds)
      if (bounds.outWidth < 1 || bounds.outHeight < 1) error("Unable to decode photo")
      val options = BitmapFactory.Options().apply { inSampleSize = maxOf(1, maxOf(bounds.outWidth, bounds.outHeight) / 128) }
      val bitmap = BitmapFactory.decodeFile(path, options) ?: error("Unable to decode photo")
      try {
        val w = bitmap.width; val h = bitmap.height
        val pixels = IntArray(w * h); bitmap.getPixels(pixels, 0, w, 0, 0, w, h)
        val luma = DoubleArray(pixels.size) { i ->
          val p = pixels[i]; .2126 * ((p shr 16) and 255) + .7152 * ((p shr 8) and 255) + .0722 * (p and 255)
        }
        var sum = 0.0; var sumSq = 0.0; var n = 0
        for (y in 1 until h - 1) for (x in 1 until w - 1) {
          val i = y * w + x
          val v = luma[i - 1] + luma[i + 1] + luma[i - w] + luma[i + w] - 4 * luma[i]
          sum += v; sumSq += v * v; n++
        }
        val variance = if (n > 0) maxOf(0.0, sumSq / n - (sum / n) * (sum / n)) else 0.0
        mapOf("luminance" to luma.average(), "laplacianVariance" to variance,
          "clipping" to luma.count { it < 5 || it > 250 }.toDouble() / luma.size,
          "width" to bounds.outWidth, "height" to bounds.outHeight)
      } finally { bitmap.recycle() }
    }
  }
}

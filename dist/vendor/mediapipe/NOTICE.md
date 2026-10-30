# MediaPipe person masking

Local runtime: `@mediapipe/tasks-vision` 1.2.0, distributed through Google's npm package. The module and WebAssembly files are bundled here so character pictures stay on the device.

Model: MediaPipe SelfieSegmenter (square), float16, version 1, from https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/1/selfie_segmenter.tflite.

Upstream documentation: https://developers.google.com/edge/mediapipe/solutions/vision/image_segmenter. Source and license: https://github.com/google-ai-edge/mediapipe. Apache License 2.0 is included in LICENSE. The upstream model card is https://storage.googleapis.com/mediapipe-assets/Model%20Card%20MediaPipe%20Selfie%20Segmentation.pdf.

The model identifies people, not individual arms, legs or hidden surfaces. Review the mask and refine it with the local brushes. No network requests are needed at runtime.

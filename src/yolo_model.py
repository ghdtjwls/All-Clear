import onnxruntime as ort
import cv2
import numpy as np
import time, psutil, os

class YOLOOnnx:
    def __init__(self, model_path, class_names, provider="CPUExecutionProvider", input_size=640):
        self.session = ort.InferenceSession(model_path, providers=[provider])
        self.input_name = self.session.get_inputs()[0].name
        self.class_names = class_names
        self.process = psutil.Process(os.getpid())
        self.input_size = input_size

        # Warm-up
        for _ in range(3):
            dummy = np.zeros((1, 3, self.input_size, self.input_size), dtype=np.float32)
            self.session.run(None, {self.input_name: dummy})

    def preprocess(self, img):
        img_resized = cv2.resize(img, (self.input_size, self.input_size))
        img_input = img_resized.transpose(2, 0, 1) / 255.0
        return img_input[np.newaxis, :, :, :].astype(np.float32)

    def predict(self, img_path, conf_threshold=0.5, nms_threshold=0.4, save_path="predicted_img.jpg"):
        img = cv2.imread(img_path)
        orig_h, orig_w = img.shape[:2]
        img_input = self.preprocess(img)

        # Inference
        outputs = self.session.run(None, {self.input_name: img_input})
        output_data = outputs[0][0].T  # (num_detections, 4+num_classes)

        x_scale = orig_w / self.input_size
        y_scale = orig_h / self.input_size

        boxes = []
        confidences = []
        class_ids = []

        # Post-processing
        for det in output_data:
            scores = det[4:]
            class_id = np.argmax(scores)
            confidence = scores[class_id]

            if confidence > conf_threshold:
                cx, cy, w, h = det[:4]
                x = int(cx - w/2)
                y = int(cy - h/2)
                boxes.append([x, y, int(w), int(h)])
                confidences.append(float(confidence))
                class_ids.append(class_id)

        # Apply NMS
        indices = cv2.dnn.NMSBoxes(boxes, confidences, conf_threshold, nms_threshold)

        detections = []
        summary = {name: 0 for name in self.class_names}

        if len(indices) > 0:
            for i in indices.flatten():
                x, y, w, h = boxes[i]
                # Scale to original image
                x1 = int(x * x_scale)
                y1 = int(y * y_scale)
                x2 = int((x + w) * x_scale)
                y2 = int((y + h) * y_scale)

                cls_name = self.class_names[class_ids[i]]
                summary[cls_name] += 1

                detections.append({
                    "class": cls_name,
                    "confidence": confidences[i],
                    "box": {"x1": x1, "y1": y1, "x2": x2, "y2": y2}
                })

                # Draw bounding box
                color = (0, 255, 0)
                cv2.rectangle(img, (x1, y1), (x2, y2), color, 2)
                label = f"{cls_name}: {confidences[i]:.2f}"
                (label_width, label_height), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2)
                label_y = y1 - 10 if y1 - 10 > 10 else y1 + 10
                cv2.rectangle(img, (x1, label_y - label_height), (x1 + label_width, label_y + 5), color, cv2.FILLED)
                cv2.putText(img, label, (x1, label_y), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 0), 2)

        # Save image
        if save_path:
            cv2.imwrite(save_path, img)

        result = {
            "image_path": save_path,
            "detections": detections,
            "summary": {**summary, "total_objects": len(detections)}
        }

        return result

    def benchmark(self, img_path, runs=100):
        img = cv2.imread(img_path)
        img_input = self.preprocess(img)

        times, cpu_usages, mem_usages = [], [], []

        for _ in range(runs):
            start_t = time.time()
            self.session.run(None, {self.input_name: img_input})
            end_t = time.time()

            times.append((end_t - start_t) * 1000)  # ms
            cpu_usages.append(self.process.cpu_percent(interval=0.0))
            mem_usages.append(self.process.memory_info().rss / (1024 * 1024))  # MB

        avg_time = sum(times) / runs
        avg_cpu = sum(cpu_usages) / runs
        avg_mem = sum(mem_usages) / runs
        fps = 1000 / avg_time

        print(f"\n⏱️ Benchmark Result ({runs} runs)")
        print(f"• Avg Inference Time : {avg_time:.2f} ms")
        print(f"• Estimated FPS      : {fps:.2f} FPS")
        print(f"• Avg CPU Usage      : {avg_cpu:.2f} %")
        print(f"• Avg RAM Usage      : {avg_mem:.2f} MB\n")

#
# model_path = "./model/best_noise.onnx"
# img_path = "./human_cctv.png"
# class_names = ["fire", "human", "smoke"]
#
# yolo = YOLOOnnx(model_path, class_names)
#
# # Run prediction
# result = yolo.predict(img_path, save_path="predicted_img.jpg")
# print(result)
#
# # Benchmark
# yolo.benchmark(img_path, runs=50)
#

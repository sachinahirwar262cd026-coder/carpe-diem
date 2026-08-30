
import os
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing import image
import matplotlib.pyplot as plt
from sklearn.metrics import confusion_matrix, ConfusionMatrixDisplay


# ============================================================
# SETTINGS
# ============================================================

MODEL_PATH = "pollution_sound_cnn.h5"

SPECTROGRAM_PATH = "data/spectrograms"

IMG_HEIGHT = 128
IMG_WIDTH = 128

CLASSES = [
    "car_horn",
    "engine",
    "helicopter",
    "siren",
    "train"
]


# ============================================================
# LOAD MODEL
# ============================================================

print("Loading CNN model...")

model = tf.keras.models.load_model(MODEL_PATH)

print("Model loaded successfully!")


# ============================================================
# STORAGE FOR RESULTS
# ============================================================

y_true = []
y_pred = []


# ============================================================
# TEST EACH CLASS
# ============================================================

print("\n" + "=" * 60)
print("          CNN SOUND CLASSIFICATION TEST")
print("=" * 60)


for class_index, class_name in enumerate(CLASSES):

    class_path = os.path.join(
        SPECTROGRAM_PATH,
        class_name
    )

    if not os.path.exists(class_path):
        print(f"\nWARNING: Folder not found: {class_path}")
        continue

    files = [
        f for f in os.listdir(class_path)
        if f.lower().endswith(".png")
    ]

    print(f"\nTesting class: {class_name}")
    print(f"Files found: {len(files)}")

    for filename in sorted(files):

        file_path = os.path.join(
            class_path,
            filename
        )

        try:

            # ------------------------------------------------
            # LOAD IMAGE
            # ------------------------------------------------

            img = image.load_img(
                file_path,
                target_size=(IMG_HEIGHT, IMG_WIDTH)
            )

            # ------------------------------------------------
            # CONVERT IMAGE TO ARRAY
            # ------------------------------------------------

            img_array = image.img_to_array(img)

            # ------------------------------------------------
            # NORMALIZE
            # ------------------------------------------------

            img_array = img_array / 255.0

            # ------------------------------------------------
            # ADD BATCH DIMENSION
            # ------------------------------------------------

            img_array = np.expand_dims(
                img_array,
                axis=0
            )

            # ------------------------------------------------
            # PREDICT
            # ------------------------------------------------

            predictions = model.predict(
                img_array,
                verbose=0
            )[0]

            predicted_index = np.argmax(
                predictions
            )

            predicted_class = CLASSES[
                predicted_index
            ]

            confidence = predictions[
                predicted_index
            ] * 100

            # ------------------------------------------------
            # STORE RESULTS
            # ------------------------------------------------

            y_true.append(class_index)
            y_pred.append(predicted_index)

            # ------------------------------------------------
            # DISPLAY RESULT
            # ------------------------------------------------

            correct = (
                predicted_index == class_index
            )

            result = "✓ CORRECT" if correct else "✗ WRONG"

            print(
                f"\nFile: {filename}"
            )

            print(
                f"Actual:    {class_name}"
            )

            print(
                f"Predicted: {predicted_class}"
            )

            print(
                f"Confidence: {confidence:.2f}%"
            )

            print(
                f"Result: {result}"
            )

        except Exception as e:

            print(
                f"ERROR processing {filename}: {e}"
            )


# ============================================================
# FINAL RESULTS
# ============================================================

total_files = len(y_true)

correct_predictions = sum(
    true == pred
    for true, pred in zip(y_true, y_pred)
)

accuracy = (
    correct_predictions / total_files
    if total_files > 0
    else 0
)


print("\n" + "=" * 60)
print("              FINAL RESULTS")
print("=" * 60)

print(
    f"Total files tested: {total_files}"
)

print(
    f"Correct predictions: {correct_predictions}"
)

print(
    f"Test accuracy: {accuracy * 100:.2f}%"
)

print("=" * 60)


# ============================================================
# CONFUSION MATRIX
# ============================================================

cm = confusion_matrix(
    y_true,
    y_pred,
    labels=range(len(CLASSES))
)


print("\nConfusion Matrix:")
print(cm)


# ============================================================
# PER-CLASS ACCURACY
# ============================================================

print("\n" + "=" * 60)
print("             PER-CLASS ACCURACY")
print("=" * 60)


for i, class_name in enumerate(CLASSES):

    total_class = np.sum(cm[i])

    correct_class = cm[i, i]

    if total_class > 0:
        class_accuracy = (
            correct_class / total_class
        ) * 100
    else:
        class_accuracy = 0

    print(
        f"{class_name:12s}: "
        f"{class_accuracy:.2f}% "
        f"({correct_class}/{total_class})"
    )


# ============================================================
# DISPLAY CONFUSION MATRIX
# ============================================================

plt.figure(
    figsize=(8, 8)
)

disp = ConfusionMatrixDisplay(
    confusion_matrix=cm,
    display_labels=CLASSES
)

disp.plot(
    cmap="Blues",
    values_format="d"
)

plt.title(
    "CNN Sound Classification Confusion Matrix"
)

plt.tight_layout()

plt.savefig(
    "cnn_confusion_matrix.png"
)

plt.show()


# ============================================================
# COMPLETE
# ============================================================

print("\nConfusion matrix saved as:")
print("cnn_confusion_matrix.png")

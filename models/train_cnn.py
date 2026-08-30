
import os
import shutil
import numpy as np
import matplotlib.pyplot as plt
import tensorflow as tf

from tensorflow.keras import layers, models
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import (
    EarlyStopping,
    ReduceLROnPlateau,
    ModelCheckpoint
)
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

from sklearn.metrics import (
    confusion_matrix,
    classification_report,
    ConfusionMatrixDisplay
)


# ============================================================
# SETTINGS
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

# ACTUAL DATASET PATH
DATASET_DIR = os.path.join(
    BASE_DIR,
    "data",
    "spectrograms"
)

# NEW CNN SPLIT
SPLIT_DIR = os.path.join(
    BASE_DIR,
    "data",
    "mobilenet_split"
)

TRAIN_DIR = os.path.join(
    SPLIT_DIR,
    "train"
)

VAL_DIR = os.path.join(
    SPLIT_DIR,
    "validation"
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "pollution_sound_mobilenetv2.h5"
)

ACCURACY_GRAPH = os.path.join(
    BASE_DIR,
    "mobilenet_training_validation_accuracy.png"
)

LOSS_GRAPH = os.path.join(
    BASE_DIR,
    "mobilenet_training_validation_loss.png"
)

CONFUSION_MATRIX = os.path.join(
    BASE_DIR,
    "mobilenet_confusion_matrix.png"
)

REPORT_FILE = os.path.join(
    BASE_DIR,
    "mobilenet_classification_report.txt"
)

PREDICTIONS_FILE = os.path.join(
    BASE_DIR,
    "mobilenet_validation_predictions.txt"
)

IMG_SIZE = (128, 128)

BATCH_SIZE = 16

EPOCHS = 40

SEED = 42


# ============================================================
# CHECK DATASET
# ============================================================

print("=" * 60)
print("CHECKING SPECTROGRAM DATASET")
print("=" * 60)

print("\nDataset path:")
print(DATASET_DIR)


if not os.path.isdir(DATASET_DIR):

    raise FileNotFoundError(
        f"\nDataset folder not found:\n{DATASET_DIR}"
    )


classes = sorted([
    folder
    for folder in os.listdir(DATASET_DIR)
    if os.path.isdir(
        os.path.join(
            DATASET_DIR,
            folder
        )
    )
])


expected_classes = {
    "car_horn",
    "engine",
    "helicopter",
    "siren",
    "train"
}


if set(classes) != expected_classes:

    print("\nWARNING:")
    print("Expected classes:")
    print(sorted(expected_classes))

    print("\nFound classes:")
    print(classes)


print("\nDataset found!")


total_images = 0


for class_name in classes:

    class_path = os.path.join(
        DATASET_DIR,
        class_name
    )

    images = [
        f
        for f in os.listdir(class_path)
        if f.lower().endswith(
            (
                ".png",
                ".jpg",
                ".jpeg"
            )
        )
    ]

    print(
        f"{class_name}: "
        f"{len(images)} images"
    )

    total_images += len(images)


print(
    f"\nTotal images: {total_images}"
)


# ============================================================
# CREATE STRATIFIED TRAIN / VALIDATION SPLIT
# ============================================================

print("\n" + "=" * 60)
print("CREATING STRATIFIED TRAIN / VALIDATION SPLIT")
print("=" * 60)


if os.path.exists(SPLIT_DIR):

    print(
        "Removing previous MobileNet split..."
    )

    shutil.rmtree(SPLIT_DIR)


os.makedirs(
    TRAIN_DIR,
    exist_ok=True
)

os.makedirs(
    VAL_DIR,
    exist_ok=True
)


rng = np.random.default_rng(SEED)

total_train = 0
total_val = 0


for class_name in classes:

    source_dir = os.path.join(
        DATASET_DIR,
        class_name
    )

    train_class_dir = os.path.join(
        TRAIN_DIR,
        class_name
    )

    val_class_dir = os.path.join(
        VAL_DIR,
        class_name
    )

    os.makedirs(
        train_class_dir,
        exist_ok=True
    )

    os.makedirs(
        val_class_dir,
        exist_ok=True
    )


    images = [
        f
        for f in os.listdir(source_dir)
        if f.lower().endswith(
            (
                ".png",
                ".jpg",
                ".jpeg"
            )
        )
    ]


    rng.shuffle(images)


    split_index = int(
        len(images) * 0.8
    )


    train_images = images[
        :split_index
    ]

    val_images = images[
        split_index:
    ]


    for image_name in train_images:

        shutil.copy2(

            os.path.join(
                source_dir,
                image_name
            ),

            os.path.join(
                train_class_dir,
                image_name
            )
        )


    for image_name in val_images:

        shutil.copy2(

            os.path.join(
                source_dir,
                image_name
            ),

            os.path.join(
                val_class_dir,
                image_name
            )
        )


    print(
        f"{class_name}: "
        f"{len(train_images)} training, "
        f"{len(val_images)} validation"
    )


    total_train += len(
        train_images
    )

    total_val += len(
        val_images
    )


print("\n" + "=" * 60)
print("DATASET SPLIT COMPLETE")
print("=" * 60)

print(
    f"Total training images: "
    f"{total_train}"
)

print(
    f"Total validation images: "
    f"{total_val}"
)

print(
    f"Total images: "
    f"{total_train + total_val}"
)


# ============================================================
# DATA GENERATORS
# ============================================================

print("\nCreating data generators...")


# We use MobileNetV2 preprocessing.
#
# IMPORTANT:
# We do NOT use horizontal_flip because the horizontal
# direction of a spectrogram represents time.
#
# We use only small transformations.

train_datagen = ImageDataGenerator(

    preprocessing_function=preprocess_input,

    rotation_range=5,

    width_shift_range=0.05,

    height_shift_range=0.05,

    zoom_range=0.05
)


validation_datagen = ImageDataGenerator(

    preprocessing_function=preprocess_input
)


train_generator = train_datagen.flow_from_directory(

    TRAIN_DIR,

    target_size=IMG_SIZE,

    batch_size=BATCH_SIZE,

    class_mode="categorical",

    shuffle=True,

    seed=SEED
)


validation_generator = validation_datagen.flow_from_directory(

    VAL_DIR,

    target_size=IMG_SIZE,

    batch_size=BATCH_SIZE,

    class_mode="categorical",

    shuffle=False
)


# ============================================================
# CLASS INFORMATION
# ============================================================

print("\n" + "=" * 60)
print("CLASS INFORMATION")
print("=" * 60)

print("\nClasses:")
print(
    train_generator.class_indices
)

print(
    f"\nTraining images: "
    f"{train_generator.samples}"
)

print(
    f"Validation images: "
    f"{validation_generator.samples}"
)


# ============================================================
# MOBILENETV2 BASE MODEL
# ============================================================

print("\n" + "=" * 60)
print("LOADING MOBILENETV2")
print("=" * 60)


base_model = MobileNetV2(

    weights="imagenet",

    include_top=False,

    input_shape=(
        IMG_SIZE[0],
        IMG_SIZE[1],
        3
    )
)


# Freeze the pretrained model initially.
#
# This is important because we only have 160 training images.

base_model.trainable = False


print(
    "MobileNetV2 loaded successfully."
)

print(
    "Pretrained layers frozen."
)


# ============================================================
# BUILD MODEL
# ============================================================

print("\n" + "=" * 60)
print("MOBILENETV2 MODEL")
print("=" * 60)


inputs = layers.Input(
    shape=(
        IMG_SIZE[0],
        IMG_SIZE[1],
        3
    )
)


x = base_model(
    inputs,
    training=False
)


x = layers.GlobalAveragePooling2D()(x)


x = layers.Dense(
    64,
    activation="relu"
)(x)


x = layers.Dropout(
    0.4
)(x)


outputs = layers.Dense(
    len(classes),
    activation="softmax"
)(x)


model = models.Model(
    inputs,
    outputs
)


# ============================================================
# COMPILE
# ============================================================

model.compile(

    optimizer=tf.keras.optimizers.Adam(
        learning_rate=0.0005
    ),

    loss="categorical_crossentropy",

    metrics=["accuracy"]
)


model.summary()


# ============================================================
# CALLBACKS
# ============================================================

checkpoint = ModelCheckpoint(

    MODEL_PATH,

    monitor="val_accuracy",

    save_best_only=True,

    mode="max",

    verbose=1
)


early_stopping = EarlyStopping(

    monitor="val_accuracy",

    patience=10,

    restore_best_weights=True,

    verbose=1
)


reduce_lr = ReduceLROnPlateau(

    monitor="val_accuracy",

    factor=0.5,

    patience=4,

    min_lr=1e-6,

    verbose=1
)


# ============================================================
# TRAIN CLASSIFIER HEAD
# ============================================================

print("\n" + "=" * 60)
print("STARTING MOBILENETV2 TRAINING")
print("=" * 60)

print(
    "\nPhase 1:"
)

print(
    "Training only the new classification layers."
)


history1 = model.fit(

    train_generator,

    validation_data=validation_generator,

    epochs=EPOCHS,

    callbacks=[
        checkpoint,
        early_stopping,
        reduce_lr
    ]
)


# ============================================================
# FINE-TUNING
# ============================================================

print("\n" + "=" * 60)
print("STARTING FINE-TUNING")
print("=" * 60)


# Unfreeze the MobileNetV2 base model.

base_model.trainable = True


# Freeze most of the early layers.
#
# Only the final part is fine-tuned.
#
# This reduces overfitting on the small dataset.

fine_tune_from = 100


for layer in base_model.layers[
    :fine_tune_from
]:

    layer.trainable = False


for layer in base_model.layers[
    fine_tune_from:
]:

    layer.trainable = True


print(
    f"Fine-tuning MobileNetV2 "
    f"from layer {fine_tune_from}."
)


# Use a VERY small learning rate for fine-tuning.

model.compile(

    optimizer=tf.keras.optimizers.Adam(

        learning_rate=1e-5

    ),

    loss="categorical_crossentropy",

    metrics=["accuracy"]
)


# New callbacks for fine-tuning.

fine_tune_checkpoint = ModelCheckpoint(

    MODEL_PATH,

    monitor="val_accuracy",

    save_best_only=True,

    mode="max",

    verbose=1
)


fine_tune_early_stopping = EarlyStopping(

    monitor="val_accuracy",

    patience=8,

    restore_best_weights=True,

    verbose=1
)


fine_tune_reduce_lr = ReduceLROnPlateau(

    monitor="val_accuracy",

    factor=0.5,

    patience=3,

    min_lr=1e-7,

    verbose=1
)


# Continue training.

history2 = model.fit(

    train_generator,

    validation_data=validation_generator,

    epochs=20,

    callbacks=[
        fine_tune_checkpoint,
        fine_tune_early_stopping,
        fine_tune_reduce_lr
    ]
)


# ============================================================
# COMBINE TRAINING HISTORIES
# ============================================================

accuracy_history = (

    history1.history["accuracy"]
    +
    history2.history["accuracy"]

)


val_accuracy_history = (

    history1.history["val_accuracy"]
    +
    history2.history["val_accuracy"]

)


loss_history = (

    history1.history["loss"]
    +
    history2.history["loss"]

)


val_loss_history = (

    history1.history["val_loss"]
    +
    history2.history["val_loss"]

)


# ============================================================
# TRAINING RESULTS
# ============================================================

print("\n" + "=" * 60)
print("TRAINING COMPLETE")
print("=" * 60)


best_train_accuracy = max(
    accuracy_history
)

best_val_accuracy = max(
    val_accuracy_history
)

final_train_accuracy = (
    accuracy_history[-1]
)

final_val_accuracy = (
    val_accuracy_history[-1]
)


print(
    f"Model saved as:\n"
    f"{MODEL_PATH}"
)

print(
    f"\nBest training accuracy: "
    f"{best_train_accuracy:.4f}"
)

print(
    f"Best validation accuracy: "
    f"{best_val_accuracy:.4f}"
)

print(
    f"\nFinal training accuracy: "
    f"{final_train_accuracy:.4f}"
)

print(
    f"Final validation accuracy: "
    f"{final_val_accuracy:.4f}"
)


# ============================================================
# LOAD BEST MODEL
# ============================================================

print("\n" + "=" * 60)
print("LOADING BEST MODEL")
print("=" * 60)


model = tf.keras.models.load_model(
    MODEL_PATH
)


print(
    "Best model loaded successfully."
)


# ============================================================
# VALIDATION EVALUATION
# ============================================================

print("\n" + "=" * 60)
print("VALIDATION EVALUATION")
print("=" * 60)


validation_generator.reset()


predictions = model.predict(

    validation_generator,

    verbose=1
)


predicted_classes = np.argmax(

    predictions,

    axis=1
)


true_classes = (
    validation_generator.classes
)


class_names = list(
    validation_generator
    .class_indices
    .keys()
)


# ============================================================
# PREDICTION COUNTS
# ============================================================

print("\n" + "=" * 60)
print("PREDICTION COUNTS")
print("=" * 60)


actual_counts = np.bincount(

    true_classes,

    minlength=len(class_names)
)


predicted_counts = np.bincount(

    predicted_classes,

    minlength=len(class_names)
)


print(
    "\nActual validation distribution:"
)


for i, class_name in enumerate(
    class_names
):

    print(
        f"{class_name}: "
        f"{actual_counts[i]}"
    )


print(
    "\nPredicted validation distribution:"
)


for i, class_name in enumerate(
    class_names
):

    print(
        f"{class_name}: "
        f"{predicted_counts[i]}"
    )


# ============================================================
# CLASSIFICATION REPORT
# ============================================================

print("\n" + "=" * 60)
print("CLASSIFICATION REPORT")
print("=" * 60)


report = classification_report(

    true_classes,

    predicted_classes,

    target_names=class_names,

    zero_division=0
)


print(report)


with open(

    REPORT_FILE,

    "w",

    encoding="utf-8"

) as file:

    file.write(report)


# ============================================================
# CONFUSION MATRIX
# ============================================================

print("\n" + "=" * 60)
print("CONFUSION MATRIX")
print("=" * 60)


cm = confusion_matrix(

    true_classes,

    predicted_classes
)


print("\nConfusion matrix:")

print(cm)


disp = ConfusionMatrixDisplay(

    confusion_matrix=cm,

    display_labels=class_names
)


fig, ax = plt.subplots(

    figsize=(8, 8)
)


disp.plot(

    ax=ax,

    xticks_rotation=45
)


plt.title(
    "MobileNetV2 Sound Classification Confusion Matrix"
)


plt.tight_layout()


plt.savefig(

    CONFUSION_MATRIX,

    dpi=300
)


plt.show()


# ============================================================
# ACTUAL VS PREDICTED
# ============================================================

print("\n" + "=" * 60)
print("ACTUAL VS PREDICTED")
print("=" * 60)


correct = 0

prediction_lines = []


for i in range(
    len(true_classes)
):

    actual = class_names[
        true_classes[i]
    ]

    predicted = class_names[
        predicted_classes[i]
    ]


    if (

        true_classes[i]
        ==
        predicted_classes[i]

    ):

        correct += 1

        result = "CORRECT"

    else:

        result = "WRONG"


    line = (

        f"{i + 1:02d}. "

        f"Actual: {actual:<12} "

        f"Predicted: {predicted:<12} "

        f"{result}"

    )


    print(line)


    prediction_lines.append(
        line
    )


prediction_accuracy = (

    correct /
    len(true_classes)

)


print(

    f"\nCorrect predictions: "

    f"{correct}/"
    f"{len(true_classes)}"

)


print(

    f"Validation accuracy from "
    f"predictions: "
    f"{prediction_accuracy:.4f}"

)


# ============================================================
# SAVE PREDICTIONS
# ============================================================

with open(

    PREDICTIONS_FILE,

    "w",

    encoding="utf-8"

) as file:

    file.write(

        "MOBILENETV2 "
        "ACTUAL VS PREDICTED "
        "VALIDATION RESULTS\n"

    )


    file.write(
        "=" * 60 + "\n\n"
    )


    for line in prediction_lines:

        file.write(
            line + "\n"
        )


# ============================================================
# ACCURACY GRAPH
# ============================================================

print("\n" + "=" * 60)
print("CREATING TRAINING GRAPHS")
print("=" * 60)


plt.figure(
    figsize=(8, 6)
)


plt.plot(

    accuracy_history,

    label="Training Accuracy"

)


plt.plot(

    val_accuracy_history,

    label="Validation Accuracy"

)


# Mark the beginning of fine-tuning.

plt.axvline(

    x=len(history1.history["accuracy"]) - 1,

    linestyle="--",

    label="Fine-tuning starts"

)


plt.title(
    "MobileNetV2 Training vs Validation Accuracy"
)


plt.xlabel(
    "Epoch"
)


plt.ylabel(
    "Accuracy"
)


plt.legend()


plt.grid(True)


plt.tight_layout()


plt.savefig(

    ACCURACY_GRAPH,

    dpi=300

)


plt.show()


# ============================================================
# LOSS GRAPH
# ============================================================

plt.figure(
    figsize=(8, 6)
)


plt.plot(

    loss_history,

    label="Training Loss"

)


plt.plot(

    val_loss_history,

    label="Validation Loss"

)


plt.axvline(

    x=len(history1.history["loss"]) - 1,

    linestyle="--",

    label="Fine-tuning starts"

)


plt.title(
    "MobileNetV2 Training vs Validation Loss"
)


plt.xlabel(
    "Epoch"
)


plt.ylabel(
    "Loss"
)


plt.legend()


plt.grid(True)


plt.tight_layout()


plt.savefig(

    LOSS_GRAPH,

    dpi=300

)


plt.show()


# ============================================================
# FINAL RESULT
# ============================================================

print("\n" + "=" * 60)
print("MOBILENETV2 DIAGNOSTICS COMPLETE")
print("=" * 60)


print("\nFiles created:")

print(
    "1. pollution_sound_mobilenetv2.h5"
)

print(
    "2. mobilenet_confusion_matrix.png"
)

print(
    "3. mobilenet_classification_report.txt"
)

print(
    "4. mobilenet_validation_predictions.txt"
)

print(
    "5. mobilenet_training_validation_accuracy.png"
)

print(
    "6. mobilenet_training_validation_loss.png"
)


print("\n" + "=" * 60)
print("FINAL RESULT")
print("=" * 60)


print(

    f"Best validation accuracy: "
    f"{best_val_accuracy:.2%}"

)


if best_val_accuracy < 0.40:

    print("\nWARNING:")

    print(

        "MobileNetV2 validation accuracy "
        "is still low."

    )

    print(

        "The next step should be checking "
        "the spectrogram generation/data quality "
        "rather than simply increasing epochs."

    )

elif best_val_accuracy < 0.60:

    print("\nNOTICE:")

    print(

        "The model is learning, but "
        "validation performance is moderate."

    )

else:

    print("\nGOOD:")

    print(

        "MobileNetV2 is showing useful "
        "validation performance."

    )


print("=" * 60)

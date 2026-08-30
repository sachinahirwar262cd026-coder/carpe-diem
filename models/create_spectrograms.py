import os
import numpy as np
import pandas as pd
from scipy.io import wavfile
import librosa
import matplotlib.pyplot as plt


# ============================================================
# PATHS
# ============================================================

ESC50_PATH = "data/ESC-50-master"

METADATA_FILE = os.path.join(
    ESC50_PATH,
    "meta",
    "esc50.csv"
)

AUDIO_PATH = os.path.join(
    ESC50_PATH,
    "audio"
)

OUTPUT_PATH = "data/spectrograms"


# ============================================================
# CLASSES
# ============================================================

TARGET_CLASSES = [
    "car_horn",
    "siren",
    "engine",
    "train",
    "helicopter"
]


# ============================================================
# CREATE OUTPUT DIRECTORIES
# ============================================================

for class_name in TARGET_CLASSES:
    os.makedirs(
        os.path.join(OUTPUT_PATH, class_name),
        exist_ok=True
    )


# ============================================================
# LOAD METADATA
# ============================================================

print("Creating Mel spectrograms...")

metadata = pd.read_csv(METADATA_FILE)


# ============================================================
# PROCESS AUDIO FILES
# ============================================================

total_created = 0

for class_name in TARGET_CLASSES:

    class_data = metadata[
        metadata["category"] == class_name
    ]

    print(
        f"\n{class_name}: "
        f"{len(class_data)} audio files"
    )

    for _, row in class_data.iterrows():

        filename = row["filename"]

        input_file = os.path.join(
            AUDIO_PATH,
            filename
        )

        output_file = os.path.join(
            OUTPUT_PATH,
            class_name,
            filename.replace(".wav", ".png")
        )

        try:

            # ------------------------------------------------
            # LOAD AUDIO
            # ------------------------------------------------

            sample_rate, audio = wavfile.read(
                input_file
            )

            audio = audio.astype(np.float32)

            # ------------------------------------------------
            # CONVERT STEREO → MONO
            # ------------------------------------------------

            if audio.ndim > 1:
                audio = np.mean(
                    audio,
                    axis=1
                )

            # ------------------------------------------------
            # NORMALIZE AUDIO
            # ------------------------------------------------

            max_value = np.max(
                np.abs(audio)
            )

            if max_value > 0:
                audio = audio / max_value

            # ------------------------------------------------
            # CREATE MEL SPECTROGRAM
            # ------------------------------------------------

            mel_spectrogram = librosa.feature.melspectrogram(
                y=audio,
                sr=sample_rate,
                n_mels=128,
                n_fft=2048,
                hop_length=512
            )

            # ------------------------------------------------
            # CONVERT TO DECIBELS
            # ------------------------------------------------

            mel_db = librosa.power_to_db(
                mel_spectrogram,
                ref=np.max
            )

            # ------------------------------------------------
            # NORMALIZE SPECTROGRAM
            # ------------------------------------------------

            mel_min = mel_db.min()
            mel_max = mel_db.max()

            if mel_max > mel_min:

                mel_normalized = (
                    (mel_db - mel_min)
                    / (mel_max - mel_min)
                )

            else:

                mel_normalized = np.zeros_like(
                    mel_db
                )

            # ------------------------------------------------
            # SAVE SPECTROGRAM
            # ------------------------------------------------

            plt.imsave(
                output_file,
                mel_normalized,
                cmap="gray",
                vmin=0,
                vmax=1
            )

            total_created += 1

        except Exception as e:

            print(
                f"ERROR: {filename}"
            )

            print(e)


# ============================================================
# COMPLETE
# ============================================================

print("\n" + "=" * 50)

print(
    "SPECTROGRAM GENERATION COMPLETE"
)

print(
    f"Total spectrograms created: "
    f"{total_created}"
)

print("=" * 50)
import yt_dlp
import os
from pydub import AudioSegment

os.environ["PATH"] += os.pathsep + r"C:\ffmpeg\bin"

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOWNLOAD_DIR = os.path.join(BASE_DIR, "downloads")
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

def download_youtube_audio(url:str)->str:
    output_path = os.path.join(DOWNLOAD_DIR, "%(title)s.%(ext)s")

    ydl_opts = {
    "format": "bestaudio/best",
    "outtmpl": output_path,
    "ffmpeg_location": r"C:\Users\Lenovo\Downloads\ffmpeg-8.1.1-essentials_build\ffmpeg-8.1.1-essentials_build\bin",
    "postprocessors": [
        {
            "key": "FFmpegExtractAudio",
            "preferredcodec": "wav",
            "preferredquality": "192",
        }
    ],
}

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        filename = ydl.prepare_filename(info).replace(".webm", ".wav").replace(".m4a", ".wav")

    return filename

#data=download_youtube_audio("https://youtu.be/T4yFNQMl0Ls?si=1p2-zvn9cMCLfvMo")

## Input audio ko 16khz aur monoaudio(headephones ke dono speakers me ek avaj aaye alg alg nhi) krne ka function
def convert_to_wav(input_path: str) -> str:
    """Convert any audio/video file to WAV format using pydub."""
    output_path = os.path.splitext(input_path)[0] + "_converted.wav"
    audio = AudioSegment.from_file(input_path)
    audio = audio.set_channels(1).set_frame_rate(16000) #16khz 
    audio.export(output_path, format="wav")
    return output_path

#final_data=convert_to_wav(data)


## Chunking whole length of audio into 10min
def chunk_audio(wav_path : str , chunk_minutes : int = 10) -> list:
    audio = AudioSegment.from_wav(wav_path)    ## Lading the audio
    chunk_ms = chunk_minutes * 60 * 1000       ## 10 min

    chunks = []                                ## storing all chunks in list

    for i, start in enumerate(range(0,len(audio),chunk_ms)):
        chunk = audio[start : start + chunk_ms]
        chunk_path = f"{wav_path}_chunk_{i}.wav"
        chunk.export(chunk_path , format = "wav")

        chunks.append(chunk_path)
    
    return chunks

#print(chunk_audio(final_data))



def process_input(source: str) -> list:
    if source.startswith("http://") or source.startswith("https://"):
        print("Detected YouTube URL. Downloading audio...")
        wav_path = download_youtube_audio(source)
    else:
        print("Detected local file. Converting to WAV...")
        wav_path = convert_to_wav(source)

    print("Chunking audio...")
    chunks = chunk_audio(wav_path)
    print(f"Audio ready — {len(chunks)} chunk(s) created.")
    return chunks
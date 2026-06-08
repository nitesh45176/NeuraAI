import whisper
import os
import requests
from pydub import AudioSegment

# Sarvam's sync STT-translate API rejects audio longer than 30s.
# We slice each chunk into 25s pieces (with a 5s safety margin) before sending.
SARVAM_PIECE_SECONDS = 25


WHISPER_MODEL = os.getenv("WHISPER_MODEL", "small")


SARVAM_API_KEY = os.getenv("SARVAM_API_KEY")
SARVAM_STT_TRANSLATE_URL = "https://api.sarvam.ai/speech-to-text-translate"
SARVAM_MODEL = os.getenv("SARVAM_STT_MODEL", "saaras:v2.5")

_model = None


def load_model():

    global _model                       ## Global variable _model ko function ke andar use karne ke liye. Taaki baar baar naya model load na ho.

    if _model is None: 
        print(f"Loading Whisper model: {WHISPER_MODEL} ...")
        _model = whisper.load_model(WHISPER_MODEL) 
        print("Whisper model loaded.")
    return _model 


def transcribe_chunk_whisper(chunk_path: str) -> str:

    model = load_model()  

    result = model.transcribe(chunk_path, task="transcribe")  
    return result["text"]  


def _send_to_sarvam(piece_path: str) -> str:
    """
    Send one WAV audio file to Sarvam Speech-to-Text API
    and return the generated transcript.
    """

    ## API authentication header
    headers = {
        "api-subscription-key": SARVAM_API_KEY
    }

    ## Open audio file in binary mode
    with open(piece_path, "rb") as f:

        ## Prepare file data for multipart/form-data upload
        files = {
            "file": (
                os.path.basename(piece_path),  # filename only
                f,                             # actual file object
                "audio/wav"                   # MIME type
            )
        }

        ## Additional form data sent with request
        data = {
            "model": SARVAM_MODEL,
            "with_diarization": "false"
        }

        ## Send POST request to Sarvam API
        response = requests.post(
            SARVAM_STT_TRANSLATE_URL,
            headers=headers,
            files=files,
            data=data,
            timeout=120,   # wait max 120 sec
        )

    ## Check if API request failed
    if not response.ok:

        print(f"\n❌ Sarvam returned {response.status_code}")
        print(f"Response body: {response.text}\n")

        ## Raise exception for HTTP errors
        response.raise_for_status()

    ## Convert JSON response into Python dictionary
    ## and return transcript text
    return response.json().get("transcript", "")


def transcribe_chunk_sarvam(chunk_path: str) -> str:
    """
    Sarvam sync API only supports audio <= 30 sec.
    
    So:
    1. Split long audio into smaller 25-sec pieces
    2. Send each piece separately to API
    3. Combine all transcripts
    """

    ## Check API key exists
    if not SARVAM_API_KEY:
        raise RuntimeError(
            "SARVAM_API_KEY is not set in environment / .env"
        )

    ## Load WAV audio using pydub
    audio = AudioSegment.from_wav(chunk_path)

    ## Convert seconds -> milliseconds
    ## because AudioSegment uses milliseconds
    piece_ms = SARVAM_PIECE_SECONDS * 1000

    ## Final combined transcript
    full_text = ""

    ## Calculate total number of pieces required
    total_pieces = (len(audio) + piece_ms - 1) // piece_ms

    ## Loop through audio in steps of piece_ms
    for i, start in enumerate(range(0, len(audio), piece_ms)):

        ## Slice current audio piece
        piece = audio[start : start + piece_ms]

        ## Temporary file name
        piece_path = f"{chunk_path}_sv_{i}.wav"

        ## Export sliced piece as WAV file
        piece.export(piece_path, format="wav")

        try:
            print(f"  → Sarvam piece {i + 1}/{total_pieces} ...")

            ## Send piece to Sarvam API
            ## and append transcript
            full_text += _send_to_sarvam(piece_path) + " "

        finally:
            ## Always delete temporary file
            ## even if API fails
            if os.path.exists(piece_path):
                os.remove(piece_path)

    ## Remove extra spaces and return final transcript
    return full_text.strip()
   



def transcribe_chunk(chunk_path: str, language: str = "english") -> str:
    """
    Route one chunk to Whisper or Sarvam depending on language choice.
    - english  → Whisper (local model)
    - hinglish → Sarvam (translates to English while transcribing)
    """
    if language.lower() == "hinglish":
        return transcribe_chunk_sarvam(chunk_path)
    return transcribe_chunk_whisper(chunk_path)


def transcribe_all(chunks: list, language: str = "english") -> str:

    full_transcript = "" 

    engine = "Sarvam AI" if language.lower() == "hinglish" else "Whisper"
    print(f"Using {engine} for transcription.")

    for i, chunk in enumerate(chunks):            # This loop is doing 2 things together: a)getting each item from chunks. b)getting its index number               # Without enumerate, you would only get the chunk,  But with enumerate, you get: a)index (i)   b)value (chunk) both together.

        print(f"Transcribing chunk {i + 1}/{len(chunks)}...")

        text = transcribe_chunk(chunk, language=language)  

        full_transcript += text + " "                   ## Last me jo transcribe krne ke baad text ayega ussey full_transcript me save krenge

    print("Transcription complete.")

    return full_transcript.strip()  






































































# import whisper
# import os

# WHISPER_MODEL= os.getenv("WHISPER_MODEL","small")

# _model = None

# SARVAM_API_KEY = os.getenv("SARVAM_API_KEY")
# SARVAM_STT_TRANSLATE_URL = "https://api.sarvam.ai/speech-to-text-translate"
# SARVAM_MODEL = os.getenv("SARVAM_STT_MODEL", "saaras:v2.5")

# def load_model():

#     global _model               ## Global variable _model ko function ke andar use karne ke liye. Taaki baar baar naya model load na ho.

#     if _model is None:
#         print(f"Loading model...")
#         _model = whisper.load_model(WHISPER_MODEL)
#         print("Whisper model loaded successfully")

#     return _model

# ## This function transcribes one chunk
# def transcribe_chunk(chunk_path :str, translate : bool = False)->str:

#     model = load_model()                              ## Loading model
#     task = "translate" if translate else "transcribe" ## agr translate true hai(mtlb kisi dusre language me hai audio like hindi) to translate krna, nhi to transcribe(audio ko text me krdo)

#     result = model.transcribe(chunk_path, task = task)

#     return result['text']


# ## This function transcribes all chunks
# def transcribe_all(chunks : list, translate : bool=False)-> str :

#     full_transcript = ""

#     for i, chunk in enumerate(chunks):              # This loop is doing 2 things together: a)getting each item from chunks. b)getting its index number               # Without enumerate, you would only get the chunk,  But with enumerate, you get: a)index (i)   b)value (chunk) both together.
#         print(f"Transcribing chunk {i+1}")
#         text = transcribe_chunk(chunk, translate=translate)

#         full_transcript += text + " "

#     print("Transcription completed")

#     return full_transcript




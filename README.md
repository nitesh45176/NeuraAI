# NeuraAI — AI Meeting Intelligence Platform

NeuraAI turns any recorded meeting into structured, actionable information. Upload an audio/video file or paste a YouTube link and get a full transcript, summary, action items, decisions, and open questions — plus a chatbot to ask anything about the meeting.

Supports **English**, **Hindi**, and **Hinglish**.

---

## Features

- **Transcription** — English via OpenAI Whisper (local), Hindi/Hinglish via Sarvam AI
- **Summarization** — Bullet-point summary of the full meeting
- **Action Items** — Extracted with owner and deadline
- **Decisions** — Key decisions made during the meeting
- **Open Questions** — Follow-ups and unresolved points
- **Meeting Chat** — Ask anything about the meeting using RAG
- **Export** — Download full report as PDF or TXT

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, Tailwind CSS |
| Backend | FastAPI, Python |
| Transcription | OpenAI Whisper (local), Sarvam AI |
| LLM | Mistral AI |
| RAG Pipeline | LangChain LCEL |
| Vector Database | ChromaDB |
| Embeddings | HuggingFace (local) |
| Audio Processing | yt-dlp, FFmpeg |

---

## How It Works

```
Audio / Video / YouTube URL
        ↓
Transcription (Whisper or Sarvam AI)
        ↓
LangChain Extraction Pipeline
(Summary + Action Items + Decisions + Questions)
        ↓
ChromaDB Vector Store
        ↓
RAG Chatbot — ask anything about the meeting
        ↓
Export as PDF / TXT
```

---

## Project Structure

```
NeuraAI/
├── api/
│   ├── routes/
│   │   └── process.py
│   └── job_store.py
├── core/
│   ├── transcriber.py
│   ├── summarizer.py
│   ├── extractor.py
│   ├── rag_engine.py
│   ├── pipeline.py
│   └── vector_store.py
├── utils/
│   └── audio_processor.py
├── frontend/               # Next.js app
│   └── src/
│       └── app/
│           ├── page.tsx
│           ├── results/[jobId]/page.tsx
│           └── chat/[jobId]/page.tsx
├── api_main.py
├── Requirements.txt
└── .env.example
```

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- FFmpeg installed and added to PATH
- API keys for Sarvam AI and Mistral AI

### 1. Clone the repo

```bash
git clone https://github.com/nitesh45176/NeuraAI.git
cd NeuraAI
```

### 2. Set up Python backend

```bash
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

pip install -r Requirements.txt
```

### 3. Set up environment variables

Create a `.env` file in the root:

```env
MISTRAL_API_KEY=your_mistral_api_key
SARVAM_API_KEY=your_sarvam_api_key
```

### 4. Run the backend

```bash
uvicorn api_main:app --reload --port 8000
```

### 5. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/process` | Upload file or YouTube URL |
| GET | `/api/process/{job_id}` | Poll transcription status |
| GET | `/api/results/{job_id}` | Get summary, actions, decisions |
| POST | `/api/chat/{job_id}` | Chat with the meeting |
| GET | `/api/export/{job_id}/{format}` | Export as pdf or txt |

---

## Demo

> Backend is currently running locally. [Contact me](mailto:mishranitesh45176@gmail.com) to schedule a live demo.

---

## License

MIT

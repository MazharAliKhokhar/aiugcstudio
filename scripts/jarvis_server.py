import os, uuid, time, asyncio, numpy as np, logging
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import torch

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger("JarvisServer")

app = FastAPI(title="ViralUGC GPU Engine")
OUTPUT_DIR = "/home/user/outputs"
INACTIVITY_SECS = 1800  # 30 mins
INSTANCE_ID = os.getenv("JARVISLABS_INSTANCE_ID")
JARVIS_API_KEY = os.getenv("JARVISLABS_API_KEY")

last_request_time = time.time()
gpu_lock = asyncio.Lock()  # Prevent concurrent heavy GPU tasks to avoid OOM

os.makedirs(OUTPUT_DIR, exist_ok=True)
app.mount("/outputs", StaticFiles(directory=OUTPUT_DIR), name="outputs")

class VideoRequest(BaseModel):
    prompt: str
    video_id: Optional[str] = None
    supabase_url: Optional[str] = None
    supabase_key: Optional[str] = None

class VoiceRequest(BaseModel):
    text: str
    voice: Optional[str] = "af_heart"

def update_db_progress(video_id, progress, url=None, key=None):
    if not video_id or not url or not key:
        return
    try:
        import httpx
        with httpx.Client() as client:
            headers = {
                "apikey": key,
                "Authorization": f"Bearer {key}",
                "Content-Type": "application/json"
            }
            res = client.patch(
                f"{url}/rest/v1/videos?id=eq.{video_id}",
                headers=headers,
                json={"progress": progress}
            )
            logger.info(f"DB Progress {progress}% for {video_id}: {res.status_code}")
    except Exception as e:
        logger.error(f"Failed to update progress: {str(e)}")

_wan, _kokoro = None, None

def get_wan():
    global _wan
    if not _wan:
        logger.info("Initializing Wan 2.1 Video Pipeline...")
        from diffusers import WanVideoPipeline
        _wan = WanVideoPipeline.from_pretrained("wan-ai/Wan2.1-T2V-1.3B", torch_dtype=torch.float16).to("cuda")
        logger.info("Wan 2.1 Loaded.")
    return _wan

def get_kokoro():
    global _kokoro
    if not _kokoro:
        logger.info("Initializing Kokoro TTS Pipeline...")
        from kokoro import KPipeline
        _kokoro = KPipeline(lang_code="a")
        logger.info("Kokoro Loaded.")
    return _kokoro

def touch():
    global last_request_time
    last_request_time = time.time()

async def watchdog():
    import httpx
    logger.info(f"Starting Inactivity Watchdog (TTL: {INACTIVITY_SECS}s)")
    while True:
        await asyncio.sleep(60)
        idle_time = time.time() - last_request_time
        if idle_time > INACTIVITY_SECS and INSTANCE_ID and JARVIS_API_KEY:
            logger.info(f"Idle for {int(idle_time)}s. Triggering auto-pause via JarvisLabs API...")
            try:
                # Use the common JarvisLabs API endpoint for pausing
                async with httpx.AsyncClient() as c:
                    url = f"https://api.jarvislabs.ai/v1/instances/{INSTANCE_ID}?action=pause"
                    res = await c.put(url, headers={"X-API-KEY": JARVIS_API_KEY}, timeout=10)
                    logger.info(f"Auto-pause response: {res.status_code} {res.text}")
            except Exception as e:
                logger.error(f"Auto-pause failed: {str(e)}")

@app.on_event("startup")
async def startup():
    asyncio.create_task(watchdog())

@app.get("/health")
async def health():
    return {
        "status": "ok", 
        "gpu": torch.cuda.is_available(),
        "vram_used": f"{torch.cuda.memory_allocated() / 1e9:.2f} GB" if torch.cuda.is_available() else "0"
    }

@app.post("/generate")
async def generate(req: VideoRequest):
    touch()
    async with gpu_lock:
        try:
            logger.info(f"Generating video for prompt: {req.prompt[:50]}...")
            filename = f"{uuid.uuid4()}.mp4"
            filepath = os.path.join(OUTPUT_DIR, filename)

            # Mark as started
            update_db_progress(req.video_id, 5, req.supabase_url, req.supabase_key)

            # Move blocking inference to a thread to keep FastAPI alive
            def do_inference():
                pipeline = get_wan()
                
                def progress_callback(pipe, step, timestep, callback_kwargs):
                    num_steps = 30
                    current_progress = int((step / num_steps) * 80) + 10 # Scale 10% to 90%
                    update_db_progress(req.video_id, current_progress, req.supabase_url, req.supabase_key)
                    return callback_kwargs

                # Run Wan 2.1 Generation
                result = pipeline(
                    req.prompt, 
                    num_frames=81, 
                    height=832, 
                    width=480, 
                    num_inference_steps=30,
                    callback_on_step_end=progress_callback
                ).frames[0]
                
                update_db_progress(req.video_id, 95, req.supabase_url, req.supabase_key)
                
                import imageio
                imageio.mimwrite(filepath, [np.array(f) for f in result], fps=24, quality=8)
                return f"/outputs/{filename}"

            url = await asyncio.to_thread(do_inference)
            update_db_progress(req.video_id, 100, req.supabase_url, req.supabase_key)
            logger.info(f"Generation successful: {url}")
            return {"status": "completed", "video_url": url}
        except Exception as e:
            logger.error(f"Generation failed: {str(e)}")
            raise HTTPException(500, detail=f"Generation Engine Error: {str(e)}")

@app.post("/voice")
async def voice(req: VoiceRequest):
    touch()
    # TTS is lighter but still should use the lock to avoid VRAM spikes if video is running
    async with gpu_lock:
        try:
            logger.info(f"Generating voice for: {req.text[:50]}...")
            filename = f"{uuid.uuid4()}.wav"
            filepath = os.path.join(OUTPUT_DIR, filename)

            def do_tts():
                pipeline = get_kokoro()
                generator = pipeline(req.text, voice=req.voice, speed=1, split_pattern=r"\n+")
                chunks = [a for _, _, a in generator]
                if not chunks:
                    return None
                
                import soundfile as sf
                audio = np.concatenate(chunks)
                sf.write(filepath, audio, 24000)
                return f"/outputs/{filename}"

            url = await asyncio.to_thread(do_tts)
            if not url:
                raise ValueError("No audio was generated from text.")
                
            logger.info(f"Voice generation successful: {url}")
            return {"status": "completed", "audio_url": url}
        except Exception as e:
            logger.error(f"Voice generation failed: {str(e)}")
            raise HTTPException(500, detail=f"Voice Engine Error: {str(e)}")


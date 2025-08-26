# backend/resume_ai.py

import os, io, json
from groq import Groq
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import pdfplumber

resume_ai_bp = Blueprint("resume_ai", __name__)
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

MODEL = "llama-3.3-70b-versatile"  # fast + high quality on Groq
MAX_CHARS = 120_000  # keep input sane

SYSTEM_INSTRUCTIONS = """You are a career mentor for software/tech roles.
Given a candidate's resume text (which may be messy), analyze and return ONLY valid JSON:
{
  "headline": "one-sentence profile",
  "core_strengths": [..],
  "skill_gaps": {
    "foundations": [..],
    "frameworks": [..],
    "tools": [..],
    "data_ai": [..],
    "soft_skills": [..]
  },
  "priority_learning_path": [
    {"topic":"", "why_it_matters":"", "starter_resources":[{"title":"", "type":"course|doc|repo", "url":""}]}
  ],
  "project_ideas": [{"title":"", "description":"", "skills":[".."]}],
  "role_fit": [{"role":"", "fit_reason":"", "confidence": 0-100}],
  "next_30_days": [{"task":"", "measure_of_success":""}]
}
Keep it actionable, India-friendly where relevant (e.g., common stacks, free courses).
If job_description is provided, tailor gaps to it.
"""

def _pdf_to_text(file_stream) -> str:
    text_chunks = []
    with pdfplumber.open(file_stream) as pdf:
        for p in pdf.pages:
            t = p.extract_text() or ""
            if t.strip():
                text_chunks.append(t)
    text = "\n\n".join(text_chunks)
    return text[:MAX_CHARS]

# NOTE: Do NOT prefix with /api here. app.py mounts url_prefix="/api"
@resume_ai_bp.route("/resume/analyze", methods=["POST"])
def analyze_resume():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    f = request.files["file"]
    filename = secure_filename(f.filename or "resume.pdf")
    if not filename.lower().endswith(".pdf"):
        return jsonify({"error": "Please upload a PDF"}), 400

    target_role = request.form.get("target_role", "").strip()
    job_desc = request.form.get("job_description", "").strip()

    resume_text = _pdf_to_text(io.BytesIO(f.read()))
    if not resume_text:
        return jsonify({"error": "Could not read text. If this is a scanned PDF, run OCR first."}), 400

    user_payload = {
        "resume_text": resume_text,
        "target_role": target_role,
        "job_description": job_desc
    }

    completion = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_INSTRUCTIONS},
            {"role": "user", "content": json.dumps(user_payload)}
        ],
        response_format={"type": "json_object"}  # force clean JSON
    )

    data = completion.choices[0].message.content
    try:
        parsed = json.loads(data)
    except Exception:
        parsed = {"headline": "Resume analysis", "raw": data}

    return jsonify({
        "analysis": parsed,
        "resume_snippet": resume_text[:4000],  # small context for quick follow-ups
    })

# NOTE: Do NOT prefix with /api here. app.py mounts url_prefix="/api"
@resume_ai_bp.route("/resume/chat", methods=["POST"])
def chat_about_resume():
    try:
        body = request.get_json(force=True)
        message = body.get("message", "")
        analysis = body.get("analysis", {})
        resume_snippet = body.get("resume_snippet", "")

        prompt = (
            "Resume snippet:\n"
            f"{resume_snippet}\n\n"
            "Current analysis (JSON):\n"
            f"{json.dumps(analysis)}\n\n"
            "User question:\n"
            f"{message}"
        )

        completion = client.chat.completions.create(
            model=MODEL,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a concise career mentor. "
                        "Reply **only** in clean Markdown with:\n"
                        "### Headline\n"
                        "- 1 sentence\n\n"
                        "### Top Focus Areas (1–3)\n"
                        "- Bullet points; bold the skill name; 1 actionable step each\n\n"
                        "### Starter Resources\n"
                        "- Use Markdown links; 2–4 items max\n\n"
                        "### 30-Day Plan\n"
                        "1. Week 1 …\n2. Week 2 …\n3. Week 3 …\n4. Week 4 …\n\n"
                        "Prefer India-friendly/free options. Keep total under 180 lines."
                    )
                },
                {"role": "user", "content": prompt}
            ]
        )
        return jsonify({"reply": completion.choices[0].message.content})
    except Exception as e:
        return jsonify({"error": "chat_failed", "detail": str(e)}), 500

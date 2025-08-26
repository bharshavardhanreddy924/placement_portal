// src/pages/ResumeCoach.jsx
import React, { useState, useRef } from "react";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Heuristics to move misclassified items from soft_skills → tools */
const HARD_SKILL_KEYWORDS = [
  "git", "agile", "scrum", "kanban", "docker", "kubernetes",
  "pytest", "junit", "linux", "shell", "ci", "cd", "jenkins",
  "github", "gitlab", "jira", "postman"
];

function normalizeGaps(gaps = {}) {
  const out = { foundations: [], frameworks: [], tools: [], data_ai: [], soft_skills: [] };
  for (const key of Object.keys(out)) out[key] = Array.isArray(gaps[key]) ? [...gaps[key]] : [];

  // Move obviously technical/process items out of soft_skills into tools
  out.soft_skills = out.soft_skills.filter(item => {
    const hit = HARD_SKILL_KEYWORDS.some(k => item.toLowerCase().includes(k));
    if (hit) out.tools.push(item);
    return !hit;
  });
  return out;
}

export default function ResumeCoach() {
  const [analysis, setAnalysis] = useState(null);
  const [resumeSnippet, setResumeSnippet] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const handleAnalyze = async (e) => {
    e.preventDefault();
    const file = fileRef.current.files?.[0];
    if (!file) return toast.error("Choose a PDF resume");
    if (file.type !== "application/pdf") return toast.error("Only PDF files are supported");
    if (file.size > 10 * 1024 * 1024) return toast.error("PDF is too large (max 10MB)");

    const form = new FormData();
    form.append("file", file);
    form.append("target_role", e.target.target_role.value);
    form.append("job_description", e.target.job_description.value);

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/resume/analyze", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error || "Failed to analyze");
        return;
      }

      const normalized = {
        ...data.analysis,
        skill_gaps: normalizeGaps(data.analysis?.skill_gaps)
      };
      setAnalysis(normalized);
      setResumeSnippet(data.resume_snippet);
      setMessages([
        {
          role: "assistant",
          content:
            "Analysis ready. Ask for resources, project ideas, or paste a JD to tailor further."
        }
      ]);
      toast.success("Resume analyzed");
    } catch (err) {
      toast.error("Network or server error");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg = { role: "user", content: trimmed };
    setMessages((m) => [...m, userMsg]);

    try {
      const res = await fetch("http://localhost:5000/api/resume/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, analysis, resume_snippet: resumeSnippet })
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.detail || "Chat failed");
        return;
      }
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch {
      toast.error("Chat failed");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Resume Coach (Groq)</h1>

      {/* Upload + Analyze */}
      <form onSubmit={handleAnalyze} className="bg-white rounded-2xl shadow p-4 space-y-3">
        <input ref={fileRef} type="file" accept="application/pdf" className="block w-full" />
        <input
          name="target_role"
          placeholder="Target role (e.g., Frontend Engineer)"
          className="w-full p-2 border rounded"
        />
        <textarea
          name="job_description"
          placeholder="Paste JD (optional) for tailored gaps"
          className="w-full p-2 border rounded"
          rows={4}
        />
        <button disabled={loading} className="px-4 py-2 rounded bg-black text-white">
          {loading ? "Analyzing..." : "Analyze Resume"}
        </button>
      </form>

      {/* Analysis Panel */}
      {analysis && (
        <div className="bg-white rounded-2xl shadow p-4 space-y-6">
          {/* Headline */}
          {analysis.headline && (
            <div>
              <h2 className="text-xl font-semibold">Profile</h2>
              <p className="text-slate-700 mt-1">{analysis.headline}</p>
            </div>
          )}

          {/* Core strengths */}
          {Array.isArray(analysis.core_strengths) && analysis.core_strengths.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold">Core strengths</h2>
              <div className="flex flex-wrap gap-2 mt-2">
                {analysis.core_strengths.map((s, i) => (
                  <span key={i} className="text-sm bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Skill gaps */}
          <div>
            <h2 className="text-xl font-semibold">What you’re missing</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
              {Object.entries(analysis.skill_gaps || {}).map(([section, items]) => (
                <div key={section} className="border rounded-xl p-3">
                  <div className="font-medium capitalize mb-2">
                    {section.replace("_", " ")}
                  </div>
                  {items?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {items.map((x, i) => (
                        <span key={i} className="text-sm bg-slate-100 px-2 py-1 rounded-lg">
                          {x}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-slate-500">Looks good here.</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 30-day plan */}
          {analysis.next_30_days?.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold">30-day plan</h3>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                {analysis.next_30_days.map((t, i) => (
                  <li key={i}>
                    {t.task} — <span className="text-gray-600">{t.measure_of_success}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Priority learning path + resources */}
          {analysis.priority_learning_path?.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold">Priority learning path</h3>
              <div className="mt-2 space-y-3">
                {analysis.priority_learning_path.map((step, i) => (
                  <div key={i} className="border rounded-xl p-3">
                    <div className="font-medium">{step.topic}</div>
                    {step.why_it_matters && (
                      <div className="text-sm text-slate-600 mt-1">{step.why_it_matters}</div>
                    )}
                    {step.starter_resources?.length ? (
                      <ul className="list-disc pl-5 mt-2">
                        {step.starter_resources.map((r, j) => (
                          <li key={j} className="text-sm">
                            {r.url ? (
                              <a href={r.url} target="_blank" rel="noreferrer" className="underline">
                                {r.title || r.url}
                              </a>
                            ) : (
                              <span>{r.title}</span>
                            )}
                            {r.type ? (
                              <span className="ml-2 text-slate-500">({r.type})</span>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Role fit */}
          {analysis.role_fit?.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold">Role fit</h3>
              <div className="grid sm:grid-cols-2 gap-3 mt-2">
                {analysis.role_fit.map((r, i) => (
                  <div key={i} className="border rounded-xl p-3">
                    <div className="font-medium">{r.role}</div>
                    {r.fit_reason && (
                      <div className="text-sm text-slate-600 mt-1">{r.fit_reason}</div>
                    )}
                    {"confidence" in r && (
                      <div className="text-sm mt-1">Confidence: {r.confidence}%</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Project ideas */}
          {analysis.project_ideas?.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold">Project ideas</h3>
              <div className="grid sm:grid-cols-2 gap-3 mt-2">
                {analysis.project_ideas.map((p, i) => (
                  <div key={i} className="border rounded-xl p-3">
                    <div className="font-medium">{p.title}</div>
                    {p.description && (
                      <div className="text-sm text-slate-600 mt-1">{p.description}</div>
                    )}
                    {p.skills?.length ? (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {p.skills.map((s, j) => (
                          <span
                            key={j}
                            className="text-xs bg-slate-100 px-2 py-1 rounded-lg"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick chat suggestions + Chat */}
      {analysis && (
        <div className="bg-white rounded-2xl shadow p-4">
          <div className="flex flex-wrap gap-2 mb-3">
            {[
              "Give me a week-by-week plan for the top 3 gaps.",
              "Suggest 2 free courses and 1 hands-on project for each gap.",
              "Tailor this plan for a React SDE role with system design basics.",
              "Create interview prep checkpoints for the next 30 days."
            ].map((q, i) => (
              <button
                key={i}
                onClick={() => sendMessage(q)}
                className="text-sm px-3 py-1 rounded bg-slate-100 hover:bg-slate-200"
              >
                {q}
              </button>
            ))}
          </div>

          <ChatBox messages={messages} onSend={sendMessage} />
        </div>
      )}
    </div>
  );
}

function ChatBox({ messages, onSend }) {
  const [text, setText] = useState("");

  return (
    <div>
      <div className="h-64 overflow-auto space-y-3 border rounded-xl p-3">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            <div
              className={
                "inline-block px-3 py-2 rounded max-w-[80ch] whitespace-pre-wrap " +
                (m.role === "user" ? "bg-blue-100" : "bg-gray-100")
              }
            >
              {m.role === "assistant" ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {m.content}
                </ReactMarkdown>
              ) : (
                m.content
              )}
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (text.trim()) {
            onSend(text.trim());
            setText("");
          }
        }}
        className="mt-3 flex gap-2"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 border rounded p-2"
          placeholder="Ask for resources, project ideas, or role mapping…"
        />
        <button className="px-4 py-2 rounded bg-black text-white">Send</button>
      </form>
    </div>
  );
}

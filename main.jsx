import React, { useState, useEffect, useRef } from "react";
import {
  BookOpen, Calculator, Atom, Leaf, Globe, Rocket, PenTool, Code, FlaskConical,
  TrendingUp, Landmark, Dna, Feather, Sparkles, Star, Trophy, Flame, MessageCircle,
  Home, LogOut, Lock, Check, Send, User, Mail, GraduationCap, ChevronRight,
  Loader2, Award, RotateCcw
} from "lucide-react";
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";

/* ---------------------------------- THEME ---------------------------------- */
const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');
`;
const C = {
  bg: "#0F0F28",
  bgSoft: "#171736",
  panel: "#1D1D45",
  panel2: "#252557",
  line: "#33336B",
  cream: "#F4EFE4",
  dim: "#A6A3C9",
  gold: "#FFD873",
  lavender: "#B49AFF",
  green: "#6EE7B7",
  coral: "#FF8C7A",
  sky: "#7DD3FC",
};

/* ---------------------------------- DATA ---------------------------------- */
const LEAGUES = [
  { name: "New Moon", min: 0, color: C.dim, emoji: "🌑" },
  { name: "Waxing Crescent", min: 50, color: C.lavender, emoji: "🌒" },
  { name: "Half Moon", min: 150, color: C.sky, emoji: "🌓" },
  { name: "Waxing Gibbous", min: 350, color: C.green, emoji: "🌔" },
  { name: "Full Moon", min: 700, color: C.gold, emoji: "🌕" },
  { name: "Supermoon", min: 1500, color: C.coral, emoji: "✨" },
];
function getLeague(xp) {
  let l = LEAGUES[0];
  for (const league of LEAGUES) if (xp >= league.min) l = league;
  return l;
}
function nextLeague(xp) {
  const idx = LEAGUES.findIndex((l) => l.min > xp);
  return idx === -1 ? null : LEAGUES[idx];
}
function gradeBand(grade) {
  const g = parseInt(grade, 10);
  if (g <= 5) return "elementary";
  if (g <= 8) return "middle";
  return "high";
}
const TOPICS = {
  elementary: [
    { id: "e1", title: "Addition & Subtraction", subject: "Math", icon: Calculator },
    { id: "e2", title: "Multiplication Basics", subject: "Math", icon: Calculator },
    { id: "e3", title: "Fractions Fun", subject: "Math", icon: PenTool },
    { id: "e4", title: "Shapes & Geometry", subject: "Math", icon: Atom },
    { id: "e5", title: "Reading Comprehension", subject: "English", icon: BookOpen },
    { id: "e6", title: "Grammar Basics", subject: "English", icon: Feather },
    { id: "e7", title: "States of Matter", subject: "Science", icon: FlaskConical },
    { id: "e8", title: "Plants & Animals", subject: "Science", icon: Leaf },
    { id: "e9", title: "The Solar System", subject: "Science", icon: Rocket },
    { id: "e10", title: "Coding Logic", subject: "Tech", icon: Code },
  ],
  middle: [
    { id: "m1", title: "Pre-Algebra", subject: "Math", icon: Calculator },
    { id: "m2", title: "Ratios & Proportions", subject: "Math", icon: TrendingUp },
    { id: "m3", title: "Geometry Basics", subject: "Math", icon: Atom },
    { id: "m4", title: "Essay Writing", subject: "English", icon: PenTool },
    { id: "m5", title: "Grammar & Vocabulary", subject: "English", icon: Feather },
    { id: "m6", title: "Cell Biology", subject: "Science", icon: Dna },
    { id: "m7", title: "Chemistry Basics", subject: "Science", icon: FlaskConical },
    { id: "m8", title: "Earth Science", subject: "Science", icon: Globe },
    { id: "m9", title: "World History Intro", subject: "History", icon: Landmark },
    { id: "m10", title: "Intro to Programming", subject: "Tech", icon: Code },
  ],
  high: [
    { id: "h1", title: "Algebra II", subject: "Math", icon: Calculator },
    { id: "h2", title: "Geometry & Trig", subject: "Math", icon: Atom },
    { id: "h3", title: "Statistics & Probability", subject: "Math", icon: TrendingUp },
    { id: "h4", title: "Rhetoric & Essays", subject: "English", icon: PenTool },
    { id: "h5", title: "Literature Analysis", subject: "English", icon: BookOpen },
    { id: "h6", title: "Biology", subject: "Science", icon: Dna },
    { id: "h7", title: "Chemistry", subject: "Science", icon: FlaskConical },
    { id: "h8", title: "Physics", subject: "Science", icon: Atom },
    { id: "h9", title: "World History", subject: "History", icon: Landmark },
    { id: "h10", title: "Computer Science", subject: "Tech", icon: Code },
  ],
};
const todayStr = () => new Date().toISOString().slice(0, 10);

/* ------------------------------- API HELPER -------------------------------- */
async function callClaude(messages, system) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": "Bearer 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"
    },
    body: JSON.stringify({ 
      model: "mixtral-8x7b-32768", 
      max_tokens: 1000, 
      messages: [
        { role: "system", content: system },
        ...messages
      ]
    }),
  });
  const data = await res.json();
  return (data.choices || []).map((c) => c.message?.content || "").join("\n");
}
function parseJsonLoose(text) {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("[") === -1 ? cleaned.indexOf("{") : cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]") === -1 ? cleaned.lastIndexOf("}") : cleaned.lastIndexOf("]");
  const slice = start !== -1 && end !== -1 ? cleaned.slice(start, end + 1) : cleaned;
  return JSON.parse(slice);
}

/* -------------------------------- MASCOT ----------------------------------- */
function Luna({ size = 96, mood = "happy", glow = C.gold }) {
  const eyes = {
    happy: <><circle cx="38" cy="52" r="4" fill="#2B2B4A" /><circle cx="62" cy="52" r="4" fill="#2B2B4A" /></>,
    excited: <><circle cx="38" cy="50" r="5" fill="#2B2B4A" /><circle cx="62" cy="50" r="5" fill="#2B2B4A" /></>,
    thinking: <><rect x="34" y="50" width="8" height="3" rx="1.5" fill="#2B2B4A" /><rect x="58" y="50" width="8" height="3" rx="1.5" fill="#2B2B4A" /></>,
    sleepy: <><path d="M33 52 q5 4 10 0" stroke="#2B2B4A" strokeWidth="3" fill="none" strokeLinecap="round" /><path d="M57 52 q5 4 10 0" stroke="#2B2B4A" strokeWidth="3" fill="none" strokeLinecap="round" /></>,
  };
  const mouth = {
    happy: <path d="M40 64 q10 10 20 0" stroke="#2B2B4A" strokeWidth="3.5" fill="none" strokeLinecap="round" />,
    excited: <ellipse cx="50" cy="66" rx="9" ry="7" fill="#2B2B4A" />,
    thinking: <path d="M42 66 q8 -3 16 0" stroke="#2B2B4A" strokeWidth="3.5" fill="none" strokeLinecap="round" />,
    sleepy: <path d="M43 66 q7 3 14 0" stroke="#2B2B4A" strokeWidth="3" fill="none" strokeLinecap="round" />,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <radialGradient id="lunaGlow" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor={glow} stopOpacity="0.55" />
          <stop offset="100%" stopColor={glow} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="lunaBody" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFF6DE" />
          <stop offset="100%" stopColor={glow} />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#lunaGlow)" />
      <circle cx="50" cy="50" r="34" fill="url(#lunaBody)" />
      <circle cx="30" cy="34" r="4" fill="#FFF6DE" opacity="0.5" />
      <circle cx="68" cy="30" r="2.5" fill="#FFF6DE" opacity="0.5" />
      <circle cx="70" cy="60" r="3" fill="#FFF6DE" opacity="0.4" />
      {eyes[mood]}
      {mouth[mood]}
      <ellipse cx="30" cy="60" rx="5" ry="3" fill="#FF9E9E" opacity="0.5" />
      <ellipse cx="70" cy="60" rx="5" ry="3" fill="#FF9E9E" opacity="0.5" />
    </svg>
  );
}

/* --------------------------------- STORAGE ---------------------------------- */
async function loadProfile(email) {
  try {
    const r = await window.storage.get(`profile:${email}`, false);
    return r ? JSON.parse(r.value) : null;
  } catch (e) {
    return null;
  }
}
async function saveProfile(profile) {
  try {
    await window.storage.set(`profile:${profile.email}`, JSON.stringify(profile), false);
    await window.storage.set(
      `leaderboard:${profile.email}`,
      JSON.stringify({ name: profile.name, xp: profile.xp, grade: profile.grade }),
      true
    );
  } catch (e) {
    console.error("save failed", e);
  }
}
async function loadLeaderboard() {
  try {
    const listRes = await window.storage.list("leaderboard:", true);
    const keys = listRes?.keys || [];
    const entries = await Promise.all(
      keys.map(async (k) => {
        try {
          const r = await window.storage.get(k, true);
          return r ? { email: k.replace("leaderboard:", ""), ...JSON.parse(r.value) } : null;
        } catch {
          return null;
        }
      })
    );
    return entries.filter(Boolean).sort((a, b) => b.xp - a.xp);
  } catch (e) {
    return [];
  }
}

/* ---------------------------------- SHARED UI -------------------------------- */
function Btn({ children, onClick, variant = "primary", disabled, style, type = "button" }) {
  const base = {
    fontFamily: "Fredoka, sans-serif",
    fontWeight: 600,
    fontSize: 15,
    padding: "12px 22px",
    borderRadius: 14,
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    transition: "transform .12s ease, filter .12s ease",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  };
  const variants = {
    primary: { background: C.gold, color: "#2B2210", boxShadow: "0 4px 0 #C9A84E" },
    ghost: { background: "transparent", color: C.cream, border: `2px solid ${C.line}` },
    lavender: { background: C.lavender, color: "#241B4A", boxShadow: "0 4px 0 #8368D6" },
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseDown={(e) => !disabled && (e.currentTarget.style.transform = "translateY(2px)")}
      onMouseUp={(e) => !disabled && (e.currentTarget.style.transform = "translateY(0)")}
      style={{ ...base, ...variants[variant], ...style }}
    >
      {children}
    </button>
  );
}

/* ---------------------------------- LOGIN ------------------------------------ */
function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("6");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!email.includes("@") || !name.trim()) {
      setError("Enter a valid email and your name to continue.");
      return;
    }
    setError("");
    setBusy(true);
    let profile = await loadProfile(email.trim().toLowerCase());
    if (!profile) {
      profile = {
        email: email.trim().toLowerCase(),
        name: name.trim(),
        grade,
        xp: 0,
        streak: 0,
        lastActive: null,
        completedTopics: [],
        xpHistory: {},
        tutorXpDate: null,
      };
      await saveProfile(profile);
    }
    setBusy(false);
    onLogin(profile);
  };

  return (
    <div style={{ minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 400, textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
          <Luna size={110} mood="excited" />
        </div>
        <h1 style={{ fontFamily: "Fredoka, sans-serif", fontSize: 30, color: C.cream, margin: "8px 0 2px" }}>
          EduBot AI
        </h1>
        <p style={{ color: C.dim, fontFamily: "Inter, sans-serif", fontSize: 14, marginBottom: 26 }}>
          Learn a little every day with Luna, your AI moon tutor 🌙
        </p>

        <div style={{ background: C.panel, borderRadius: 20, padding: 24, border: `1px solid ${C.line}`, textAlign: "left" }}>
          <Field icon={<User size={16} />} label="Your name">
            <input style={inputStyle} placeholder="e.g. Amina" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field icon={<Mail size={16} />} label="Email address">
            <input style={inputStyle} placeholder="you@school.edu" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field icon={<GraduationCap size={16} />} label="Grade">
            <select style={inputStyle} value={grade} onChange={(e) => setGrade(e.target.value)}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((g) => (
                <option key={g} value={g}>Grade {g}</option>
              ))}
            </select>
          </Field>
          {error && <p style={{ color: C.coral, fontSize: 13, fontFamily: "Inter, sans-serif", marginTop: -6 }}>{error}</p>}
          <Btn onClick={submit} disabled={busy} style={{ width: "100%", marginTop: 6, justifyContent: "center" }}>
            {busy ? <Loader2 size={18} className="spin" /> : <>Continue <ChevronRight size={16} /></>}
          </Btn>
        </div>
        <p style={{ color: C.dim, fontSize: 11, fontFamily: "Inter, sans-serif", marginTop: 16, lineHeight: 1.5 }}>
          Your name and XP appear on the shared class leaderboard.<br />No password needed — this demo login is keyed by email.
        </p>
      </div>
    </div>
  );
}
function Field({ icon, label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "flex", alignItems: "center", gap: 6, color: C.dim, fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.4 }}>
        {icon}{label}
      </label>
      {children}
    </div>
  );
}
const inputStyle = {
  width: "100%",
  background: C.bgSoft,
  border: `1.5px solid ${C.line}`,
  borderRadius: 10,
  padding: "10px 12px",
  color: C.cream,
  fontFamily: "Inter, sans-serif",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
};

/* --------------------------------- NAVBAR ------------------------------------ */
function NavBar({ screen, setScreen, profile, onLogout }) {
  const league = getLeague(profile.xp);
  const items = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "lessons", label: "Lessons", icon: BookOpen },
    { id: "tutor", label: "Ask Luna", icon: MessageCircle },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy },
  ];
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderBottom: `1px solid ${C.line}`, flexWrap: "wrap", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Luna size={36} mood="happy" glow={league.color} />
        <span style={{ fontFamily: "Fredoka, sans-serif", color: C.cream, fontSize: 18, fontWeight: 600 }}>EduBot AI</span>
      </div>
      <div style={{ display: "flex", gap: 6, background: C.bgSoft, padding: 5, borderRadius: 14 }}>
        {items.map((it) => {
          const Icon = it.icon;
          const active = screen === it.id;
          return (
            <button key={it.id} onClick={() => setScreen(it.id)} style={{
              display: "flex", alignItems: "center", gap: 6, border: "none", cursor: "pointer",
              padding: "8px 14px", borderRadius: 10, fontFamily: "Fredoka, sans-serif", fontSize: 13.5, fontWeight: 600,
              background: active ? C.panel2 : "transparent", color: active ? C.gold : C.dim,
            }}>
              <Icon size={16} /> {it.label}
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <Stat icon={<Flame size={16} color={C.coral} />} value={profile.streak} />
        <Stat icon={<Star size={16} color={C.gold} />} value={profile.xp} />
        <span title={league.name} style={{ fontSize: 20 }}>{league.emoji}</span>
        <button onClick={onLogout} title="Log out" style={{ background: "transparent", border: "none", cursor: "pointer", color: C.dim }}>
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
}
function Stat({ icon, value }) {
  return <span style={{ display: "flex", alignItems: "center", gap: 4, color: C.cream, fontFamily: "Fredoka, sans-serif", fontSize: 14, fontWeight: 600 }}>{icon}{value}</span>;
}

/* -------------------------------- DASHBOARD ----------------------------------- */
function Dashboard({ profile, setScreen }) {
  const league = getLeague(profile.xp);
  const nxt = nextLeague(profile.xp);
  const band = gradeBand(profile.grade);
  const total = TOPICS[band].length;
  const done = profile.completedTopics.length;
  const pct = Math.round((done / total) * 100);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    return { day: d.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 2), xp: profile.xpHistory[key] || 0 };
  });

  return (
    <div style={{ padding: 24, maxWidth: 980, margin: "0 auto" }}>
      <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
        <Card style={{ flex: "1 1 320px", display: "flex", alignItems: "center", gap: 18 }}>
          <Luna size={80} mood={profile.streak > 0 ? "happy" : "sleepy"} glow={league.color} />
          <div>
            <h2 style={{ fontFamily: "Fredoka, sans-serif", color: C.cream, margin: 0, fontSize: 22 }}>Hi, {profile.name.split(" ")[0]}! 👋</h2>
            <p style={{ color: C.dim, fontFamily: "Inter, sans-serif", fontSize: 13, margin: "4px 0 10px" }}>Grade {profile.grade} · {league.emoji} {league.name}</p>
            {nxt ? (
              <p style={{ color: C.dim, fontFamily: "Inter, sans-serif", fontSize: 12.5, margin: 0 }}>
                {nxt.min - profile.xp} XP to reach <span style={{ color: nxt.color, fontWeight: 700 }}>{nxt.name}</span>
              </p>
            ) : (
              <p style={{ color: C.gold, fontFamily: "Inter, sans-serif", fontSize: 12.5, margin: 0 }}>Top league reached! ✨</p>
            )}
          </div>
        </Card>

        <Card style={{ flex: "1 1 200px" }}>
          <MiniStat icon={<Star size={18} color={C.gold} />} label="Total XP" value={profile.xp} />
          <MiniStat icon={<Flame size={18} color={C.coral} />} label="Day streak" value={profile.streak} />
          <MiniStat icon={<Award size={18} color={C.green} />} label="Lessons done" value={`${done}/${total}`} />
        </Card>
      </div>

      <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginTop: 18 }}>
        <Card style={{ flex: "2 1 420px" }}>
          <CardTitle>This week's XP</CardTitle>
          <div style={{ height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={days}>
                <XAxis dataKey="day" stroke={C.dim} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 8, color: C.cream, fontFamily: "Inter, sans-serif", fontSize: 12 }} labelStyle={{ color: C.dim }} />
                <Bar dataKey="xp" radius={[6, 6, 0, 0]}>
                  {days.map((d, i) => <Cell key={i} fill={i === 6 ? C.gold : C.lavender} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card style={{ flex: "1 1 260px" }}>
          <CardTitle>Path progress</CardTitle>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 10 }}>
            <RingProgress pct={pct} />
            <div>
              <p style={{ color: C.cream, fontFamily: "Fredoka, sans-serif", fontSize: 20, margin: 0 }}>{pct}%</p>
              <p style={{ color: C.dim, fontFamily: "Inter, sans-serif", fontSize: 12, margin: "2px 0 0" }}>{done} of {total} lessons</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <Btn variant="lavender" onClick={() => setScreen("lessons")} style={{ flex: 1, justifyContent: "center", fontSize: 13, padding: "10px 8px" }}>Continue path</Btn>
            <Btn variant="ghost" onClick={() => setScreen("tutor")} style={{ flex: 1, justifyContent: "center", fontSize: 13, padding: "10px 8px" }}>Ask Luna</Btn>
          </div>
        </Card>
      </div>
    </div>
  );
}
function Card({ children, style }) {
  return <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 18, padding: 20, ...style }}>{children}</div>;
}
function CardTitle({ children }) {
  return <h3 style={{ fontFamily: "Fredoka, sans-serif", color: C.cream, fontSize: 15, margin: 0 }}>{children}</h3>;
}
function MiniStat({ icon, label, value }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0" }}>
      {icon}
      <span style={{ color: C.dim, fontFamily: "Inter, sans-serif", fontSize: 13, flex: 1 }}>{label}</span>
      <span style={{ color: C.cream, fontFamily: "Fredoka, sans-serif", fontWeight: 600, fontSize: 15 }}>{value}</span>
    </div>
  );
}
function RingProgress({ pct }) {
  const r = 32, c = 2 * Math.PI * r;
  return (
    <svg width="80" height="80" viewBox="0 0 80 80">
      <circle cx="40" cy="40" r={r} fill="none" stroke={C.bgSoft} strokeWidth="9" />
      <circle cx="40" cy="40" r={r} fill="none" stroke={C.gold} strokeWidth="9" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c - (c * pct) / 100} transform="rotate(-90 40 40)" />
    </svg>
  );
}

/* -------------------------------- LESSON MAP ----------------------------------- */
function LessonMap({ profile, onOpenTopic }) {
  const band = gradeBand(profile.grade);
  const topics = TOPICS[band];
  return (
    <div style={{ padding: "24px 24px 60px", maxWidth: 560, margin: "0 auto" }}>
      <h2 style={{ fontFamily: "Fredoka, sans-serif", color: C.cream, textAlign: "center", marginBottom: 4 }}>Your Learning Path</h2>
      <p style={{ color: C.dim, fontFamily: "Inter, sans-serif", fontSize: 13, textAlign: "center", marginBottom: 30 }}>
        Grade {profile.grade} · {band === "elementary" ? "Elementary" : band === "middle" ? "Middle School" : "High School"}
      </p>
      <div style={{ position: "relative" }}>
        {topics.map((t, i) => {
          const isDone = profile.completedTopics.includes(t.id);
          const isLocked = i > 0 && !profile.completedTopics.includes(topics[i - 1].id);
          const isCurrent = !isDone && !isLocked;
          const align = i % 2 === 0 ? "flex-start" : "flex-end";
          const Icon = t.icon;
          return (
            <div key={t.id} style={{ display: "flex", justifyContent: align, margin: "6px 0" }}>
              <div style={{ display: "flex", flexDirection: i % 2 === 0 ? "row" : "row-reverse", alignItems: "center", gap: 12, width: "70%" }}>
                <button
                  onClick={() => !isLocked && onOpenTopic(t)}
                  disabled={isLocked}
                  style={{
                    width: 66, height: 66, borderRadius: "50%", border: "none", flexShrink: 0,
                    cursor: isLocked ? "not-allowed" : "pointer",
                    background: isDone ? C.gold : isCurrent ? C.lavender : C.bgSoft,
                    boxShadow: isCurrent ? `0 0 0 6px ${C.panel2}` : "none",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: isDone ? "#2B2210" : isCurrent ? "#241B4A" : C.dim,
                  }}
                >
                  {isLocked ? <Lock size={22} /> : isDone ? <Check size={26} /> : <Icon size={26} />}
                </button>
                <div>
                  <p style={{ color: isLocked ? C.dim : C.cream, fontFamily: "Fredoka, sans-serif", fontSize: 14.5, margin: 0, fontWeight: 600 }}>{t.title}</p>
                  <p style={{ color: C.dim, fontFamily: "Inter, sans-serif", fontSize: 11.5, margin: "2px 0 0" }}>{t.subject}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------- QUIZ --------------------------------------- */
function Quiz({ topic, profile, onFinish, onClose }) {
  const [stage, setStage] = useState("loading"); // loading | error | active | feedback
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  useEffect(() => { generate(); }, []);

  const generate = async () => {
    setStage("loading");
    try {
      const sys = `You are a quiz generator for an education app. Return ONLY raw JSON, no markdown fences, no preamble. Produce an array of exactly 5 multiple-choice questions for a grade ${profile.grade} student on the topic "${topic.title}" (${topic.subject}). Each item: {"question": string, "options": [4 strings], "correctIndex": integer 0-3, "explanation": string (one short sentence)}. Keep vocabulary and difficulty appropriate for grade ${profile.grade}.`;
      const text = await callClaude([{ role: "user", content: "Generate the quiz now." }], sys);
      const parsed = parseJsonLoose(text);
      if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("bad format");
      setQuestions(parsed);
      setStage("active");
      setIdx(0); setSelected(null); setAnswers([]);
    } catch (e) {
      setStage("error");
    }
  };

  const choose = (i) => { if (selected === null) setSelected(i); };
  const next = () => {
    const q = questions[idx];
    const correct = selected === q.correctIndex;
    const newAnswers = [...answers, { q: q.question, correct }];
    setAnswers(newAnswers);
    if (idx + 1 < questions.length) {
      setIdx(idx + 1); setSelected(null);
    } else {
      finish(newAnswers);
    }
  };

  const finish = async (finalAnswers) => {
    setStage("feedback");
    setFeedbackLoading(true);
    const correctCount = finalAnswers.filter((a) => a.correct).length;
    const xpEarned = correctCount * 10 + (correctCount === finalAnswers.length ? 20 : 0);
    try {
      const sys = `You are Luna, an encouraging AI moon mascot tutor for a grade ${profile.grade} student. Return ONLY raw JSON, no markdown fences: {"summary": string (2-3 warm encouraging sentences about their quiz performance, speaking directly to the student), "tips": [1-2 short actionable study tips as strings]}. Be specific to the topic "${topic.title}" and the fact they got ${correctCount} out of ${finalAnswers.length} correct. Keep tone age-appropriate and positive even if the score was low.`;
      const text = await callClaude([{ role: "user", content: "Give feedback now." }], sys);
      const parsed = parseJsonLoose(text);
      setFeedback(parsed);
    } catch (e) {
      setFeedback({ summary: `Nice work! You got ${correctCount} out of ${finalAnswers.length} correct on ${topic.title}.`, tips: ["Review the questions you missed and try again soon."] });
    }
    setFeedbackLoading(false);
    onFinish({ topicId: topic.id, xpEarned, correctCount, total: finalAnswers.length });
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(10,10,26,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 20 }}>
      <div style={{ background: C.panel, borderRadius: 22, padding: 28, width: "100%", maxWidth: 480, border: `1px solid ${C.line}`, maxHeight: "88vh", overflowY: "auto" }}>
        {stage === "loading" && (
          <div style={{ textAlign: "center", padding: "30px 0" }}>
            <Luna size={80} mood="thinking" />
            <p style={{ color: C.cream, fontFamily: "Fredoka, sans-serif", marginTop: 14 }}>Luna is writing your quiz…</p>
            <Loader2 size={22} className="spin" color={C.gold} style={{ marginTop: 8 }} />
          </div>
        )}
        {stage === "error" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <Luna size={70} mood="sleepy" />
            <p style={{ color: C.cream, fontFamily: "Inter, sans-serif", margin: "14px 0" }}>Hmm, the quiz didn't load. Let's try again.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <Btn onClick={generate}><RotateCcw size={16} /> Retry</Btn>
              <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
            </div>
          </div>
        )}
        {stage === "active" && questions[idx] && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ color: C.dim, fontFamily: "Inter, sans-serif", fontSize: 12 }}>Question {idx + 1} of {questions.length}</span>
              <button onClick={onClose} style={{ background: "transparent", border: "none", color: C.dim, cursor: "pointer", fontSize: 13 }}>Close</button>
            </div>
            <div style={{ height: 6, background: C.bgSoft, borderRadius: 4, marginBottom: 20, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${((idx + (selected !== null ? 1 : 0)) / questions.length) * 100}%`, background: C.gold, transition: "width .3s" }} />
            </div>
            <h3 style={{ color: C.cream, fontFamily: "Fredoka, sans-serif", fontSize: 18, marginBottom: 18 }}>{questions[idx].question}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {questions[idx].options.map((opt, i) => {
                const isCorrect = i === questions[idx].correctIndex;
                const isChosen = i === selected;
                let bg = C.bgSoft, border = C.line, color = C.cream;
                if (selected !== null) {
                  if (isCorrect) { bg = "rgba(110,231,183,0.15)"; border = C.green; color = C.green; }
                  else if (isChosen) { bg = "rgba(255,140,122,0.15)"; border = C.coral; color = C.coral; }
                }
                return (
                  <button key={i} onClick={() => choose(i)} style={{
                    textAlign: "left", padding: "12px 14px", borderRadius: 12, cursor: selected === null ? "pointer" : "default",
                    background: bg, border: `1.5px solid ${border}`, color, fontFamily: "Inter, sans-serif", fontSize: 14,
                  }}>{opt}</button>
                );
              })}
            </div>
            {selected !== null && (
              <div style={{ marginTop: 14 }}>
                <p style={{ color: C.dim, fontFamily: "Inter, sans-serif", fontSize: 12.5, fontStyle: "italic" }}>{questions[idx].explanation}</p>
                <Btn onClick={next} style={{ marginTop: 10, width: "100%", justifyContent: "center" }}>
                  {idx + 1 < questions.length ? "Next question" : "See results"} <ChevronRight size={16} />
                </Btn>
              </div>
            )}
          </div>
        )}
        {stage === "feedback" && (
          <div style={{ textAlign: "center" }}>
            <Luna size={90} mood="excited" />
            <h3 style={{ color: C.cream, fontFamily: "Fredoka, sans-serif", marginTop: 10 }}>
              {answers.filter((a) => a.correct).length}/{answers.length} correct
            </h3>
            {feedbackLoading ? (
              <div style={{ padding: "14px 0" }}><Loader2 size={20} className="spin" color={C.gold} /></div>
            ) : feedback && (
              <>
                <p style={{ color: C.cream, fontFamily: "Inter, sans-serif", fontSize: 14, lineHeight: 1.6, textAlign: "left", background: C.bgSoft, padding: 14, borderRadius: 12, marginTop: 14 }}>{feedback.summary}</p>
                {feedback.tips?.length > 0 && (
                  <ul style={{ textAlign: "left", color: C.dim, fontFamily: "Inter, sans-serif", fontSize: 13, paddingLeft: 20 }}>
                    {feedback.tips.map((t, i) => <li key={i} style={{ marginBottom: 4 }}>{t}</li>)}
                  </ul>
                )}
              </>
            )}
            <Btn onClick={onClose} style={{ marginTop: 16, width: "100%", justifyContent: "center" }}>Back to path</Btn>
          </div>
        )}
      </div>
    </div>
  );
}

/* --------------------------------- TUTOR ---------------------------------------- */
function Tutor({ profile, onXp }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: `Hi ${profile.name.split(" ")[0]}! I'm Luna 🌙 What would you like to learn about today?` },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    const sys = `You are Luna, a friendly moon-shaped AI tutor mascot inside an education app called EduBot AI. The student is in grade ${profile.grade}. Explain things simply, use encouraging language and occasional emoji, keep replies under 120 words, and prefer guiding questions over just giving away homework answers outright unless the student clearly wants a direct explanation.`;
    try {
      const apiMessages = newMessages.map((m) => ({ role: m.role, content: m.content }));
      const text = await callClaude(apiMessages, sys);
      setMessages([...newMessages, { role: "assistant", content: text || "Sorry, I lost my train of thought — could you ask again?" }]);
      const today = todayStr();
      if (profile.tutorXpDate !== today) onXp(5, { tutorXpDate: today });
    } catch (e) {
      setMessages([...newMessages, { role: "assistant", content: "I'm having trouble connecting right now. Try again in a moment!" }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 24, maxWidth: 680, margin: "0 auto", display: "flex", flexDirection: "column", height: "calc(100vh - 160px)", minHeight: 420 }}>
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, paddingRight: 4 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-end", flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
            {m.role === "assistant" && <Luna size={32} mood="happy" />}
            <div style={{
              maxWidth: "75%", padding: "10px 14px", borderRadius: 16,
              background: m.role === "user" ? C.lavender : C.panel,
              color: m.role === "user" ? "#241B4A" : C.cream,
              fontFamily: "Inter, sans-serif", fontSize: 14, lineHeight: 1.5,
              border: m.role === "assistant" ? `1px solid ${C.line}` : "none",
            }}>{m.content}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Luna size={32} mood="thinking" />
            <span style={{ color: C.dim, fontFamily: "Inter, sans-serif", fontSize: 13 }}>Luna is thinking…</span>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask Luna anything about your schoolwork…"
          style={{ ...inputStyle, flex: 1 }}
        />
        <Btn onClick={send} disabled={loading}><Send size={16} /></Btn>
      </div>
    </div>
  );
}

/* ------------------------------- LEADERBOARD ------------------------------------ */
function Leaderboard({ profile }) {
  const [entries, setEntries] = useState(null);
  useEffect(() => { loadLeaderboard().then(setEntries); }, [profile.xp]);

  return (
    <div style={{ padding: 24, maxWidth: 560, margin: "0 auto" }}>
      <h2 style={{ fontFamily: "Fredoka, sans-serif", color: C.cream, textAlign: "center", marginBottom: 4 }}>Class Leaderboard</h2>
      <p style={{ color: C.dim, fontFamily: "Inter, sans-serif", fontSize: 12.5, textAlign: "center", marginBottom: 22 }}>
        Visible to everyone using this EduBot AI app
      </p>
      {entries === null ? (
        <div style={{ textAlign: "center", padding: 30 }}><Loader2 size={22} className="spin" color={C.gold} /></div>
      ) : entries.length === 0 ? (
        <p style={{ color: C.dim, textAlign: "center", fontFamily: "Inter, sans-serif" }}>No one's on the board yet — be the first!</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {entries.slice(0, 20).map((e, i) => {
            const league = getLeague(e.xp);
            const isMe = e.email === profile.email;
            return (
              <div key={e.email} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 14,
                background: isMe ? C.panel2 : C.panel, border: isMe ? `1.5px solid ${C.gold}` : `1px solid ${C.line}`,
              }}>
                <span style={{ width: 24, textAlign: "center", fontFamily: "Fredoka, sans-serif", color: i < 3 ? C.gold : C.dim, fontWeight: 700 }}>{i + 1}</span>
                <span style={{ fontSize: 20 }}>{league.emoji}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, color: C.cream, fontFamily: "Fredoka, sans-serif", fontSize: 14, fontWeight: 600 }}>{e.name}{isMe ? " (you)" : ""}</p>
                  <p style={{ margin: 0, color: C.dim, fontFamily: "Inter, sans-serif", fontSize: 11 }}>Grade {e.grade} · {league.name}</p>
                </div>
                <span style={{ color: C.gold, fontFamily: "Fredoka, sans-serif", fontWeight: 700, fontSize: 14 }}>{e.xp} XP</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ----------------------------------- APP ---------------------------------------- */
export default function EduBotAI() {
  const [profile, setProfile] = useState(null);
  const [screen, setScreen] = useState("dashboard");
  const [activeTopic, setActiveTopic] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // apply streak on login-restore attempt is handled in Login; nothing to auto-load without email
    setReady(true);
  }, []);

  const handleLogin = (p) => {
    const today = todayStr();
    let { streak, lastActive } = p;
    if (lastActive !== today) {
      const y = new Date(); y.setDate(y.getDate() - 1);
      const yesterday = y.toISOString().slice(0, 10);
      streak = lastActive === yesterday ? streak + 1 : 1;
      const updated = { ...p, streak, lastActive: today };
      saveProfile(updated);
      setProfile(updated);
    } else {
      setProfile(p);
    }
  };

  const applyXp = (amount, extra = {}) => {
    setProfile((prev) => {
      const today = todayStr();
      const updated = {
        ...prev,
        ...extra,
        xp: prev.xp + amount,
        xpHistory: { ...prev.xpHistory, [today]: (prev.xpHistory[today] || 0) + amount },
      };
      saveProfile(updated);
      return updated;
    });
  };

  const finishQuiz = ({ topicId, xpEarned }) => {
    setProfile((prev) => {
      const today = todayStr();
      const completedTopics = prev.completedTopics.includes(topicId) ? prev.completedTopics : [...prev.completedTopics, topicId];
      const updated = {
        ...prev,
        completedTopics,
        xp: prev.xp + xpEarned,
        xpHistory: { ...prev.xpHistory, [today]: (prev.xpHistory[today] || 0) + xpEarned },
      };
      saveProfile(updated);
      return updated;
    });
  };

  if (!ready) return null;

  return (
    <div style={{ fontFamily: "Inter, sans-serif", background: C.bg, minHeight: "100vh", color: C.cream }}>
      <style>{`
        ${FONTS}
        * { box-sizing: border-box; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        ::selection { background: ${C.lavender}; color: #241B4A; }
        input::placeholder { color: ${C.dim}; }
        select option { background: ${C.bgSoft}; }
      `}</style>

      {!profile ? (
        <Login onLogin={handleLogin} />
      ) : (
        <>
          <NavBar screen={screen} setScreen={setScreen} profile={profile} onLogout={() => setProfile(null)} />
          {screen === "dashboard" && <Dashboard profile={profile} setScreen={setScreen} />}
          {screen === "lessons" && <LessonMap profile={profile} onOpenTopic={setActiveTopic} />}
          {screen === "tutor" && <Tutor profile={profile} onXp={applyXp} />}
          {screen === "leaderboard" && <Leaderboard profile={profile} />}
          {activeTopic && (
            <Quiz
              topic={activeTopic}
              profile={profile}
              onFinish={finishQuiz}
              onClose={() => setActiveTopic(null)}
            />
          )}
        </>
      )}
    </div>
  );
}
import { useState, useEffect, useRef } from "react";

const COLORS = {
  accent: "#FF6B2B",
  accentLight: "#FF8F5C",
  black: "#0A0A0A",
  darkGray: "#1A1A1A",
  midGray: "#2A2A2A",
  lightGray: "#F5F3EF",
  cream: "#FAF8F5",
  white: "#FFFFFF",
  green: "#2DD4A0",
  yellow: "#FACC15",
  red: "#EF4444",
  blue: "#3B82F6",
};

const styles = {
  page: { fontFamily: "'DM Sans', sans-serif", color: COLORS.black, background: COLORS.cream, minHeight: "100vh", overflowX: "hidden" },
  serif: { fontFamily: "'Playfair Display', serif" },
};

// --- Utility Components ---
const Badge = ({ children, color = COLORS.green, bg }) => (
  <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase",
    background: bg || `${color}18`, color }}>
    {children}
  </span>
);

const StatusDot = ({ status }) => {
  const c = status === "optimal" ? COLORS.green : status === "watch" ? COLORS.yellow : COLORS.red;
  return <span style={{ width: 8, height: 8, borderRadius: "50%", background: c, display: "inline-block", marginRight: 6 }} />;
};

// --- Animated Number ---
const AnimNum = ({ end, duration = 1200, suffix = "", prefix = "" }) => {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        const start = performance.now();
        const step = (now) => {
          const p = Math.min((now - start) / duration, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          setVal(Math.round(ease * end));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        obs.disconnect();
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end, duration]);
  return <span ref={ref}>{prefix}{val}{suffix}</span>;
};

// --- Circular Score ---
const ScoreRing = ({ score, size = 160, label, sub }) => {
  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? COLORS.green : score >= 60 ? COLORS.yellow : COLORS.red;
  return (
    <div style={{ textAlign: "center" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`${color}20`} strokeWidth={8} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(.4,0,.2,1)" }} />
      </svg>
      <div style={{ marginTop: -size/2 - 28, position: "relative" }}>
        <div style={{ fontSize: size * 0.3, fontWeight: 700, color: COLORS.black, lineHeight: 1 }}>{score}</div>
        <div style={{ fontSize: 11, color: "#888", fontWeight: 500, marginTop: 2 }}>{label}</div>
      </div>
      {sub && <div style={{ marginTop: size * 0.22, fontSize: 13, color: "#666" }}>{sub}</div>}
    </div>
  );
};

// --- Health Category Card ---
const HealthCard = ({ icon, title, status, markers, score }) => {
  const [hov, setHov] = useState(false);
  const statusColor = status === "optimal" ? COLORS.green : status === "watch" ? COLORS.yellow : COLORS.red;
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: COLORS.white, borderRadius: 16, padding: "24px 20px", cursor: "pointer",
        border: `1px solid ${hov ? statusColor : "#E8E5E0"}`, boxShadow: hov ? `0 8px 32px ${statusColor}15` : "0 1px 3px rgba(0,0,0,.04)",
        transition: "all .3s ease", transform: hov ? "translateY(-2px)" : "none" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <span style={{ fontSize: 28 }}>{icon}</span>
        <Badge color={statusColor}>{status}</Badge>
      </div>
      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 13, color: "#888", lineHeight: 1.5 }}>{markers}</div>
      {score !== undefined && (
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ flex: 1, height: 4, borderRadius: 2, background: `${statusColor}20` }}>
            <div style={{ width: `${score}%`, height: "100%", borderRadius: 2, background: statusColor, transition: "width 1s ease" }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: statusColor }}>{score}%</span>
        </div>
      )}
    </div>
  );
};

// --- Biomarker Row ---
const BiomarkerRow = ({ name, value, unit, range, status }) => {
  const c = status === "optimal" ? COLORS.green : status === "watch" ? COLORS.yellow : COLORS.red;
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #F0EDE8", gap: 12 }}>
      <StatusDot status={status} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 500 }}>{name}</div>
        <div style={{ fontSize: 11, color: "#AAA" }}>{range}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: c }}>{value}</span>
        <span style={{ fontSize: 11, color: "#AAA", marginLeft: 3 }}>{unit}</span>
      </div>
    </div>
  );
};

// --- Section Wrapper ---
const Section = ({ children, bg = "transparent", id, style: s = {} }) => (
  <section id={id} style={{ padding: "80px 24px", background: bg, ...s }}>
    <div style={{ maxWidth: 1140, margin: "0 auto" }}>{children}</div>
  </section>
);

// --- Navigation ---
const Nav = ({ activeSection }) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? "rgba(250,248,245,.92)" : "transparent", backdropFilter: scrolled ? "blur(20px)" : "none",
      borderBottom: scrolled ? "1px solid #E8E5E0" : "none", transition: "all .3s ease", padding: "0 24px" }}>
      <div style={{ maxWidth: 1140, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", height: 64 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: COLORS.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 21c-1.5 0-5-2.5-7-6s-2-7 0-9 4.5-2 7 1c2.5-3 5-3 7-1s2 5.5 0 9-5.5 6-7 6z" fill="white"/></svg>
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em" }}>
            super<span style={{ color: COLORS.accent }}>paw</span>
          </span>
        </div>
        <div style={{ display: "flex", gap: 32, fontSize: 13, fontWeight: 500, color: "#666" }}>
          {["Science","Dashboard","Pricing"].map(t => (
            <a key={t} href={`#${t.toLowerCase()}`} style={{ color: "inherit", textDecoration: "none", transition: "color .2s",
              borderBottom: activeSection === t.toLowerCase() ? `2px solid ${COLORS.accent}` : "2px solid transparent", paddingBottom: 2 }}
              onMouseEnter={e => e.target.style.color = COLORS.accent} onMouseLeave={e => e.target.style.color = "#666"}>
              {t}
            </a>
          ))}
        </div>
        <button style={{ background: COLORS.accent, color: "white", border: "none", borderRadius: 8, padding: "8px 20px",
          fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "transform .2s, box-shadow .2s" }}
          onMouseEnter={e => { e.target.style.transform = "scale(1.04)"; e.target.style.boxShadow = "0 4px 16px rgba(255,107,43,.35)"; }}
          onMouseLeave={e => { e.target.style.transform = "scale(1)"; e.target.style.boxShadow = "none"; }}>
          Get Started
        </button>
      </div>
    </nav>
  );
};

// --- HERO ---
const Hero = () => (
  <Section style={{ paddingTop: 140, paddingBottom: 60 }}>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
      <div>
        <Badge color={COLORS.accent} bg={`${COLORS.accent}12`}>NOW IN EARLY ACCESS</Badge>
        <h1 style={{ ...styles.serif, fontSize: 56, fontWeight: 700, lineHeight: 1.08, letterSpacing: "-0.03em", margin: "20px 0 24px",
          background: `linear-gradient(135deg, ${COLORS.black} 60%, ${COLORS.accent})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Give your dog<br />more good years.
        </h1>
        <p style={{ fontSize: 18, lineHeight: 1.65, color: "#666", maxWidth: 440 }}>
          Track 100+ biomarkers. Decode their DNA. Monitor vitals in real-time. Get a personalized longevity protocol — all in one place.
        </p>
        <div style={{ display: "flex", gap: 14, marginTop: 32 }}>
          <button style={{ background: COLORS.black, color: "white", border: "none", borderRadius: 10, padding: "14px 32px",
            fontSize: 15, fontWeight: 600, cursor: "pointer", transition: "all .2s" }}
            onMouseEnter={e => e.target.style.background = COLORS.accent} onMouseLeave={e => e.target.style.background = COLORS.black}>
            Sign Up
          </button>
          <button style={{ background: "transparent", color: COLORS.black, border: `1.5px solid #D5D0C8`, borderRadius: 10,
            padding: "14px 24px", fontSize: 15, fontWeight: 500, cursor: "pointer" }}>
            See the Science ↓
          </button>
        </div>
        <div style={{ display: "flex", gap: 40, marginTop: 40 }}>
          {[["100+", "Biomarkers"], ["270+", "Genetic Risks"], ["24/7", "Vital Monitoring"]].map(([n, l]) => (
            <div key={l}><div style={{ fontSize: 24, fontWeight: 700 }}>{n}</div><div style={{ fontSize: 12, color: "#999" }}>{l}</div></div>
          ))}
        </div>
      </div>
      {/* Dashboard Preview Card */}
      <div style={{ background: COLORS.white, borderRadius: 24, padding: 32, boxShadow: "0 24px 80px rgba(0,0,0,.08), 0 2px 8px rgba(0,0,0,.04)",
        border: "1px solid #E8E5E0", position: "relative" }}>
        <div style={{ position: "absolute", top: -12, right: 24, background: COLORS.accent, color: "white", borderRadius: 20,
          padding: "6px 16px", fontSize: 11, fontWeight: 600 }}>LIVE DASHBOARD</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: `linear-gradient(135deg, ${COLORS.accent}30, ${COLORS.accent}10)`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>🐕</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>Luna</div>
            <div style={{ fontSize: 13, color: "#999" }}>Golden Retriever · 6 yr · 62 lbs</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          <div style={{ textAlign: "center", padding: 16, background: COLORS.cream, borderRadius: 14 }}>
            <div style={{ fontSize: 11, color: "#999", fontWeight: 500, marginBottom: 4 }}>VITALITY SCORE</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: COLORS.green }}>87</div>
            <div style={{ fontSize: 11, color: COLORS.green }}>▲ 4 pts from last quarter</div>
          </div>
          <div style={{ textAlign: "center", padding: 16, background: COLORS.cream, borderRadius: 14 }}>
            <div style={{ fontSize: 11, color: "#999", fontWeight: 500, marginBottom: 4 }}>BIOLOGICAL AGE</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: COLORS.blue }}>4.8</div>
            <div style={{ fontSize: 11, color: COLORS.blue }}>1.2 yrs younger than actual</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[["❤️","Heart","optimal"],["🦴","Joints","watch"],["🧬","Cancer Risk","optimal"],["🧠","Cognition","optimal"],["🦠","Gut","optimal"]].map(([i,t,s]) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8,
              background: `${s === "optimal" ? COLORS.green : COLORS.yellow}10`, fontSize: 12, fontWeight: 500 }}>
              <StatusDot status={s} />{i} {t}
            </div>
          ))}
        </div>
      </div>
    </div>
  </Section>
);

// --- SOCIAL PROOF ---
const SocialProof = () => (
  <div style={{ background: COLORS.white, borderTop: "1px solid #E8E5E0", borderBottom: "1px solid #E8E5E0", padding: "24px", overflow: "hidden" }}>
    <div style={{ maxWidth: 1140, margin: "0 auto", display: "flex", justifyContent: "center", alignItems: "center", gap: 48, flexWrap: "wrap" }}>
      {["Backed by veterinary science", "100+ biomarkers per panel", "Integrates with PetPace · Invoxia · Fi", "DNA + Microbiome + Blood + Wearables"].map(t => (
        <span key={t} style={{ fontSize: 12, fontWeight: 500, color: "#999", letterSpacing: "0.03em", whiteSpace: "nowrap" }}>{t}</span>
      ))}
    </div>
  </div>
);

// --- HOW IT WORKS ---
const HowItWorks = () => (
  <Section id="science" bg={COLORS.white}>
    <div style={{ textAlign: "center", marginBottom: 56 }}>
      <Badge color={COLORS.accent} bg={`${COLORS.accent}10`}>THE SCIENCE</Badge>
      <h2 style={{ ...styles.serif, fontSize: 40, fontWeight: 700, marginTop: 16, letterSpacing: "-0.02em" }}>
        Six layers of health intelligence
      </h2>
      <p style={{ color: "#888", fontSize: 16, maxWidth: 520, margin: "12px auto 0" }}>
        We aggregate every data source that matters — then our AI finds what your vet can't see alone.
      </p>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
      {[
        { icon: "🧬", title: "DNA & Genetics", desc: "270+ health risks, breed composition, MDR1 drug sensitivity, and pharmacogenomics", num: "01" },
        { icon: "🩸", title: "Blood Biomarkers", desc: "100+ markers including SDMA (early kidney), NT-proBNP (cardiac), cPL (pancreas), CRP (inflammation)", num: "02" },
        { icon: "🦠", title: "Gut Microbiome", desc: "5,000+ bacterial species profiled. Pathogen detection, dysbiosis scoring, and FMT recommendations", num: "03" },
        { icon: "📡", title: "Wearable Vitals", desc: "Heart rate, HRV, respiratory rate, temperature, sleep quality, activity — streamed 24/7 from your collar", num: "04" },
        { icon: "🔬", title: "Cancer Screening", desc: "Liquid biopsy detecting 30+ cancer types. Annual screening timed to breed-specific risk windows", num: "05" },
        { icon: "🧠", title: "Cognitive & Behavioral", desc: "DISHAAL assessment, C-BARQ phenotyping, pain indices, and quality-of-life scoring — all digitized", num: "06" },
      ].map(s => (
        <div key={s.num} style={{ background: COLORS.cream, borderRadius: 16, padding: 28, position: "relative", border: "1px solid #E8E5E0",
          transition: "all .3s", cursor: "default" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.accent; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 12px 40px ${COLORS.accent}10`; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#E8E5E0"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
          <div style={{ position: "absolute", top: 20, right: 20, fontSize: 11, fontWeight: 700, color: "#D5D0C8" }}>{s.num}</div>
          <div style={{ fontSize: 32, marginBottom: 14 }}>{s.icon}</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{s.title}</div>
          <div style={{ fontSize: 13, color: "#888", lineHeight: 1.55 }}>{s.desc}</div>
        </div>
      ))}
    </div>
  </Section>
);

// --- DASHBOARD SECTION ---
const DashboardSection = () => (
  <Section id="dashboard" bg={COLORS.cream}>
    <div style={{ textAlign: "center", marginBottom: 48 }}>
      <Badge color={COLORS.accent} bg={`${COLORS.accent}10`}>DASHBOARD PREVIEW</Badge>
      <h2 style={{ ...styles.serif, fontSize: 40, fontWeight: 700, marginTop: 16, letterSpacing: "-0.02em" }}>
        Luna's health at a glance
      </h2>
      <p style={{ color: "#888", fontSize: 15, maxWidth: 480, margin: "10px auto 0" }}>
        Every data point, scored and tracked over time. Color-coded so you know exactly what needs attention.
      </p>
    </div>

    {/* Score Cards Row */}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
      {[
        { label: "Vitality Score", value: "87", sub: "+4 from Q3", color: COLORS.green, icon: "⚡" },
        { label: "Biological Age", value: "4.8 yr", sub: "Actual: 6.0 yr", color: COLORS.blue, icon: "🧬" },
        { label: "Cancer Risk", value: "Low", sub: "Last screen: Oct 2025", color: COLORS.green, icon: "🔬" },
        { label: "Next Action", value: "Blood Panel", sub: "Due in 18 days", color: COLORS.accent, icon: "📅" },
      ].map(c => (
        <div key={c.label} style={{ background: COLORS.white, borderRadius: 14, padding: "20px 18px", border: "1px solid #E8E5E0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 12, color: "#999", fontWeight: 500 }}>{c.label}</span>
            <span style={{ fontSize: 18 }}>{c.icon}</span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: c.color }}>{c.value}</div>
          <div style={{ fontSize: 11, color: "#BBB", marginTop: 4 }}>{c.sub}</div>
        </div>
      ))}
    </div>

    {/* Health Categories Grid */}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
      <HealthCard icon="❤️" title="Heart" status="optimal" markers="NT-proBNP · cTnI · HRV · Murmur grade" score={92} />
      <HealthCard icon="🦴" title="Joints & Mobility" status="watch" markers="BCS 6/9 · Mild hip laxity · ROM decreased" score={68} />
      <HealthCard icon="🧠" title="Cognition" status="optimal" markers="DISHAAL 2/30 · CCDR 18 · C-BARQ normal" score={95} />
      <HealthCard icon="🦷" title="Dental" status="watch" markers="Grade 2 plaque · Mild gingivitis L premolars" score={61} />
      <HealthCard icon="🫁" title="Organ Function" status="optimal" markers="SDMA 11 · ALT 42 · Spec cPL normal" score={89} />
      <HealthCard icon="🦠" title="Gut Health" status="optimal" markers="Dysbiosis Index -2.1 · No pathogens · High diversity" score={88} />
      <HealthCard icon="✨" title="Skin & Coat" status="optimal" markers="No allergens · Omega ratio 1:4 · Coat score 9/10" score={94} />
      <HealthCard icon="⚖️" title="Weight & Metabolism" status="watch" markers="BCS 6/9 · 4 lbs over ideal · Thyroid T4 normal" score={72} />
    </div>

    {/* Detailed Biomarker Panel */}
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      <div style={{ background: COLORS.white, borderRadius: 16, padding: 24, border: "1px solid #E8E5E0" }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Key Blood Biomarkers</div>
        <BiomarkerRow name="SDMA (Kidney)" value="11" unit="µg/dL" range="Ref: 0–14" status="optimal" />
        <BiomarkerRow name="ALT (Liver)" value="42" unit="U/L" range="Ref: 10–125" status="optimal" />
        <BiomarkerRow name="NT-proBNP (Heart)" value="624" unit="pmol/L" range="Ref: <900" status="optimal" />
        <BiomarkerRow name="Spec cPL (Pancreas)" value="82" unit="µg/L" range="Ref: <200" status="optimal" />
        <BiomarkerRow name="CRP (Inflammation)" value="12.4" unit="mg/L" range="Ref: <10" status="watch" />
        <BiomarkerRow name="Free T4 (Thyroid)" value="1.8" unit="ng/dL" range="Ref: 1.0–2.2" status="optimal" />
        <BiomarkerRow name="Vitamin D" value="48" unit="ng/mL" range="Optimal: 40–80" status="optimal" />
        <BiomarkerRow name="Triglycerides" value="198" unit="mg/dL" range="Ref: 50–150" status="concern" />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ background: COLORS.white, borderRadius: 16, padding: 24, border: "1px solid #E8E5E0", flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>🧬 Genetic Risk Highlights</div>
          {[["Hip Dysplasia", "Elevated", "watch"], ["MDR1 Drug Sensitivity", "Carrier (1 copy)", "watch"], ["DCM (Heart)", "Clear", "optimal"],
            ["Progressive Retinal Atrophy", "Clear", "optimal"], ["Exercise-Induced Collapse", "Clear", "optimal"],
          ].map(([n, v, s]) => (
            <div key={n} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #F5F3EF" }}>
              <span style={{ fontSize: 13 }}>{n}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: s === "optimal" ? COLORS.green : COLORS.yellow }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ background: `linear-gradient(135deg, ${COLORS.accent}, #FF8F5C)`, borderRadius: 16, padding: 24, color: "white" }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>📡 Live from Luna's Collar</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {[["Heart Rate", "78 bpm", "resting"], ["Resp Rate", "22 br/min", "normal"], ["Temperature", "101.2°F", "normal"],
              ["Sleep", "9.2 hrs", "last night"], ["Activity", "52 min", "today"], ["HRV", "48 ms", "good"]].map(([l, v, s]) => (
              <div key={l} style={{ background: "rgba(255,255,255,0.15)", borderRadius: 10, padding: "10px 12px" }}>
                <div style={{ fontSize: 10, opacity: 0.7 }}>{l}</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{v}</div>
                <div style={{ fontSize: 10, opacity: 0.6 }}>{s}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </Section>
);

// --- LONGEVITY PROTOCOL ---
const Protocol = () => (
  <Section bg={COLORS.white}>
    <div style={{ textAlign: "center", marginBottom: 48 }}>
      <Badge color={COLORS.accent} bg={`${COLORS.accent}10`}>PERSONALIZED PROTOCOL</Badge>
      <h2 style={{ ...styles.serif, fontSize: 40, fontWeight: 700, marginTop: 16, letterSpacing: "-0.02em" }}>
        Luna's longevity plan
      </h2>
      <p style={{ color: "#888", maxWidth: 500, margin: "10px auto 0", fontSize: 15 }}>
        AI-generated from her genetics, bloodwork, microbiome, and wearable data. Updated every quarter.
      </p>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
      {[
        { cat: "🍖 Nutrition", items: ["Fresh food: The Farmer's Dog turkey recipe, 820 kcal/day (reduce 8% — BCS 6/9)", "Omega-3: 1,200mg EPA+DHA daily (elevated CRP)", "Limit treats to <10% daily calories", "Add low-glycemic toppers (blueberries, sardines)"], tier: "Based on metabolic panel + BCS" },
        { cat: "💊 Supplements", items: ["Omega-3 fish oil — 1,200mg (inflammation)", "Glucosamine + chondroitin — 750mg (hip laxity)", "MCT oil — 1 tsp daily (cognitive reserve)", "Probiotic — S. boulardii strain (gut optimization)", "CoQ10 — 100mg (cardiac support)"], tier: "Tier 1–2 evidence" },
        { cat: "🏃 Exercise", items: ["55 min/day (currently 52 — on track)", "2x weekly swimming (low-impact for hips)", "FitPaws balance disc 3x/week (proprioception)", "Reduce high-impact fetch to 2x/week", "Add daily 15-min decompression walk"], tier: "Adjusted for hip laxity" },
        { cat: "🧩 Enrichment", items: ["Frozen Kong: rotate 3 recipes weekly", "Nose work: 10-min scent trail every other day", "Nina Ottosson puzzle — Level 2 (upgrade from 1)", "Novel environment exposure: 2 new routes/week", "iCalmPet music during alone-time"], tier: "Cognitive reserve building" },
        { cat: "🔬 Longevity", items: ["Biological age trending younger — continue protocol", "Consider LOY-002 when available (est. 2027)", "Rapamycin: monitor TRIAD results before deciding", "Annual Nu.Q cancer screen (breed risk: hemangiosarcoma)", "Repeat epigenetic age test in 6 months"], tier: "Frontier interventions" },
        { cat: "🩺 Preventive Care", items: ["Blood panel: due in 18 days (Q1 panel)", "Dental cleaning: schedule within 60 days", "Titer test CDV/CPV: due at annual visit", "OFA hip evaluation: completed (Mild)", "DISHAAL cognitive screen: next at age 7"], tier: "Personalized by age + genetics" },
      ].map(p => (
        <div key={p.cat} style={{ background: COLORS.cream, borderRadius: 16, padding: 24, border: "1px solid #E8E5E0" }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>{p.cat}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {p.items.map((it, i) => (
              <div key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: "#555", lineHeight: 1.45 }}>
                <span style={{ color: COLORS.accent, fontWeight: 700, flexShrink: 0 }}>→</span>
                <span>{it}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, fontSize: 11, color: "#BBB", fontStyle: "italic" }}>{p.tier}</div>
        </div>
      ))}
    </div>
  </Section>
);

// --- PRICING ---
const PricingSection = () => (
  <Section id="pricing" bg={COLORS.cream}>
    <div style={{ textAlign: "center", marginBottom: 48 }}>
      <Badge color={COLORS.accent} bg={`${COLORS.accent}10`}>PLANS</Badge>
      <h2 style={{ ...styles.serif, fontSize: 40, fontWeight: 700, marginTop: 16, letterSpacing: "-0.02em" }}>
        One platform. Every insight.
      </h2>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, maxWidth: 960, margin: "0 auto" }}>
      {[
        { name: "Essential", price: "$149", period: "/year", desc: "Start understanding your dog's biology", features: [
          "100+ blood biomarkers (2x/year)", "DNA breed + 270 health conditions", "Biological age baseline", "Vitality Score dashboard", "Personalized nutrition plan", "Quarterly protocol updates"
        ], cta: "Start Here", accent: false },
        { name: "Complete", price: "$349", period: "/year", desc: "The full longevity stack", features: [
          "Everything in Essential", "Gut microbiome analysis (2x/year)", "Annual liquid biopsy cancer screen", "Wearable integration (PetPace / Invoxia / Fi)", "24/7 vital monitoring + alerts", "Vet-shareable health reports", "AI longevity protocol with supplement recs"
        ], cta: "Most Popular", accent: true },
        { name: "Founder", price: "$599", period: "/year", desc: "For the truly obsessed dog parent", features: [
          "Everything in Complete", "Quarterly blood panels (4x/year)", "Epigenetic age tracking (2x/year)", "Monthly telehealth vet consultation", "Early access to longevity interventions", "Dedicated health concierge", "Multi-dog household pricing"
        ], cta: "Join Founders", accent: false },
      ].map(p => (
        <div key={p.name} style={{
          background: p.accent ? COLORS.black : COLORS.white, color: p.accent ? "white" : COLORS.black,
          borderRadius: 20, padding: 32, border: p.accent ? "none" : "1px solid #E8E5E0",
          transform: p.accent ? "scale(1.03)" : "none", boxShadow: p.accent ? `0 20px 60px rgba(0,0,0,.2)` : "none",
          position: "relative"
        }}>
          {p.accent && <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
            background: COLORS.accent, color: "white", borderRadius: 20, padding: "5px 16px", fontSize: 11, fontWeight: 700 }}>RECOMMENDED</div>}
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: p.accent ? COLORS.accentLight : COLORS.accent }}>{p.name}</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 2, marginBottom: 6 }}>
            <span style={{ fontSize: 40, fontWeight: 800 }}>{p.price}</span>
            <span style={{ fontSize: 14, color: p.accent ? "#999" : "#AAA" }}>{p.period}</span>
          </div>
          <div style={{ fontSize: 13, color: p.accent ? "#999" : "#888", marginBottom: 24 }}>{p.desc}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
            {p.features.map((f, i) => (
              <div key={i} style={{ display: "flex", gap: 8, fontSize: 13, lineHeight: 1.4 }}>
                <span style={{ color: COLORS.green, flexShrink: 0 }}>✓</span>
                <span style={{ color: p.accent ? "#CCC" : "#666" }}>{f}</span>
              </div>
            ))}
          </div>
          <button style={{
            width: "100%", padding: "13px 0", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer",
            background: p.accent ? COLORS.accent : "transparent", color: p.accent ? "white" : COLORS.black,
            border: p.accent ? "none" : `1.5px solid #D5D0C8`, transition: "all .2s"
          }}>{p.cta}</button>
        </div>
      ))}
    </div>
  </Section>
);

// --- FOOTER ---
const FooterSection = () => (
  <footer style={{ background: COLORS.black, color: "#999", padding: "60px 24px 40px" }}>
    <div style={{ maxWidth: 1140, margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 40 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: COLORS.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 21c-1.5 0-5-2.5-7-6s-2-7 0-9 4.5-2 7 1c2.5-3 5-3 7-1s2 5.5 0 9-5.5 6-7 6z" fill="white"/></svg>
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, color: "white" }}>super<span style={{ color: COLORS.accent }}>paw</span></span>
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.6, maxWidth: 300 }}>
            The canine health and longevity platform. Helping dogs live longer, healthier, happier lives through personalized, data-driven care.
          </p>
        </div>
        {[
          { h: "Platform", links: ["Blood Testing", "DNA Analysis", "Microbiome", "Wearables", "Cancer Screening", "Dashboard"] },
          { h: "Science", links: ["Dog Aging Project", "Longevity Research", "Biomarker Guide", "Evidence Tiers", "Our Vet Team"] },
          { h: "Company", links: ["About", "Blog", "Careers", "Contact", "Privacy", "Terms"] },
        ].map(col => (
          <div key={col.h}>
            <div style={{ color: "white", fontWeight: 600, fontSize: 13, marginBottom: 14 }}>{col.h}</div>
            {col.links.map(l => <div key={l} style={{ fontSize: 13, marginBottom: 8, cursor: "pointer", transition: "color .2s" }}
              onMouseEnter={e => e.target.style.color = COLORS.accent} onMouseLeave={e => e.target.style.color = "#999"}>{l}</div>)}
          </div>
        ))}
      </div>
      <div style={{ borderTop: "1px solid #333", paddingTop: 24, display: "flex", justifyContent: "space-between", fontSize: 12 }}>
        <span>© 2026 Superpaw. This is a concept mockup.</span>
        <span>Designed for longer lives, together.</span>
      </div>
    </div>
  </footer>
);

// --- APP ---
export default function App() {
  return (
    <div style={styles.page}>
      <Nav />
      <Hero />
      <SocialProof />
      <HowItWorks />
      <DashboardSection />
      <Protocol />
      <PricingSection />
      <FooterSection />
    </div>
  );
}

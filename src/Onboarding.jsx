import { useState, useRef } from "react";

const COLORS = {
  accent: "#0071E3",
  accentLight: "#2997FF",
  black: "#1D1D1F",
  cream: "#FBFBFD",
  white: "#FFFFFF",
  green: "#34C759",
};

const STEPS = [
  { key: "dogName", question: "What is your dog's name?" },
  { key: "breed", question: "What breed(s) is your dog?" },
  { key: "birthday", question: "What is your dog's birthday?" },
  { key: "sex", question: "What is your dog's sex?" },
  { key: "procedureAge", question: "At what age was the procedure done?" },
  { key: "weight", question: "What is your dog's current weight?" },
  { key: "photo", question: "What does your dog look like?" },
];

const Logo = ({ onClick }) => (
  <div onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
    <div style={{ width: 32, height: 32, borderRadius: 6, background: COLORS.black, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 21c-1.5 0-5-2.5-7-6s-2-7 0-9 4.5-2 7 1c2.5-3 5-3 7-1s2 5.5 0 9-5.5 6-7 6z" fill="white"/></svg>
    </div>
    <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", color: COLORS.black }}>
      powerpet
    </span>
  </div>
);

const inputStyle = {
  width: "100%",
  padding: "14px 16px",
  fontSize: 16,
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  border: "1.5px solid #D1D1D6",
  borderRadius: 8,
  background: COLORS.white,
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color .2s",
};

const btnBase = {
  padding: "13px 32px",
  borderRadius: 8,
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
  transition: "background .2s",
  border: "none",
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
};

export default function Onboarding({ onExit }) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    dogName: "",
    breed: "",
    breedUnknown: false,
    birthday: "",
    sex: "",
    procedureAge: "",
    weight: "",
    photo: null,
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [done, setDone] = useState(false);
  const fileRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const isIntact = formData.sex === "Male intact" || formData.sex === "Female intact";

  // Build visible steps — skip step 4 (procedureAge) if intact
  const visibleSteps = STEPS.filter((s) => {
    if (s.key === "procedureAge" && isIntact) return false;
    return true;
  });

  const totalSteps = visibleSteps.length;
  const currentStepData = visibleSteps[step];
  const progress = ((step + 1) / totalSteps) * 100;

  const update = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));

  const canAdvance = () => {
    if (!currentStepData) return false;
    const k = currentStepData.key;
    if (k === "dogName") return formData.dogName.trim().length > 0;
    if (k === "breed") return formData.breed.trim().length > 0 || formData.breedUnknown;
    if (k === "birthday") return formData.birthday.length > 0;
    if (k === "sex") return formData.sex.length > 0;
    if (k === "procedureAge") return formData.procedureAge !== "" && Number(formData.procedureAge) >= 0;
    if (k === "weight") return formData.weight !== "" && Number(formData.weight) > 0;
    if (k === "photo") return true; // photo is optional
    return true;
  };

  const next = () => {
    if (step < totalSteps - 1) setStep(step + 1);
    else setDone(true);
  };

  const back = () => {
    if (step > 0) setStep(step - 1);
  };

  const handlePhoto = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    update("photo", file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handlePhoto(file);
  };

  const sexOptions = ["Male intact", "Male neutered", "Female intact", "Female spayed"];

  // --- Render step content ---
  const renderInput = () => {
    const k = currentStepData.key;

    if (k === "dogName") {
      return (
        <input
          type="text"
          placeholder="e.g. Luna"
          value={formData.dogName}
          onChange={(e) => update("dogName", e.target.value)}
          style={inputStyle}
          autoFocus
        />
      );
    }

    if (k === "breed") {
      return (
        <div>
          <input
            type="text"
            placeholder="e.g. Golden Retriever"
            value={formData.breed}
            onChange={(e) => update("breed", e.target.value)}
            disabled={formData.breedUnknown}
            style={{ ...inputStyle, opacity: formData.breedUnknown ? 0.5 : 1 }}
            autoFocus
          />
          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, fontSize: 14, color: "#666", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={formData.breedUnknown}
              onChange={(e) => update("breedUnknown", e.target.checked)}
              style={{ width: 18, height: 18, accentColor: COLORS.accent }}
            />
            Unknown / mixed breed
          </label>
        </div>
      );
    }

    if (k === "birthday") {
      return (
        <input
          type="date"
          value={formData.birthday}
          onChange={(e) => update("birthday", e.target.value)}
          style={inputStyle}
          autoFocus
        />
      );
    }

    if (k === "sex") {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {sexOptions.map((opt) => (
            <label
              key={opt}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 16px",
                borderRadius: 8,
                border: `1.5px solid ${formData.sex === opt ? COLORS.accent : "#D1D1D6"}`,
                background: formData.sex === opt ? `${COLORS.accent}08` : COLORS.white,
                cursor: "pointer",
                transition: "all .2s",
                fontSize: 15,
              }}
            >
              <input
                type="radio"
                name="sex"
                value={opt}
                checked={formData.sex === opt}
                onChange={() => update("sex", opt)}
                style={{ width: 18, height: 18, accentColor: COLORS.accent }}
              />
              {opt}
            </label>
          ))}
        </div>
      );
    }

    if (k === "procedureAge") {
      return (
        <div style={{ position: "relative" }}>
          <input
            type="number"
            min="0"
            placeholder="e.g. 1"
            value={formData.procedureAge}
            onChange={(e) => update("procedureAge", e.target.value)}
            style={{ ...inputStyle, paddingRight: 60 }}
            autoFocus
          />
          <span style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#999" }}>
            years
          </span>
        </div>
      );
    }

    if (k === "weight") {
      return (
        <div style={{ position: "relative" }}>
          <input
            type="number"
            min="1"
            placeholder="e.g. 62"
            value={formData.weight}
            onChange={(e) => update("weight", e.target.value)}
            style={{ ...inputStyle, paddingRight: 50 }}
            autoFocus
          />
          <span style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#999" }}>
            lbs
          </span>
        </div>
      );
    }

    if (k === "photo") {
      return (
        <div>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? COLORS.accent : "#D1D1D6"}`,
              borderRadius: 10,
              padding: "40px 20px",
              textAlign: "center",
              cursor: "pointer",
              background: dragOver ? `${COLORS.accent}06` : COLORS.white,
              transition: "all .2s",
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.black, marginBottom: 4 }}>Upload a photo</div>
            <div style={{ fontSize: 15, fontWeight: 500, color: "#666" }}>
              Drag & drop, or <span style={{ color: COLORS.accent, fontWeight: 600 }}>browse</span>
            </div>
            <div style={{ fontSize: 12, color: "#AAA", marginTop: 4 }}>JPG, PNG — this is optional</div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={(e) => handlePhoto(e.target.files[0])}
            style={{ display: "none" }}
          />
          {photoPreview && (
            <div style={{ marginTop: 16, textAlign: "center" }}>
              <img
                src={photoPreview}
                alt="Dog preview"
                style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 10, objectFit: "cover" }}
              />
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setPhotoPreview(null);
                  update("photo", null);
                }}
                style={{ fontSize: 13, color: COLORS.accent, cursor: "pointer", marginTop: 8, fontWeight: 500 }}
              >
                Remove photo
              </div>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  // --- Done screen ---
  if (done) {
    return (
      <div style={{
        position: "fixed", inset: 0, background: COLORS.cream, zIndex: 1000,
        display: "flex", flexDirection: "column", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}>
        <div style={{ padding: "20px 32px" }}>
          <Logo onClick={onExit} />
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", maxWidth: 440 }}>
            <div style={{ width: 56, height: 56, borderRadius: 28, background: `${COLORS.green}18`, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke={COLORS.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <h1 style={{ fontSize: 36, fontWeight: 700, margin: "0 0 12px", letterSpacing: "-0.02em" }}>
              You're all set{formData.dogName ? `, ${formData.dogName}` : ""}!
            </h1>
            <p style={{ fontSize: 16, color: "#666", lineHeight: 1.6, margin: "0 0 32px" }}>
              We'll use this info to build a personalized health profile. Welcome to Powerpet.
            </p>
            <button
              onClick={onExit}
              style={{ ...btnBase, background: COLORS.black, color: "white" }}
              onMouseEnter={(e) => { e.target.style.background = COLORS.accent; }}
              onMouseLeave={(e) => { e.target.style.background = COLORS.black; }}
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Step screen ---
  return (
    <div style={{
      position: "fixed", inset: 0, background: COLORS.cream, zIndex: 1000,
      display: "flex", flexDirection: "column", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      {/* Header */}
      <div style={{ padding: "20px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Logo onClick={onExit} />
        <span style={{ fontSize: 13, color: "#999", fontWeight: 500 }}>
          Step {step + 1} of {totalSteps}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: "#E5E5EA", margin: "0 32px" }}>
        <div style={{ height: "100%", width: `${progress}%`, background: COLORS.accent, borderRadius: 2, transition: "width .3s ease" }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div style={{
          background: COLORS.white, borderRadius: 14, padding: "40px 36px", width: "100%", maxWidth: 480,
          border: "1px solid #E5E5EA", boxShadow: "0 2px 12px rgba(0,0,0,.03)",
        }}>
          <h2 style={{
            fontSize: 24, fontWeight: 700, marginBottom: 28,
            letterSpacing: "-0.02em", lineHeight: 1.2, marginTop: 0,
          }}>
            {currentStepData.question}
          </h2>

          {renderInput()}

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32 }}>
            {step > 0 ? (
              <button
                onClick={back}
                style={{ ...btnBase, background: "transparent", color: "#666", border: "1.5px solid #D1D1D6" }}
                onMouseEnter={(e) => { e.target.style.borderColor = COLORS.accent; e.target.style.color = COLORS.accent; }}
                onMouseLeave={(e) => { e.target.style.borderColor = "#D1D1D6"; e.target.style.color = "#666"; }}
              >
                Back
              </button>
            ) : (
              <div />
            )}
            <button
              onClick={next}
              disabled={!canAdvance()}
              style={{
                ...btnBase,
                background: canAdvance() ? COLORS.black : "#D1D1D6",
                color: "white",
                cursor: canAdvance() ? "pointer" : "not-allowed",
              }}
              onMouseEnter={(e) => { if (canAdvance()) e.target.style.background = COLORS.accent; }}
              onMouseLeave={(e) => { if (canAdvance()) e.target.style.background = COLORS.black; }}
            >
              {step === totalSteps - 1 ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

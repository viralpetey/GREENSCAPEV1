import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── SUPABASE CLIENT ──────────────────────────────────────────────────────────
const supabase = createClient(
  "https://xluohwwcmplmutlngjts.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsdW9od3djbXBsbXV0bG5nanRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3NzA5NDIsImV4cCI6MjA5MjM0Njk0Mn0.4Jp2hRqvHrdBoleRfBJAg-R780xzQyo3pccl4q_6Gmc"
);

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'DM Sans',sans-serif;}
    ::-webkit-scrollbar{width:5px;}
    ::-webkit-scrollbar-thumb{background:#74c69d;border-radius:4px;}
    .card{transition:transform .2s,box-shadow .2s;}
    .card:hover{transform:translateY(-2px);box-shadow:0 14px 40px rgba(27,67,50,.13)!important;}
    .btn{transition:all .15s;cursor:pointer;border:none;font-family:'DM Sans',sans-serif;}
    .btn:hover{filter:brightness(1.07);}
    .btn:active{transform:scale(.97);}
    .fade{animation:fadeUp .3s ease both;}
    @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
    input,textarea,select{font-family:'DM Sans',sans-serif;}
    input:focus,textarea:focus{outline:none;}
    .pill:hover{background:#2d6a4f!important;color:#fff!important;}
  `}</style>
);

const CAT_COLORS = {
  Success:    { bg:"#d8f3dc", text:"#1b4332", border:"#74c69d" },
  Question:   { bg:"#fff3cd", text:"#664d03", border:"#ffc107" },
  Tips:       { bg:"#d1ecf1", text:"#0c5460", border:"#17a2b8" },
  Showcase:   { bg:"#f8d7da", text:"#721c24", border:"#f5c6cb" },
  Discussion: { bg:"#e2d9f3", text:"#432874", border:"#c3a8f0" },
};

// ─── SMALL COMPONENTS ─────────────────────────────────────────────────────────
const Avatar = ({ user, size = 36 }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: "linear-gradient(135deg,#d8f3dc,#74c69d)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.42, flexShrink: 0, border: "2px solid #b7e4c7" }}>
    {user?.avatar_emoji || "🌿"}
  </div>
);

const GreenBtn = ({ children, onClick, ghost, small, style = {}, disabled }) => (
  <button className="btn" onClick={onClick} disabled={disabled} style={{ padding: small ? "7px 16px" : "10px 22px", borderRadius: 24, background: ghost ? "transparent" : disabled ? "#ccc" : "linear-gradient(135deg,#2d6a4f,#40916c)", color: ghost ? "#2d6a4f" : "white", fontWeight: 600, fontSize: small ? 12 : 13, border: ghost ? "1.5px solid #2d6a4f" : "none", boxShadow: ghost || disabled ? "none" : "0 4px 14px rgba(45,106,79,.25)", cursor: disabled ? "not-allowed" : "pointer", ...style }}>
    {children}
  </button>
);

const Spinner = () => (
  <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
    <div style={{ width: 32, height: 32, border: "3px solid #d8f3dc", borderTop: "3px solid #2d6a4f", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

// ─── AUTH PAGE ────────────────────────────────────────────────────────────────
const AuthPage = ({ onAuth }) => {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", password: "", username: "", zone: "7" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(form.email, { redirectTo: window.location.origin });
        if (error) throw error;
        setResetSent(true);
      } else if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
        if (error) throw error;
        onAuth(data.user);
      } else {
        if (!form.username.trim()) throw new Error("Username is required");
        const { data, error } = await supabase.auth.signUp({ email: form.email, password: form.password });
        if (error) throw error;
        if (data.user) {
          await supabase.from("profiles").upsert({ id: data.user.id, username: form.username, avatar_emoji: "🌿", lawn_zone: parseInt(form.zone), bio: "", is_pro: false });
          onAuth(data.user);
        }
      }
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#1b4332,#2d6a4f 40%,#40916c)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <GlobalStyles />
      <div className="fade" style={{ background: "white", borderRadius: 24, padding: "40px 36px", width: "100%", maxWidth: 420, boxShadow: "0 30px 80px rgba(0,0,0,.3)" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 10 }}>🌿</div>
          <h1 style={{ fontFamily: "'Lora',serif", fontSize: 26, fontWeight: 700, color: "#1b4332", marginBottom: 4 }}>GreenScape</h1>
          <p style={{ fontSize: 13, color: "#74c69d" }}>The community for lawn lovers</p>
        </div>

        {mode === "forgot" ? (
          <div style={{ marginBottom: 20 }}>
            <button className="btn" onClick={() => { setMode("login"); setResetSent(false); setError(""); }} style={{ background: "none", border: "none", color: "#2d6a4f", fontSize: 13, fontWeight: 600, padding: 0, cursor: "pointer" }}>← Back to Sign In</button>
            <h2 style={{ fontFamily: "'Lora',serif", fontSize: 18, color: "#1b4332", marginTop: 12, marginBottom: 4 }}>Reset Password</h2>
            <p style={{ fontSize: 12, color: "#6b8e7a" }}>Enter your email and we'll send you a reset link.</p>
          </div>
        ) : (
          <div style={{ display: "flex", background: "#f0f7f0", borderRadius: 12, padding: 4, marginBottom: 24 }}>
            {["login", "signup"].map(m => (
              <button key={m} className="btn" onClick={() => { setMode(m); setError(""); setResetSent(false); }} style={{ flex: 1, padding: "9px", borderRadius: 10, background: mode === m ? "white" : "transparent", color: mode === m ? "#1b4332" : "#74c69d", fontWeight: mode === m ? 600 : 400, fontSize: 13, border: "none", boxShadow: mode === m ? "0 2px 8px rgba(0,0,0,.08)" : "none" }}>
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>
        )}

        {resetSent ? (
          <div style={{ background: "#d8f3dc", color: "#1b4332", padding: 16, borderRadius: 12, textAlign: "center", fontSize: 13, lineHeight: 1.6 }}>
            ✅ Reset email sent! Check your inbox and follow the link to reset your password.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {mode === "signup" && <input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} placeholder="Username (e.g. MowMaster_Jake)" style={{ padding: "12px 16px", borderRadius: 12, border: "1.5px solid #d8f3dc", fontSize: 14, background: "#fafff9" }} />}
            <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email address" type="email" style={{ padding: "12px 16px", borderRadius: 12, border: "1.5px solid #d8f3dc", fontSize: 14, background: "#fafff9" }} />
            {mode !== "forgot" && <input value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Password" type="password" onKeyDown={e => e.key === "Enter" && handleSubmit()} style={{ padding: "12px 16px", borderRadius: 12, border: "1.5px solid #d8f3dc", fontSize: 14, background: "#fafff9" }} />}
            {mode === "signup" && (
              <select value={form.zone} onChange={e => setForm(f => ({ ...f, zone: e.target.value }))} style={{ padding: "12px 16px", borderRadius: 12, border: "1.5px solid #d8f3dc", fontSize: 14, background: "#fafff9" }}>
                {[1,2,3,4,5,6,7,8,9,10,11,12,13].map(z => <option key={z} value={z}>Lawn Zone {z}</option>)}
              </select>
            )}
          </div>
        )}

        {error && <div style={{ background: "#fee2e2", color: "#991b1b", padding: "10px 14px", borderRadius: 10, fontSize: 12, marginTop: 12 }}>{error}</div>}

        {!resetSent && (
          <GreenBtn onClick={handleSubmit} disabled={loading} style={{ width: "100%", marginTop: 20, padding: "13px", fontSize: 15, borderRadius: 14 }}>
            {loading ? "Please wait…" : mode === "login" ? "Sign In 🌿" : mode === "signup" ? "Create Account 🌿" : "Send Reset Link 📧"}
          </GreenBtn>
        )}

        {mode === "login" && !resetSent && (
          <p style={{ textAlign: "center", fontSize: 12, color: "#95a89e", marginTop: 10 }}>
            <span onClick={() => { setMode("forgot"); setError(""); }} style={{ color: "#2d6a4f", fontWeight: 600, cursor: "pointer" }}>Forgot your password?</span>
          </p>
        )}

        {mode !== "forgot" && (
          <p style={{ textAlign: "center", fontSize: 12, color: "#95a89e", marginTop: 10 }}>
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <span onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }} style={{ color: "#2d6a4f", fontWeight: 600, cursor: "pointer" }}>
              {mode === "login" ? "Sign up free" : "Sign in"}
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

// ─── HEADER ───────────────────────────────────────────────────────────────────
const Header = ({ page, setPage, user, profile, onSignOut }) => (
  <header style={{ background: "linear-gradient(135deg,#1b4332,#2d6a4f 55%,#40916c)", padding: "0 20px", position: "sticky", top: 0, zIndex: 200, boxShadow: "0 4px 24px rgba(0,0,0,.22)" }}>
    <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", alignItems: "center", gap: 16, padding: "12px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer", flexShrink: 0 }} onClick={() => setPage("feed")}>
        <span style={{ fontSize: 24 }}>🌿</span>
        <div>
          <div style={{ fontFamily: "'Lora',serif", fontWeight: 700, fontSize: 19, color: "#d8f3dc", lineHeight: 1 }}>GreenScape</div>
          <div style={{ fontSize: 9, color: "#74c69d", letterSpacing: 2, textTransform: "uppercase" }}>Community</div>
        </div>
      </div>

      <nav style={{ display: "flex", gap: 2, marginLeft: "auto" }}>
        {[
          { id: "feed", label: "🏡 Feed" },
          { id: "marketplace", label: "🛒 Market" },
          { id: "map", label: "📍 Map" },
        ].map(t => (
          <button key={t.id} className="btn" onClick={() => setPage(t.id)} style={{ padding: "7px 13px", borderRadius: 20, background: page === t.id ? "rgba(255,255,255,.18)" : "transparent", color: page === t.id ? "#d8f3dc" : "#95d5b2", fontSize: 13, fontWeight: 500, border: "none" }}>
            {t.label}
          </button>
        ))}
      </nav>

      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <button className="btn" onClick={() => setPage("messages")} style={{ position: "relative", width: 36, height: 36, borderRadius: "50%", background: page === "messages" ? "rgba(255,255,255,.2)" : "rgba(255,255,255,.08)", border: "none", fontSize: 16, color: "white" }}>💬</button>
        <button className="btn" onClick={() => setPage("notifications")} style={{ position: "relative", width: 36, height: 36, borderRadius: "50%", background: page === "notifications" ? "rgba(255,255,255,.2)" : "rgba(255,255,255,.08)", border: "none", fontSize: 16, color: "white" }}>🔔</button>
        <button className="btn" onClick={() => setPage("profile")} style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#74c69d,#40916c)", border: "2px solid rgba(255,255,255,.3)", fontSize: 16 }}>
          {profile?.avatar_emoji || "🌿"}
        </button>
        <button className="btn" onClick={onSignOut} style={{ padding: "6px 12px", borderRadius: 16, background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.2)", color: "#d8f3dc", fontSize: 11, fontWeight: 500 }}>
          Sign out
        </button>
      </div>
    </div>
  </header>
);

// ─── FEED PAGE ────────────────────────────────────────────────────────────────
const FeedPage = ({ user, profile }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState("All");
  const [showCompose, setShowCompose] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", category: "Discussion", tags: "" });
  const [submitting, setSubmitting] = useState(false);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => { fetchPosts(); }, [activeCat]);

  const fetchPosts = async () => {
    setLoading(true);
    let query = supabase.from("posts").select("*, profiles(username, avatar_emoji, badge, lawn_zone)").order("created_at", { ascending: false }).limit(20);
    if (activeCat !== "All") query = query.eq("category", activeCat);
    const { data } = await query;
    if (data) setPosts(data);
    setLoading(false);
  };

  const handleLike = async (postId, liked, currentLikes) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, liked: !liked, likes: liked ? currentLikes - 1 : currentLikes + 1 } : p));
    if (liked) {
      await supabase.from("likes").delete().eq("user_id", user.id).eq("post_id", postId);
      await supabase.from("posts").update({ likes: currentLikes - 1 }).eq("id", postId);
    } else {
      await supabase.from("likes").insert({ user_id: user.id, post_id: postId });
      await supabase.from("posts").update({ likes: currentLikes + 1 }).eq("id", postId);
    }
  };

  const handleMediaSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMediaFile(file);
    setMediaType(file.type.startsWith("video") ? "video" : "image");
    setMediaPreview(URL.createObjectURL(file));
  };

  const handlePublish = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    setSubmitting(true);
    let mediaUrl = null;
    if (mediaFile) {
      const ext = mediaFile.name.split(".").pop();
      const path = `posts/${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("media").upload(path, mediaFile, { contentType: mediaFile.type });
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from("media").getPublicUrl(path);
        mediaUrl = urlData?.publicUrl;
      }
    }
    const tags = form.tags.split(",").map(t => t.trim()).filter(Boolean);
    const { data } = await supabase.from("posts").insert({
      author_id: user.id, category: form.category, title: form.title,
      content: form.content, tags, likes: 0, comments: 0,
      image_url: mediaUrl, media_type: mediaType,
    }).select("*, profiles(username, avatar_emoji, badge, lawn_zone)").single();
    if (data) setPosts(prev => [data, ...prev]);
    setForm({ title: "", content: "", category: "Discussion", tags: "" });
    setMediaFile(null); setMediaPreview(null); setMediaType(null);
    setShowCompose(false);
    setSubmitting(false);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 290px", gap: 24, maxWidth: 1120, margin: "28px auto", padding: "0 20px" }}>
      <div>
        {/* Compose bar */}
        <div style={{ background: "white", borderRadius: 16, padding: "14px 18px", marginBottom: 18, boxShadow: "0 2px 14px rgba(45,106,79,.07)", display: "flex", gap: 10, alignItems: "center", border: "1px solid #eaf5ea" }}>
          <Avatar user={profile} />
          <div onClick={() => setShowCompose(true)} style={{ flex: 1, padding: "10px 16px", borderRadius: 24, background: "#f0f7f0", cursor: "pointer", fontSize: 13, color: "#6b8e7a", border: "1.5px solid #d8f3dc" }}>
            Share your lawn wins, questions, or tips…
          </div>
          <GreenBtn small onClick={() => setShowCompose(true)}>Post</GreenBtn>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 7, marginBottom: 18, flexWrap: "wrap" }}>
          {["All", "Success", "Question", "Tips", "Showcase", "Discussion"].map(c => (
            <button key={c} className="btn" onClick={() => setActiveCat(c)} style={{ padding: "6px 16px", borderRadius: 20, background: activeCat === c ? "#2d6a4f" : "white", color: activeCat === c ? "white" : "#4a7c59", fontWeight: 500, fontSize: 12, border: `1.5px solid ${activeCat === c ? "#2d6a4f" : "#d8f3dc"}` }}>
              {c}
            </button>
          ))}
        </div>

        {/* Posts */}
        {loading ? <Spinner /> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {posts.length === 0 && <div style={{ textAlign: "center", padding: 48, color: "#74c69d", fontFamily: "'Lora',serif", fontSize: 17 }}>🌱 No posts yet. Be the first to share!</div>}
            {posts.map(post => (
              <article key={post.id} className="card fade" style={{ background: "white", borderRadius: 16, padding: "20px 24px", boxShadow: "0 2px 16px rgba(45,106,79,.07)", border: "1px solid #eaf5ea" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <Avatar user={post.profiles} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#1b4332" }}>{post.profiles?.username || "User"}</div>
                    <div style={{ fontSize: 11, color: "#95a89e" }}>{new Date(post.created_at).toLocaleDateString()} · Zone {post.profiles?.lawn_zone}</div>
                  </div>
                  <span style={{ padding: "3px 11px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: CAT_COLORS[post.category]?.bg || "#f0f7f0", color: CAT_COLORS[post.category]?.text || "#2d6a4f", border: `1px solid ${CAT_COLORS[post.category]?.border || "#74c69d"}` }}>{post.category}</span>
                </div>
                <h3 style={{ fontFamily: "'Lora',serif", fontWeight: 700, fontSize: 17, color: "#1b4332", marginBottom: 9, lineHeight: 1.4 }}>{post.title}</h3>
                <p style={{ fontSize: 14, color: "#4a6358", lineHeight: 1.75, marginBottom: 13 }}>{post.content}</p>
                {post.tags?.length > 0 && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                    {post.tags.map(t => <span key={t} className="pill" style={{ padding: "3px 10px", borderRadius: 12, fontSize: 11, background: "#f0f7f0", color: "#2d6a4f", border: "1px solid #d8f3dc", cursor: "pointer", transition: "all .15s" }}>#{t}</span>)}
                  </div>
                )}
                <div style={{ display: "flex", gap: 8, borderTop: "1px solid #f0f7f0", paddingTop: 13 }}>
                  <button className="btn" onClick={() => handleLike(post.id, post.liked, post.likes)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 14px", borderRadius: 20, background: post.liked ? "#d8f3dc" : "#f5f5f5", color: post.liked ? "#1b4332" : "#6b8e7a", fontWeight: 600, fontSize: 12, border: `1.5px solid ${post.liked ? "#74c69d" : "#eee"}` }}>
                    {post.liked ? "💚" : "🤍"} {post.likes || 0}
                  </button>
                  <button className="btn" style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 14px", borderRadius: 20, background: "#f5f5f5", color: "#6b8e7a", fontWeight: 600, fontSize: 12, border: "1.5px solid #eee" }}>
                    💬 {post.comments || 0}
                  </button>
                  <button className="btn" style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 14px", borderRadius: 20, background: "#f5f5f5", color: "#6b8e7a", fontWeight: 600, fontSize: 12, border: "1.5px solid #eee" }}>
                    🔗 Share
                  </button>
                </div>
                {/* Show image or video if present */}
                {post.image_url && post.media_type === "image" && (
                  <img src={post.image_url} alt="post media" style={{ width: "100%", borderRadius: 12, marginTop: 12, maxHeight: 400, objectFit: "cover" }} />
                )}
                {post.image_url && post.media_type === "video" && (
                  <video src={post.image_url} controls style={{ width: "100%", borderRadius: 12, marginTop: 12, maxHeight: 400 }} />
                )}
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Sidebar */}
      <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ background: "linear-gradient(135deg,#1b4332,#2d6a4f)", borderRadius: 16, padding: 20, color: "white" }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🌱</div>
          <h2 style={{ fontFamily: "'Lora',serif", fontSize: 16, marginBottom: 7 }}>Welcome, {profile?.username || "Lawn Lover"}!</h2>
          <p style={{ fontSize: 12, color: "#95d5b2", lineHeight: 1.6, marginBottom: 14 }}>Share your wins, ask questions, and grow with the community.</p>
          <GreenBtn onClick={() => setShowCompose(true)} style={{ width: "100%", background: "rgba(255,255,255,.15)", border: "1.5px solid rgba(255,255,255,.3)", boxShadow: "none" }}>✍️ Create a Post</GreenBtn>
        </div>

        <div style={{ background: "white", borderRadius: 16, padding: 18, boxShadow: "0 2px 14px rgba(45,106,79,.07)", border: "1px solid #eaf5ea" }}>
          <h3 style={{ fontFamily: "'Lora',serif", fontSize: 14, color: "#1b4332", marginBottom: 12 }}>🔥 Trending Tags</h3>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["springlawn","bermuda","aeration","stripes","overseeding","fescue","zoysia","fertilizer"].map(t => (
              <span key={t} className="pill" style={{ padding: "4px 10px", borderRadius: 12, fontSize: 11, background: "#f0f7f0", color: "#2d6a4f", border: "1px solid #d8f3dc", cursor: "pointer", transition: "all .15s" }}>#{t}</span>
            ))}
          </div>
        </div>

        <div style={{ background: "linear-gradient(135deg,#f0f7f0,#e8f5e9)", borderRadius: 16, padding: 16, border: "1.5px solid #b7e4c7" }}>
          <div style={{ display: "flex", gap: 7, alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 18 }}>☀️</span>
            <span style={{ fontFamily: "'Lora',serif", fontSize: 13, fontWeight: 700, color: "#1b4332" }}>Spring Tip</span>
          </div>
          <p style={{ fontSize: 12, color: "#4a6358", lineHeight: 1.6 }}>Apply pre-emergent before crabgrass germinates. Target soil temps of 50–55°F.</p>
        </div>
      </aside>

      {/* Compose Modal */}
      {showCompose && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div className="fade" style={{ background: "white", borderRadius: 20, padding: 28, width: "100%", maxWidth: 540, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 60px rgba(0,0,0,.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Lora',serif", fontSize: 19, color: "#1b4332" }}>Create a Post</h2>
              <button className="btn" onClick={() => { setShowCompose(false); setMediaFile(null); setMediaPreview(null); }} style={{ background: "none", border: "none", fontSize: 18, color: "#999" }}>✕</button>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
              {["Success", "Question", "Tips", "Showcase", "Discussion"].map(c => (
                <button key={c} className="btn" onClick={() => setForm(f => ({ ...f, category: c }))} style={{ padding: "5px 13px", borderRadius: 20, background: form.category === c ? CAT_COLORS[c].bg : "#f5f5f5", color: form.category === c ? CAT_COLORS[c].text : "#888", fontWeight: 600, fontSize: 11, border: form.category === c ? `1.5px solid ${CAT_COLORS[c].border}` : "1.5px solid #eee" }}>
                  {c}
                </button>
              ))}
            </div>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Post title…" style={{ width: "100%", padding: "11px 14px", borderRadius: 10, marginBottom: 10, border: "1.5px solid #d8f3dc", fontSize: 14, background: "#fafff9", fontFamily: "'Lora',serif" }} />
            <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Share your experience, question, or tip…" rows={4} style={{ width: "100%", padding: "11px 14px", borderRadius: 10, marginBottom: 10, border: "1.5px solid #d8f3dc", fontSize: 13, background: "#fafff9", resize: "vertical" }} />
            <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="Tags: bermuda, spring, fertilizer" style={{ width: "100%", padding: "10px 14px", borderRadius: 10, marginBottom: 14, border: "1.5px solid #d8f3dc", fontSize: 13, background: "#fafff9" }} />

            {/* Media Upload */}
            <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleMediaSelect} style={{ display: "none" }} />
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <button className="btn" onClick={() => fileInputRef.current?.click()} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 20, background: "#f0f7f0", color: "#2d6a4f", fontWeight: 600, fontSize: 12, border: "1.5px solid #d8f3dc" }}>
                📷 Add Photo
              </button>
              <button className="btn" onClick={() => fileInputRef.current?.click()} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 20, background: "#f0f7f0", color: "#2d6a4f", fontWeight: 600, fontSize: 12, border: "1.5px solid #d8f3dc" }}>
                🎥 Add Video
              </button>
            </div>

            {/* Media Preview */}
            {mediaPreview && (
              <div style={{ position: "relative", marginBottom: 14 }}>
                {mediaType === "image" ? (
                  <img src={mediaPreview} alt="preview" style={{ width: "100%", borderRadius: 12, maxHeight: 200, objectFit: "cover" }} />
                ) : (
                  <video src={mediaPreview} controls style={{ width: "100%", borderRadius: 12, maxHeight: 200 }} />
                )}
                <button className="btn" onClick={() => { setMediaFile(null); setMediaPreview(null); setMediaType(null); }} style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,.6)", color: "white", border: "none", borderRadius: "50%", width: 28, height: 28, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <GreenBtn ghost onClick={() => { setShowCompose(false); setMediaFile(null); setMediaPreview(null); }}>Cancel</GreenBtn>
              <GreenBtn onClick={handlePublish} disabled={submitting}>{submitting ? "Posting…" : "Publish 🌿"}</GreenBtn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── MARKETPLACE PAGE ─────────────────────────────────────────────────────────
const MarketplacePage = ({ user, profile }) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", desc: "", category: "Tools", price: "", isFree: false, condition: "Used" });

  useEffect(() => { fetchListings(); }, [activeCat]);

  const fetchListings = async () => {
    setLoading(true);
    let query = supabase.from("listings").select("*, profiles(username, avatar_emoji)").eq("is_sold", false).order("created_at", { ascending: false });
    if (activeCat !== "All") query = query.eq("category", activeCat);
    const { data } = await query;
    if (data) setListings(data);
    setLoading(false);
  };

  const handlePost = async () => {
    if (!form.title || !form.desc) return;
    const { data } = await supabase.from("listings").insert({
      seller_id: user.id,
      category: form.category,
      title: form.title,
      description: form.desc,
      price: form.isFree ? 0 : parseFloat(form.price) || 0,
      is_free: form.isFree,
      condition: form.condition,
      location: profile?.city || "USA",
      is_sold: false,
    }).select("*, profiles(username, avatar_emoji)").single();
    if (data) setListings(prev => [data, ...prev]);
    setForm({ title: "", desc: "", category: "Tools", price: "", isFree: false, condition: "Used" });
    setShowForm(false);
  };

  const MCAT = { Tools: { bg: "#fff3cd", text: "#664d03" }, Seeds: { bg: "#d8f3dc", text: "#1b4332" }, Services: { bg: "#d1ecf1", text: "#0c5460" }, Fertilizers: { bg: "#fde2e4", text: "#721c24" }, Free: { bg: "#e2d9f3", text: "#432874" } };

  return (
    <div style={{ maxWidth: 1120, margin: "28px auto", padding: "0 20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
        <div>
          <h1 style={{ fontFamily: "'Lora',serif", fontSize: 26, color: "#1b4332", fontWeight: 700 }}>🛒 Marketplace</h1>
          <p style={{ fontSize: 13, color: "#6b8e7a", marginTop: 3 }}>Buy, sell & trade lawn gear, seeds, and services</p>
        </div>
        <GreenBtn onClick={() => setShowForm(true)}>+ Post a Listing</GreenBtn>
      </div>
      <div style={{ display: "flex", gap: 7, marginBottom: 22, flexWrap: "wrap" }}>
        {["All", "Tools", "Seeds", "Services", "Fertilizers", "Free"].map(c => (
          <button key={c} className="btn" onClick={() => setActiveCat(c)} style={{ padding: "6px 16px", borderRadius: 20, background: activeCat === c ? "#2d6a4f" : "white", color: activeCat === c ? "white" : "#4a7c59", fontWeight: 500, fontSize: 12, border: `1.5px solid ${activeCat === c ? "#2d6a4f" : "#d8f3dc"}` }}>{c}</button>
        ))}
      </div>
      {loading ? <Spinner /> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))", gap: 18 }}>
          {listings.length === 0 && <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 48, color: "#74c69d", fontFamily: "'Lora',serif" }}>🌱 No listings yet. Post the first one!</div>}
          {listings.map(l => (
            <div key={l.id} className="card fade" style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 16px rgba(45,106,79,.08)", border: "1px solid #eaf5ea" }}>
              <div style={{ height: 120, background: "linear-gradient(135deg,#d8f3dc,#b7e4c7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44 }}>🌿</div>
              <div style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <h3 style={{ fontFamily: "'Lora',serif", fontSize: 14, fontWeight: 700, color: "#1b4332", flex: 1, marginRight: 8, lineHeight: 1.3 }}>{l.title}</h3>
                  <span style={{ fontFamily: "'Lora',serif", fontSize: 15, fontWeight: 700, color: "#1b4332" }}>{l.is_free ? "Free" : `$${l.price}`}</span>
                </div>
                <p style={{ fontSize: 12, color: "#6b8e7a", lineHeight: 1.6, marginBottom: 10 }}>{l.description?.slice(0, 80)}{l.description?.length > 80 ? "…" : ""}</p>
                <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                  <span style={{ padding: "2px 8px", borderRadius: 10, fontSize: 10, fontWeight: 600, background: MCAT[l.category]?.bg || "#f0f7f0", color: MCAT[l.category]?.text || "#2d6a4f" }}>{l.category}</span>
                  <span style={{ fontSize: 11, color: "#95a89e" }}>· {l.condition}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Avatar user={l.profiles} size={22} />
                    <span style={{ fontSize: 11, color: "#4a7c59" }}>{l.profiles?.username}</span>
                  </div>
                  <GreenBtn small>Message</GreenBtn>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div className="fade" style={{ background: "white", borderRadius: 20, padding: 28, width: "100%", maxWidth: 500, boxShadow: "0 24px 60px rgba(0,0,0,.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Lora',serif", fontSize: 18, color: "#1b4332" }}>Post a Listing</h2>
              <button className="btn" onClick={() => setShowForm(false)} style={{ background: "none", border: "none", fontSize: 18, color: "#999" }}>✕</button>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
              {["Tools", "Seeds", "Services", "Fertilizers", "Free"].map(c => (
                <button key={c} className="btn" onClick={() => setForm(f => ({ ...f, category: c, isFree: c === "Free" }))} style={{ padding: "5px 12px", borderRadius: 20, background: form.category === c ? "#2d6a4f" : "#f5f5f5", color: form.category === c ? "white" : "#666", fontWeight: 600, fontSize: 11, border: "none" }}>{c}</button>
              ))}
            </div>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="What are you listing?" style={{ width: "100%", padding: "10px 13px", borderRadius: 10, border: "1.5px solid #d8f3dc", fontSize: 13, background: "#fafff9", marginBottom: 10 }} />
            <textarea value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} placeholder="Describe the item or service…" rows={3} style={{ width: "100%", padding: "10px 13px", borderRadius: 10, border: "1.5px solid #d8f3dc", fontSize: 13, background: "#fafff9", resize: "vertical", marginBottom: 10 }} />
            <input value={form.isFree ? "" : form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} disabled={form.isFree} placeholder={form.isFree ? "Free" : "Price in $"} style={{ width: "100%", padding: "10px 13px", borderRadius: 10, border: "1.5px solid #d8f3dc", fontSize: 13, background: form.isFree ? "#f5f5f5" : "#fafff9", marginBottom: 20 }} />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <GreenBtn ghost onClick={() => setShowForm(false)}>Cancel</GreenBtn>
              <GreenBtn onClick={handlePost}>Post Listing 🛒</GreenBtn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── MESSAGES PAGE ────────────────────────────────────────────────────────────
const MessagesPage = ({ user, profile }) => {
  const [convos, setConvos] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => { fetchConvos(); }, []);
  useEffect(() => { if (active) fetchMessages(active.id); }, [active]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const fetchConvos = async () => {
    const { data } = await supabase.from("conversations").select("*, p1:profiles!conversations_participant_1_fkey(username,avatar_emoji), p2:profiles!conversations_participant_2_fkey(username,avatar_emoji)").or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`).order("last_message_at", { ascending: false });
    if (data) setConvos(data);
  };

  const fetchMessages = async (convoId) => {
    const { data } = await supabase.from("messages").select("*, profiles(username,avatar_emoji)").eq("conversation_id", convoId).order("created_at", { ascending: true });
    if (data) setMessages(data);
  };

  const sendMsg = async () => {
    if (!input.trim() || !active) return;
    const msg = { conversation_id: active.id, sender_id: user.id, content: input.trim(), read: false };
    const { data } = await supabase.from("messages").insert(msg).select("*, profiles(username,avatar_emoji)").single();
    if (data) setMessages(prev => [...prev, data]);
    await supabase.from("conversations").update({ last_message_at: new Date().toISOString() }).eq("id", active.id);
    setInput("");
  };

  const getOther = (convo) => convo.participant_1 === user.id ? convo.p2 : convo.p1;

  return (
    <div style={{ maxWidth: 1120, margin: "28px auto", padding: "0 20px" }}>
      <h1 style={{ fontFamily: "'Lora',serif", fontSize: 26, color: "#1b4332", fontWeight: 700, marginBottom: 20 }}>💬 Messages</h1>
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", background: "white", borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 24px rgba(45,106,79,.1)", border: "1px solid #eaf5ea", height: 520 }}>
        <div style={{ borderRight: "1px solid #f0f7f0", overflowY: "auto" }}>
          <div style={{ padding: "14px 16px 8px", fontSize: 11, fontWeight: 700, color: "#95a89e", textTransform: "uppercase", letterSpacing: 1 }}>Conversations</div>
          {convos.length === 0 && <div style={{ padding: 20, fontSize: 12, color: "#95a89e", textAlign: "center" }}>No messages yet</div>}
          {convos.map(c => {
            const other = getOther(c);
            return (
              <div key={c.id} onClick={() => setActive(c)} style={{ display: "flex", gap: 10, padding: "12px 16px", cursor: "pointer", background: active?.id === c.id ? "#f0f7f0" : "white", borderLeft: active?.id === c.id ? "3px solid #2d6a4f" : "3px solid transparent" }}>
                <Avatar user={other} size={36} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1b4332" }}>{other?.username}</div>
                  <div style={{ fontSize: 11, color: "#95a89e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Tap to view</div>
                </div>
              </div>
            );
          })}
        </div>
        {active ? (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 20px", borderBottom: "1px solid #f0f7f0" }}>
              <Avatar user={getOther(active)} size={34} />
              <span style={{ fontSize: 14, fontWeight: 600, color: "#1b4332" }}>{getOther(active)?.username}</span>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
              {messages.map(m => {
                const isMe = m.sender_id === user.id;
                return (
                  <div key={m.id} style={{ display: "flex", flexDirection: isMe ? "row-reverse" : "row", gap: 8, alignItems: "flex-end" }}>
                    {!isMe && <Avatar user={m.profiles} size={26} />}
                    <div style={{ maxWidth: "70%", padding: "10px 14px", borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: isMe ? "linear-gradient(135deg,#2d6a4f,#40916c)" : "#f0f7f0", color: isMe ? "white" : "#1b4332", fontSize: 13, lineHeight: 1.55 }}>
                      {m.content}
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
            <div style={{ padding: "12px 16px", borderTop: "1px solid #f0f7f0", display: "flex", gap: 10 }}>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMsg()} placeholder="Type a message…" style={{ flex: 1, padding: "10px 16px", borderRadius: 24, border: "1.5px solid #d8f3dc", fontSize: 13, background: "#fafff9" }} />
              <button className="btn" onClick={sendMsg} style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#2d6a4f,#40916c)", border: "none", fontSize: 16, color: "white" }}>➤</button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#74c69d", fontFamily: "'Lora',serif", fontSize: 15 }}>Select a conversation 🌿</div>
        )}
      </div>
    </div>
  );
};

// ─── NOTIFICATIONS PAGE ───────────────────────────────────────────────────────
const NotificationsPage = ({ user }) => {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("notifications").select("*, actor:profiles!notifications_actor_id_fkey(username,avatar_emoji)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(30);
      if (data) setNotifs(data);
      setLoading(false);
    };
    fetch();
  }, []);

  const markAll = async () => {
    await supabase.from("notifications").update({ read: true }).eq("user_id", user.id);
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  };

  const icons = { like: "💚", comment: "💬", message: "📩", marketplace_interest: "🛒" };

  return (
    <div style={{ maxWidth: 680, margin: "28px auto", padding: "0 20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h1 style={{ fontFamily: "'Lora',serif", fontSize: 26, color: "#1b4332", fontWeight: 700 }}>🔔 Notifications</h1>
        <GreenBtn small ghost onClick={markAll}>Mark all read</GreenBtn>
      </div>
      {loading ? <Spinner /> : (
        <div style={{ background: "white", borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 24px rgba(45,106,79,.08)", border: "1px solid #eaf5ea" }}>
          {notifs.length === 0 && <div style={{ padding: 40, textAlign: "center", color: "#74c69d", fontFamily: "'Lora',serif" }}>🌱 You're all caught up!</div>}
          {notifs.map((n, i) => (
            <div key={n.id} onClick={() => setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))} style={{ display: "flex", gap: 12, padding: "16px 20px", cursor: "pointer", borderBottom: i < notifs.length - 1 ? "1px solid #f5f5f5" : "none", background: n.read ? "white" : "#f0f7f0", borderLeft: `3px solid ${n.read ? "transparent" : "#2d6a4f"}` }}>
              <Avatar user={n.actor} size={38} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, color: "#1b4332", lineHeight: 1.5, fontWeight: n.read ? 400 : 500 }}>{n.message}</p>
                <div style={{ fontSize: 11, color: "#95a89e", marginTop: 3 }}>{new Date(n.created_at).toLocaleDateString()}</div>
              </div>
              <span style={{ fontSize: 16 }}>{icons[n.type] || "🔔"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── PROFILE PAGE ─────────────────────────────────────────────────────────────
const ProfilePage = ({ user, profile, setProfile }) => {
  const [posts, setPosts] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: profile?.username || "", bio: profile?.bio || "", lawn_zone: profile?.lawn_zone || 7 });

  useEffect(() => {
    supabase.from("posts").select("*").eq("author_id", user.id).order("created_at", { ascending: false }).then(({ data }) => { if (data) setPosts(data); });
  }, []);

  const saveProfile = async () => {
    const { data } = await supabase.from("profiles").update({ username: form.username, bio: form.bio, lawn_zone: form.lawn_zone }).eq("id", user.id).select().single();
    if (data) setProfile(data);
    setEditing(false);
  };

  return (
    <div style={{ maxWidth: 820, margin: "28px auto", padding: "0 20px" }}>
      <div style={{ background: "linear-gradient(135deg,#1b4332,#2d6a4f,#40916c)", borderRadius: 20, padding: "32px 28px", marginBottom: 20, position: "relative", overflow: "hidden", boxShadow: "0 6px 30px rgba(27,67,50,.3)" }}>
        <div style={{ position: "absolute", top: -30, right: -30, fontSize: 150, opacity: .05 }}>🌿</div>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#d8f3dc,#74c69d)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, border: "4px solid rgba(255,255,255,.3)", flexShrink: 0 }}>
            {profile?.avatar_emoji || "🌿"}
          </div>
          <div style={{ flex: 1 }}>
            {editing ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} style={{ padding: "8px 12px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,.3)", background: "rgba(255,255,255,.15)", color: "white", fontSize: 14 }} />
                <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Your bio…" rows={2} style={{ padding: "8px 12px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,.3)", background: "rgba(255,255,255,.15)", color: "white", fontSize: 13, resize: "none" }} />
                <select value={form.lawn_zone} onChange={e => setForm(f => ({ ...f, lawn_zone: e.target.value }))} style={{ padding: "8px 12px", borderRadius: 10, border: "none", fontSize: 13 }}>
                  {[1,2,3,4,5,6,7,8,9,10,11,12,13].map(z => <option key={z} value={z}>Zone {z}</option>)}
                </select>
                <div style={{ display: "flex", gap: 8 }}>
                  <GreenBtn small onClick={saveProfile} style={{ background: "rgba(255,255,255,.2)", border: "1.5px solid rgba(255,255,255,.4)", boxShadow: "none" }}>Save</GreenBtn>
                  <GreenBtn small ghost onClick={() => setEditing(false)} style={{ border: "1.5px solid rgba(255,255,255,.3)", color: "white" }}>Cancel</GreenBtn>
                </div>
              </div>
            ) : (
              <>
                <h1 style={{ fontFamily: "'Lora',serif", fontSize: 22, color: "white", fontWeight: 700, marginBottom: 4 }}>{profile?.username || "Lawn Lover"}</h1>
                <p style={{ fontSize: 13, color: "#95d5b2", marginBottom: 8, lineHeight: 1.5 }}>{profile?.bio || "No bio yet."}</p>
                <div style={{ display: "flex", gap: 14, fontSize: 12, color: "#74c69d" }}>
                  <span>🌿 Zone {profile?.lawn_zone}</span>
                  <span>📅 Member since {new Date(user.created_at).toLocaleDateString()}</span>
                </div>
              </>
            )}
          </div>
          {!editing && <GreenBtn small onClick={() => setEditing(true)} style={{ background: "rgba(255,255,255,.15)", border: "1.5px solid rgba(255,255,255,.3)", boxShadow: "none" }}>Edit Profile</GreenBtn>}
        </div>

        <div style={{ display: "flex", marginTop: 24, background: "rgba(0,0,0,.15)", borderRadius: 14, overflow: "hidden" }}>
          {[{ l: "Posts", v: posts.length }, { l: "Likes Given", v: 0 }, { l: "Zone", v: profile?.lawn_zone || "—" }].map((s, i, arr) => (
            <div key={s.l} style={{ flex: 1, textAlign: "center", padding: "13px", borderRight: i < arr.length - 1 ? "1px solid rgba(255,255,255,.1)" : "none" }}>
              <div style={{ fontFamily: "'Lora',serif", fontSize: 20, fontWeight: 700, color: "white" }}>{s.v}</div>
              <div style={{ fontSize: 11, color: "#95d5b2", marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <h2 style={{ fontFamily: "'Lora',serif", fontSize: 18, color: "#1b4332", marginBottom: 16 }}>My Posts</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {posts.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "#74c69d", fontFamily: "'Lora',serif" }}>🌱 No posts yet. Share your first win!</div>}
        {posts.map(p => (
          <div key={p.id} style={{ background: "white", borderRadius: 14, padding: "16px 20px", border: "1px solid #eaf5ea", boxShadow: "0 2px 10px rgba(45,106,79,.06)" }}>
            <span style={{ padding: "2px 10px", borderRadius: 10, fontSize: 10, fontWeight: 700, background: CAT_COLORS[p.category]?.bg || "#f0f7f0", color: CAT_COLORS[p.category]?.text || "#2d6a4f", marginBottom: 8, display: "inline-block" }}>{p.category}</span>
            <h3 style={{ fontFamily: "'Lora',serif", fontSize: 15, color: "#1b4332", marginBottom: 4 }}>{p.title}</h3>
            <p style={{ fontSize: 13, color: "#6b8e7a" }}>{p.content?.slice(0, 100)}…</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── MAP PAGE ─────────────────────────────────────────────────────────────────
const MapPage = () => {
  const [members, setMembers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    supabase.from("profiles").select("*").then(({ data }) => { if (data) setMembers(data); });
  }, []);

  const shown = filter === "Pros" ? members.filter(m => m.is_pro) : members;
  const toXY = (lat, lng) => ({ x: ((lng + 130) / 65) * 700, y: ((50 - lat) / 25) * 380 });

  return (
    <div style={{ maxWidth: 1120, margin: "28px auto", padding: "0 20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h1 style={{ fontFamily: "'Lora',serif", fontSize: 26, color: "#1b4332", fontWeight: 700 }}>📍 Community Map</h1>
        <div style={{ display: "flex", gap: 7 }}>
          {["All", "Pros"].map(f => (
            <button key={f} className="btn" onClick={() => setFilter(f)} style={{ padding: "7px 18px", borderRadius: 20, background: filter === f ? "#2d6a4f" : "white", color: filter === f ? "white" : "#4a7c59", fontWeight: 500, fontSize: 12, border: `1.5px solid ${filter === f ? "#2d6a4f" : "#d8f3dc"}` }}>
              {f === "Pros" ? "⭐ Pros Only" : "👥 All Members"}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 20 }}>
        <div style={{ background: "white", borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 24px rgba(45,106,79,.1)", border: "1px solid #eaf5ea" }}>
          <svg viewBox="0 0 700 380" style={{ width: "100%", height: "auto", display: "block" }}>
            <rect width="700" height="380" fill="#e8f5e9" />
            <path d="M80,80 L600,80 L630,120 L640,200 L580,280 L520,300 L460,310 L380,320 L280,310 L180,290 L120,240 L80,180 Z" fill="#c8e6c9" stroke="#a5d6a7" strokeWidth="2" />
            {[100,200,300,400,500,600].map(x => <line key={x} x1={x} y1={0} x2={x} y2={380} stroke="#b7e4c7" strokeWidth=".5" strokeDasharray="4,4" />)}
            {[80,160,240,320].map(y => <line key={y} x1={0} y1={y} x2={700} y2={y} stroke="#b7e4c7" strokeWidth=".5" strokeDasharray="4,4" />)}
            {shown.filter(u => u.lat && u.lng).map(u => {
              const { x, y } = toXY(u.lat, u.lng);
              const isSel = selected?.id === u.id;
              return (
                <g key={u.id} style={{ cursor: "pointer" }} onClick={() => setSelected(u)}>
                  <circle cx={x} cy={y} r={isSel ? 15 : 11} fill={u.is_pro ? "#2d6a4f" : "#74c69d"} stroke="white" strokeWidth="2.5" style={{ filter: isSel ? "drop-shadow(0 0 8px rgba(45,106,79,.6))" : "" }} />
                  <text x={x} y={y + 4} textAnchor="middle" fontSize="10">{u.avatar_emoji || "🌿"}</text>
                </g>
              );
            })}
          </svg>
        </div>
        <div>
          {selected ? (
            <div className="fade" style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 4px 20px rgba(45,106,79,.1)", border: "1px solid #eaf5ea" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <Avatar user={selected} size={48} />
                <button className="btn" onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "#999", fontSize: 16 }}>✕</button>
              </div>
              <h3 style={{ fontFamily: "'Lora',serif", fontSize: 15, color: "#1b4332", marginBottom: 4 }}>{selected.username}</h3>
              <p style={{ fontSize: 12, color: "#6b8e7a", marginBottom: 10, lineHeight: 1.5 }}>{selected.bio || "No bio yet."}</p>
              <div style={{ fontSize: 12, color: "#95a89e", marginBottom: 14 }}>🌿 Zone {selected.lawn_zone}</div>
              <GreenBtn small style={{ width: "100%" }}>Message</GreenBtn>
            </div>
          ) : (
            <div style={{ background: "linear-gradient(135deg,#f0f7f0,#e8f5e9)", borderRadius: 16, padding: 20, border: "1.5px solid #b7e4c7", textAlign: "center" }}>
              <div style={{ fontSize: 30, marginBottom: 8 }}>📍</div>
              <p style={{ fontFamily: "'Lora',serif", fontSize: 13, color: "#1b4332" }}>Click a pin to view a member's profile</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function GreenScapeApp() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [page, setPage] = useState("feed");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    setProfile(data);
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1b4332,#2d6a4f)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <GlobalStyles />
      <div style={{ fontSize: 52 }}>🌿</div>
      <div style={{ fontFamily: "'Lora',serif", fontSize: 22, color: "white" }}>GreenScape</div>
      <Spinner />
    </div>
  );

  if (!user) return <><GlobalStyles /><AuthPage onAuth={(u) => setUser(u)} /></>;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#f0f7f0,#e8f5e9 40%,#f5f0e8 100%)" }}>
      <GlobalStyles />
      <Header page={page} setPage={setPage} user={user} profile={profile} onSignOut={handleSignOut} />
      {page === "feed"          && <FeedPage user={user} profile={profile} />}
      {page === "marketplace"   && <MarketplacePage user={user} profile={profile} />}
      {page === "map"           && <MapPage />}
      {page === "messages"      && <MessagesPage user={user} profile={profile} />}
      {page === "notifications" && <NotificationsPage user={user} />}
      {page === "profile"       && <ProfilePage user={user} profile={profile} setProfile={setProfile} />}

      {/* Mobile bottom nav */}
      <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "white", borderTop: "1px solid #eaf5ea", display: "flex", justifyContent: "space-around", padding: "8px 0 12px", zIndex: 190, boxShadow: "0 -4px 20px rgba(45,106,79,.1)" }}>
        {[
          { id: "feed", icon: "🏡", label: "Feed" },
          { id: "marketplace", icon: "🛒", label: "Market" },
          { id: "map", icon: "📍", label: "Map" },
          { id: "messages", icon: "💬", label: "DMs" },
          { id: "notifications", icon: "🔔", label: "Alerts" },
          { id: "profile", icon: "🌾", label: "Me" },
        ].map(t => (
          <button key={t.id} className="btn" onClick={() => setPage(t.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, background: "none", border: "none", color: page === t.id ? "#2d6a4f" : "#95a89e", fontSize: 18, minWidth: 48 }}>
            {t.icon}
            <span style={{ fontSize: 9, fontWeight: page === t.id ? 600 : 400 }}>{t.label}</span>
          </button>
        ))}
      </nav>
      <div style={{ height: 70 }} />
    </div>
  );
}

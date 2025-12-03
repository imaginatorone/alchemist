import { useEffect, useState, useRef } from "react";
import {
  requestLoginCode,
  verifyLoginCode,
  fetchLibrary,
  addDemoTrack,
} from "./api";
import type { UserTrack } from "./api";

import { animate, stagger } from "animejs";

function App() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"login" | "code" | "app">("login");
  const [code, setCode] = useState("");
  const [debugCode, setDebugCode] = useState<string | null>(null);
  const [library, setLibrary] = useState<UserTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentTrack, setCurrentTrack] = useState<UserTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : true
  );

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // =======================
  //  AUTH + LIBRARY
  // =======================

  useEffect(() => {
    const token = localStorage.getItem("alchemist_token");
    if (token) {
      setStep("app");
      loadLibrary();
    }
  }, []);

  async function loadLibrary() {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchLibrary();
      setLibrary(data);
      if (!currentTrack && data.length > 0) {
        setCurrentTrack(data[0]);
      }
    } catch (e: any) {
      console.error(e);
      if (e.message === "unauthorized") {
        localStorage.removeItem("alchemist_token");
        setStep("login");
      } else {
        setError("Не удалось загрузить библиотеку");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleRequestCode() {
    try {
      setLoading(true);
      setError(null);
      const result = await requestLoginCode(email);
      setStep("code");
      if (result.debug_code) {
        setDebugCode(result.debug_code);
      }
    } catch (e) {
      console.error(e);
      setError("Не удалось отправить код");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode() {
    try {
      setLoading(true);
      setError(null);
      await verifyLoginCode(email, code);
      setStep("app");
      await loadLibrary();
    } catch (e) {
      console.error(e);
      setError("Неверный код");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddDemoTrack() {
    try {
      setLoading(true);
      setError(null);
      await addDemoTrack();
      await loadLibrary();
    } catch (e) {
      console.error(e);
      setError("Не удалось добавить трек");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("alchemist_token");
    setLibrary([]);
    setEmail("");
    setCode("");
    setCurrentTrack(null);
    setIsPlaying(false);
    setStep("login");
  }

  // =======================
  //  AUDIO LOGIC
  // =======================

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!currentTrack || !currentTrack.track.audio_url) {
      audio.pause();
      audio.removeAttribute("src");
      setIsPlaying(false);
      return;
    }

    audio.src = currentTrack.track.audio_url;

    if (isPlaying) {
      audio
        .play()
        .then(() => {})
        .catch((err) => {
          console.error("Audio play error", err);
          setIsPlaying(false);
        });
    }
  }, [currentTrack, isPlaying]);

  function handleTrackClick(ut: UserTrack) {
    setCurrentTrack(ut);
    if (ut.track.audio_url) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }

  function togglePlayPause() {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.error("Audio play error", err);
        });
    }
  }

  // =======================
  //  RESPONSIVE
  // =======================

  useEffect(() => {
    function onResize() {
      setIsMobile(window.innerWidth < 768);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // =======================
  //  ANIME.JS
  // =======================

  // появление основной карточки
  useEffect(() => {
    const shell = document.querySelector(".alch-shell") as HTMLElement | null;
    if (!shell) return;

    animate(shell, {
      opacity: [0, 1],
      translateY: [24, 0],
      duration: 600,
      easing: "easeOutQuad",
    });

    const logo = document.querySelector(".alch-logo") as HTMLElement | null;
    if (logo) {
      animate(logo, {
        scale: [0.9, 1],
        duration: 500,
        delay: 200,
        easing: "easeOutBack",
      });
    }
  }, [step]);

  // анимация списка треков при изменении
  useEffect(() => {
    const rows = document.querySelectorAll(
      ".alch-track-row"
    ) as NodeListOf<HTMLElement>;
    if (!rows.length) return;

    animate(rows, {
      opacity: [0, 1],
      translateY: [10, 0],
      delay: stagger(40),
      duration: 300,
      easing: "easeOutQuad",
    });
  }, [library.length]);

  const accent = "#22c55e";

  // =======================
  //  UI
  // =======================

  return (
    <div
      className="alch-root"
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: isMobile ? "16px" : "32px",
        background:
          "radial-gradient(circle at top, #064e3b 0, #020617 45%, #000 100%)",
        color: "#e5e7eb",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div
        className="alch-shell"
        style={{
          width: "100%",
          maxWidth: isMobile ? 520 : 1080,
          minHeight: isMobile ? "auto" : 520,
          padding: isMobile ? 18 : 24,
          borderRadius: 28,
          background:
            "linear-gradient(145deg, rgba(15,23,42,0.96), rgba(6,78,59,0.9))",
          boxShadow:
            "0 30px 80px rgba(0,0,0,0.85), 0 0 0 1px rgba(34,197,94,0.12)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(148,163,184,0.35)",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        {/* HEADER */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              className="alch-logo"
              style={{
                width: 40,
                height: 40,
                borderRadius: 999,
                background:
                  "conic-gradient(from 140deg, #22c55e, #22d3ee, #22c55e)",
                boxShadow: "0 0 22px rgba(34,197,94,0.55)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "30% 70% 35% 65%",
                  background: "#020617",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: 0,
                    height: 0,
                    borderTop: "6px solid transparent",
                    borderBottom: "6px solid transparent",
                    borderLeft: `10px solid ${accent}`,
                    marginLeft: 2,
                  }}
                />
              </div>
            </div>

            <div>
              <h1
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  letterSpacing: 0.4,
                }}
              >
                Alchemist
              </h1>
              <p
                style={{
                  fontSize: 13,
                  color: "#9ca3af",
                }}
              >
                Одна оффлайн-библиотека музыки для всех устройств.
              </p>
            </div>
          </div>

          {step === "app" && (
            <button
              onClick={handleLogout}
              style={{
                borderRadius: 999,
                border: "1px solid rgba(148,163,184,0.4)",
                background: "rgba(15,23,42,0.8)",
                color: "#9ca3af",
                padding: "6px 12px",
                fontSize: 12,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Выйти
            </button>
          )}
        </header>

        {error && (
          <div
            style={{
              marginTop: -4,
              marginBottom: 4,
              padding: "8px 12px",
              borderRadius: 12,
              background:
                "linear-gradient(135deg, rgba(248,113,113,0.18), rgba(127,29,29,0.65))",
              color: "#fee2e2",
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        {/* LOGIN / CODE */}
        {(step === "login" || step === "code") && (
          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: 18,
              alignItems: "stretch",
            }}
          >
            <div style={{ flex: 1 }}>
              {step === "login" && (
                <>
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      marginBottom: 6,
                      color: "#d1d5db",
                    }}
                  >
                    Email для входа
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 14,
                      border: "1px solid rgba(148,163,184,0.6)",
                      background: "rgba(15,23,42,0.8)",
                      color: "#e5e7eb",
                      marginBottom: 10,
                      outline: "none",
                      fontSize: 14,
                    }}
                  />
                  <button
                    onClick={handleRequestCode}
                    disabled={loading || !email}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 16,
                      border: "none",
                      background: loading
                        ? "linear-gradient(135deg,#16a34a,#16a34a)"
                        : "linear-gradient(135deg,#22c55e,#22d3ee)",
                      color: "#020617",
                      fontWeight: 600,
                      cursor: loading || !email ? "not-allowed" : "pointer",
                      opacity: loading || !email ? 0.6 : 1,
                      boxShadow: "0 0 25px rgba(34,197,94,0.4)",
                    }}
                  >
                    {loading ? "Отправляем..." : "Получить код входа"}
                  </button>
                </>
              )}

              {step === "code" && (
                <>
                  <p
                    style={{
                      fontSize: 13,
                      marginBottom: 8,
                      color: "#9ca3af",
                    }}
                  >
                    Мы отправили код входа на <b>{email}</b>.
                  </p>

                  {debugCode && (
                    <p
                      style={{
                        fontSize: 12,
                        marginBottom: 6,
                        color: accent,
                      }}
                    >
                      Dev-код: <b>{debugCode}</b>
                    </p>
                  )}

                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      marginBottom: 6,
                      color: "#d1d5db",
                    }}
                  >
                    Код
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 14,
                      border: "1px solid rgba(148,163,184,0.6)",
                      background: "rgba(15,23,42,0.85)",
                      color: "#e5e7eb",
                      marginBottom: 12,
                      letterSpacing: 4,
                      textAlign: "center",
                      outline: "none",
                      fontSize: 16,
                    }}
                  />
                  <button
                    onClick={handleVerifyCode}
                    disabled={loading || !code}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 16,
                      border: "none",
                      background: loading
                        ? "linear-gradient(135deg,#22d3ee,#22d3ee)"
                        : "linear-gradient(135deg,#22d3ee,#22c55e)",
                      color: "#020617",
                      fontWeight: 600,
                      cursor: loading || !code ? "not-allowed" : "pointer",
                      opacity: loading || !code ? 0.6 : 1,
                      boxShadow: "0 0 25px rgba(34,197,94,0.4)",
                    }}
                  >
                    {loading ? "Проверяем..." : "Войти"}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* MAIN APP */}
        {step === "app" && (
          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: 20,
              marginTop: 4,
            }}
          >
            {/* LEFT: LIBRARY */}
            <section
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div>
                  <h2
                    style={{
                      fontSize: 18,
                      fontWeight: 600,
                      marginBottom: 2,
                    }}
                  >
                    Моя библиотека
                  </h2>
                  <p
                    style={{
                      fontSize: 12,
                      color: "#9ca3af",
                    }}
                  >
                    {library.length > 0
                      ? `${library.length} трек(ов)`
                      : "Пока пусто — добавь демо-трек ниже"}
                  </p>
                </div>
              </div>

              <button
                onClick={handleAddDemoTrack}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: 14,
                  border: "none",
                  background: loading
                    ? "linear-gradient(135deg,#16a34a,#22c55e)"
                    : "linear-gradient(135deg,#22c55e,#22d3ee)",
                  color: "#020617",
                  fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.8 : 1,
                  boxShadow: "0 0 22px rgba(34,197,94,0.45)",
                  fontSize: 14,
                }}
              >
                {loading
                  ? "Обновляем библиотеку..."
                  : "Добавить демо-трек в библиотеку"}
              </button>

              <div
                style={{
                  flex: 1,
                  maxHeight: isMobile ? 260 : 320,
                  overflowY: "auto",
                  paddingRight: 4,
                  marginTop: 4,
                }}
              >
                {library.length === 0 && !loading && (
                  <p style={{ fontSize: 13, color: "#6b7280" }}>
                    Здесь пока пусто. Добавь первый трек 👆
                  </p>
                )}

                {library.map((ut) => {
                  const isActive = currentTrack?.id === ut.id;
                  const playable = !!ut.track.audio_url;

                  return (
                    <div
                      key={ut.id}
                      className="alch-track-row"
                      onClick={() => handleTrackClick(ut)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "8px 10px",
                        borderRadius: 14,
                        background: isActive
                          ? "linear-gradient(135deg,rgba(6,95,70,0.95),rgba(15,23,42,0.98))"
                          : "rgba(15,23,42,0.85)",
                        border: isActive
                          ? "1px solid rgba(34,197,94,0.9)"
                          : "1px solid rgba(30,64,175,0.4)",
                        marginBottom: 8,
                        gap: 10,
                        cursor: "pointer",
                        transition:
                          "background 0.15s ease, transform 0.1s ease, box-shadow 0.15s ease",
                        boxShadow: isActive
                          ? "0 0 18px rgba(34,197,94,0.4)"
                          : "none",
                      }}
                    >
                      <div
                        style={{
                          position: "relative",
                          width: 44,
                          height: 44,
                          borderRadius: 14,
                          background: ut.track.cover_url
                            ? `url(${ut.track.cover_url}) center/cover no-repeat`
                            : "linear-gradient(135deg,#22c55e,#22d3ee)",
                          overflow: "hidden",
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 500,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {ut.track.title}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "#9ca3af",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {ut.track.artist || ut.track.source}
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          textTransform: "uppercase",
                          letterSpacing: 1,
                          color: playable ? accent : "#f97373",
                          opacity: 0.9,
                        }}
                      >
                        {playable ? "Готов" : "Нет аудио"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* RIGHT: NOW PLAYING */}
            <section
              style={{
                flexBasis: isMobile ? "auto" : "38%",
                marginTop: isMobile ? 8 : 0,
              }}
            >
              <div
                style={{
                  borderRadius: 20,
                  padding: 14,
                  background:
                    "radial-gradient(circle at 0 0,rgba(34,197,94,0.24),transparent 55%), radial-gradient(circle at 100% 100%,rgba(56,189,248,0.18),transparent 55%), rgba(15,23,42,0.92)",
                  border: "1px solid rgba(148,163,184,0.5)",
                  minHeight: 160,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      textTransform: "uppercase",
                      letterSpacing: 1.6,
                      color: "#9ca3af",
                      marginBottom: 4,
                    }}
                  >
                    Сейчас играет
                  </div>

                  {currentTrack ? (
                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: 16,
                          background: currentTrack.track.cover_url
                            ? `url(${currentTrack.track.cover_url}) center/cover no-repeat`
                            : "linear-gradient(135deg,#22c55e,#22d3ee)",
                          boxShadow:
                            "0 0 20px rgba(34,197,94,0.5), 0 0 40px rgba(34,197,94,0.3)",
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 15,
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {currentTrack.track.title}
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: "#a1a1aa",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {currentTrack.track.artist ||
                            currentTrack.track.source}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p
                      style={{
                        fontSize: 13,
                        color: "#9ca3af",
                      }}
                    >
                      Ничего не играет. Выбери трек слева, чтобы начать алхимию
                      🧪
                    </p>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    marginTop: 4,
                  }}
                >
                  <button
                    onClick={togglePlayPause}
                    disabled={!currentTrack || !currentTrack.track.audio_url}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "999px",
                      border: "none",
                      background: currentTrack?.track.audio_url
                        ? "linear-gradient(135deg,#22c55e,#22d3ee)"
                        : "rgba(75,85,99,0.4)",
                      color: "#020617",
                      fontSize: 18,
                      fontWeight: 700,
                      cursor:
                        !currentTrack || !currentTrack.track.audio_url
                          ? "not-allowed"
                          : "pointer",
                      boxShadow: currentTrack?.track.audio_url
                        ? "0 0 20px rgba(34,197,94,0.6)"
                        : "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {isPlaying ? "⏸" : "▶"}
                  </button>

                  <div
                    style={{
                      flex: 1,
                      fontSize: 11,
                      color: "#9ca3af",
                      lineHeight: 1.5,
                    }}
                  >
                    <div>Потом сюда подвяжем Discord Rich Presence.</div>
                    <div style={{ opacity: 0.9, marginTop: 2 }}>
                      Сейчас это чистый оффлайн-плеер с демо-треком и
                      синхронизацией библиотеки через backend.
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        <audio ref={audioRef} style={{ display: "none" }} />
      </div>
    </div>
  );
}

export default App;

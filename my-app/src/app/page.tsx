"use client";

import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { siteConfig, type SiteConfig, type ThemeMode } from "./site-config";

type ContactForm = {
  name: string;
  email: string;
};

type LinkPreset = {
  key: keyof SiteConfig["links"];
  label: string;
  accent: {
    bg: string;
    text: string;
    border?: string;
    icon: string;
  };
  helper?: string;
};

const LINK_PRESETS: LinkPreset[] = [
  {
    key: "kakaoOpenChat",
    label: "Kakao Open Chat",
    accent: { bg: "#FEE500", text: "#111111", icon: "Ka" },
    helper: "오픈채팅 바로가기",
  },
  {
    key: "youtube",
    label: "YouTube",
    accent: { bg: "#FF0000", text: "#ffffff", icon: "YT" },
    helper: "유튜브 채널/영상",
  },
  {
    key: "threads",
    label: "Threads",
    accent: { bg: "#18181B", text: "#ffffff", icon: "Th" },
    helper: "threads.net",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    accent: { bg: "#0A66C2", text: "#ffffff", icon: "in" },
    helper: "프로필/페이지",
  },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ArrowIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path
      d="M5 12h14M13 6l6 6-6 6"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SunIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
    <path
      d="M12 2v2m0 16v2m10-10h-2M4 12H2m16.95-6.95-1.4 1.4M6.45 17.55l-1.4 1.4m12.9 0-1.4-1.4M6.45 6.45l-1.4-1.4"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const MoonIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path
      d="M21 13.5A9 9 0 0 1 10.5 3 7.5 7.5 0 1 0 21 13.5Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

type LinkButtonProps = {
  label: string;
  url: string;
  accent: LinkPreset["accent"];
  helper?: string;
};

function LinkButton({ label, url, accent, helper }: LinkButtonProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="focus-ring flex w-full items-center justify-between rounded-xl border px-4 py-4 transition-transform"
      style={{
        backgroundColor: "var(--button-bg)",
        borderColor: "var(--border)",
        boxShadow: "var(--shadow-soft)",
        color: "var(--foreground)",
      }}
    >
      <div className="flex items-center gap-3">
        <span
          className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold uppercase tracking-tight"
          style={{
            backgroundColor: accent.bg,
            color: accent.text,
            border: accent.border ? `1px solid ${accent.border}` : "none",
            boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)",
          }}
        >
          {accent.icon}
        </span>
        <div className="flex flex-col text-left">
          <span className="text-lg font-semibold">{label}</span>
          <span
            className="text-sm"
            style={{
              color: "var(--muted)",
            }}
          >
            {helper ?? "새 탭에서 열기"}
          </span>
        </div>
      </div>
      <ArrowIcon />
    </a>
  );
}

type ThemeToggleProps = {
  theme: ThemeMode;
  onToggle: () => void;
};

function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="focus-ring flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors"
      style={{
        backgroundColor: "var(--button-bg)",
        color: "var(--foreground)",
        border: `1px solid var(--border)`,
      }}
      aria-label={theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
    >
      <span
        className="flex h-8 w-8 items-center justify-center rounded-full"
        style={{ backgroundColor: "var(--button-hover)" }}
        aria-hidden
      >
        {theme === "dark" ? <SunIcon /> : <MoonIcon />}
      </span>
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}

type ContactModalProps = {
  open: boolean;
  form: ContactForm;
  errors: Partial<ContactForm>;
  onChange: (field: keyof ContactForm, value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
  isValid: boolean;
};

function ContactModal({
  open,
  form,
  errors,
  onChange,
  onSubmit,
  onClose,
  isValid,
}: ContactModalProps) {
  if (!open) return null;

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "var(--overlay)" }}
      onClick={handleOverlayClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby="contact-title"
    >
      <div
        className="w-full max-w-lg rounded-2xl border p-6"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
          boxShadow: "var(--shadow-card)",
          color: "var(--foreground)",
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="contact-title" className="text-xl font-bold">
              문의하기
            </h2>
            <p
              className="mt-1 text-sm"
              style={{ color: "var(--muted)" }}
            >
              이름과 이메일을 입력하면 기본 메일 앱이 열립니다.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring rounded-full p-2 transition-colors"
            style={{ color: "var(--muted)" }}
            aria-label="모달 닫기"
          >
            ✕
          </button>
        </div>

        <form
          className="mt-5 flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <label className="flex flex-col gap-2 text-sm font-medium">
            이름 *
            <input
              className="focus-ring w-full rounded-lg border px-3 py-3 transition-colors"
              style={{
                backgroundColor: "var(--input-bg)",
                borderColor: errors.name ? "var(--danger)" : "var(--border)",
                color: "var(--foreground)",
                boxShadow: "var(--shadow-soft)",
              }}
              name="name"
              value={form.name}
              onChange={(event) => onChange("name", event.target.value)}
              placeholder="이름을 입력해주세요"
              autoComplete="name"
            />
            {errors.name ? (
              <span className="text-sm" style={{ color: "var(--danger)" }}>
                {errors.name}
              </span>
            ) : null}
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium">
            이메일 *
            <input
              className="focus-ring w-full rounded-lg border px-3 py-3 transition-colors"
              style={{
                backgroundColor: "var(--input-bg)",
                borderColor: errors.email ? "var(--danger)" : "var(--border)",
                color: "var(--foreground)",
                boxShadow: "var(--shadow-soft)",
              }}
              type="email"
              name="email"
              value={form.email}
              onChange={(event) => onChange("email", event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              inputMode="email"
            />
            {errors.email ? (
              <span className="text-sm" style={{ color: "var(--danger)" }}>
                {errors.email}
              </span>
            ) : null}
          </label>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="focus-ring inline-flex items-center justify-center rounded-lg px-4 py-3 text-sm font-semibold transition-colors"
              style={{
                backgroundColor: "var(--button-bg)",
                border: `1px solid var(--border)`,
                color: "var(--foreground)",
              }}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className="focus-ring inline-flex items-center justify-center rounded-lg px-4 py-3 text-sm font-semibold transition-colors disabled:opacity-60"
              style={{
                backgroundColor: "var(--accent-strong)",
                color: "#ffffff",
                border: "1px solid transparent",
              }}
            >
              보내기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Home() {
  const [theme, setTheme] = useState<ThemeMode>(siteConfig.theme.default);
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<ContactForm>({ name: "", email: "" });
  const [errors, setErrors] = useState<Partial<ContactForm>>({});

  useEffect(() => {
    const stored =
      siteConfig.theme.persist && typeof window !== "undefined"
        ? window.localStorage.getItem(siteConfig.theme.storageKey)
        : null;
    const initialTheme: ThemeMode =
      stored === "light" || stored === "dark"
        ? stored
        : siteConfig.theme.default;
    setTheme(initialTheme);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.setProperty(
      "color-scheme",
      theme === "dark" ? "dark" : "light",
    );
    if (siteConfig.theme.persist) {
      window.localStorage.setItem(siteConfig.theme.storageKey, theme);
    }
  }, [theme, mounted]);

  useEffect(() => {
    if (!isModalOpen) {
      setErrors({});
      return;
    }
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [isModalOpen]);

  const activeLinks = useMemo(
    () => LINK_PRESETS.filter((link) => siteConfig.links[link.key]),
    [],
  );

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  const handleChange = useCallback(
    (field: keyof ContactForm, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const validateForm = useCallback(() => {
    const nextErrors: Partial<ContactForm> = {};
    if (!form.name.trim()) {
      nextErrors.name = "이름을 입력해주세요.";
    }
    if (!EMAIL_REGEX.test(form.email.trim())) {
      nextErrors.email = "이메일 형식을 확인해주세요.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [form]);

  const handleSubmit = useCallback(() => {
    const isValid = validateForm();
    if (!isValid) return;
    const subject = `[문의] ${siteConfig.brandName}`;
    const body = `이름: ${form.name}\n이메일: ${form.email}\n내용: `;
    const mailto = `mailto:${siteConfig.contact.mailto}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    try {
      window.location.href = mailto;
      setIsModalOpen(false);
    } catch (error) {
      // eslint-disable-next-line no-alert
      alert("메일 앱을 열 수 없습니다.");
    }
  }, [form.email, form.name, validateForm]);

  const isFormValid =
    form.name.trim().length > 0 && EMAIL_REGEX.test(form.email.trim());

  const cardStyle = {
    backgroundColor: "var(--card)",
    borderColor: "var(--border)",
    boxShadow: "var(--shadow-card)",
    color: "var(--foreground)",
  };

  const softCardStyle = {
    backgroundColor: "var(--surface)",
    borderColor: "var(--border)",
    boxShadow: "var(--shadow-soft)",
    color: "var(--foreground)",
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
    >
      <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-4 py-10 sm:px-6">
        <header
          className="flex items-center justify-between gap-4 rounded-2xl border px-4 py-3"
          style={softCardStyle}
        >
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-[var(--accent)] text-sm font-semibold text-white shadow-sm flex items-center justify-center">
              {siteConfig.brandName.slice(0, 1).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-base font-semibold">
                {siteConfig.brandName}
              </span>
              <span className="text-sm" style={{ color: "var(--muted)" }}>
                Theme: {theme === "dark" ? "Dark" : "Light"}
              </span>
            </div>
          </div>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </header>

        <main className="mt-6 flex flex-1 flex-col gap-6">
          <section className="rounded-2xl border px-6 py-8" style={cardStyle}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-2">
                <p
                  className="text-sm font-medium uppercase tracking-[0.08em]"
                  style={{ color: "var(--muted)" }}
                >
                  My Links
                </p>
                <h1 className="text-3xl font-bold tracking-tight">
                  {siteConfig.title}
                </h1>
                {siteConfig.subtitle ? (
                  <p className="text-base leading-relaxed" style={{ color: "var(--muted)" }}>
                    {siteConfig.subtitle}
                  </p>
                ) : null}
              </div>
              <span
                className="rounded-full px-3 py-1 text-xs font-semibold"
                style={{
                  backgroundColor: "var(--button-bg)",
                  border: `1px solid var(--border)`,
                  color: "var(--muted)",
                }}
              >
                모바일 우선
              </span>
            </div>
          </section>

          <section className="rounded-2xl border px-4 py-5" style={cardStyle}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">링크</h2>
              <span className="text-sm" style={{ color: "var(--muted)" }}>
                새 탭에서 열림
              </span>
            </div>
            <div className="mt-4 flex flex-col gap-3">
              {activeLinks.length === 0 ? (
                <div
                  className="rounded-xl border px-4 py-5 text-sm"
                  style={{
                    backgroundColor: "var(--surface)",
                    borderColor: "var(--border)",
                    color: "var(--muted)",
                  }}
                >
                  노출할 링크가 없습니다. config에 URL을 추가해주세요.
                </div>
              ) : (
                activeLinks.map((link) => (
                  <LinkButton
                    key={link.key}
                    label={link.label}
                    url={siteConfig.links[link.key] ?? "#"}
                    accent={link.accent}
                    helper={link.helper}
                  />
                ))
              )}
            </div>
          </section>

          <section
            className="rounded-2xl border px-6 py-6 sm:flex sm:items-center sm:justify-between sm:gap-6"
            style={cardStyle}
          >
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold">문의하기</h2>
              <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                버튼을 누르면 모달이 열리고, 이름/이메일 입력 후 메일 앱으로 연결됩니다.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="focus-ring mt-4 inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition-colors sm:mt-0"
              style={{
                backgroundColor: "var(--accent-strong)",
                color: "#ffffff",
                boxShadow: "var(--shadow-soft)",
              }}
            >
              문의하기
            </button>
          </section>
        </main>

        <footer
          className="mt-8 pb-2 text-center text-sm"
          style={{ color: "var(--muted)" }}
        >
          © {new Date().getFullYear()} {siteConfig.brandName}
        </footer>
      </div>

      <ContactModal
        open={isModalOpen}
        form={form}
        errors={errors}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onClose={() => setIsModalOpen(false)}
        isValid={isFormValid}
      />
    </div>
  );
}

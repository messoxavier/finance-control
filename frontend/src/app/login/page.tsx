"use client";

import styled, { keyframes } from "styled-components";
import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/context/auth";
import { useRouter } from "next/navigation";

// ====== Styles ======
const gradient = `linear-gradient(135deg, #0ea5e9 0%, #6366f1 50%, #111827 100%)`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(6px) }
  to   { opacity: 1; transform: translateY(0) }
`;

const Page = styled.div`
  height: 100dvh;            
  overflow: hidden;          
  display: grid;
  grid-template-columns: 1.2fr 1fr;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    height: auto;            
    overflow: auto;
  }
`;

const Hero = styled.section`
  background: ${gradient};
  color: #fff;
  display: grid;
  place-items: center;
  padding: 48px 16px;
  position: relative;
  overflow: hidden;

  /* shapes */
  &:before, &:after {
    content: "";
    position: absolute;
    border-radius: 999px;
    filter: blur(60px);
    opacity: .35;
  }
  &:before {
    width: 360px; height: 360px;
    background: #22d3ee;
    top: -60px; left: -60px;
  }
  &:after {
    width: 420px; height: 420px;
    background: #f472b6;
    right: -80px; bottom: -80px;
  }
`;

const HeroInner = styled.div`
  max-width: 640px;
  animation: ${fadeIn} .45s ease;
  text-align: center;
  h1 {
    font-size: clamp(28px, 4vw, 44px);
    line-height: 1.1;
    margin: 0 0 12px;
    letter-spacing: -0.02em;
  }
  p {
    opacity: .9;
    font-size: clamp(14px, 2vw, 16px);
  }
  .brand {
    display: inline-grid;
    grid-auto-flow: column;
    gap: 10px;
    align-items: center;
    margin-bottom: 16px;
    font-weight: 700;
    letter-spacing: .2px;
  }
  .brand svg { width: 28px; height: 28px; }
`;

const FormSide = styled.section`
  display: grid;
  place-items: center;
  padding: 32px 16px;
  background: #0b1220; /* subtle dark to contrast the glass */
  @media (max-width: 1024px) { background: #0b1220; }
`;

const Card = styled.form`
  width: 100%;
  max-width: 420px;
  backdrop-filter: blur(14px);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 24px;
  color: #e5e7eb;
  box-shadow: 0 10px 30px rgba(0,0,0,.25);
  display: grid;
  gap: 14px;
  animation: ${fadeIn} .35s ease;

  h2 {
    margin: 0 0 4px;
    font-size: 22px;
    color: #f3f4f6;
  }
  .subtitle {
    color: #9ca3af;
    font-size: 14px;
    margin-bottom: 4px;
  }
`;

const Field = styled.div`
  display: grid; gap: 6px;
`;

const LabelRow = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  label { font-size: 12px; color: #9ca3af; }
  a { color: #93c5fd; font-size: 12px; text-decoration: none; }
  a:hover { text-decoration: underline; }
`;

const InputWrap = styled.div`
  position: relative;
  display: grid;
`;

const Input = styled.input`
  padding: 12px 40px 12px 40px;
  border: 1px solid rgba(148,163,184,.35);
  background: rgba(2,6,23,.6);
  color: #e5e7eb;
  border-radius: 12px;
  outline: none;
  font-size: 14px;
  transition: border-color .15s ease, box-shadow .15s ease;

  &:focus {
    border-color: #60a5fa;
    box-shadow: 0 0 0 3px rgba(59,130,246,.25);
  }

  &::placeholder { color: #9ca3af; }
`;

const IconL = styled.span`
  position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
  display: grid; place-items: center; opacity: .8;
  svg { width: 18px; height: 18px; }
`;

const IconR = styled.button`
  position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
  display: grid; place-items: center;
  border: 0; background: transparent; color: #9ca3af; cursor: pointer;
  padding: 6px; border-radius: 8px;
  &:hover { background: rgba(148,163,184,.15); color: #e5e7eb; }
  svg { width: 18px; height: 18px; }
`;

const Row = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  margin-top: 6px;
  gap: 10px;

  .remember {
    display: inline-flex; align-items: center; gap: 8px;
    font-size: 13px; color: #cbd5e1;
    input { accent-color: #60a5fa; }
  }
`;

const Button = styled.button<{variant?: "primary" | "ghost"}>`
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid ${({variant}) => variant==="ghost" ? "rgba(148,163,184,.35)" : "#3b82f6"};
  background: ${({variant}) => variant==="ghost" ? "transparent" : "#3b82f6"};
  color: ${({variant}) => variant==="ghost" ? "#e5e7eb" : "#0b1220"};
  font-weight: 600;
  cursor: pointer;
  transition: transform .04s ease, filter .15s ease, background .15s ease;
  &:active { transform: translateY(1px); }
  &:hover  { filter: brightness(1.05); }
  &:disabled { opacity: .6; cursor: not-allowed; }
`;

const Muted = styled.div`
  color: #94a3b8; font-size: 12px; text-align: center;
`;

const ErrorBox = styled.div`
  color: #fecaca; background: rgba(239,68,68,.08);
  border: 1px solid rgba(239,68,68,.35);
  padding: 10px 12px; border-radius: 10px;
  font-size: 13px; animation: ${fadeIn} .2s ease;
`;

const InlineLinks = styled.div`
  display: grid; gap: 8px; margin-top: 8px;
  a { color: #93c5fd; font-size: 12px; text-decoration: none; text-align: center; }
  a:hover { text-decoration: underline; }
`;

const Spinner = styled.span`
  width: 16px; height: 16px; border-radius: 999px;
  display: inline-block; margin-left: 8px; vertical-align: middle;
  border: 2px solid rgba(255,255,255,.5);
  border-top-color: transparent;
  animation: spin .6s linear infinite;
  @keyframes spin { to { transform: rotate(360deg); } }
`;

// ====== Component ======
export default function LoginPage() {
  const { login, isLoading, user } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("demo@finance.local");
  const [password, setPassword] = useState("demo123");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // se já logado, enviar para /accounts
  useEffect(() => {
    if (!isLoading && user) router.replace("/accounts");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, user]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      // se não quiser lembrar, poderíamos limpar localStorage aqui.
      router.push("/accounts");
    } catch (err: any) {
      setError(err?.message || "Falha no login");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Page>
      <Hero>
        <HeroInner>
          <div className="brand">
            {/* logo simples em SVG */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeWidth="2" d="M3 12s3-7 9-7 9 7 9 7-3 7-9 7-9-7-9-7Z" />
              <path strokeWidth="2" d="M12 9v6m0 0c-2 0-3-1-3-3s1-3 3-3 3 1 3 3-1 3-3 3Z"/>
            </svg>
            <span>Finance Control</span>
          </div>
          <h1>Controle suas finanças com elegância.</h1>
          <p>Acompanhe contas, categorias e transações num fluxo rápido e moderno. Seu dashboard de finanças sem fricção.</p>
        </HeroInner>
      </Hero>

      <FormSide>
        <Card onSubmit={onSubmit} aria-describedby={error ? "login-error" : undefined}>
          <div>
            <h2>Bem-vindo de volta</h2>
            <div className="subtitle">Acesse sua conta para continuar</div>
          </div>

          {error && <ErrorBox id="login-error">{error}</ErrorBox>}

          <Field>
            <LabelRow><label htmlFor="email">E-mail</label></LabelRow>
            <InputWrap>
              <IconL aria-hidden>
                {/* email icon */}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeWidth="2" d="M4 6h16v12H4z" />
                  <path strokeWidth="2" d="m22 6-10 7L2 6" />
                </svg>
              </IconL>
              <Input
                id="email"
                type="email"
                placeholder="voce@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </InputWrap>
          </Field>

          <Field>
            <LabelRow>
              <label htmlFor="password">Senha</label>
              <a href="#" onClick={(e)=>e.preventDefault()} aria-disabled>Esqueci a senha</a>
            </LabelRow>
            <InputWrap>
              <IconL aria-hidden>
                {/* lock icon */}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="4" y="11" width="16" height="9" rx="2" strokeWidth="2"/>
                  <path strokeWidth="2" d="M8 11V8a4 4 0 0 1 8 0v3"/>
                </svg>
              </IconL>
              <Input
                id="password"
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <IconR type="button" aria-label={showPass ? "Ocultar senha" : "Mostrar senha"} onClick={() => setShowPass(s => !s)}>
                {showPass ? (
                  // eye-off
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeWidth="2" d="M3 3l18 18"/>
                    <path strokeWidth="2" d="M10.7 10.7A2 2 0 0 0 12 14a2 2 0 0 0 1.3-3.3M9.88 5.09A9.4 9.4 0 0 1 12 5c7 0 10 7 10 7a13.4 13.4 0 0 1-3.06 4.18M6.22 6.22A13.2 13.2 0 0 0 2 12s3 7 10 7c1.41 0 2.73-.22 3.94-.63"/>
                  </svg>
                ) : (
                  // eye
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeWidth="2" d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z"/>
                    <circle cx="12" cy="12" r="3" strokeWidth="2"/>
                  </svg>
                )}
              </IconR>
            </InputWrap>
          </Field>

          <Row>
            <label className="remember">
              <input type="checkbox" checked={remember} onChange={()=>setRemember(v => !v)} />
              Lembrar de mim
            </label>
          </Row>

          <Button type="submit" disabled={submitting || isLoading} aria-busy={submitting}>
            {submitting ? <>Entrando <Spinner/></> : "Entrar"}
          </Button>

          <InlineLinks>
            <a href="/accounts">Ver contas</a>
            <a href="/categories">Ver categorias</a>
          </InlineLinks>

          <Muted>
            Dica: <b>demo@finance.local / demo123</b>
          </Muted>
        </Card>
      </FormSide>
    </Page>
  );
}

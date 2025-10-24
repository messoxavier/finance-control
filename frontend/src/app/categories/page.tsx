"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";
import { useAuth } from "@/context/auth";
import { apiFetch } from "@/lib/api";
import styled, { keyframes, css } from "styled-components";
import Link from "next/link";

type CategoryType = "INCOME" | "EXPENSE";
type Category = { id: number; userId: number; name: string; type: CategoryType };

const fadeIn = keyframes`from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}`;
const shimmer = keyframes`100%{transform:translateX(100%)}`;

const Page = styled.div`
  min-height: 100dvh;
  color:#e5e7eb;
  background:
    radial-gradient(1400px 700px at 0% -20%, rgba(99,102,241,.12), transparent 60%),
    radial-gradient(800px 600px at 100% 0%, rgba(14,165,233,.10), transparent 55%),
    #0b1220;
`;
const Container = styled.div`max-width: 1100px; margin: 0 auto; padding: 24px;`;

const TopBar = styled.header`
  display:flex; align-items:center; gap:12px; margin-bottom:16px;
  h1{ margin:0; font-size:24px; letter-spacing:-.02em; }
`;

const CardGlass = styled.div<{padded?:boolean}>`
  backdrop-filter: blur(12px);
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,.25);
  animation: ${fadeIn} .25s ease;
  ${p => p.padded !== false && css`padding:16px;`}
`;

const StatGrid = styled.div`
  display:grid; gap:12px; grid-template-columns: repeat(3, 1fr);
  margin-bottom:16px;
  @media (max-width: 900px){ grid-template-columns: 1fr; }
`;
const StatCard = styled(CardGlass)`
  display:grid; gap:6px;
  .label{ color:#9ca3af; font-size:12px }
  .value{ font-size:20px; font-weight:700; letter-spacing:-.02em }
`;

const Toolbar = styled.div`
  display:flex; gap:10px; align-items:center;
  input, select{
    padding:10px 12px; border-radius:10px; border:1px solid rgba(148,163,184,.35);
    background: rgba(2,6,23,.6); color:#e5e7eb; outline:none
  }
  input:focus, select:focus{ border-color:#60a5fa; box-shadow:0 0 0 3px rgba(59,130,246,.25) }
  .spacer{ flex:1 }
`;

const Tabs = styled.div`
  display:inline-flex; border:1px solid rgba(148,163,184,.35); border-radius:12px; overflow:hidden;
  button{
    padding:8px 12px; background:transparent; color:#cbd5e1; border:0; cursor:pointer;
  }
  button[aria-pressed="true"]{
    background:rgba(148,163,184,.16); color:#fff;
  }
`;

const Grid = styled.div`
  display:grid; gap:12px; grid-template-columns: repeat(3, 1fr);
  @media (max-width: 1000px){ grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 640px){ grid-template-columns: 1fr; }
`;

const CatCard = styled(CardGlass)`
  padding:14px; display:grid; gap:8px; transition:transform .12s ease, box-shadow .12s ease;
  &:hover{ transform: translateY(-2px); box-shadow:0 12px 34px rgba(0,0,0,.32); }
  .name{ font-weight:600 }
  .row{ display:flex; align-items:center; gap:10px }
`;
const Badge = styled.span<{type:CategoryType}>`
  margin-left:auto; font-size:12px; padding:4px 8px; border-radius:999px; border:1px solid;
  ${({type}) => type === "INCOME"
    ? css`color:#22c55e; border-color:#22c55e80; background:rgba(34,197,94,.12);`
    : css`color:#ef4444; border-color:#ef444480; background:rgba(239,68,68,.12);`}
`;

const FormCard = styled.form`
  display:grid; gap:12px; grid-template-columns: 1fr 200px auto; align-items:end;
  @media (max-width: 820px){ grid-template-columns:1fr; }
  label{ font-size:12px; color:#9ca3af; display:grid; gap:6px }
  input, select{
    padding:12px; border-radius:10px; border:1px solid rgba(148,163,184,.35);
    background: rgba(2,6,23,.6); color:#e5e7eb; outline:none
  }
  input:focus, select:focus{ border-color:#60a5fa; box-shadow:0 0 0 3px rgba(59,130,246,.25) }
  button{
    height:44px; padding:0 14px; border-radius:10px; font-weight:600;
    border:1px solid #3b82f6; background:#3b82f6; color:#0b1220; cursor:pointer
  }
`;
const ErrorBox = styled.div`
  grid-column:1/-1; color:#fecaca; background:rgba(239,68,68,.08);
  border:1px solid rgba(239,68,68,.35); padding:10px 12px; border-radius:10px; font-size:13px;
`;
const Empty = styled(CardGlass)`padding:14px; text-align:center; color:#9ca3af;`;
const Skeleton = styled.div`
  position:relative; overflow:hidden; border-radius:16px; height:82px;
  background: rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08);
  &:after{ content:""; position:absolute; inset:0; transform:translateX(-100%);
    background: linear-gradient(90deg, transparent, rgba(255,255,255,.06), transparent);
    animation: ${shimmer} 1200ms infinite; }
`;

export default function CategoriesPage() {
  const { token, user, isLoading } = useAuth();
  const [data, setData] = useState<Category[] | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // form
  const [name, setName] = useState("");
  const [type, setType] = useState<CategoryType>("EXPENSE");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // filtros/busca
  const [tab, setTab] = useState<"ALL"|"EXPENSE"|"INCOME">("ALL");
  const [query, setQuery] = useState("");

  async function fetchCategories() {
    if (!token) return;
    setLoadingList(true); setError(null);
    try { setData(await apiFetch("/categories")); }
    catch (e:any) { setError(String(e.message || e)); }
    finally { setLoadingList(false); }
  }
  useEffect(() => { fetchCategories(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [token]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!name.trim()) { setFormError("Informe o nome da categoria."); return; }
    setSubmitting(true);
    try {
      await apiFetch("/categories", { method: "POST", body: JSON.stringify({ name: name.trim(), type }) });
      setName(""); setType("EXPENSE");
      await fetchCategories();
    } catch (e:any) {
      setFormError(e?.message || "Falha ao criar categoria.");
    } finally { setSubmitting(false); }
  }

  // derivados
  const counts = useMemo(() => ({
    all: (data ?? []).length,
    expense: (data ?? []).filter(c => c.type === "EXPENSE").length,
    income: (data ?? []).filter(c => c.type === "INCOME").length,
  }), [data]);

  const filtered = useMemo(() => {
    let list = (data ?? []);
    if (tab !== "ALL") list = list.filter(c => c.type === tab);
    if (query.trim()) list = list.filter(c => c.name.toLowerCase().includes(query.toLowerCase()));
    return list.sort((a,b)=>a.name.localeCompare(b.name));
  }, [data, tab, query]);

  if (isLoading) return <Container>Carregando...</Container>;
  if (!token || !user) {
    return (
      <Container>
        <p>Você precisa estar autenticado.</p>
        <Link href="/login">Ir para o login</Link>
      </Container>
    );
  }

  return (
    <Page>
      <Container>
        <TopBar>
          <h1>Categorias</h1>
        </TopBar>

        {/* KPIs */}
        <StatGrid>
          <StatCard><span className="label">Total de categorias</span><span className="value">{counts.all}</span></StatCard>
          <StatCard><span className="label">Despesas</span><span className="value">{counts.expense}</span></StatCard>
          <StatCard><span className="label">Receitas</span><span className="value">{counts.income}</span></StatCard>
        </StatGrid>

        {/* Filtros + busca + form */}
        <CardGlass style={{marginBottom:12}}>
          <Toolbar>
            <Tabs aria-label="Filtro de tipo">
              <button aria-pressed={tab==="ALL"} onClick={()=>setTab("ALL")}>Todas</button>
              <button aria-pressed={tab==="EXPENSE"} onClick={()=>setTab("EXPENSE")}>Despesas</button>
              <button aria-pressed={tab==="INCOME"} onClick={()=>setTab("INCOME")}>Receitas</button>
            </Tabs>
            <div className="spacer" />
            <input placeholder="Buscar por nome..." value={query} onChange={e=>setQuery(e.target.value)} />
          </Toolbar>
        </CardGlass>

        <CardGlass>
          <h3 style={{margin:"0 0 10px", color:"#cbd5e1", fontWeight:600}}>Adicionar categoria</h3>
          <FormCard onSubmit={onSubmit}>
            <label>Nome da categoria
              <input placeholder="Ex.: Alimentação" value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label>Tipo
              <select value={type} onChange={(e) => setType(e.target.value as CategoryType)}>
                <option value="EXPENSE">Despesa</option>
                <option value="INCOME">Receita</option>
              </select>
            </label>
            <button disabled={submitting} type="submit">
              {submitting ? "Adicionando..." : "Adicionar"}
            </button>
            {formError && <ErrorBox>{formError}</ErrorBox>}
          </FormCard>
        </CardGlass>

        {/* Lista */}
        {error && <div style={{marginTop:12}}><CardGlass><span style={{color:"#fecaca"}}>Erro: {error}</span></CardGlass></div>}
        {loadingList ? (
          <Grid style={{marginTop:12}}>
            {Array.from({length:6}).map((_,i)=><Skeleton key={i} />)}
          </Grid>
        ) : filtered.length === 0 ? (
          <div style={{marginTop:12}}><Empty>Nenhuma categoria encontrada.</Empty></div>
        ) : (
          <div style={{marginTop:12}}>
            <Grid>
              {filtered.map(c => (
                <CatCard key={c.id}>
                  <div className="row">
                    <span className="name">{c.name}</span>
                    <Badge type={c.type}>{c.type === "EXPENSE" ? "Despesa" : "Receita"}</Badge>
                  </div>
                  <small style={{color:"#94a3b8"}}>ID #{c.id}</small>
                </CatCard>
              ))}
            </Grid>
          </div>
        )}
      </Container>
    </Page>
  );
}

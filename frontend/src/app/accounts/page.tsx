"use client";

import { useEffect, useState, FormEvent, useMemo } from "react";
import { useAuth } from "@/context/auth";
import { apiFetch } from "@/lib/api";
import styled, { keyframes, css } from "styled-components";
import Link from "next/link";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

type AccountType = "CHECKING" | "SAVINGS" | "CASH" | "CREDIT_CARD";
type Account = { id: number; userId: number; name: string; type: AccountType; balance: string };

const fadeIn = keyframes`from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}`;
const shimmer = keyframes`100%{transform:translateX(100%)}`;
const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const fmt = (v: string | number) => money.format(typeof v === "string" ? Number(v) : v);

// ===== layout =====
const Page = styled.div`
  min-height: 100dvh; color:#e5e7eb;
  background:
    radial-gradient(1400px 700px at 0% -20%, rgba(99,102,241,.12), transparent 60%),
    radial-gradient(800px 600px at 100% 0%, rgba(14,165,233,.10), transparent 55%),
    #0b1220;
`;
const Container = styled.div`max-width: 1200px; margin: 0 auto; padding: 24px;`;

const TopBar = styled.header`
  display: flex; align-items: center; margin-bottom: 16px;
  h1{ margin:0; font-size: 24px; letter-spacing:-.02em }
`;

const CardGlass = styled.div<{ $padded?: boolean }>`
  backdrop-filter: blur(12px);
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,.25);
  animation: ${fadeIn} .25s ease;
  ${p => p.$padded !== false && css`padding:16px;`}
`;

const StatGrid = styled.div`
  display: grid; gap: 12px; grid-template-columns: 1fr 1fr 1fr 1.2fr;
  margin-bottom: 12px;
  @media (max-width: 1100px){ grid-template-columns: 1fr 1fr; }
  @media (max-width: 700px){ grid-template-columns: 1fr; }
`;
const StatCard = styled(CardGlass)`
  display:grid; gap:6px;
  .label{ color:#9ca3af; font-size:12px }
  .value{ font-size:22px; font-weight:700; letter-spacing:-.02em }
`;

const StatGrid2 = styled.div`
  display: grid; gap: 12px; grid-template-columns: 1fr 1fr 1fr;
  margin: 6px 0 18px;
  @media (max-width: 900px){ grid-template-columns: 1fr; }
`;

const MainGrid = styled.div`
  display: grid; gap: 16px; grid-template-columns: 1.2fr .8fr;
  @media (max-width: 1000px){ grid-template-columns: 1fr; }
`;

const ListToolbar = styled.div`
  display:flex; gap:10px; align-items:center; margin-bottom:10px;
  input, select{
    padding:10px 12px; border-radius:10px; border:1px solid rgba(148,163,184,.35);
    background: rgba(2,6,23,.6); color:#e5e7eb; outline:none
  }
  input:focus, select:focus{ border-color:#60a5fa; box-shadow:0 0 0 3px rgba(59,130,246,.25) }
  .count{ margin-left:auto; color:#9ca3af; font-size:12px }
`;

const AccountsGrid = styled.div`
  display:grid; gap:12px; grid-template-columns: repeat(3, 1fr);
  @media (max-width: 1200px){ grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 640px){ grid-template-columns: 1fr; }
`;

const AccountCard = styled(CardGlass)`
  padding:16px; display:grid; gap:10px; transition:transform .12s ease, box-shadow .12s ease;
  &:hover{ transform: translateY(-2px); box-shadow:0 12px 34px rgba(0,0,0,.32); }
  .top{ display:flex; align-items:center; gap:10px }
  .name{ font-weight:600 }
  .money{ font-size:22px; font-weight:700; letter-spacing:-.02em }
  .hint{ font-size:12px; color:#94a3b8 }
`;

const Menu = styled.div`
  margin-left:auto; position:relative;
  button{
    border:1px solid rgba(148,163,184,.35); background:transparent; color:#e5e7eb;
    border-radius:10px; padding:6px 8px; cursor:pointer;
  }
`;
const MenuList = styled.div`
  position:absolute; right:0; top:36px; min-width:160px; z-index:10;
  background: rgba(2,6,23,.95); border:1px solid rgba(148,163,184,.25); border-radius:12px;
  overflow:hidden;
  button{
    width:100%; text-align:left; padding:10px 12px; background:transparent; border:0; color:#e5e7eb; cursor:pointer;
  }
  button:hover{ background:rgba(148,163,184,.12); }
`;

const Badge = styled.span<{c:string; bg:string}>`
  margin-left:auto; font-size:12px; padding:4px 8px; border-radius:999px;
  border:1px solid ${({c})=>c}80; background:${({bg})=>bg}; color:${({c})=>c};
`;

const FormCard = styled.form`
  display:grid; gap:12px; grid-template-columns: 1fr 170px 170px auto; align-items:end;
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
  position:relative; overflow:hidden; border-radius:16px; height:96px;
  background: rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08);
  &:after{ content:""; position:absolute; inset:0; transform:translateX(-100%);
    background: linear-gradient(90deg, transparent, rgba(255,255,255,.06), transparent);
    animation: ${shimmer} 1200ms infinite; }
`;

// Modal
const Overlay = styled.div`position:fixed; inset:0; background:rgba(0,0,0,.45); display:grid; place-items:center; z-index:40;`;
const Modal = styled(CardGlass)`max-width:420px; width:100%;`;

// ===== Component =====
export default function AccountsPage() {
  const { token, user, isLoading } = useAuth();
  const [data, setData] = useState<Account[] | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // form
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("CASH");
  const [balance, setBalance] = useState<string>("0");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // filtros UI
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"name"|"balanceDesc">("balanceDesc");

  // modal edição
  const [editOpen, setEditOpen] = useState(false);
  const [editAcc, setEditAcc] = useState<Account | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);

  const palette: Record<AccountType, {c:string,bg:string}> = {
    CASH: { c:"#22c55e", bg:"rgba(34,197,94,.12)" },
    CHECKING: { c:"#60a5fa", bg:"rgba(96,165,250,.12)"},
    SAVINGS: { c:"#34d399", bg:"rgba(52,211,153,.12)"},
    CREDIT_CARD: { c:"#f472b6", bg:"rgba(244,114,182,.14)"},
  };

  const filtered = useMemo(() => {
    let list = (data ?? []).filter(a => a.name.toLowerCase().includes(search.toLowerCase()));
    if (sort === "name") list = list.sort((a,b)=>a.name.localeCompare(b.name));
    else list = list.sort((a,b)=>Number(b.balance)-Number(a.balance));
    return list;
  }, [data, search, sort]);

  const sum = (t?: AccountType) =>
    (data ?? []).filter(a => !t || a.type===t).reduce((s,a)=>s+Number(a.balance),0);

  const totals = useMemo(() => ({
    all: sum(),
    checking: sum("CHECKING"),
    savings: sum("SAVINGS"),
    cash: sum("CASH"),
    credit: sum("CREDIT_CARD"),
  }), [data]);

  const chartAccounts = useMemo(
    () => (data ?? []).map(a => ({ name: a.name, value: Number(a.balance), color: palette[a.type].c })),
    [data]
  );

  const chartByType = useMemo(() => ([
    { name: "Corrente", value: totals.checking, color: palette.CHECKING.c },
    { name: "Poupança", value: totals.savings, color: palette.SAVINGS.c },
    { name: "Dinheiro", value: totals.cash, color: palette.CASH.c },
    { name: "Cartão", value: totals.credit, color: palette.CREDIT_CARD.c },
  ]).filter(i => i.value > 0), [totals]);

  async function fetchAccounts() {
    if (!token) return;
    setLoadingList(true); setError(null);
    try { setData(await apiFetch("/accounts")); }
    catch (e:any) { setError(String(e.message || e)); }
    finally { setLoadingList(false); }
  }
  useEffect(()=>{ fetchAccounts(); /* eslint-disable-next-line */},[token]);

  if (isLoading) return <Container>Carregando...</Container>;
  if (!token || !user) return (<Container><p>Você precisa estar autenticado.</p><Link href="/login">Ir para o login</Link></Container>);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!name.trim()) return setFormError("Informe o nome da conta.");
    const num = Number(balance);
    if (Number.isNaN(num) || num < 0) return setFormError("Saldo inicial inválido (use número ≥ 0).");
    setSubmitting(true);
    try {
      await apiFetch("/accounts", { method:"POST", body: JSON.stringify({ name: name.trim(), type, balance: num }) });
      setName(""); setType("CASH"); setBalance("0");
      await fetchAccounts();
    } catch (e:any) { setFormError(e?.message || "Falha ao criar conta."); }
    finally { setSubmitting(false); }
  }

  async function openEdit(acc: Account) {
    setEditAcc(acc); setEditOpen(true); setMenuOpenId(null);
  }
  async function submitEdit(e: FormEvent) {
    e.preventDefault();
    if (!editAcc) return;
    await apiFetch(`/accounts/${editAcc.id}`, { method: "PUT", body: JSON.stringify({ name: editAcc.name, type: editAcc.type }) });
    setEditOpen(false); await fetchAccounts();
  }
  async function archive(id: number) {
    if (!confirm("Arquivar esta conta?")) return;
    await apiFetch(`/accounts/${id}`, { method: "DELETE" });
    setMenuOpenId(null); await fetchAccounts();
  }

  const badgeText: Record<AccountType,string> = {
    CASH:"Dinheiro", CHECKING:"Conta Corrente", SAVINGS:"Poupança", CREDIT_CARD:"Cartão de Crédito"
  };

  // ===== render =====
  return (
    <Page>
      <Container>
        <TopBar>
          <h1>Minhas contas</h1>
        </TopBar>

        {/* KPIs + gráfico por conta */}
        <StatGrid>
          <StatCard><span className="label">Saldo total</span><span className="value">{fmt(totals.all)}</span></StatCard>
          <StatCard><span className="label">Em conta corrente</span><span className="value">{fmt(totals.checking)}</span></StatCard>
          <StatCard><span className="label">Em poupança</span><span className="value">{fmt(totals.savings)}</span></StatCard>

          <CardGlass>
            <span style={{color:"#9ca3af", fontSize:12}}>Distribuição por conta</span>
            <div style={{height:140}}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartAccounts} dataKey="value" nameKey="name" innerRadius={40} outerRadius={60}>
                    {chartAccounts.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip formatter={(v:any)=>fmt(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardGlass>
        </StatGrid>

        {/* KPIs extras + distribuição por tipo + ações rápidas */}
        <StatGrid2>
          <StatCard><span className="label">Em dinheiro</span><span className="value">{fmt(totals.cash)}</span></StatCard>
          <StatCard><span className="label">Cartão de crédito</span><span className="value">{fmt(totals.credit)}</span></StatCard>

          <CardGlass>
            <span style={{color:"#9ca3af", fontSize:12}}>Distribuição por tipo</span>
            <div style={{height:120}}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartByType} dataKey="value" nameKey="name" innerRadius={36} outerRadius={52}>
                    {chartByType.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip formatter={(v:any)=>fmt(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardGlass>
        </StatGrid2>

        <MainGrid>
          {/* Lista */}
          <div>
            <CardGlass $padded={false} style={{marginBottom:12, padding:12}}>
              <ListToolbar>
                <input placeholder="Buscar por nome..." value={search} onChange={e=>setSearch(e.target.value)} />
                <select value={sort} onChange={e=>setSort(e.target.value as any)}>
                  <option value="balanceDesc">Ordenar: Saldo (↓)</option>
                  <option value="name">Ordenar: Nome (A–Z)</option>
                </select>
                <span className="count">{filtered.length} conta(s)</span>
              </ListToolbar>
            </CardGlass>

            {error && <ErrorBox>{error}</ErrorBox>}
            {loadingList ? (
              <AccountsGrid>{Array.from({length:6}).map((_,i)=><Skeleton key={i} />)}</AccountsGrid>
            ) : filtered.length === 0 ? (
              <Empty>Nenhuma conta encontrada.</Empty>
            ) : (
              <AccountsGrid>
                {filtered.map(a => (
                  <AccountCard key={a.id}>
                    <div className="top">
                      <span className="name">{a.name}</span>
                      <Badge c={palette[a.type].c} bg={palette[a.type].bg}>{badgeText[a.type]}</Badge>
                      <Menu>
                        <button onClick={()=>setMenuOpenId(v => v===a.id?null:a.id)}>⋯</button>
                        {menuOpenId === a.id && (
                          <MenuList>
                            <button onClick={()=>openEdit(a)}>Editar</button>
                            <button onClick={()=>archive(a.id)}>Arquivar</button>
                          </MenuList>
                        )}
                      </Menu>
                    </div>
                    <div className="money">{fmt(a.balance)}</div>
                    <div className="hint">ID #{a.id}</div>
                  </AccountCard>
                ))}
              </AccountsGrid>
            )}
          </div>

          {/* Coluna lateral: Form + Top contas */}
          <div>
            <h3 style={{margin:"0 0 10px", color:"#cbd5e1", fontWeight:600}}>Adicionar conta</h3>
            <CardGlass>
              <FormCard onSubmit={onSubmit}>
                <label>Nome
                  <input placeholder="Ex.: Conta Salário" value={name} onChange={e=>setName(e.target.value)} />
                </label>
                <label>Tipo
                  <select value={type} onChange={e=>setType(e.target.value as AccountType)}>
                    <option value="CASH">Dinheiro</option>
                    <option value="CHECKING">Conta Corrente</option>
                    <option value="SAVINGS">Poupança</option>
                    <option value="CREDIT_CARD">Cartão de Crédito</option>
                  </select>
                </label>
                <label>Saldo inicial
                  <input type="number" step="0.01" min="0" value={balance} onChange={e=>setBalance(e.target.value)} />
                </label>
                <button disabled={submitting} type="submit">
                  {submitting ? "Adicionando..." : "Adicionar"}
                </button>
                {formError && <ErrorBox>{formError}</ErrorBox>}
              </FormCard>
            </CardGlass>

            {/* Top contas por saldo */}
            <h3 style={{margin:"14px 0 10px", color:"#cbd5e1", fontWeight:600}}>Top contas por saldo</h3>
            <CardGlass>
              <table style={{width:"100%", borderCollapse:"separate", borderSpacing:"0 8px"}}>
                <tbody>
                  {(data ?? [])
                    .slice()
                    .sort((a,b)=>Number(b.balance)-Number(a.balance))
                    .slice(0,5)
                    .map((a,i)=>(
                      <tr key={a.id}>
                        <td style={{width:28, color:"#94a3b8"}}>{i+1}.</td>
                        <td style={{fontWeight:600}}>{a.name}</td>
                        <td style={{textAlign:"right"}}>{fmt(a.balance)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </CardGlass>

            {/* Ações rápidas */}
            <h3 style={{margin:"14px 0 10px", color:"#cbd5e1", fontWeight:600}}>Ações rápidas</h3>
            <CardGlass>
              <div style={{display:"grid", gap:8, gridTemplateColumns:"1fr 1fr"}}>
                <Link href="/transactions" style={{textDecoration:"none"}}>
                  <div style={{border:"1px solid rgba(148,163,184,.35)", borderRadius:12, padding:12, textAlign:"center", color:"#e5e7eb"}}>
                    Registrar transação
                  </div>
                </Link>
                <Link href="/categories" style={{textDecoration:"none"}}>
                  <div style={{border:"1px solid rgba(148,163,184,.35)", borderRadius:12, padding:12, textAlign:"center", color:"#e5e7eb"}}>
                    Gerenciar categorias
                  </div>
                </Link>
              </div>
            </CardGlass>
          </div>
        </MainGrid>
      </Container>

      {/* Modal de edição */}
      {editOpen && editAcc && (
        <Overlay onClick={()=>setEditOpen(false)}>
          <Modal onClick={(e)=>e.stopPropagation()}>
            <h3 style={{marginTop:0}}>Editar conta</h3>
            <form onSubmit={submitEdit} style={{display:"grid", gap:12}}>
              <label style={{fontSize:12, color:"#9ca3af", display:"grid", gap:6}}>
                Nome
                <input
                  value={editAcc.name}
                  onChange={e=>setEditAcc({...editAcc, name: e.target.value})}
                  style={{padding:12, borderRadius:10, border:"1px solid rgba(148,163,184,.35)", background:"rgba(2,6,23,.6)", color:"#e5e7eb"}}
                  required
                />
              </label>
              <label style={{fontSize:12, color:"#9ca3af", display:"grid", gap:6}}>
                Tipo
                <select
                  value={editAcc.type}
                  onChange={e=>setEditAcc({...editAcc, type: e.target.value as AccountType})}
                  style={{padding:12, borderRadius:10, border:"1px solid rgba(148,163,184,.35)", background:"rgba(2,6,23,.6)", color:"#e5e7eb"}}
                >
                  <option value="CASH">Dinheiro</option>
                  <option value="CHECKING">Conta Corrente</option>
                  <option value="SAVINGS">Poupança</option>
                  <option value="CREDIT_CARD">Cartão de Crédito</option>
                </select>
              </label>
              <div style={{display:"flex", gap:8, justifyContent:"flex-end"}}>
                <button type="button" onClick={()=>setEditOpen(false)} style={{padding:"10px 12px", borderRadius:10, border:"1px solid rgba(148,163,184,.35)", background:"transparent", color:"#e5e7eb"}}>Cancelar</button>
                <button type="submit" style={{padding:"10px 12px", borderRadius:10, border:"1px solid #3b82f6", background:"#3b82f6", color:"#0b1220", fontWeight:600}}>Salvar</button>
              </div>
            </form>
          </Modal>
        </Overlay>
      )}
    </Page>
  );
}

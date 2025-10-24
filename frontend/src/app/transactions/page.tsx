"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";
import { useAuth } from "@/context/auth";
import { apiFetch } from "@/lib/api";
import styled, { css, keyframes } from "styled-components";
import Link from "next/link";

type Account = { id: number; name: string; balance: string };
type Category = { id: number; name: string; type: "INCOME" | "EXPENSE" };
type Trx = {
  id: number;
  accountId: number;
  categoryId?: number | null;
  date: string;
  description?: string | null;
  amount: string;
  type: "INCOME" | "EXPENSE";
  account: { id: number; name: string };
  category?: { id: number; name: string; type: "INCOME" | "EXPENSE" } | null;
};

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const fmt = (v: string | number) => money.format(typeof v === "string" ? Number(v) : v);
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString();

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
const Container = styled.div`max-width: 1200px; margin: 0 auto; padding: 24px;`;

const TopBar = styled.header`
  display:flex; align-items:center; margin-bottom:16px;
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
  .value{ font-size:22px; font-weight:700; letter-spacing:-.02em }
  &[data-kind="in"] .value { color:#22c55e; }
  &[data-kind="out"] .value { color:#ef4444; }
`;

const Filters = styled(CardGlass)`
  display:grid; gap:10px;
  grid-template-columns: 1fr 220px 180px 180px;
  align-items:center;
  @media (max-width: 1100px){ grid-template-columns: 1fr 1fr; }
  @media (max-width: 640px){ grid-template-columns: 1fr; }
`;
const Input = styled.input`
  padding:10px 12px; border-radius:10px; border:1px solid rgba(148,163,184,.35);
  background: rgba(2,6,23,.6); color:#e5e7eb; outline:none;
  &:focus{ border-color:#60a5fa; box-shadow:0 0 0 3px rgba(59,130,246,.25) }
`;
const Select = styled.select`
  padding:10px 12px; border-radius:10px; border:1px solid rgba(148,163,184,.35);
  background: rgba(2,6,23,.6); color:#e5e7eb; outline:none;
  &:focus{ border-color:#60a5fa; box-shadow:0 0 0 3px rgba(59,130,246,.25) }
`;
const Tabs = styled.div`
  display:inline-flex; border:1px solid rgba(148,163,184,.35); border-radius:12px; overflow:hidden;
  button{
    padding:8px 12px; background:transparent; color:#cbd5e1; border:0; cursor:pointer;
  }
  button[aria-pressed="true"]{ background:rgba(148,163,184,.16); color:#fff; }
`;

const TwoCols = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr;  
`;

const FormCard = styled.form`
  display:grid; gap:12px; grid-template-columns: 140px 1fr 1fr 140px 180px auto;
  align-items:end;
  @media (max-width: 1100px){ grid-template-columns: 1fr; }
  label{ font-size:12px; color:#9ca3af; display:grid; gap:6px }
  input, select{
    padding:12px; border-radius:10px; border:1px solid rgba(148,163,184,.35);
    background: rgba(2,6,23,.6); color:#e5e7eb; outline:none;
  }
  input:focus, select:focus{ border-color:#60a5fa; box-shadow:0 0 0 3px rgba(59,130,246,.25) }
  button{
    height:44px; padding:0 14px; border-radius:10px; font-weight:600;
    border:1px solid #3b82f6; background:#3b82f6; color:#0b1220; cursor:pointer;
    &:disabled{ opacity:.6; cursor:not-allowed }
  }
`;
const ErrorBox = styled.div`
  grid-column:1/-1; color:#fecaca; background:rgba(239,68,68,.08);
  border:1px solid rgba(239,68,68,.35); padding:10px 12px; border-radius:10px; font-size:13px;
`;

const TableWrap = styled(CardGlass)`
  padding: 0;
  min-width: 0;
  overflow: auto;          
`;
const Table = styled.table`
  width: 100%;
  table-layout: fixed;
  border-collapse: separate;
  border-spacing: 0;

  thead th {
    position: sticky; top: 0;
    background: rgba(2,6,23,.8);
    backdrop-filter: blur(6px);
    text-align: left; font-weight: 600; color: #cbd5e1; font-size: 13px;
    padding: 12px 14px; border-bottom: 1px solid rgba(148,163,184,.2);
  }

  tbody td {
    padding: 12px 14px; border-bottom: 1px solid rgba(148,163,184,.08);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }

  tbody td.actions {
    overflow: visible;              
    text-overflow: initial;
    white-space: normal;            
  }
`;
const Badge = styled.span<{kind:"INCOME"|"EXPENSE"}>`
  font-size:12px; padding:3px 8px; border-radius:999px; border:1px solid;
  ${({kind}) => kind === "INCOME"
    ? css`color:#22c55e; border-color:#22c55e80; background:rgba(34,197,94,.12);`
    : css`color:#ef4444; border-color:#ef444480; background:rgba(239,68,68,.12);`}
`;
const Amount = styled.span<{kind:"INCOME"|"EXPENSE"}>`
  font-weight:700;
  ${({kind}) => kind === "INCOME"
    ? css`color:#22c55e;`
    : css`color:#ef4444;`}
`;
const Empty = styled.div`
  padding:18px; text-align:center; color:#9ca3af;
`;
const Skeleton = styled.div`
  height:52px; position:relative; overflow:hidden;
  &:after{content:""; position:absolute; inset:0; transform:translateX(-100%);
    background: linear-gradient(90deg, transparent, rgba(255,255,255,.06), transparent);
    animation: ${shimmer} 1200ms infinite;}
`;

export default function TransactionsPage() {
  const { token, user, isLoading } = useAuth();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [trx, setTrx] = useState<Trx[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [tab, setTab] = useState<"ALL"|"EXPENSE"|"INCOME">("ALL");
  const [q, setQ] = useState("");
  const [accFilter, setAccFilter] = useState<number|"">("");
  const [from, setFrom] = useState<string>(() => new Date(new Date().setDate(new Date().getDate()-30)).toISOString().slice(0,10));
  const [to, setTo] = useState<string>(() => new Date().toISOString().slice(0,10));

  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [type, setType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [accountId, setAccountId] = useState<number | "">("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [amount, setAmount] = useState<string>("0");
  const [description, setDescription] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [page, setPage] = useState(1);

  const [editing, setEditing] = useState<Trx | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const filteredCategories = useMemo(
    () => categories.filter(c => c.type === type),
    [categories, type]
  );

  const list = useMemo(() => {
    let l = trx.slice();
    if (tab !== "ALL") l = l.filter(t => t.type === tab);
    if (accFilter) l = l.filter(t => t.accountId === accFilter);
    if (from) l = l.filter(t => new Date(t.date) >= new Date(from));
    if (to) l = l.filter(t => new Date(t.date) <= new Date(to));
    if (q.trim()) l = l.filter(t => (t.description || "").toLowerCase().includes(q.toLowerCase()));
    return l.sort((a,b)=> +new Date(b.date) - +new Date(a.date));
  }, [trx, tab, accFilter, from, to, q]);

  const kpis = useMemo(() => {
    const inc = list.filter(t=>t.type==="INCOME").reduce((s,t)=>s+Number(t.amount),0);
    const exp = list.filter(t=>t.type==="EXPENSE").reduce((s,t)=>s+Number(t.amount),0);
    return { inc, exp, net: inc-exp };
  }, [list]);

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
  const paged = useMemo(() => {
    const start = (page-1)*pageSize;
    return list.slice(start, start+pageSize);
  }, [list, page]);

  async function loadAll() {
    if (!token) return;
    setLoading(true); setError(null);
    try {
      const [accs, cats, trans] = await Promise.all([
        apiFetch("/accounts"),
        apiFetch("/categories"),
        apiFetch("/transactions")
      ]);
      setAccounts(accs);
      setCategories(cats);
      setTrx(trans);
    } catch (e: any) {
      setError(e?.message || "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }

  useEffect(()=>{ setPage(1); }, [q, accFilter, from, to, tab]);
  
  useEffect(() => { loadAll(); }, [token]);

  if (isLoading) return <Container>Carregando...</Container>;
  if (!token || !user) {
    return (
      <Container>
        <p>Você precisa estar autenticado.</p>
        <Link href="/login">Ir para o login</Link>
      </Container>
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!accountId) return setFormError("Selecione a conta.");
    const v = Number(amount);
    if (Number.isNaN(v) || v <= 0) return setFormError("Valor inválido.");
    if (!date) return setFormError("Informe a data.");

    setSubmitting(true);
    try {
      await apiFetch("/transactions", {
        method: "POST",
        body: JSON.stringify({
          accountId: Number(accountId),
          categoryId: categoryId ? Number(categoryId) : null,
          date,
          description: description?.trim() || null,
          amount: v,
          type
        })
      });
      setAmount("0"); setDescription(""); setCategoryId("");
      await loadAll();
    } catch (e: any) {
      setFormError(e?.message || "Falha ao criar transação.");
    } finally { setSubmitting(false); }
  }

  function resetFilters() {
    setQ(""); setAccFilter(""); 
    setFrom(new Date(new Date().setDate(new Date().getDate()-30)).toISOString().slice(0,10));
    setTo(new Date().toISOString().slice(0,10));
    setTab("ALL"); setPage(1);
  }

  function toCSV(rows: Trx[]) {
    const header = ["Data","Conta","Categoria","Tipo","Descrição","Valor"];
    const body = rows.map(t => [
      fmtDate(t.date),
      t.account?.name ?? "",
      t.category?.name ?? "",
      t.type === "INCOME" ? "Receita" : "Despesa",
      (t.description ?? "").replace(/"/g,'""'),
      (t.type === "INCOME" ? "" : "-") + (Number(t.amount).toFixed(2)).replace(".",",")
    ]);
    const csv = [header, ...body].map(r => r.map(v => `"${String(v)}"`).join(";")).join("\n");
    const blob = new Blob([csv], {type:"text/csv;charset=utf-8;"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `transacoes_${from}_a_${to}.csv`; a.click();
    URL.revokeObjectURL(url);
  }


  async function removeTrx(id: number) {
    if (!confirm("Remover esta transação?")) return;
    setRemovingId(id);
    try {
      await apiFetch(`/transactions/${id}`, { method: "DELETE" });
      await loadAll();
    } finally { setRemovingId(null); }
  }

  return (
    <Page>
      <Container>
        <TopBar><h1>Transações</h1></TopBar>

        <StatGrid>
          <StatCard data-kind="in"><span className="label">Receitas</span><span className="value">{fmt(kpis.inc)}</span></StatCard>
          <StatCard data-kind="out"><span className="label">Despesas</span><span className="value">{fmt(kpis.exp)}</span></StatCard>
          <StatCard><span className="label">Saldo no período</span><span className="value">{fmt(kpis.net)}</span></StatCard>
        </StatGrid>

        <Filters>
          <Input placeholder="Buscar descrição..." value={q} onChange={e=>setQ(e.target.value)} />
          <Select value={accFilter} onChange={e=>setAccFilter(e.target.value ? Number(e.target.value) : "")}>
            <option value="">Todas as contas</option>
            {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </Select>
          <Input type="date" value={from} onChange={e=>setFrom(e.target.value)} />
          <Input type="date" value={to} onChange={e=>setTo(e.target.value)} />
          <div style={{gridColumn:"1 / -1"}}>
            <Tabs aria-label="Tipo">
              <button aria-pressed={tab==="ALL"} onClick={()=>setTab("ALL")}>Todos</button>
              <button aria-pressed={tab==="EXPENSE"} onClick={()=>setTab("EXPENSE")}>Despesas</button>
              <button aria-pressed={tab==="INCOME"} onClick={()=>setTab("INCOME")}>Receitas</button>
            </Tabs>
          </div>
          <div style={{display:"flex", gap:8, justifyContent:"flex-end"}}>
            <button
              onClick={() => toCSV(list)}
              style={{padding:"8px 12px", borderRadius:10, border:"1px solid rgba(148,163,184,.35)", background:"transparent", color:"#e5e7eb", cursor:"pointer"}}
            >
              Exportar CSV
            </button>
            <button
              onClick={resetFilters}
              style={{padding:"8px 12px", borderRadius:10, border:"1px solid rgba(148,163,184,.35)", background:"transparent", color:"#e5e7eb", cursor:"pointer"}}
            >
              Limpar filtros
            </button>
          </div>
        </Filters>

        <TwoCols>
          <CardGlass>
            <h3 style={{margin:"0 0 10px", color:"#cbd5e1", fontWeight:600}}>Adicionar transação</h3>
            <FormCard onSubmit={onSubmit}>
              <label>Data
                <input type="date" value={date} onChange={e => setDate(e.target.value)} />
              </label>

              <label>Conta
                <select value={accountId} onChange={e => setAccountId(e.target.value ? Number(e.target.value) : "")}>
                  <option value="">Selecione</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({fmt(a.balance)})
                    </option>
                  ))}
                </select>
              </label>

              <label>Tipo
                <select value={type} onChange={e => setType(e.target.value as "INCOME" | "EXPENSE")}>
                  <option value="EXPENSE">Despesa</option>
                  <option value="INCOME">Receita</option>
                </select>
              </label>

              <label>Categoria
                <select value={categoryId} onChange={e => setCategoryId(e.target.value ? Number(e.target.value) : "")}>
                  <option value="">(Opcional)</option>
                  {filteredCategories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </label>

              <label>Valor
                <input type="number" step="0.01" min="0.01" value={amount} onChange={e => setAmount(e.target.value)} />
              </label>

              <label>Descrição
                <input placeholder="Ex.: Supermercado, salário..." value={description} onChange={e=>setDescription(e.target.value)} />
              </label>

              <button disabled={submitting} type="submit">
                {submitting ? "Adicionando..." : "Adicionar"}
              </button>

              {formError && <ErrorBox>{formError}</ErrorBox>}
            </FormCard>
          </CardGlass>

          <TableWrap>
            <div style={{display:"flex", gap:8, alignItems:"center", justifyContent:"flex-end", marginTop:8}}>
              <span style={{color:"#9ca3af", fontSize:12}}>
                Página {page} de {totalPages} — {list.length} itens
              </span>
              <button
                onClick={()=>setPage(p=>Math.max(1,p-1))}
                disabled={page===1}
                style={{padding:"8px 10px", borderRadius:10, border:"1px solid rgba(148,163,184,.35)", background:"transparent", color:"#e5e7eb", cursor:"pointer", opacity: page === 1 ? .6 :1,}}
              >Anterior</button>
              <button
                onClick={()=>setPage(p=>Math.min(totalPages,p+1))}
                disabled={page===totalPages}
                style={{padding:"8px 10px", borderRadius:10, border:"1px solid rgba(148,163,184,.35)", background:"transparent", color:"#e5e7eb", cursor:"pointer", opacity: page === totalPages ? .6 :1,}}
              >Próxima</button>
            </div>
            {loading ? (
              <div style={{padding:14}}>
                {Array.from({length:6}).map((_,i)=><Skeleton key={i}/>)}
              </div>
            ) : list.length === 0 ? (
              <Empty>Nenhuma transação no período.</Empty>
            ) : (
              <Table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Conta</th>
                    <th>Categoria</th>
                    <th>Tipo</th>
                    <th>Descrição</th>
                    <th style={{textAlign:"right"}}>Valor</th>
                    <th style={{width:160}}></th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map(t => (
                    <tr key={t.id}>
                      <td>{fmtDate(t.date)}</td>
                      <td>{t.account?.name}</td>
                      <td>{t.category?.name || "-"}</td>
                      <td><Badge kind={t.type}>{t.type === "INCOME" ? "Receita" : "Despesa"}</Badge></td>
                      <td style={{maxWidth:360, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>
                        {t.description || "-"}
                      </td>
                      <td style={{textAlign:"right"}}>
                        <Amount kind={t.type}>
                          {t.type === "INCOME" ? "+" : "-"} {fmt(t.amount)}
                        </Amount>
                      </td>
                      <td className="actions" style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: 6 }}>
                          <button
                            onClick={() => setEditing(t)}
                            title="Editar"
                            style={{ padding: "6px 8px", borderRadius: 8, border: "1px solid rgba(148,163,184,.35)", background: "transparent", color: "#e5e7eb", cursor: "pointer" }}
                          >Editar</button>
                          <button
                            onClick={() => removeTrx(t.id)}
                            title="Excluir"
                            style={{ padding: "6px 8px", borderRadius: 8, border: "1px solid rgba(239,68,68,.45)", background: "rgba(239,68,68,.12)", color: "#fecaca", cursor: "pointer" }}
                            disabled={removingId === t.id}
                          >{removingId === t.id ? "..." : "Excluir"}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={5} style={{textAlign:"right", padding:"12px 14px", color:"#9ca3af"}}>Totais desta página:</td>
                    <td style={{textAlign:"right", fontWeight:700, padding:"12px 14px"}}>
                      {fmt(paged.reduce((s,t)=> s + (t.type==="INCOME"?+1:-1)*Number(t.amount), 0))}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </Table>
            )}
          </TableWrap>
        </TwoCols>
      </Container>
      {editing && (
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,.45)", display:"grid", placeItems:"center", zIndex:50}}
            onClick={()=>setEditing(null)}>
          <div onClick={(e)=>e.stopPropagation()} style={{maxWidth:480, width:"100%"}}>
            <CardGlass>
              <h3 style={{marginTop:0}}>Editar transação</h3>
              <form onSubmit={async (e)=> {
                e.preventDefault();
                if (!editing) return;       
                await apiFetch(`/transactions/${editing.id}`, {
                  method:"PUT",
                  body: JSON.stringify({
                    description: editing.description ?? "",
                    categoryId: editing.categoryId ?? null
                  })
                });
                setEditing(null);
                await loadAll();
              }} style={{display:"grid", gap:12}}>
                <label style={{fontSize:12, color:"#9ca3af", display:"grid", gap:6}}>
                  Descrição
                  <input
                    value={editing.description ?? ""}
                    onChange={e=>setEditing({...editing, description: e.target.value})}
                    style={{padding:12, borderRadius:10, border:"1px solid rgba(148,163,184,.35)", background:"rgba(2,6,23,.6)", color:"#e5e7eb"}}
                  />
                </label>
                <label style={{fontSize:12, color:"#9ca3af", display:"grid", gap:6}}>
                  Categoria
                  <select
                    value={editing.categoryId ?? ""}
                    onChange={e=>setEditing({...editing, categoryId: e.target.value? Number(e.target.value): null})}
                    style={{padding:12, borderRadius:10, border:"1px solid rgba(148,163,184,.35)", background:"rgba(2,6,23,.6)", color:"#e5e7eb"}}
                  >
                    <option value="">(Sem categoria)</option>
                    {categories
                      .filter(c => c.type === editing.type)
                      .map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </label>
                <div style={{display:"flex", gap:8, justifyContent:"flex-end"}}>
                  <button type="button" onClick={()=>setEditing(null)}
                    style={{padding:"10px 12px", borderRadius:10, border:"1px solid rgba(148,163,184,.35)", background:"transparent", color:"#e5e7eb"}}>Cancelar</button>
                  <button type="submit"
                    style={{padding:"10px 12px", borderRadius:10, border:"1px solid #3b82f6", background:"#3b82f6", color:"#0b1220", fontWeight:600}}>Salvar</button>
                </div>
              </form>
            </CardGlass>
          </div>
        </div>
      )}
    </Page>
  );
}

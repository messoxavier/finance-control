"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";
import { useAuth } from "@/context/auth";
import { apiFetch } from "@/lib/api";
import styled from "styled-components";
import Link from "next/link";

type Account = { id: number; name: string; balance: string };
type Category = { id: number; name: string; type: "INCOME" | "EXPENSE" };
type Trx = {
  id: number;
  accountId: number;
  categoryId?: number | null;
  date: string;
  description?: string | null;
  amount: string; // Decimal -> string
  type: "INCOME" | "EXPENSE";
  account: { id: number; name: string };
  category?: { id: number; name: string; type: "INCOME" | "EXPENSE" } | null;
};

const Page = styled.div` padding: 24px; max-width: 980px; margin: 0 auto; `;
const Top = styled.div` display: flex; gap: 12px; align-items: center; margin-bottom: 16px; `;
const Logout = styled.button`
  margin-left: auto; padding: 6px 10px; border: 1px solid #ddd; border-radius: 8px; cursor: pointer;
`;
const Card = styled.form`
  padding: 16px; border: 1px solid #e5e7eb; border-radius: 12px; margin-bottom: 16px;
  display: grid; gap: 12px; grid-template-columns: 140px 1fr 1fr 140px 160px auto; align-items: end;
  @media (max-width: 980px) { grid-template-columns: 1fr; }
`;
const Label = styled.label` font-size: 12px; color: #6b7280; display: grid; gap: 6px; `;
const Input = styled.input` padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; `;
const Select = styled.select` padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; `;
const Button = styled.button`
  padding: 10px 12px; border: 1px solid #111827; border-radius: 8px; background: #111827; color: white;
  cursor: pointer; height: 40px; &:disabled { opacity: .6; cursor: not-allowed; }
`;
const ErrorBox = styled.div` color: #b91c1c; font-size: 14px; `;
const Table = styled.table`
  width: 100%; border-collapse: collapse;
  th, td { padding: 10px; border-bottom: 1px solid #eee; text-align: left; }
  th { font-weight: 600; color: #374151; }
`;

function toMoney(n: string | number) {
  const v = typeof n === "string" ? Number(n) : n;
  return isFinite(v) ? v.toFixed(2) : "0.00";
}
function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString();
}

export default function TransactionsPage() {
  const { token, user, isLoading, logout } = useAuth();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [trx, setTrx] = useState<Trx[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // form
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [type, setType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [accountId, setAccountId] = useState<number | "">("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [amount, setAmount] = useState<string>("0");
  const [description, setDescription] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const filteredCategories = useMemo(
    () => categories.filter(c => c.type === type),
    [categories, type]
  );

  async function loadAll() {
    if (!token) return;
    setLoading(true);
    setError(null);
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

  useEffect(() => { loadAll(); /* eslint-disable-line */ }, [token]);

  if (isLoading) return <Page>Carregando...</Page>;
  if (!token || !user) {
    return (
      <Page>
        <p>Você precisa estar autenticado.</p>
        <Link href="/login">Ir para o login</Link>
      </Page>
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
          date, // o backend usa z.coerce.date
          description: description?.trim() || null,
          amount: v,
          type
        })
      });
      // limpa campos e recarrega lista/saldos
      setAmount("0");
      setDescription("");
      setCategoryId("");
      await loadAll();
    } catch (e: any) {
      setFormError(e?.message || "Falha ao criar transação.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Page>
      <Top>
        <h1>Transações</h1>
        <span style={{ color: "#6b7280" }}>Olá, {user.name}</span>
        <Logout onClick={logout}>Sair</Logout>
      </Top>

      <Card onSubmit={onSubmit}>
        <Label>
          Data
          <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </Label>

        <Label>
          Conta
          <Select value={accountId} onChange={e => setAccountId(e.target.value ? Number(e.target.value) : "")}>
            <option value="">Selecione</option>
            {accounts.map(a => (
              <option key={a.id} value={a.id}>
                {a.name} (R$ {toMoney(a.balance)})
              </option>
            ))}
          </Select>
        </Label>

        <Label>
          Tipo
          <Select value={type} onChange={e => setType(e.target.value as "INCOME" | "EXPENSE")}>
            <option value="EXPENSE">Despesa</option>
            <option value="INCOME">Receita</option>
          </Select>
        </Label>

        <Label>
          Categoria
          <Select value={categoryId} onChange={e => setCategoryId(e.target.value ? Number(e.target.value) : "")}>
            <option value="">(Opcional)</option>
            {filteredCategories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </Label>

        <Label>
          Valor
          <Input type="number" step="0.01" min="0.01" value={amount} onChange={e => setAmount(e.target.value)} />
        </Label>

        <Button disabled={submitting} type="submit">
          {submitting ? "Adicionando..." : "Adicionar"}
        </Button>

        {formError && <div style={{ gridColumn: "1 / -1" }}><ErrorBox>{formError}</ErrorBox></div>}
      </Card>

      {error && <ErrorBox>Erro: {error}</ErrorBox>}

      {loading ? (
        <div>Carregando...</div>
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Conta</th>
              <th>Categoria</th>
              <th>Tipo</th>
              <th>Descrição</th>
              <th style={{ textAlign: "right" }}>Valor</th>
            </tr>
          </thead>
          <tbody>
            {trx.length === 0 ? (
              <tr><td colSpan={6}>Nenhuma transação.</td></tr>
            ) : (
              trx.map(t => (
                <tr key={t.id}>
                  <td>{fmtDate(t.date)}</td>
                  <td>{t.account?.name}</td>
                  <td>{t.category?.name || "-"}</td>
                  <td>{t.type === "INCOME" ? "Receita" : "Despesa"}</td>
                  <td>{t.description || "-"}</td>
                  <td style={{ textAlign: "right", color: t.type === "INCOME" ? "#065f46" : "#991b1b" }}>
                    {t.type === "INCOME" ? "+" : "-"} R$ {toMoney(t.amount)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}
    </Page>
  );
}

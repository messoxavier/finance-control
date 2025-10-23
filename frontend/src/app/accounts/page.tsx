"use client";

import { useEffect, useState, FormEvent } from "react";
import { useAuth } from "@/context/auth";
import { apiFetch } from "@/lib/api";
import styled from "styled-components";
import Link from "next/link";

type AccountType = "CHECKING" | "SAVINGS" | "CASH" | "CREDIT_CARD";

type Account = {
  id: number;
  userId: number;
  name: string;
  type: AccountType;
  balance: string; // Prisma Decimal vem como string
};

const Page = styled.div` padding: 24px; max-width: 880px; margin: 0 auto; `;
const Top = styled.div` display: flex; gap: 12px; align-items: center; margin-bottom: 16px; `;
const Logout = styled.button`
  margin-left: auto; padding: 6px 10px; border: 1px solid #ddd; border-radius: 8px; cursor: pointer;
`;

const Card = styled.form`
  padding: 16px; border: 1px solid #e5e7eb; border-radius: 12px; margin-bottom: 16px;
  display: grid; gap: 12px; grid-template-columns: 1fr 180px 180px auto; align-items: end;
  @media (max-width: 820px) { grid-template-columns: 1fr; }
`;

const Label = styled.label` font-size: 12px; color: #6b7280; display: grid; gap: 6px; `;
const Input = styled.input` padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; `;
const Select = styled.select` padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; `;
const Button = styled.button`
  padding: 10px 12px; border: 1px solid #111827; border-radius: 8px; background: #111827; color: white;
  cursor: pointer; height: 40px; &:disabled { opacity: .6; cursor: not-allowed; }
`;
const ErrorBox = styled.div` color: #b91c1c; font-size: 14px; `;
const List = styled.ul` margin-top: 12px; `;

export default function AccountsPage() {
  const { token, user, isLoading, logout } = useAuth();
  const [data, setData] = useState<Account[] | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // form state
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("CASH");
  const [balance, setBalance] = useState<string>("0");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function toMoney(n: string | number) {
    const v = typeof n === "string" ? Number(n) : n;
    return isFinite(v) ? v.toFixed(2) : "0.00";
  }

  async function fetchAccounts() {
    if (!token) return;
    setLoadingList(true);
    setError(null);
    try {
      const res = await apiFetch("/accounts");
      setData(res);
    } catch (e: any) {
      setError(String(e.message || e));
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => { fetchAccounts(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [token]);

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
    if (!name.trim()) {
      setFormError("Informe o nome da conta.");
      return;
    }
    const num = Number(balance);
    if (Number.isNaN(num) || num < 0) {
      setFormError("Saldo inicial inválido (use número ≥ 0).");
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch("/accounts", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          type,
          balance: num,
        }),
      });
      // limpa e atualiza a lista
      setName("");
      setType("CASH");
      setBalance("0");
      await fetchAccounts();
    } catch (e: any) {
      setFormError(e?.message || "Falha ao criar conta.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Page>
      <Top>
        <h1>Minhas contas</h1>
        <span style={{ color: "#6b7280" }}>Olá, {user.name}</span>
        <Logout onClick={logout}>Sair</Logout>
      </Top>

      <Card onSubmit={onSubmit}>
        <Label>
          Nome da conta
          <Input placeholder="Ex.: Conta Corrente" value={name} onChange={(e) => setName(e.target.value)} />
        </Label>

        <Label>
          Tipo
          <Select value={type} onChange={(e) => setType(e.target.value as AccountType)}>
            <option value="CASH">Dinheiro</option>
            <option value="CHECKING">Conta Corrente</option>
            <option value="SAVINGS">Poupança</option>
            <option value="CREDIT_CARD">Cartão de Crédito</option>
          </Select>
        </Label>

        <Label>
          Saldo inicial
          <Input
            type="number"
            step="0.01"
            min="0"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
          />
        </Label>

        <Button disabled={submitting} type="submit">
          {submitting ? "Adicionando..." : "Adicionar conta"}
        </Button>

        {formError && <div style={{ gridColumn: "1 / -1" }}><ErrorBox>{formError}</ErrorBox></div>}
      </Card>

      {error && <ErrorBox>Erro: {error}</ErrorBox>}
      {!data || loadingList ? (
        <div>Carregando contas...</div>
      ) : data.length === 0 ? (
        <div>Nenhuma conta.</div>
      ) : (
        <List>
          {data.map((a) => (
            <li key={a.id}>
              #{a.id} — <b>{a.name}</b> [{a.type}] — saldo: R$ {toMoney(a.balance)}
            </li>
          ))}
        </List>
      )}
    </Page>
  );
}

"use client";

import { useEffect, useState, FormEvent } from "react";
import { useAuth } from "@/context/auth";
import { apiFetch } from "@/lib/api";
import styled from "styled-components";
import Link from "next/link";

type CategoryType = "INCOME" | "EXPENSE";

type Category = {
  id: number;
  userId: number;
  name: string;
  type: CategoryType;
};

const Page = styled.div` padding: 24px; max-width: 880px; margin: 0 auto; `;
const Top = styled.div` display: flex; gap: 12px; align-items: center; margin-bottom: 16px; `;
const Logout = styled.button`
  margin-left: auto; padding: 6px 10px; border: 1px solid #ddd; border-radius: 8px; cursor: pointer;
`;

const Card = styled.form`
  padding: 16px; border: 1px solid #e5e7eb; border-radius: 12px; margin-bottom: 16px;
  display: grid; gap: 12px; grid-template-columns: 1fr 200px auto; align-items: end;
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

export default function CategoriesPage() {
  const { token, user, isLoading, logout } = useAuth();
  const [data, setData] = useState<Category[] | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // form
  const [name, setName] = useState("");
  const [type, setType] = useState<CategoryType>("EXPENSE");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function fetchCategories() {
    if (!token) return;
    setLoadingList(true);
    setError(null);
    try {
      const res = await apiFetch("/categories");
      setData(res);
    } catch (e: any) {
      setError(String(e.message || e));
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => { fetchCategories(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [token]);

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
      setFormError("Informe o nome da categoria.");
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch("/categories", {
        method: "POST",
        body: JSON.stringify({ name: name.trim(), type })
      });
      setName("");
      setType("EXPENSE");
      await fetchCategories();
    } catch (e: any) {
      setFormError(e?.message || "Falha ao criar categoria.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Page>
      <Top>
        <h1>Categorias</h1>
        <span style={{ color: "#6b7280" }}>Olá, {user.name}</span>
        <Logout onClick={logout}>Sair</Logout>
      </Top>

      <Card onSubmit={onSubmit}>
        <Label>
          Nome da categoria
          <Input placeholder="Ex.: Alimentação" value={name} onChange={(e) => setName(e.target.value)} />
        </Label>

        <Label>
          Tipo
          <Select value={type} onChange={(e) => setType(e.target.value as CategoryType)}>
            <option value="EXPENSE">Despesa</option>
            <option value="INCOME">Receita</option>
          </Select>
        </Label>

        <Button disabled={submitting} type="submit">
          {submitting ? "Adicionando..." : "Adicionar categoria"}
        </Button>

        {formError && <div style={{ gridColumn: "1 / -1" }}><ErrorBox>{formError}</ErrorBox></div>}
      </Card>

      {error && <ErrorBox>Erro: {error}</ErrorBox>}
      {!data || loadingList ? (
        <div>Carregando categorias...</div>
      ) : data.length === 0 ? (
        <div>Nenhuma categoria.</div>
      ) : (
        <List>
          {data.map((c) => (
            <li key={c.id}>
              #{c.id} — <b>{c.name}</b> [{c.type === "EXPENSE" ? "Despesa" : "Receita"}]
            </li>
          ))}
        </List>
      )}
    </Page>
  );
}

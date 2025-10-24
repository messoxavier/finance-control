"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styled, { css } from "styled-components";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth";

const Bar = styled.header`
  position: sticky; top: 0; z-index: 50;
  backdrop-filter: blur(10px);
  background: linear-gradient(180deg, rgba(30,41,59,.95) 0%, rgba(15,23,42,.92) 100%);
  border-bottom: 1px solid rgba(148,163,184,.25);
  box-shadow: 0 8px 20px rgba(0,0,0,.35);
`;

const Inner = styled.div`
  max-width: 1200px; margin: 0 auto;
  padding: 14px 16px;
  display: grid; grid-template-columns: auto 1fr auto; gap: 12px; align-items: center;
`;

const Brand = styled(Link)`
  display: inline-grid; grid-auto-flow: column; align-items: center; gap: 8px;
  color: #e5e7eb; text-decoration: none; font-weight: 700; letter-spacing: .2px;
  svg{ width: 22px; height: 22px }
`;

// ⚠️ use prop transitória $open para não vazar para o DOM
const Nav = styled.nav<{ $open?: boolean }>`
  justify-self: center;
  @media (max-width: 820px) {
    position: fixed; top: var(--header-h, 56px); left: 0; right: 0;
    background: rgba(2,6,23,.96);
    border-bottom: 1px solid rgba(148,163,184,.20);
    transform: translateY(${p => p.$open ? "0" : "-8px"});
    opacity: ${p => p.$open ? 1 : 0};
    pointer-events: ${p => p.$open ? "auto" : "none"};
    transition: .15s ease;
    padding: 10px 16px;
  }
`;

const List = styled.ul`
  display: grid; grid-auto-flow: column; gap: 10px;
  @media (max-width: 820px) { grid-auto-flow: row; }
`;

const Item = styled.li``;

// ⚠️ use prop transitória $active
const A = styled(Link)<{ $active?: boolean }>`
  display: inline-block; padding: 10px 12px;
  border-radius: 10px; text-decoration: none;
  color: ${p => p.$active ? "#ffffff" : "#cbd5e1"};
  background: ${p => p.$active ? "rgba(99,102,241,.24)" : "transparent"};
  border: 1px solid ${p => p.$active ? "rgba(99,102,241,.45)" : "transparent"};
  &:hover { background: rgba(148,163,184,.12); color: #e5e7eb; }
`;

const Right = styled.div`
  display: flex; gap: 8px; align-items: center;
  button{
    padding: 8px 12px; border-radius: 10px;
    border: 1px solid rgba(148,163,184,.35); background: transparent; color: #e5e7eb;
    cursor: pointer;
  }
  button:hover { background: rgba(148,163,184,.12); }
`;

const Burger = styled.button`
  display: none;
  @media (max-width: 820px){ display: inline-grid; place-items: center; }
  width: 36px; height: 36px; border-radius: 10px;
  border: 1px solid rgba(148,163,184,.35); background: transparent; color: #e5e7eb;
  cursor: pointer;
`;

export default function Header() {
  const pathname = usePathname();
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [pathname]);

  const links = [
    { href: "/accounts", label: "Contas" },
    { href: "/categories", label: "Categorias" },
    { href: "/transactions", label: "Transações" },
  ];

  return (
    <Bar style={{ height: "var(--header-h, 56px)" }}>
      <Inner>
        <Brand href="/accounts" aria-label="Finance Control">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeWidth="2" d="M3 12s3-7 9-7 9 7 9 7-3 7-9 7-9-7-9-7Z" />
            <path strokeWidth="2" d="M12 9v6m0 0c-2 0-3-1-3-3s1-3 3-3 3 1 3 3-1 3-3 3Z"/>
          </svg>
          Finance Control
        </Brand>

        <Nav $open={open} aria-label="principal">
          <List>
            {links.map(l => {
              const isActive = pathname?.startsWith(l.href);
              return (
                <Item key={l.href}>
                  <A
                    href={l.href}
                    $active={!!isActive}                 // ✅ não vaza para o DOM
                    aria-current={isActive ? "page" : undefined} // ♿
                  >
                    {l.label}
                  </A>
                </Item>
              );
            })}
          </List>
        </Nav>

        <Right>
          {token && user ? (
            <>
              <span style={{ color:"#94a3b8", fontSize: 13 }}>Olá, {user.name}</span>
              <button onClick={logout}>Sair</button>
            </>
          ) : (
            <button onClick={()=>router.push("/login")}>Entrar</button>
          )}
          <Burger onClick={()=>setOpen(o=>!o)} aria-label="Menu">
            ☰
          </Burger>
        </Right>
      </Inner>
    </Bar>
  );
}

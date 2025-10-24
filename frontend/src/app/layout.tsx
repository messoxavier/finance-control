import type { Metadata } from "next";
import StyledComponentsRegistry from "./styled-registry";
import { AuthProvider } from "@/context/auth";
import { GlobalStyles } from "./global-styles";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Finance Control",
  description: "Sistema de controle financeiro",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <StyledComponentsRegistry>
          <GlobalStyles />
          <AuthProvider>
            <AppShell>{children}</AppShell>
          </AuthProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}

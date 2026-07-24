import type { ReactNode } from "react";

type GameLayoutProps = {
  children: ReactNode;
};

export default function GameLayout({
  children,
}: GameLayoutProps) {
  return <>{children}</>;
}
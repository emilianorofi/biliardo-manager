import type { ReactNode } from "react";
import GameShell from "../components/layout/GameShell";

type GameLayoutProps = {
  children: ReactNode;
};

export default function GameLayout({ children }: GameLayoutProps) {
  return <GameShell>{children}</GameShell>;
}
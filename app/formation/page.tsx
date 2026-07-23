import FormationBoard from "../components/formation/FormationBoard";

export default function FormationPage() {
  return (
    <main className="space-y-7">
      <header>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">
          Giornata 5
        </p>

        <h1 className="mt-2 text-4xl font-black text-white">
          Prepara la formazione
        </h1>

        <p className="mt-2 max-w-3xl text-slate-400">
          Assegna i giocatori agli slot A, B e C. I sei incontri della
          giornata verranno composti automaticamente.
        </p>
      </header>

      <FormationBoard />
    </main>
  );
}
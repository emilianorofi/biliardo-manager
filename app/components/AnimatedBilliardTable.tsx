"use client";

export default function AnimatedBilliardTable() {
  return (
    <section className="relative overflow-hidden border-y border-white/5 bg-[#080a0a] py-16 sm:py-24">
      <style jsx>{`
        /*
         * Tutti gli elementi seguono la stessa timeline.
         * Durata completa del ciclo: 5.5 secondi.
         */

        .cue-animation {
          animation: cueShot 5.5s linear infinite;
          transform-origin: right center;
        }

        .white-ball-animation {
          animation: whiteBallShot 5.5s linear infinite;
        }

        .yellow-ball-animation {
          animation: yellowBallShot 5.5s linear infinite;
        }

        .pin-top {
          animation: pinTopFall 5.5s linear infinite;
        }

        .pin-left {
          animation: pinLeftFall 5.5s linear infinite;
        }

        .pin-center {
          animation: pinCenterFall 5.5s linear infinite;
        }

        .pin-right {
          animation: pinRightFall 5.5s linear infinite;
        }

        .pin-bottom {
          animation: pinBottomFall 5.5s linear infinite;
        }

        /*
         * STECCA
         *
         * Avanza fino alla bianca, la colpisce
         * e subito dopo arretra e scompare.
         */
        @keyframes cueShot {
          0%,
          10% {
            transform: translateX(0);
            opacity: 1;
          }

          17% {
            transform: translateX(42px);
            opacity: 1;
          }

          20% {
            transform: translateX(18px);
            opacity: 0.7;
          }

          24%,
          100% {
            transform: translateX(-15px);
            opacity: 0;
          }
        }

        /*
         * BIANCA
         *
         * Parte appena viene colpita dalla stecca
         * e arriva direttamente sulla gialla.
         */
        @keyframes whiteBallShot {
          0%,
          17% {
            left: 8%;
          }

          18% {
            left: 8.5%;
          }

          38% {
            left: 29.5%;
          }

          100% {
            left: 29.5%;
          }
        }

        /*
         * GIALLA
         *
         * Parte immediatamente dopo l'impatto.
         * Attraversa il castello e poi rallenta
         * progressivamente prima di fermarsi.
         */
        @keyframes yellowBallShot {
          0%,
          38% {
            left: 34%;
          }

          /* Impatto con la bianca */
          39% {
            left: 34.5%;
          }

          /* Partenza veloce */
          47% {
            left: 42%;
          }

          /* Arrivo verso il castello */
          54% {
            left: 49%;
          }

          /* Attraversa i birilli */
          59% {
            left: 55%;
          }

          /* Inizia a rallentare */
          65% {
            left: 61%;
          }

          /* Rallenta ancora */
          72% {
            left: 65%;
          }

          /* Ultimi centimetri */
          80% {
            left: 67.5%;
          }

          /* Quasi ferma */
          88% {
            left: 68.5%;
          }

          /* Posizione finale */
          92%,
          100% {
            left: 69%;
          }
        }

        /*
         * I birilli iniziano a cadere mentre
         * la gialla attraversa il centro.
         */

        @keyframes pinTopFall {
          0%,
          56% {
            transform: translateX(-50%) translateY(0) rotate(0deg);
            opacity: 1;
          }

          64%,
          100% {
            transform: translateX(-50%) translateY(-18px) translateX(5px)
              rotate(68deg);
            opacity: 0.7;
          }
        }

        @keyframes pinLeftFall {
          0%,
          56% {
            transform: translateY(-50%) translateX(0) rotate(0deg);
            opacity: 1;
          }

          64%,
          100% {
            transform: translateY(-50%) translateX(-20px) translateY(5px)
              rotate(-72deg);
            opacity: 0.7;
          }
        }

        @keyframes pinCenterFall {
          0%,
          56% {
            transform: translate(-50%, -50%) rotate(0deg);
            opacity: 1;
          }

          64%,
          100% {
            transform: translate(-50%, -50%) translateX(18px) translateY(10px)
              rotate(78deg);
            opacity: 0.7;
          }
        }

        @keyframes pinRightFall {
          0%,
          56% {
            transform: translateY(-50%) translateX(0) rotate(0deg);
            opacity: 1;
          }

          64%,
          100% {
            transform: translateY(-50%) translateX(20px) translateY(-5px)
              rotate(72deg);
            opacity: 0.7;
          }
        }

        @keyframes pinBottomFall {
          0%,
          56% {
            transform: translateX(-50%) translateY(0) rotate(0deg);
            opacity: 1;
          }

          64%,
          100% {
            transform: translateX(-50%) translateY(20px) translateX(-5px)
              rotate(-62deg);
            opacity: 0.7;
          }
        }
      `}</style>

      {/* BACKGROUND GLOW */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.08),transparent_55%)]" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* TITLE */}
        <div className="mb-10 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-[#d4af37]">
            The Italian Game
          </p>

          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Precision. Strategy. Passion.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
            Every shot matters. Build your team, master the table and write
            your story in the world of Italian 5-pin billiards.
          </p>
        </div>

        {/* MATCH FRAME */}
        <div className="rounded-[28px] border border-[#d4af37]/20 bg-[#101313] p-3 shadow-2xl sm:p-6">
          {/* TOP INFO */}
          <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d4af37]">
                Exhibition Match
              </p>

              <p className="mt-1 font-semibold text-white">
                Firenze Billiards Club
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d4af37]">
                Discipline
              </p>

              <p className="mt-1 font-semibold text-white">
                5 Birilli
              </p>
            </div>
          </div>

          {/* BILLIARD TABLE */}
          <div className="relative mx-auto aspect-[2.15/1] w-[92%] max-w-3xl rounded-[24px] bg-gradient-to-b from-[#80552e] via-[#4e321c] to-[#29180c] p-[14px] shadow-[0_30px_70px_rgba(0,0,0,0.7)] sm:p-[20px]">
            {/* WOOD HIGHLIGHT */}
            <div className="pointer-events-none absolute inset-[6px] rounded-[20px] border border-[#d4af37]/25" />

            {/* INNER RAIL */}
            <div className="relative h-full w-full rounded-[15px] bg-gradient-to-b from-[#332116] to-[#17100b] p-[12px] sm:p-[16px]">
              {/* CLOTH */}
              <div className="relative h-full w-full overflow-hidden rounded-[7px] border border-black/60 bg-[#075536] shadow-[inset_0_0_55px_rgba(0,0,0,0.5)]">
                {/* CLOTH LIGHTING */}
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.11),transparent_60%)]" />

                {/* SUBTLE CENTER LINE */}
                <div className="pointer-events-none absolute left-[5%] right-[5%] top-1/2 h-px bg-white/[0.025]" />

                {/* ===================== */}
                {/* 5 PINS - EXACT CENTER */}
                {/* ===================== */}

                <div className="absolute left-1/2 top-1/2 z-30 h-[32px] w-[32px] -translate-x-1/2 -translate-y-1/2">
                  {/* TOP WHITE */}
                  <div className="pin-top absolute left-1/2 top-0 h-[10px] w-[4px] rounded-full bg-gradient-to-r from-zinc-400 via-white to-zinc-500 shadow-md" />

                  {/* LEFT WHITE */}
                  <div className="pin-left absolute left-0 top-1/2 h-[10px] w-[4px] rounded-full bg-gradient-to-r from-zinc-400 via-white to-zinc-500 shadow-md" />

                  {/* CENTER RED */}
                  <div className="pin-center absolute left-1/2 top-1/2 z-10 h-[12px] w-[5px] rounded-full bg-gradient-to-r from-red-950 via-red-500 to-red-950 shadow-md" />

                  {/* RIGHT WHITE */}
                  <div className="pin-right absolute right-0 top-1/2 h-[10px] w-[4px] rounded-full bg-gradient-to-r from-zinc-400 via-white to-zinc-500 shadow-md" />

                  {/* BOTTOM WHITE */}
                  <div className="pin-bottom absolute bottom-0 left-1/2 h-[10px] w-[4px] rounded-full bg-gradient-to-r from-zinc-400 via-white to-zinc-500 shadow-md" />
                </div>

                {/* ===================== */}
                {/* RED BALL */}
                {/* ===================== */}

                <div className="absolute right-[10%] top-[45.5%] z-20 aspect-square w-[4.5%] rounded-full bg-[radial-gradient(circle_at_35%_30%,#ffd6d6,#dc2626_42%,#700b0b_100%)] shadow-[4px_7px_12px_rgba(0,0,0,0.55)]" />

                {/* ===================== */}
                {/* YELLOW BALL */}
                {/* ===================== */}

                <div className="yellow-ball-animation absolute left-[34%] top-[45.5%] z-20 aspect-square w-[4.5%] rounded-full bg-[radial-gradient(circle_at_35%_30%,#fff8b5,#e6bd24_45%,#7d5c00_100%)] shadow-[4px_7px_12px_rgba(0,0,0,0.55)]" />

                {/* ===================== */}
                {/* WHITE BALL */}
                {/* ===================== */}

                <div className="white-ball-animation absolute left-[8%] top-[45.5%] z-20 aspect-square w-[4.5%] rounded-full bg-[radial-gradient(circle_at_35%_30%,#ffffff,#e7e7e7_55%,#8c8c8c_100%)] shadow-[4px_7px_12px_rgba(0,0,0,0.55)]" />

                {/* ===================== */}
                {/* CUE */}
                {/* ===================== */}

                <div className="cue-animation absolute left-[-9%] top-[51%] z-10 h-[3px] w-[16%] rounded-full bg-gradient-to-r from-[#4b2916] via-[#c9975a] to-[#f3e1bc] shadow-md" />
              </div>
            </div>
          </div>

          {/* BOTTOM INFO */}
          <div className="mt-5 flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-zinc-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              Live Simulation
            </div>

            <div className="font-semibold text-[#d4af37]">
              Biliardo Manager • 2026
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
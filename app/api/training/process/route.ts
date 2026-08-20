import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "L'aggiornamento settimanale viene elaborato automaticamente il lunedì alle 12:00.",
    },
    {
      status: 405,
    }
  );
}

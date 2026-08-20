import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Le partite di campionato vengono disputate automaticamente all'orario previsto.",
    },
    {
      status: 405,
    }
  );
}

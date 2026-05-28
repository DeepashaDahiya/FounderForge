import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { idea } = await req.json();
  const response = await fetch("http://localhost:8000/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idea }),
  });
  const data = await response.json();
  return Response.json(data);
}
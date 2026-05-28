export async function GET() {
  const response = await fetch("http://localhost:8000/test-agent");
  const data = await response.json();
  return Response.json(data);
}
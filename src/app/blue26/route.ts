const IMAGE_URL = "https://f43e0ea95148c13521.v2.appdeploy.ai/resources/international-blue-circular-economy-conference-2026.jpg";

export const runtime = "nodejs";
export const revalidate = 86400;

export async function GET() {
  const upstream = await fetch(IMAGE_URL, { cache: "force-cache" });

  if (!upstream.ok) {
    return Response.redirect(IMAGE_URL, 302);
  }

  const image = await upstream.arrayBuffer();

  return new Response(image, {
    headers: {
      "Content-Type": "image/jpeg",
      "Content-Disposition": "inline; filename=blue-economy-conference-2026.jpg",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}

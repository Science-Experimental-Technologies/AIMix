export function GET() {
  return Response.json({
    title: "Support AIMix",
    message: "This local-only build has no configured donation service.",
    channels: [],
  });
}

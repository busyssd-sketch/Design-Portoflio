export function isCmsBackendConfigured() {
  return process.env.NEXT_PUBLIC_CMS_ENABLED === "true";
}

export async function uploadCmsMedia(file: File): Promise<string> {
  const ticketResponse = await fetch("/api/cms/media/upload-ticket", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ fileName: encodeURIComponent(file.name), contentType: file.type, size: file.size }),
  });
  const ticket = await ticketResponse.json().catch(() => ({})) as { uploadUrl?: string; publicUrl?: string; error?: string };
  if (!ticketResponse.ok || !ticket.uploadUrl || !ticket.publicUrl) throw new Error(ticket.error || "Could not prepare upload.");

  // Upload directly from the browser to the Worker/R2. This avoids Vercel's
  // serverless request-body limit and keeps large video files off Vercel.
  const uploadResponse = await fetch(ticket.uploadUrl, {
    method: "PUT", headers: { "content-type": file.type }, body: file,
  });
  if (!uploadResponse.ok) {
    const message = await uploadResponse.text().catch(() => "");
    throw new Error(message || "Cloudflare R2 upload failed.");
  }
  return ticket.publicUrl;
}

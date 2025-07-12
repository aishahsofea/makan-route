/**
 * Parses streaming response chunks and extracts content from lines starting with "0:"
 * @param chunk - The raw chunk data from the stream
 * @returns The parsed content string
 */
export function parseStreamResponse(chunk: Uint8Array): string {
  const chunkText = new TextDecoder().decode(chunk);
  const lines = chunkText.split("\n");
  let content = "";

  for (const line of lines) {
    if (line.startsWith("0:")) {
      // Extract the content after "0:"
      const data = line.slice(2);
      if (data && data.trim()) {
        try {
          // Try to parse as JSON first
          const parsed = JSON.parse(data);
          // If it's a simple string, use it directly
          if (typeof parsed === "string") {
            content += parsed;
          }
        } catch {
          // If not JSON, treat as plain text
          content += data;
        }
      }
    }
  }

  return content;
} 
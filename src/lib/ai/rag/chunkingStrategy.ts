export class ChunkingStrategy {
  chunkSemantically(text: string, maxChunkSize = 300): string[] {
    const chunks: string[] = [];
    let currentChunk = "";

    const paragraphs = text.split(/\n+/);

    for (const paragraph of paragraphs) {
      if (paragraph.trim().length === 0) continue;

      if (currentChunk.length + paragraph.length <= maxChunkSize) {
        currentChunk += (currentChunk ? "\n" : "") + paragraph;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = paragraph;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  // TODO: implement later if necessary
  chunkBySentences() {}

  // TODO: implement later if necessary
  chunkBySize() {}
}

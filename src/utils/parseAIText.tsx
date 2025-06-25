export const parseText = (content: string) => {
  const parts = content.split(/(\*\*[^*]+\*\*)/g);

  return (
    <div className="space-y-1 leading-relaxed">
      {parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong className="underline decoration-amber-400" key={index}>
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </div>
  );
};

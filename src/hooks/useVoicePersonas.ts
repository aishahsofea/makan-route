import { useCallback, useState } from "react";

type VoicePersona = {
  id: string;
  name: string;
  description: string;
  voice: string;
  contexts: string[];
  settings: {
    rate?: number;
    pitch?: number;
    volume?: number;
  };
};

export const DEFAULT_PERSONAS: VoicePersona[] = [
  {
    id: "default",
    name: "Default Assistant",
    description: "Standard conversational voice",
    voice: "alloy",
    contexts: ["general", "conversation"],
    settings: { rate: 1, pitch: 1, volume: 0.8 },
  },
  {
    id: "food-expert",
    name: "Food Expert",
    description: "Warm, knowledgable voice for food recommendations",
    voice: "nova",
    contexts: ["food", "restaurant", "cooking", "recipe"],
    settings: { rate: 0.9, pitch: 1.1, volume: 0.8 },
  },
  {
    id: "directions",
    name: "Navigation",
    description: "Clear, direct voice for directions",
    voice: "echo",
    contexts: ["directions", "navigation", "location"],
    settings: { rate: 0.8, pitch: 1, volume: 1 },
  },
  {
    id: "helpful",
    name: "Helpful Guide",
    description: "Friendly, encouraging voice",
    voice: "shimmer",
    contexts: ["help", "tutorial", "explanation"],
    settings: { rate: 0.9, pitch: 1.2, volume: 0.8 },
  },
];

export const useVoicePersonas = () => {
  const [personas, setPersonas] = useState<VoicePersona[]>(DEFAULT_PERSONAS);
  const [activePersona, setActivePersona] = useState<VoicePersona>(
    DEFAULT_PERSONAS[0]
  );

  const detectContext = useCallback((message: string): string[] => {
    const contexts: string[] = [];
    const lowerCasedMessage = message.toLowerCase();

    if (
      /\b(restaurant|food|eat|meal|dish|cuisine|recipe|cook|taste|flavor)\b/.test(
        lowerCasedMessage
      )
    ) {
      contexts.push("food");
    }

    if (
      /\b(direction|navigate|location|address|route|way|map|go to)\b/.test(
        lowerCasedMessage
      )
    ) {
      contexts.push("directions");
    }

    if (
      /\b(help|how to|tutorial|explain|guide|show me)\b/.test(lowerCasedMessage)
    ) {
      contexts.push("help");
    }

    return contexts.length > 0 ? contexts : ["general"];
  }, []);

  const selectPersonaForContext = useCallback(
    (contexts: string[]) => {
      const matchingPersona = personas.find((persona) =>
        persona.contexts.some((context) => contexts.includes(context))
      );

      return matchingPersona || personas[0];
    },
    [personas]
  );

  const getPersonaForMessage = useCallback(
    (message: string): VoicePersona => {
      const contexts = detectContext(message);
      return selectPersonaForContext(contexts);
    },
    [detectContext, selectPersonaForContext]
  );

  const addPersona = useCallback((persona: VoicePersona) => {
    setPersonas((prev) => [...prev, persona]);
  }, []);

  const updatePersona = useCallback(
    (id: string, updates: Partial<VoicePersona>) => {
      setPersonas((prev) =>
        prev.map((persona) =>
          persona.id === id ? { ...persona, ...updates } : persona
        )
      );
    },
    []
  );

  const removePersona = useCallback((id: string) => {
    setPersonas((prev) => prev.filter((persona) => persona.id !== id));
  }, []);

  return {
    personas,
    activePersona,
    setActivePersona,
    detectContext,
    selectPersonaForContext,
    getPersonaForMessage,
    addPersona,
    updatePersona,
    removePersona,
  };
};

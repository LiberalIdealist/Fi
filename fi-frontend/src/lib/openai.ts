interface OpenAIOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export async function callOpenAI(
  prompt: string,
  systemPrompt: string = "You are a helpful financial assistant.",
  options: OpenAIOptions = {}
) {
  const response = await fetch('/api/openai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      systemPrompt,
      options: {
        model: options.model || "gpt-4o",
        temperature: options.temperature || 0.7,
        maxTokens: options.maxTokens || 1000,
        topP: options.topP || 1,
        frequencyPenalty: options.frequencyPenalty || 0,
        presencePenalty: options.presencePenalty || 0,
      }
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to get response from OpenAI');
  }

  return await response.json();
}
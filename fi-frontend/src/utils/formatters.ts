/**
 * Formats AI responses to ensure consistent styling without markdown artifacts
 * @param response The raw response from the AI
 * @returns A cleaned response with no markdown formatting
 */
export function formatAIResponse(response: string): string {
  if (!response) return '';
  
  // Remove markdown headings (# Heading)
  let formatted = response.replace(/^#{1,6}\s+/gm, '');
  
  // Remove markdown bold/italic markers
  formatted = formatted.replace(/(\*\*|__)(.*?)\1/g, '$2');
  formatted = formatted.replace(/(\*|_)(.*?)\1/g, '$2');
  
  // Convert markdown bullet points to simple bullets
  formatted = formatted.replace(/^\s*[*-]\s+/gm, '• ');
  
  // Remove markdown code blocks
  formatted = formatted.replace(/```[\s\S]*?```/g, (match) => {
    // Extract content between ``` markers but without the markers
    return match.replace(/```[\w]*\n|```$/g, '');
  });
  
  // Remove markdown inline code
  formatted = formatted.replace(/`([^`]+)`/g, '$1');
  
  // Handle any numbered lists
  formatted = formatted.replace(/^\s*(\d+)\.\s+/gm, '$1. ');
  
  return formatted.trim();
}
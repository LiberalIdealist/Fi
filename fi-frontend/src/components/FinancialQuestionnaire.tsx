"use client";
import { useState } from "react";
import type { QuestionnaireAnswers } from "@/types/shared";

interface FinancialQuestionnaireProps {
  onSubmit: (answers: QuestionnaireAnswers) => Promise<void>;
}

const FinancialQuestionnaire: React.FC<FinancialQuestionnaireProps> = ({ onSubmit }) => {
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({});
  const [message, setMessage] = useState<string>("");

  const questions = [
    { id: "q1", text: "How do you react to market volatility?", options: ["I panic and sell", "I stay invested but worry", "I see it as an opportunity", "I invest more"] },
    { id: "q2", text: "What is your primary financial goal?", options: ["Wealth Preservation", "Steady Growth", "High Growth", "Speculative Gains"] },
    { id: "q3", text: "How comfortable are you with high-risk investments?", options: ["Not at all", "Somewhat", "Comfortable", "Very Comfortable"] },
    { id: "q4", text: "How long can you invest without needing the money?", options: ["Less than 1 year", "1-3 years", "3-5 years", "More than 5 years"] },
    { id: "q5", text: "How do you manage unexpected expenses?", options: ["Use savings", "Use credit card", "Take a loan", "Sell investments"] },
    { id: "q6", text: "What percentage of your income do you save monthly?", options: ["Less than 10%", "10-20%", "20-40%", "More than 40%"] },
    { id: "q7", text: "Do you have emergency savings?", options: ["No", "Less than 3 months", "3-6 months", "More than 6 months"] },
    { id: "q8", text: "How do you choose financial products?", options: ["Friend’s advice", "Bank/Agent recommendations", "Research online", "Professional advisor"] },
    { id: "q9", text: "Do you actively track and adjust your investments?", options: ["Never", "Once a year", "Quarterly", "Monthly"] },
    { id: "q10", text: "What would you do if your portfolio dropped by 20%?", options: ["Sell everything", "Reduce exposure", "Hold and wait", "Buy more"] },
    { id: "q11", text: "How diversified is your investment portfolio?", options: ["All in one asset", "Mostly one asset", "Moderately diversified", "Highly diversified"] },
    { id: "q12", text: "What is your primary source of investment information?", options: ["News & TV", "Online Blogs", "Financial Advisors", "Own Research"] },
    { id: "q13", text: "How do you feel about using AI for financial planning?", options: ["Uncomfortable", "Skeptical", "Neutral", "Excited"] },
    { id: "q14", text: "How frequently do you review your financial goals?", options: ["Never", "Annually", "Every 6 months", "Quarterly"] },
    { id: "q15", text: "Do you currently have any financial dependents?", options: ["None", "Parents", "Spouse/Kids", "Extended Family"] },
  ];

  const handleChange = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async () => {
    try {
      await onSubmit(answers);
      setMessage("Profile saved successfully!");
    } catch (error) {
      setMessage("Error saving profile.");
      console.error('Error submitting questionnaire:', error);
    }
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4">Financial Risk & Behavior Questionnaire</h2>
      {questions.map((q) => (
        <div key={q.id} className="mb-4">
          <label className="text-gray-200">{q.text}</label>
          <select 
            className="w-full p-2 mt-1 bg-gray-800 text-white rounded" 
            onChange={(e) => handleChange(q.id, e.target.value)}
            value={answers[q.id] || ""}
          >
            <option value="">Select an option</option>
            {q.options.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        </div>
      ))}
      <button 
        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-700 mt-4" 
        onClick={handleSubmit}
      >
        Submit Answers
      </button>
      {message && <p className="text-green-400 mt-2">{message}</p>}
    </div>
  );
};

export default FinancialQuestionnaire;

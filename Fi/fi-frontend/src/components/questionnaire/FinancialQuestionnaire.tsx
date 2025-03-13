"use client";

import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../contexts/authContext";
import { geminiService } from "../../services/geminiService";

const FinancialQuestionnaire = ({ onSubmit }: { onSubmit: (answers: Record<string, string>, analysisResult: any) => void }) => {
  const { user } = useAuth(); // Use our actual auth hook
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Keeping the questions exactly as they were
  const questions = [
    { id: "question1", text: "How do you react to market volatility?", options: ["I panic and sell", "I stay invested but worry", "I see it as an opportunity", "I invest more"] },
    { id: "question2", text: "What is your primary financial goal?", options: ["Wealth Preservation", "Steady Growth", "High Growth", "Speculative Gains"] },
    { id: "question3", text: "How comfortable are you with high-risk investments?", options: ["Not at all", "Somewhat", "Comfortable", "Very Comfortable"] },
    { id: "question4", text: "How long can you invest without needing the money?", options: ["Less than 1 year", "1-3 years", "3-5 years", "More than 5 years"] },
    { id: "question5", text: "How do you manage unexpected expenses?", options: ["Use savings", "Use credit card", "Take a loan", "Sell investments"] },
    { id: "question6", text: "What percentage of your income do you save monthly?", options: ["Less than 10%", "10-20%", "20-40%", "More than 40%"] },
    { id: "question7", text: "Do you have emergency savings?", options: ["No", "Less than 3 months", "3-6 months", "More than 6 months"] },
    { id: "question8", text: "How do you choose financial products?", options: ["Friend's advice", "Bank/Agent recommendations", "Research online", "Professional advisor"] },
    { id: "question9", text: "Do you actively track and adjust your investments?", options: ["Never", "Once a year", "Quarterly", "Monthly"] },
    { id: "question10", text: "What would you do if your portfolio dropped by 20%?", options: ["Sell everything", "Reduce exposure", "Hold and wait", "Buy more"] },
    { id: "question11", text: "How diversified is your investment portfolio?", options: ["All in one asset", "Mostly one asset", "Moderately diversified", "Highly diversified"] },
    { id: "question12", text: "What is your primary source of investment information?", options: ["News & TV", "Online Blogs", "Financial Advisors", "Own Research"] },
    { id: "question13", text: "How do you feel about using AI for financial planning?", options: ["Uncomfortable", "Skeptical", "Neutral", "Excited"] },
    { id: "question14", text: "How frequently do you review your financial goals?", options: ["Never", "Annually", "Every 6 months", "Quarterly"] },
    { id: "question15", text: "Do you currently have any financial dependents?", options: ["None", "Parents", "Spouse/Kids", "Extended Family"] },
    { id: "question16", text: "What is your monthly income?", options: ["Less than ₹50,000", "₹50,000 - ₹1,00,000", "₹1,00,000 - ₹2,00,000", "More than ₹2,00,000"] },
    { id: "question17", text: "What are your monthly expenses?", options: ["Less than ₹20,000", "₹20,000 - ₹50,000", "₹50,000 - ₹1,00,000", "More than ₹1,00,000"] },
    { id: "question18", text: "What is your yearly insurance premium (Life, Health, Term)?", options: ["Less than ₹10,000", "₹10,000 - ₹50,000", "₹50,000 - ₹1,00,000", "More than ₹1,00,000"] },
    { id: "question19", text: "Do you have any ongoing EMIs?", options: ["No EMIs", "Less than ₹10,000", "₹10,000 - ₹50,000", "More than ₹50,000"] },
    { id: "question20", text: "How do you allocate your savings?", options: ["Fixed Deposits", "Stocks", "Mutual Funds", "Real Estate", "Gold", "Crypto"] },
  ];

  const handleChange = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please log in to submit your questionnaire.");
      return;
    }

    try {
      setIsLoading(true);
      
      // Using service instead of direct fetch
      const response = await geminiService.submitQuestionnaire({
        action: "processQuestionnaire", 
        userId: user.uid, 
        data: answers
      });
      
      toast.success("Your financial profile is being analyzed.");
      onSubmit(answers, response.analysisResult);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit questionnaire.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-white mb-4">Financial & Psychological Risk Assessment</h2>

        {questions.map((q) => (
          <div key={q.id} className="mb-4">
            <label className="text-gray-200">{q.text}</label>
            <select
              className="w-full p-2 mt-1 bg-gray-800 text-white rounded"
              onChange={(e) => handleChange(q.id, e.target.value)}
            >
              <option value="">Select an option</option>
              {q.options.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        ))}

        <button
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-700 mt-4"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Submitting..." : "Submit Answers"}
        </button>
      </div>
    </form>
  );
};

export default FinancialQuestionnaire;
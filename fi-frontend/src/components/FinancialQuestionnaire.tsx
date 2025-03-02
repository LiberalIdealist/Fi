"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

// Define a proper FormData interface to fix TypeScript errors
interface FormDataType {
  monthlyIncome: string | number;
  monthlySavings: string | number;
  monthlyExpenses: string | number;
  age: string | number;
  dependents: string | number;
  riskTolerance: string;
  investmentGoals: string[]; // Changed from never[] to string[]
  investmentHorizon: string;
  existingInvestments: {
    [key: string]: boolean; // Add index signature
    stocks: boolean;
    mutualFunds: boolean;
    fixedDeposits: boolean;
    realEstate: boolean;
    gold: boolean;
    other: boolean;
  };
  existingInsurance: {
    [key: string]: boolean; // Add index signature
    life: boolean;
    health: boolean;
    term: boolean;
    vehicle: boolean;
  };
  savingsAmount: string | number;
  debt: {
    [key: string]: boolean; // Add index signature
    hasDebt: boolean;
    creditCards: boolean;
    personalLoans: boolean;
    homeLoan: boolean;
    carLoan: boolean;
    educationLoan: boolean;
  };
  [key: string]: any; // Add general index signature for dynamic access
}

interface FinancialQuestionnaireProps {
  documentInsights?: any[];
  onComplete: (answers: Record<string, any>) => void;
}

export default function FinancialQuestionnaire({ 
  documentInsights = [],
  onComplete 
}: FinancialQuestionnaireProps) {
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  
  // Pre-fill answers from document analysis if available
  const [formData, setFormData] = useState<FormDataType>(() => {
    // Attempt to extract data from document insights
    const extractedData: Record<string, any> = {};
    
    if (documentInsights.length > 0) {
      // Bank documents might contain income information
      const bankDocs = documentInsights.filter(d => d.documentType === 'bank');
      if (bankDocs.length > 0) {
        const bankAnalysis = bankDocs[0].analysisData;
        if (bankAnalysis?.accountSummary?.regularIncome) {
          extractedData.monthlyIncome = bankAnalysis.accountSummary.regularIncome;
        }
        if (bankAnalysis?.accountSummary?.averageBalance) {
          extractedData.savingsAmount = bankAnalysis.accountSummary.averageBalance;
        }
      }
      
      // Add other document type processing as needed
    }
    
    return {
      monthlyIncome: extractedData.monthlyIncome || "",
      monthlySavings: extractedData.monthlySavings || "",
      monthlyExpenses: "",
      age: "",
      dependents: "0",
      riskTolerance: "moderate",
      investmentGoals: [], // Now properly typed as string[]
      investmentHorizon: "medium",
      existingInvestments: {
        stocks: false,
        mutualFunds: false,
        fixedDeposits: false,
        realEstate: false,
        gold: false,
        other: false
      },
      existingInsurance: {
        life: false,
        health: false,
        term: false,
        vehicle: false
      },
      savingsAmount: extractedData.savingsAmount || "",
      debt: {
        hasDebt: false,
        creditCards: false,
        personalLoans: false,
        homeLoan: false,
        carLoan: false,
        educationLoan: false
      }
    };
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => {
        // Handle nested objects (for existingInvestments, etc.)
        if (name.includes('.')) {
          const [parent, child] = name.split('.');
          return {
            ...prev,
            [parent]: {
              ...(prev[parent as keyof FormDataType] as Record<string, boolean>),
              [child]: checked
            }
          };
        }
        
        return { ...prev, [name]: checked };
      });
    } else {
      setFormData(prev => {
        // Handle nested objects
        if (name.includes('.')) {
          const [parent, child] = name.split('.');
          return {
            ...prev,
            [parent]: {
              ...(prev[parent as keyof FormDataType] as Record<string, any>),
              [child]: value
            }
          };
        }
        
        return { ...prev, [name]: value };
      });
    }
  };
  
  const handleMultiSelect = (name: string, value: string) => {
    setFormData(prev => {
      const currentValues = Array.isArray(prev[name]) ? [...prev[name] as string[]] : [];
      
      if (currentValues.includes(value)) {
        return { ...prev, [name]: currentValues.filter(v => v !== value) };
      } else {
        return { ...prev, [name]: [...currentValues, value] };
      }
    });
  };
  
  // Questionnaire steps
  const steps = [
    {
      title: "Basic Information",
      fields: ["monthlyIncome", "monthlySavings", "monthlyExpenses", "age", "dependents"]
    },
    {
      title: "Risk Profile",
      fields: ["riskTolerance", "investmentGoals", "investmentHorizon"]
    },
    {
      title: "Existing Portfolio",
      fields: ["existingInvestments", "savingsAmount"]
    },
    {
      title: "Insurance & Debt",
      fields: ["existingInsurance", "debt"]
    }
  ];
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Prepare final answers
      const finalAnswers = {
        ...formData,
        // Add document insight references for context
        documentInsightIds: documentInsights.map(doc => doc.documentId)
      };
      
      setAnswers(finalAnswers);
      onComplete(finalAnswers);
    }
  };
  
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Questionnaire form rendering
  return (
    <div className="bg-gray-900 p-6 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-4">
        {steps[currentStep].title}
      </h2>
      
      <form onSubmit={handleSubmit}>
        {/* Step 1: Basic Information */}
        {currentStep === 0 && (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">Monthly Income (₹)</label>
              <input
                type="number"
                name="monthlyIncome"
                value={formData.monthlyIncome}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2">Monthly Savings (₹)</label>
              <input
                type="number"
                name="monthlySavings"
                value={formData.monthlySavings}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2">Monthly Expenses (₹)</label>
              <input
                type="number"
                name="monthlyExpenses"
                value={formData.monthlyExpenses}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2">Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2">Dependents</label>
              <input
                type="number"
                name="dependents"
                value={formData.dependents}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
                required
              />
            </div>
          </div>
        )}
        
        {/* Step 2: Risk Profile */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">Risk Tolerance</label>
              <select
                name="riskTolerance"
                value={formData.riskTolerance}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
                required
              >
                <option value="low">Low</option>
                <option value="moderate">Moderate</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2">Investment Goals</label>
              <div className="space-y-2">
                {["Wealth Preservation", "Steady Growth", "High Growth", "Speculative Gains"].map(goal => (
                  <div key={goal} className="flex items-center">
                    <input
                      type="checkbox"
                      name="investmentGoals"
                      value={goal}
                      checked={formData.investmentGoals.includes(goal)}
                      onChange={() => handleMultiSelect("investmentGoals", goal)}
                      className="mr-2"
                    />
                    <span className="text-gray-300">{goal}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2">Investment Horizon</label>
              <select
                name="investmentHorizon"
                value={formData.investmentHorizon}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
                required
              >
                <option value="short">Short (1-3 years)</option>
                <option value="medium">Medium (3-5 years)</option>
                <option value="long">Long (5+ years)</option>
              </select>
            </div>
          </div>
        )}
        
        {/* Step 3: Existing Portfolio */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">Existing Investments</label>
              <div className="space-y-2">
                {["stocks", "mutualFunds", "fixedDeposits", "realEstate", "gold", "other"].map(investment => (
                  <div key={investment} className="flex items-center">
                    <input
                      type="checkbox"
                      name={`existingInvestments.${investment}`}
                      checked={formData.existingInvestments[investment]}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span className="text-gray-300">{investment}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2">Savings Amount (₹)</label>
              <input
                type="number"
                name="savingsAmount"
                value={formData.savingsAmount}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
                required
              />
            </div>
          </div>
        )}
        
        {/* Step 4: Insurance & Debt */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">Existing Insurance</label>
              <div className="space-y-2">
                {["life", "health", "term", "vehicle"].map(insurance => (
                  <div key={insurance} className="flex items-center">
                    <input
                      type="checkbox"
                      name={`existingInsurance.${insurance}`}
                      checked={formData.existingInsurance[insurance]}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span className="text-gray-300">{insurance}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2">Debt</label>
              <div className="space-y-2">
                {["hasDebt", "creditCards", "personalLoans", "homeLoan", "carLoan", "educationLoan"].map(debt => (
                  <div key={debt} className="flex items-center">
                    <input
                      type="checkbox"
                      name={`debt.${debt}`}
                      checked={formData.debt[debt]}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span className="text-gray-300">{debt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-between mt-6">
          {currentStep > 0 && (
            <button
              type="button"
              onClick={handleBack}
              className="py-2 px-4 bg-gray-700 text-white rounded hover:bg-gray-600"
            >
              Back
            </button>
          )}
          
          <button
            type="submit"
            className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {currentStep < steps.length - 1 ? "Next" : "Submit"}
          </button>
        </div>
      </form>
      
      {documentInsights && documentInsights.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-3">Document Insights</h3>
          <p className="text-gray-400 mb-3">
            We've analyzed your documents and pre-filled some answers based on the following insights:
          </p>
          <ul className="list-disc pl-5 text-gray-300 space-y-1">
            {documentInsights.map((doc, index) => (
              <li key={index}>
                {doc.documentType} document: {doc.insights?.length} insights found
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

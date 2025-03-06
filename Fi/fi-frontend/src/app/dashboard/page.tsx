import  PortfolioSummary  from "./components/PortfolioSummary";
import  RiskAssessment  from "./components/RiskAssessment";
import { Insights } from "./components/Insights";

export default function Dashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <PortfolioSummary />
      <RiskAssessment />
      <Insights />
    </div>
  );
}
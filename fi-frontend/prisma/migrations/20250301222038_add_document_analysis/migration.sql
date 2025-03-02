/*
  Warnings:

  - Added the required column `lastUpdated` to the `FinancialProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FinancialDocument" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "FinancialProfile" ADD COLUMN     "analysisData" JSONB,
ADD COLUMN     "documentAnalysis" JSONB,
ADD COLUMN     "financialMetrics" JSONB,
ADD COLUMN     "insights" TEXT[],
ADD COLUMN     "lastUpdated" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "psychologicalProfile" JSONB,
ADD COLUMN     "recommendations" JSONB,
ADD COLUMN     "visualizationData" JSONB,
ALTER COLUMN "responses" DROP NOT NULL,
ALTER COLUMN "riskScore" SET DEFAULT 5;

-- CreateTable
CREATE TABLE "FinancialDocumentAnalysis" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "analysisData" JSONB NOT NULL,
    "accountSummary" JSONB,
    "transactions" JSONB,
    "investments" JSONB,
    "insights" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialDocumentAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FinancialDocumentAnalysis_documentId_key" ON "FinancialDocumentAnalysis"("documentId");

-- CreateIndex
CREATE INDEX "FinancialDocumentAnalysis_documentId_idx" ON "FinancialDocumentAnalysis"("documentId");

-- AddForeignKey
ALTER TABLE "FinancialDocumentAnalysis" ADD CONSTRAINT "FinancialDocumentAnalysis_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "FinancialDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

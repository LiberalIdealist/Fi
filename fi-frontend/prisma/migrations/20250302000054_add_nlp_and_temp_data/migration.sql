/*
  Warnings:

  - You are about to drop the column `createdAt` on the `FinancialDocument` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `FinancialDocument` table. All the data in the column will be lost.
  - You are about to drop the column `userEmail` on the `FinancialDocument` table. All the data in the column will be lost.
  - You are about to drop the column `accountSummary` on the `FinancialDocumentAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `documentType` on the `FinancialDocumentAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `insights` on the `FinancialDocumentAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `investments` on the `FinancialDocumentAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `transactions` on the `FinancialDocumentAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `financialMetrics` on the `FinancialProfile` table. All the data in the column will be lost.
  - You are about to drop the column `lastUpdated` on the `FinancialProfile` table. All the data in the column will be lost.
  - You are about to drop the column `responses` on the `FinancialProfile` table. All the data in the column will be lost.
  - You are about to drop the column `visualizationData` on the `FinancialProfile` table. All the data in the column will be lost.
  - You are about to drop the `Profile` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `documentType` to the `FinancialDocument` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileSize` to the `FinancialDocument` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileType` to the `FinancialDocument` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `FinancialDocument` table without a default value. This is not possible if the table is not empty.
  - Made the column `riskScore` on table `FinancialProfile` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "FinancialDocument" DROP CONSTRAINT "FinancialDocument_userEmail_fkey";

-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_userId_fkey";

-- DropIndex
DROP INDEX "FinancialDocument_userEmail_idx";

-- DropIndex
DROP INDEX "FinancialDocumentAnalysis_documentId_idx";

-- DropIndex
DROP INDEX "FinancialProfile_userId_idx";

-- AlterTable
ALTER TABLE "FinancialDocument" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
DROP COLUMN "userEmail",
ADD COLUMN     "documentType" TEXT NOT NULL,
ADD COLUMN     "fileSize" INTEGER NOT NULL,
ADD COLUMN     "fileType" TEXT NOT NULL,
ADD COLUMN     "isPasswordProtected" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "processedAt" TIMESTAMP(3),
ADD COLUMN     "processingErrors" TEXT,
ADD COLUMN     "processingStatus" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN     "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "FinancialDocumentAnalysis" DROP COLUMN "accountSummary",
DROP COLUMN "documentType",
DROP COLUMN "insights",
DROP COLUMN "investments",
DROP COLUMN "transactions",
ADD COLUMN     "actionItems" TEXT[],
ADD COLUMN     "anomalies" TEXT[],
ADD COLUMN     "confidence" DOUBLE PRECISION,
ADD COLUMN     "keyPoints" TEXT[],
ADD COLUMN     "nlpProcessed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "nlpResults" JSONB,
ADD COLUMN     "rawText" TEXT,
ADD COLUMN     "sentimentScore" DOUBLE PRECISION,
ALTER COLUMN "analysisData" DROP NOT NULL;

-- AlterTable
ALTER TABLE "FinancialProfile" DROP COLUMN "financialMetrics",
DROP COLUMN "lastUpdated",
DROP COLUMN "responses",
DROP COLUMN "visualizationData",
ADD COLUMN     "analysisVersion" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "completedQuestionnaire" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "documentsAnalyzed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "financialGoals" TEXT[],
ADD COLUMN     "followUpResponses" JSONB,
ADD COLUMN     "investmentStyle" TEXT,
ADD COLUMN     "lastAnalyzedAt" TIMESTAMP(3),
ADD COLUMN     "questionnaireResponses" JSONB,
ALTER COLUMN "riskScore" SET NOT NULL;

-- DropTable
DROP TABLE "Profile";

-- CreateTable
CREATE TABLE "TempDocumentData" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "dataKey" TEXT NOT NULL,
    "dataValue" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TempDocumentData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TempDocumentData_documentId_idx" ON "TempDocumentData"("documentId");

-- CreateIndex
CREATE INDEX "TempDocumentData_expiresAt_idx" ON "TempDocumentData"("expiresAt");

-- AddForeignKey
ALTER TABLE "FinancialDocument" ADD CONSTRAINT "FinancialDocument_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TempDocumentData" ADD CONSTRAINT "TempDocumentData_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "FinancialDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

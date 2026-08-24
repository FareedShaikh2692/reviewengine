-- AlterTable
ALTER TABLE "users" ADD COLUMN     "googleAccessTokenEnc" TEXT,
ADD COLUMN     "googleRefreshTokenEnc" TEXT,
ADD COLUMN     "googleTokenExpiresAt" TIMESTAMP(3);

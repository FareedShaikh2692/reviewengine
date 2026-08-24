-- AlterTable
ALTER TABLE "users" ADD COLUMN     "notificationPreferences" JSONB DEFAULT '{"email":true,"newReview":true,"campaignActivity":true,"productUpdates":false}';

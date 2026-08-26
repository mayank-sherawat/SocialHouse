-- AlterTable
ALTER TABLE "PasswordReset" ADD COLUMN "attempts" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "PasswordReset_email_idx" ON "PasswordReset"("email");

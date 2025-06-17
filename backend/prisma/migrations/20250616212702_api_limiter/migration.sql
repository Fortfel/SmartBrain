-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_authorized" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "api_requests" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endpoint" TEXT NOT NULL,

    CONSTRAINT "api_requests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "api_requests" ADD CONSTRAINT "api_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

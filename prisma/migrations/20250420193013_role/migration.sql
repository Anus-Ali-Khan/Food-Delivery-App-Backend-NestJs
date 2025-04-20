-- CreateEnum
CREATE TYPE "Roles" AS ENUM ('user', 'vendor', 'rider');

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "role" "Roles" NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

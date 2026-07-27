-- CreateTable
CREATE TABLE "SiteSetting" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "announcementText" TEXT NOT NULL DEFAULT 'Enjoy FREE shipping on all orders',

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);

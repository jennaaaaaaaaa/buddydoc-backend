-- CreateTable
CREATE TABLE `bookmarks` (
    `postId` INTEGER NOT NULL,
    `createdAt` TIMESTAMP(0) NULL,
    `userId` INTEGER NOT NULL,

    INDEX `postId`(`postId`),
    PRIMARY KEY (`userId`, `postId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `posts` (
    `postId` INTEGER NOT NULL AUTO_INCREMENT,
    `postTitle` VARCHAR(200) NULL,
    `content` TEXT NULL,
    `position` VARCHAR(20) NULL,
    `postType` VARCHAR(100) NULL,
    `imageName` VARCHAR(255) NULL,
    `fileName` VARCHAR(255) NULL,
    `preference` INTEGER NULL DEFAULT 0,
    `views` INTEGER NULL DEFAULT 0,
    `createdAt` TIMESTAMP(0) NULL,
    `updatedAt` DATETIME(0) NULL,
    `deleteAt` DATETIME(0) NULL,
    `post_userId` INTEGER NULL,

    INDEX `userId`(`post_userId`),
    PRIMARY KEY (`postId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `skills` (
    `skill` VARCHAR(50) NOT NULL,
    `createdAt` TIMESTAMP(0) NULL,
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`userId`, `skill`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `studylists` (
    `postId` INTEGER NOT NULL,
    `createdAt` TIMESTAMP(0) NULL,
    `userId` INTEGER NOT NULL,

    INDEX `postId`(`postId`),
    PRIMARY KEY (`userId`, `postId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `email` VARCHAR(255) NULL,
    `userName` VARCHAR(20) NULL,
    `userNickname` VARCHAR(20) NULL,
    `userTokken` VARCHAR(255) NULL,
    `position` VARCHAR(20) NULL,
    `gitURL` VARCHAR(255) NULL,
    `userStatus` ENUM('public', 'private') NULL,
    `introduction` VARCHAR(50) NULL,
    `career` INTEGER NULL,
    `createdAt` TIMESTAMP(0) NULL,
    `updatedAt` DATETIME(0) NULL,
    `deleteAt` DATETIME(0) NULL,
    `userId` INTEGER NOT NULL AUTO_INCREMENT,

    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chats` (
    `chatId` INTEGER NOT NULL AUTO_INCREMENT,
    `postId` INTEGER NULL,
    `chat_message` TEXT NULL,
    `createdAt` TIMESTAMP(0) NULL,
    `userId` INTEGER NULL,

    INDEX `postId`(`postId`),
    INDEX `userId`(`userId`),
    PRIMARY KEY (`chatId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `userId` INTEGER NULL,
    `postId` INTEGER NOT NULL,
    `noti_userId` INTEGER NOT NULL,
    `noti_message` VARCHAR(255) NULL,
    `notiStatus` ENUM('pending', 'accept') NULL,
    `createdAt` TIMESTAMP(0) NULL,
    `updatedAt` DATETIME(0) NULL,
    `deleteAt` DATETIME(0) NULL,

    INDEX `postId`(`postId`),
    PRIMARY KEY (`noti_userId`, `postId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notes` (
    `noteId` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NULL,
    `postId` INTEGER NULL,
    `post_userId` INTEGER NULL,
    `note_message` TEXT NULL,
    `noteStatus` ENUM('unread', 'read') NULL,
    `createdAt` TIMESTAMP(0) NULL,
    `updatedAt` DATETIME(0) NULL,
    `deleteAt` DATETIME(0) NULL,

    INDEX `userId`(`userId`),
    PRIMARY KEY (`noteId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `applications` (
    `alarmId` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NULL,
    `noteId` INTEGER NULL,
    `note_userId` INTEGER NULL,
    `postId` INTEGER NULL,
    `noti_userId` INTEGER NULL,
    `alarmStatus` ENUM('unread', 'read') NULL,
    `createdAt` TIMESTAMP(0) NULL,
    `updatedAt` DATETIME(0) NULL,
    `deleteAt` DATETIME(0) NULL,

    INDEX `userId`(`userId`),
    PRIMARY KEY (`alarmId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `bookmarks` ADD CONSTRAINT `bookmarks_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `bookmarks` ADD CONSTRAINT `bookmarks_ibfk_2` FOREIGN KEY (`postId`) REFERENCES `posts`(`postId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `posts` ADD CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`post_userId`) REFERENCES `users`(`userId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `skills` ADD CONSTRAINT `skills_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `studylists` ADD CONSTRAINT `studylists_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `studylists` ADD CONSTRAINT `studylists_ibfk_2` FOREIGN KEY (`postId`) REFERENCES `posts`(`postId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `chats` ADD CONSTRAINT `chats_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `chats` ADD CONSTRAINT `chats_ibfk_2` FOREIGN KEY (`postId`) REFERENCES `posts`(`postId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`postId`) REFERENCES `posts`(`postId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`noti_userId`) REFERENCES `users`(`userId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `notes` ADD CONSTRAINT `notes_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `notes` ADD CONSTRAINT `notes_ibfk_2` FOREIGN KEY (`postId`) REFERENCES `posts`(`postId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `applications` ADD CONSTRAINT `applications_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `applications` ADD CONSTRAINT `applications_ibfk_2` FOREIGN KEY (`noteId`) REFERENCES `notes`(`noteId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `applications` ADD CONSTRAINT `applications_ibfk_4` FOREIGN KEY (`postId`, `noti_userId`) REFERENCES `notifications`(`postId`, `noti_userId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

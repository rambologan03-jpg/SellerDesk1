CREATE TABLE `inventory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`skuId` varchar(64) NOT NULL,
	`productName` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100),
	`quantity` int NOT NULL DEFAULT 0,
	`minimumStock` int NOT NULL DEFAULT 10,
	`maximumStock` int,
	`costPrice` decimal(10,2) NOT NULL,
	`sellingPrice` decimal(10,2) NOT NULL,
	`unit` varchar(20) DEFAULT 'piece',
	`barcode` varchar(100),
	`imageUrl` varchar(500),
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inventory_id` PRIMARY KEY(`id`),
	CONSTRAINT `inventory_skuId_unique` UNIQUE(`skuId`)
);
--> statement-breakpoint
CREATE TABLE `labelTemplates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`templateContent` json,
	`isDefault` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `labelTemplates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `offlineSyncQueue` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`action` varchar(50) NOT NULL,
	`entityType` varchar(50) NOT NULL,
	`entityId` int,
	`data` json,
	`synced` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`syncedAt` timestamp,
	CONSTRAINT `offlineSyncQueue_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` varchar(64) NOT NULL,
	`customerId` varchar(64) NOT NULL,
	`customerName` varchar(255) NOT NULL,
	`customerEmail` varchar(320),
	`customerPhone` varchar(20),
	`totalAmount` decimal(10,2) NOT NULL,
	`discountAmount` decimal(10,2) DEFAULT '0',
	`taxAmount` decimal(10,2) DEFAULT '0',
	`netAmount` decimal(10,2) NOT NULL,
	`status` enum('pending','confirmed','shipped','delivered','cancelled','returned') NOT NULL DEFAULT 'pending',
	`shippingAddress` text,
	`state` varchar(50),
	`city` varchar(100),
	`pincode` varchar(10),
	`items` json,
	`notes` text,
	`isDuplicate` boolean DEFAULT false,
	`duplicateOf` int,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_orderId_unique` UNIQUE(`orderId`)
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reportType` enum('profit_loss','state_wise','performance','inventory') NOT NULL,
	`title` varchar(255) NOT NULL,
	`startDate` datetime NOT NULL,
	`endDate` datetime NOT NULL,
	`data` json,
	`summary` json,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shippingLabels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`trackingNumber` varchar(100),
	`carrier` varchar(50),
	`labelUrl` varchar(500),
	`templateId` int,
	`recipientName` varchar(255) NOT NULL,
	`recipientAddress` text NOT NULL,
	`recipientPhone` varchar(20),
	`weight` decimal(8,2),
	`dimensions` json,
	`status` enum('generated','printed','shipped','delivered') DEFAULT 'generated',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shippingLabels_id` PRIMARY KEY(`id`),
	CONSTRAINT `shippingLabels_trackingNumber_unique` UNIQUE(`trackingNumber`)
);
--> statement-breakpoint
CREATE TABLE `stockMovement` (
	`id` int AUTO_INCREMENT NOT NULL,
	`skuId` int NOT NULL,
	`movementType` enum('in','out','adjustment','return') NOT NULL,
	`quantity` int NOT NULL,
	`reason` varchar(255),
	`orderId` int,
	`notes` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stockMovement_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `supportTickets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticketNumber` varchar(50) NOT NULL,
	`orderId` int,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`category` varchar(50) NOT NULL,
	`priority` enum('low','medium','high','urgent') DEFAULT 'medium',
	`status` enum('open','in_progress','resolved','closed','reopen') NOT NULL DEFAULT 'open',
	`assignedTo` int,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`resolvedAt` timestamp,
	CONSTRAINT `supportTickets_id` PRIMARY KEY(`id`),
	CONSTRAINT `supportTickets_ticketNumber_unique` UNIQUE(`ticketNumber`)
);
--> statement-breakpoint
CREATE TABLE `ticketComments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticketId` int NOT NULL,
	`comment` text NOT NULL,
	`attachmentUrl` varchar(500),
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ticketComments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','owner','staff') NOT NULL DEFAULT 'user';--> statement-breakpoint
CREATE INDEX `skuId_idx` ON `inventory` (`skuId`);--> statement-breakpoint
CREATE INDEX `category_idx` ON `inventory` (`category`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `offlineSyncQueue` (`userId`);--> statement-breakpoint
CREATE INDEX `synced_idx` ON `offlineSyncQueue` (`synced`);--> statement-breakpoint
CREATE INDEX `orderId_idx` ON `orders` (`orderId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `orders` (`status`);--> statement-breakpoint
CREATE INDEX `state_idx` ON `orders` (`state`);--> statement-breakpoint
CREATE INDEX `createdAt_idx` ON `orders` (`createdAt`);--> statement-breakpoint
CREATE INDEX `reportType_idx` ON `reports` (`reportType`);--> statement-breakpoint
CREATE INDEX `createdAt_idx` ON `reports` (`createdAt`);--> statement-breakpoint
CREATE INDEX `orderId_idx` ON `shippingLabels` (`orderId`);--> statement-breakpoint
CREATE INDEX `tracking_idx` ON `shippingLabels` (`trackingNumber`);--> statement-breakpoint
CREATE INDEX `skuId_idx` ON `stockMovement` (`skuId`);--> statement-breakpoint
CREATE INDEX `createdAt_idx` ON `stockMovement` (`createdAt`);--> statement-breakpoint
CREATE INDEX `ticketNumber_idx` ON `supportTickets` (`ticketNumber`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `supportTickets` (`status`);--> statement-breakpoint
CREATE INDEX `priority_idx` ON `supportTickets` (`priority`);--> statement-breakpoint
CREATE INDEX `ticketId_idx` ON `ticketComments` (`ticketId`);--> statement-breakpoint
CREATE INDEX `role_idx` ON `users` (`role`);
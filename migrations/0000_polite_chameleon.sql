CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`summary` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`memory` text NOT NULL
);

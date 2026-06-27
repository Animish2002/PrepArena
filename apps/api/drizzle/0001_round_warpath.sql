CREATE TABLE `user_xp` (
	`user_id` text PRIMARY KEY NOT NULL,
	`total_xp` integer DEFAULT 0 NOT NULL,
	`weekly_xp` integer DEFAULT 0 NOT NULL,
	`monthly_xp` integer DEFAULT 0 NOT NULL,
	`week_start` integer,
	`month_start` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);

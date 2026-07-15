CREATE TABLE `api_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token_hash` text NOT NULL,
	`label` text NOT NULL,
	`created_at` integer,
	`last_used_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `api_tokens_token_hash_unique` ON `api_tokens` (`token_hash`);--> statement-breakpoint
ALTER TABLE `problems` ADD `leetcode_slug` text;--> statement-breakpoint
ALTER TABLE `users` ADD `leetcode_username` text;--> statement-breakpoint
ALTER TABLE `users` ADD `leetcode_last_synced_at` integer;
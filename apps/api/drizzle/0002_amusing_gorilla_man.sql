CREATE TABLE `challenge_completions` (
	`id` text PRIMARY KEY NOT NULL,
	`challenge_id` text NOT NULL,
	`user_id` text NOT NULL,
	`problems_solved` integer DEFAULT 0 NOT NULL,
	`total_problems` integer NOT NULL,
	`completed` integer DEFAULT 0 NOT NULL,
	`total_time_seconds` integer DEFAULT 0 NOT NULL,
	`completed_at` integer,
	`xp_awarded` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`challenge_id`) REFERENCES `weekly_challenges`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `challenge_completions_challenge_user_idx` ON `challenge_completions` (`challenge_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `weekly_challenges` (
	`id` text PRIMARY KEY NOT NULL,
	`week_start` integer NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`type` text NOT NULL,
	`problem_ids` text NOT NULL,
	`xp_reward` integer DEFAULT 200 NOT NULL,
	`badge_name` text NOT NULL,
	`created_at` integer
);

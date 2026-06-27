CREATE TABLE `activity_log` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`payload` text,
	`created_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `battles` (
	`id` text PRIMARY KEY NOT NULL,
	`challenger_id` text NOT NULL,
	`opponent_id` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`problem_ids` text,
	`started_at` integer,
	`ended_at` integer,
	`winner_id` text,
	`challenger_rating_delta` integer,
	`opponent_rating_delta` integer,
	FOREIGN KEY (`challenger_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`opponent_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `bookmarks` (
	`user_id` text NOT NULL,
	`problem_id` text NOT NULL,
	`created_at` integer,
	PRIMARY KEY(`user_id`, `problem_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`problem_id`) REFERENCES `problems`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `friend_invites` (
	`id` text PRIMARY KEY NOT NULL,
	`sender_id` text NOT NULL,
	`token` text NOT NULL,
	`expires_at` integer,
	`used` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `friend_invites_token_unique` ON `friend_invites` (`token`);--> statement-breakpoint
CREATE TABLE `friendships` (
	`id` text PRIMARY KEY NOT NULL,
	`user_a` text NOT NULL,
	`user_b` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`user_a`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_b`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `group_members` (
	`group_id` text NOT NULL,
	`user_id` text NOT NULL,
	`joined_at` integer,
	PRIMARY KEY(`group_id`, `user_id`),
	FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `groups` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`creator_id` text NOT NULL,
	`weekly_goal` integer DEFAULT 20 NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`creator_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `problem_notes` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`problem_id` text NOT NULL,
	`content` text,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`problem_id`) REFERENCES `problems`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `problem_notes_user_problem_idx` ON `problem_notes` (`user_id`,`problem_id`);--> statement-breakpoint
CREATE TABLE `problems` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`topic` text NOT NULL,
	`subtopic` text,
	`difficulty` text,
	`platform` text,
	`platform_link` text,
	`estimated_minutes` integer,
	`sheet` text,
	`problem_number` integer,
	`tags` text
);
--> statement-breakpoint
CREATE TABLE `revision_schedule` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`problem_id` text NOT NULL,
	`due_date` integer,
	`completed` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`problem_id`) REFERENCES `problems`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `solve_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`problem_id` text NOT NULL,
	`started_at` integer,
	`ended_at` integer,
	`duration_seconds` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`problem_id`) REFERENCES `problems`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user_progress` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`problem_id` text NOT NULL,
	`status` text DEFAULT 'unseen' NOT NULL,
	`confidence` integer,
	`attempts` integer DEFAULT 0 NOT NULL,
	`first_solved_at` integer,
	`last_solved_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`problem_id`) REFERENCES `problems`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_progress_user_problem_idx` ON `user_progress` (`user_id`,`problem_id`);--> statement-breakpoint
CREATE TABLE `user_ratings` (
	`user_id` text PRIMARY KEY NOT NULL,
	`rating` integer DEFAULT 1200 NOT NULL,
	`battles_won` integer DEFAULT 0 NOT NULL,
	`battles_lost` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`username` text NOT NULL,
	`avatar_url` text,
	`created_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);
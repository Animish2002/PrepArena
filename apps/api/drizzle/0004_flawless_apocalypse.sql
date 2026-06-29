CREATE TABLE `mcq_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`problem_id` text NOT NULL,
	`selected_index` integer NOT NULL,
	`is_correct` integer NOT NULL,
	`attempted_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`problem_id`) REFERENCES `problems`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `problems` ADD `question_type` text DEFAULT 'coding';--> statement-breakpoint
ALTER TABLE `problems` ADD `subject` text DEFAULT 'dsa';--> statement-breakpoint
ALTER TABLE `problems` ADD `content` text;--> statement-breakpoint
ALTER TABLE `problems` ADD `content_source` text;
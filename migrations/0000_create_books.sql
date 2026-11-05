CREATE TABLE `books` (
	`id` text PRIMARY KEY NOT NULL,
	`google_books_id` text NOT NULL,
	`title` text NOT NULL,
	`authors` text DEFAULT '' NOT NULL,
	`thumbnail_url` text,
	`read_date` text NOT NULL,
	`memo` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `books_google_books_id_unique` ON `books` (`google_books_id`);
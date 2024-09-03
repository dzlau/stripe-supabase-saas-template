CREATE TABLE IF NOT EXISTS "users_table" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"plan" text NOT NULL,
	CONSTRAINT "users_table_email_unique" UNIQUE("email")
);

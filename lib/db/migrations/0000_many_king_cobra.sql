CREATE TABLE "fgi_hourly" (
	"ts_utc" timestamp with time zone PRIMARY KEY NOT NULL,
	"score" smallint NOT NULL,
	"label" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "indicator_data" (
	"id" serial PRIMARY KEY NOT NULL,
	"indicator_id" text NOT NULL,
	"ts_utc" timestamp with time zone NOT NULL,
	"value" numeric NOT NULL,
	"label" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "indicator_views" (
	"id" serial PRIMARY KEY NOT NULL,
	"indicator_id" text NOT NULL,
	"viewed_at" timestamp with time zone DEFAULT now(),
	"user_agent" text,
	"ip_hash" text
);
--> statement-breakpoint
CREATE TABLE "indicators" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"source" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "indicator_data" ADD CONSTRAINT "indicator_data_indicator_id_indicators_id_fk" FOREIGN KEY ("indicator_id") REFERENCES "public"."indicators"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "indicator_views" ADD CONSTRAINT "indicator_views_indicator_id_indicators_id_fk" FOREIGN KEY ("indicator_id") REFERENCES "public"."indicators"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "indicator_data_unique_idx" ON "indicator_data" USING btree ("indicator_id","ts_utc");--> statement-breakpoint
CREATE INDEX "indicator_data_indicator_idx" ON "indicator_data" USING btree ("indicator_id");--> statement-breakpoint
CREATE INDEX "indicator_data_time_idx" ON "indicator_data" USING btree ("ts_utc");--> statement-breakpoint
CREATE INDEX "indicator_views_indicator_idx" ON "indicator_views" USING btree ("indicator_id");--> statement-breakpoint
CREATE INDEX "indicator_views_time_idx" ON "indicator_views" USING btree ("viewed_at");
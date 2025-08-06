DROP INDEX "indicator_data_unique_idx";--> statement-breakpoint
ALTER TABLE "indicator_data" ADD CONSTRAINT "indicator_data_unique_constraint" UNIQUE("indicator_id","ts_utc");
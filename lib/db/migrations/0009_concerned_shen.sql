ALTER TABLE "indicator_views" ADD COLUMN "session_id" text;--> statement-breakpoint
ALTER TABLE "indicator_views" ADD CONSTRAINT "indicator_views_session_id_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."session"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "indicator_views_session_idx" ON "indicator_views" USING btree ("session_id");
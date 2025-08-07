ALTER TABLE "indicator_views" DROP CONSTRAINT "indicator_views_session_id_session_id_fk";
--> statement-breakpoint
ALTER TABLE "indicator_views" ADD CONSTRAINT "indicator_views_session_id_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."session"("id") ON DELETE set null ON UPDATE no action;
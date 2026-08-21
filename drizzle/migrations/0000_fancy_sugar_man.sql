CREATE TYPE "public"."issue_category" AS ENUM('plumbing', 'electrical', 'cleaning');--> statement-breakpoint
CREATE TYPE "public"."issue_severity" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."verification_result_enum" AS ENUM('PASS', 'FAIL', 'INCONCLUSIVE');--> statement-breakpoint
CREATE TYPE "public"."work_order_status" AS ENUM('REPORTED', 'ANALYZING', 'PENDING_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'PENDING_VERIFICATION', 'VERIFIED', 'REOPENED', 'ESCALATED', 'CLOSED');--> statement-breakpoint
CREATE TABLE "evaluation_cases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"category" "issue_category",
	"description" text,
	"expected_category" "issue_category" NOT NULL,
	"expected_severity" "issue_severity" NOT NULL,
	"expected_verification_result" "verification_result_enum" DEFAULT 'PASS' NOT NULL,
	"is_adversarial" boolean DEFAULT false NOT NULL,
	"input_image_url" text,
	"input_text" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"last_run_result" jsonb,
	"passed" boolean,
	"ran_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "issues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"location" text NOT NULL,
	"before_image_url" text NOT NULL,
	"voice_note_url" text,
	"ai_category" "issue_category",
	"ai_problem" text,
	"ai_severity" "issue_severity",
	"ai_confidence" real,
	"ai_reasoning" text,
	"ai_model" text,
	"ai_model_version" text,
	"ai_prompt_version" text,
	"ai_latency_ms" integer,
	"is_human_corrected" boolean DEFAULT false NOT NULL,
	"human_corrected_category" "issue_category",
	"status" "work_order_status" DEFAULT 'REPORTED' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "technicians" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"category" "issue_category" NOT NULL,
	"is_available" boolean DEFAULT true NOT NULL,
	"phone" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"role" text DEFAULT 'supervisor' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"work_order_id" uuid NOT NULL,
	"issue_id" uuid NOT NULL,
	"before_image_url" text,
	"after_image_url" text,
	"result" "verification_result_enum" NOT NULL,
	"confidence" real NOT NULL,
	"reasoning" text NOT NULL,
	"model" text,
	"model_version" text,
	"latency_ms" integer,
	"detected_issues" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "work_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"issue_id" uuid NOT NULL,
	"technician_id" uuid,
	"category" "issue_category" NOT NULL,
	"problem" text NOT NULL,
	"severity" "issue_severity" NOT NULL,
	"location" text NOT NULL,
	"description" text NOT NULL,
	"status" "work_order_status" DEFAULT 'ASSIGNED' NOT NULL,
	"agent_logs" jsonb DEFAULT '[]'::jsonb,
	"after_image_url" text,
	"technician_notes" text,
	"assigned_at" timestamp with time zone,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "verification_results" ADD CONSTRAINT "verification_results_work_order_id_work_orders_id_fk" FOREIGN KEY ("work_order_id") REFERENCES "public"."work_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_results" ADD CONSTRAINT "verification_results_issue_id_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "public"."issues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_issue_id_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "public"."issues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_technician_id_technicians_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."technicians"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "issue_status_idx" ON "issues" USING btree ("status");--> statement-breakpoint
CREATE INDEX "issue_category_idx" ON "issues" USING btree ("ai_category");--> statement-breakpoint
CREATE INDEX "tech_category_idx" ON "technicians" USING btree ("category");--> statement-breakpoint
CREATE INDEX "tech_available_idx" ON "technicians" USING btree ("is_available");--> statement-breakpoint
CREATE INDEX "vr_work_order_idx" ON "verification_results" USING btree ("work_order_id");--> statement-breakpoint
CREATE INDEX "vr_issue_idx" ON "verification_results" USING btree ("issue_id");--> statement-breakpoint
CREATE INDEX "wo_issue_idx" ON "work_orders" USING btree ("issue_id");--> statement-breakpoint
CREATE INDEX "wo_tech_idx" ON "work_orders" USING btree ("technician_id");--> statement-breakpoint
CREATE INDEX "wo_status_idx" ON "work_orders" USING btree ("status");
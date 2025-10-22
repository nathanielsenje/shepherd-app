-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN_STAFF', 'PASTORAL_STAFF', 'MINISTRY_LEADER', 'READ_ONLY');

-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('NEWCOMER', 'VISITOR', 'REGULAR_ATTENDER', 'MEMBER', 'INACTIVE');

-- CreateEnum
CREATE TYPE "RelationshipType" AS ENUM ('SPOUSE', 'PARENT', 'CHILD', 'SIBLING', 'GUARDIAN', 'OTHER');

-- CreateEnum
CREATE TYPE "CustodyIndicator" AS ENUM ('PRIMARY', 'SECONDARY', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "MilestoneType" AS ENUM ('FIRST_VISIT', 'GROWTH_TRACK', 'COVENANT_PARTNER', 'SMALL_GROUP', 'SERVING_TEAM', 'REGULAR_GIVING');

-- CreateEnum
CREATE TYPE "MilestoneStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'NOT_APPLICABLE', 'DECLINED');

-- CreateEnum
CREATE TYPE "AgeCategory" AS ENUM ('NURSERY', 'PRESCHOOL', 'PRIMARY', 'PRETEEN', 'YOUTH');

-- CreateEnum
CREATE TYPE "GroupType" AS ENUM ('GEOGRAPHIC', 'AFFINITY', 'LIFE_STAGE', 'OTHER');

-- CreateEnum
CREATE TYPE "GroupRole" AS ENUM ('MEMBER', 'LEADER', 'CO_LEADER', 'HOST');

-- CreateEnum
CREATE TYPE "MinistryCategory" AS ENUM ('YOUNG_ADULTS', 'MENS', 'WOMENS', 'SENIORS', 'MARRIAGE', 'SINGLE_PARENTS', 'RECOVERY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ParticipantRole" AS ENUM ('PARTICIPANT', 'LEADER', 'COORDINATOR');

-- CreateEnum
CREATE TYPE "BackgroundCheckStatus" AS ENUM ('PENDING', 'CLEARED', 'EXPIRED', 'NOT_REQUIRED');

-- CreateEnum
CREATE TYPE "Rotation" AS ENUM ('WEEKLY', 'MONTHLY', 'QUARTERLY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "NoteType" AS ENUM ('ADMINISTRATIVE', 'PASTORAL', 'FOLLOWUP');

-- CreateEnum
CREATE TYPE "PrivacyLevel" AS ENUM ('ADMIN_VISIBLE', 'PASTORAL_ONLY', 'RESTRICTED', 'PRIVATE', 'COORDINATOR_VISIBLE');

-- CreateEnum
CREATE TYPE "PartnershipStatus" AS ENUM ('NOT_APPLICABLE', 'CONSIDERING', 'ACTIVE', 'DECLINED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "MentorshipProgramType" AS ENUM ('NEW_BELIEVER', 'LEADERSHIP', 'MINISTRY_SPECIFIC', 'MARRIAGE', 'LIFE_TRANSITION');

-- CreateEnum
CREATE TYPE "MentorshipStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'PAUSED', 'DISCONTINUED');

-- CreateEnum
CREATE TYPE "ConsentType" AS ENUM ('DATA_STORAGE', 'COMMUNICATION', 'PHOTO', 'DIRECTORY');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "mfa_enabled" BOOLEAN NOT NULL DEFAULT false,
    "mfa_secret" TEXT,
    "last_login" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "households" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "primary_address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip_code" TEXT,
    "household_phone" TEXT,
    "communication_preferences" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "households_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "members" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "preferred_name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "date_of_birth" TEXT,
    "gender" TEXT,
    "status" "MemberStatus" NOT NULL DEFAULT 'NEWCOMER',
    "household_id" TEXT,
    "first_visit_date" TIMESTAMP(3),
    "is_child" BOOLEAN NOT NULL DEFAULT false,
    "privacy_flags" JSONB,
    "consent_data_storage" BOOLEAN NOT NULL DEFAULT false,
    "consent_communication" BOOLEAN NOT NULL DEFAULT false,
    "consent_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "family_relationships" (
    "id" TEXT NOT NULL,
    "member_id_1" TEXT NOT NULL,
    "member_id_2" TEXT NOT NULL,
    "relationship_type" "RelationshipType" NOT NULL,
    "custody_indicator" "CustodyIndicator",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "family_relationships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_milestones" (
    "id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "milestone_type" "MilestoneType" NOT NULL,
    "achieved_date" TIMESTAMP(3),
    "status" "MilestoneStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "children_safety_data" (
    "id" TEXT NOT NULL,
    "child_member_id" TEXT NOT NULL,
    "medical_alerts" TEXT,
    "allergies" TEXT,
    "special_needs" TEXT,
    "emergency_contact_info" JSONB,
    "age_category" "AgeCategory" NOT NULL,
    "requires_two_person_access" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "children_safety_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "authorized_pickup_persons" (
    "id" TEXT NOT NULL,
    "child_member_id" TEXT NOT NULL,
    "authorized_person_name" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "photo_id_verified" BOOLEAN NOT NULL DEFAULT false,
    "photo_id_expiration" TIMESTAMP(3),
    "phone_number" TEXT,
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "authorized_pickup_persons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "connect_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "group_type" "GroupType" NOT NULL,
    "meeting_schedule" TEXT,
    "meeting_location" TEXT,
    "capacity" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "leader_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "connect_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_members" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "role" "GroupRole" NOT NULL DEFAULT 'MEMBER',
    "join_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "attendance_tracking" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "group_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "serving_teams" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ministry_area" TEXT NOT NULL,
    "description" TEXT,
    "requirements" TEXT,
    "leader_id" TEXT,
    "schedule" TEXT,
    "time_commitment" TEXT,
    "requires_background_check" BOOLEAN NOT NULL DEFAULT false,
    "skills_needed" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "serving_teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "role_position" TEXT,
    "join_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "onboarding_completed" BOOLEAN NOT NULL DEFAULT false,
    "rotation" "Rotation",
    "training_status" JSONB,
    "background_check_status" "BackgroundCheckStatus" NOT NULL DEFAULT 'NOT_REQUIRED',
    "background_check_date" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "service_hours" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ministry_programs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "MinistryCategory" NOT NULL,
    "description" TEXT,
    "age_range_min" INTEGER,
    "age_range_max" INTEGER,
    "leader_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ministry_programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ministry_participants" (
    "id" TEXT NOT NULL,
    "ministry_id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "join_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" "ParticipantRole" NOT NULL DEFAULT 'PARTICIPANT',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ministry_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "covenant_partnerships" (
    "id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "status" "PartnershipStatus" NOT NULL DEFAULT 'NOT_APPLICABLE',
    "signature_date" TIMESTAMP(3),
    "witness_name" TEXT,
    "commitment_areas" JSONB,
    "renewal_date" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "covenant_partnerships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mentorship_programs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "program_type" "MentorshipProgramType" NOT NULL,
    "description" TEXT,
    "coordinator_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mentorship_programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mentorship_relationships" (
    "id" TEXT NOT NULL,
    "program_id" TEXT NOT NULL,
    "mentor_id" TEXT NOT NULL,
    "mentee_id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expected_end_date" TIMESTAMP(3),
    "status" "MentorshipStatus" NOT NULL DEFAULT 'ACTIVE',
    "check_in_milestones" JSONB,
    "privacy_level" "PrivacyLevel" NOT NULL DEFAULT 'COORDINATOR_VISIBLE',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mentorship_relationships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_notes" (
    "id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "note_text" TEXT NOT NULL,
    "note_type" "NoteType" NOT NULL,
    "privacy_level" "PrivacyLevel" NOT NULL DEFAULT 'ADMIN_VISIBLE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resource_type" TEXT NOT NULL,
    "resource_id" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "details" JSONB,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_skills" (
    "id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "skill_name" TEXT NOT NULL,
    "proficiency_level" TEXT NOT NULL,
    "available_to_serve" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_consents" (
    "id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "consent_type" "ConsentType" NOT NULL,
    "granted" BOOLEAN NOT NULL DEFAULT false,
    "granted_date" TIMESTAMP(3),
    "revoked_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "data_consents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "members_email_key" ON "members"("email");

-- CreateIndex
CREATE UNIQUE INDEX "children_safety_data_child_member_id_key" ON "children_safety_data"("child_member_id");

-- CreateIndex
CREATE UNIQUE INDEX "covenant_partnerships_member_id_key" ON "covenant_partnerships"("member_id");

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "households"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_relationships" ADD CONSTRAINT "family_relationships_member_id_1_fkey" FOREIGN KEY ("member_id_1") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_relationships" ADD CONSTRAINT "family_relationships_member_id_2_fkey" FOREIGN KEY ("member_id_2") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_milestones" ADD CONSTRAINT "member_milestones_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "children_safety_data" ADD CONSTRAINT "children_safety_data_child_member_id_fkey" FOREIGN KEY ("child_member_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "authorized_pickup_persons" ADD CONSTRAINT "authorized_pickup_persons_child_member_id_fkey" FOREIGN KEY ("child_member_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connect_groups" ADD CONSTRAINT "connect_groups_leader_id_fkey" FOREIGN KEY ("leader_id") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "connect_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "serving_teams" ADD CONSTRAINT "serving_teams_leader_id_fkey" FOREIGN KEY ("leader_id") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "serving_teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ministry_programs" ADD CONSTRAINT "ministry_programs_leader_id_fkey" FOREIGN KEY ("leader_id") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ministry_participants" ADD CONSTRAINT "ministry_participants_ministry_id_fkey" FOREIGN KEY ("ministry_id") REFERENCES "ministry_programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ministry_participants" ADD CONSTRAINT "ministry_participants_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "covenant_partnerships" ADD CONSTRAINT "covenant_partnerships_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentorship_relationships" ADD CONSTRAINT "mentorship_relationships_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "mentorship_programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentorship_relationships" ADD CONSTRAINT "mentorship_relationships_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentorship_relationships" ADD CONSTRAINT "mentorship_relationships_mentee_id_fkey" FOREIGN KEY ("mentee_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_notes" ADD CONSTRAINT "member_notes_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_notes" ADD CONSTRAINT "member_notes_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_skills" ADD CONSTRAINT "member_skills_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_consents" ADD CONSTRAINT "data_consents_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

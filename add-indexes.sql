-- ============================================================
--  AdmissionX — MySQL Index Optimization
--  Run this in phpMyAdmin → admissionx database → SQL tab
--  Safe to run multiple times (uses IF NOT EXISTS)
-- ============================================================

-- ── collegeprofile ────────────────────────────────────────────
-- isShowOnTop: main WHERE filter on top-colleges page
ALTER TABLE `collegeprofile`
  ADD INDEX IF NOT EXISTS `idx_cp_isShowOnTop` (`isShowOnTop`);

-- isShowOnHome: main WHERE filter on homepage colleges section
ALTER TABLE `collegeprofile`
  ADD INDEX IF NOT EXISTS `idx_cp_isShowOnHome` (`isShowOnHome`);

-- users_id: LEFT JOIN with users table to get college name
ALTER TABLE `collegeprofile`
  ADD INDEX IF NOT EXISTS `idx_cp_users_id` (`users_id`);

-- registeredAddressCityId: city filter + JOIN with city table
ALTER TABLE `collegeprofile`
  ADD INDEX IF NOT EXISTS `idx_cp_city` (`registeredAddressCityId`);

-- slug: college detail page lookup (e.g. /college/iit-delhi)
ALTER TABLE `collegeprofile`
  ADD INDEX IF NOT EXISTS `idx_cp_slug` (`slug`(191));

-- rating: ORDER BY rating DESC (default sort)
ALTER TABLE `collegeprofile`
  ADD INDEX IF NOT EXISTS `idx_cp_rating` (`rating`);

-- ranking: ORDER BY ranking ASC
ALTER TABLE `collegeprofile`
  ADD INDEX IF NOT EXISTS `idx_cp_ranking` (`ranking`);

-- created_at: ORDER BY newest
ALTER TABLE `collegeprofile`
  ADD INDEX IF NOT EXISTS `idx_cp_created_at` (`created_at`);

-- Composite: covers the most common query pattern (filter + sort)
ALTER TABLE `collegeprofile`
  ADD INDEX IF NOT EXISTS `idx_cp_top_rating` (`isShowOnTop`, `rating`);

ALTER TABLE `collegeprofile`
  ADD INDEX IF NOT EXISTS `idx_cp_home_rating` (`isShowOnHome`, `rating`);

-- Covering composite: lets the /top-colleges cities filter read city IDs
-- directly from the index (isShowOnTop → registeredAddressCityId) without
-- a full row fetch or temp-file sort.  Fixes the DISTINCT query that was
-- timing out when MySQL's tmpdir ran out of disk space.
ALTER TABLE `collegeprofile`
  ADD INDEX IF NOT EXISTS `idx_cp_showontop_city` (`isShowOnTop`, `registeredAddressCityId`);

-- Covering composite: same fix for the /top-university cities filter.
ALTER TABLE `collegeprofile`
  ADD INDEX IF NOT EXISTS `idx_cp_topuniv_city` (`isTopUniversity`, `registeredAddressCityId`);

-- ── collegemaster ─────────────────────────────────────────────
-- collegeprofile_id: primary JOIN key from collegeprofile
ALTER TABLE `collegemaster`
  ADD INDEX IF NOT EXISTS `idx_cm_collegeprofile_id` (`collegeprofile_id`);

-- functionalarea_id: JOIN with functionalarea (streams)
ALTER TABLE `collegemaster`
  ADD INDEX IF NOT EXISTS `idx_cm_functionalarea_id` (`functionalarea_id`);

-- degree_id: JOIN with degree table
ALTER TABLE `collegemaster`
  ADD INDEX IF NOT EXISTS `idx_cm_degree_id` (`degree_id`);

-- fees: fees filter and ORDER BY fees
ALTER TABLE `collegemaster`
  ADD INDEX IF NOT EXISTS `idx_cm_fees` (`fees`);

-- Composite: covers stream-filtered college lookups in one index
ALTER TABLE `collegemaster`
  ADD INDEX IF NOT EXISTS `idx_cm_profile_fa` (`collegeprofile_id`, `functionalarea_id`);

-- Composite: covers degree-filtered college lookups
ALTER TABLE `collegemaster`
  ADD INDEX IF NOT EXISTS `idx_cm_profile_degree` (`collegeprofile_id`, `degree_id`);

-- ── functionalarea ────────────────────────────────────────────
-- pageslug: stream filter by slug (e.g. ?stream=engineering)
ALTER TABLE `functionalarea`
  ADD INDEX IF NOT EXISTS `idx_fa_pageslug` (`pageslug`(191));

-- name: stream name lookups and GROUP BY
ALTER TABLE `functionalarea`
  ADD INDEX IF NOT EXISTS `idx_fa_name` (`name`(191));

-- ── degree ────────────────────────────────────────────────────
-- pageslug: degree filter by slug
ALTER TABLE `degree`
  ADD INDEX IF NOT EXISTS `idx_deg_pageslug` (`pageslug`(191));

-- isShowOnTop: degree list filter for top-colleges sidebar
ALTER TABLE `degree`
  ADD INDEX IF NOT EXISTS `idx_deg_isShowOnTop` (`isShowOnTop`);

-- name: degree name lookups
ALTER TABLE `degree`
  ADD INDEX IF NOT EXISTS `idx_deg_name` (`name`(191));

-- ── city ──────────────────────────────────────────────────────
-- state_id: state filter JOIN
ALTER TABLE `city`
  ADD INDEX IF NOT EXISTS `idx_city_state_id` (`state_id`);

-- name: city name ORDER BY and search
ALTER TABLE `city`
  ADD INDEX IF NOT EXISTS `idx_city_name` (`name`(191));

-- ── country ───────────────────────────────────────────────────
-- name: country name ORDER BY in filters API
ALTER TABLE `country`
  ADD INDEX IF NOT EXISTS `idx_country_name` (`name`(191));

-- ── users (old PHP system — college profile names) ────────────
ALTER TABLE `users`
  ADD INDEX IF NOT EXISTS `idx_users_id` (`id`);

ALTER TABLE `users`
  ADD INDEX IF NOT EXISTS `idx_users_firstname` (`firstname`(191));

-- ── examination_details ───────────────────────────────────────
-- slug: exam detail page lookup
ALTER TABLE `examination_details`
  ADD INDEX IF NOT EXISTS `idx_exam_slug` (`slug`(191));

-- totalViews: ORDER BY most viewed exams
ALTER TABLE `examination_details`
  ADD INDEX IF NOT EXISTS `idx_exam_totalViews` (`totalViews`);

-- functionalarea_id: stream filter on exams
ALTER TABLE `examination_details`
  ADD INDEX IF NOT EXISTS `idx_exam_fa_id` (`functionalarea_id`);

-- created_at: ORDER BY newest exams
ALTER TABLE `examination_details`
  ADD INDEX IF NOT EXISTS `idx_exam_created_at` (`created_at`);

-- ── blogs ─────────────────────────────────────────────────────
-- isactive: filter for active blogs
ALTER TABLE `blogs`
  ADD INDEX IF NOT EXISTS `idx_blogs_isactive` (`isactive`);

-- slug: blog detail page lookup
ALTER TABLE `blogs`
  ADD INDEX IF NOT EXISTS `idx_blogs_slug` (`slug`(191));

-- created_at: ORDER BY newest blogs
ALTER TABLE `blogs`
  ADD INDEX IF NOT EXISTS `idx_blogs_created_at` (`created_at`);

-- Composite: active + newest (homepage and listing query)
ALTER TABLE `blogs`
  ADD INDEX IF NOT EXISTS `idx_blogs_active_created` (`isactive`, `created_at`);

-- ── news ──────────────────────────────────────────────────────
ALTER TABLE `news`
  ADD INDEX IF NOT EXISTS `idx_news_slug` (`slug`(191));

ALTER TABLE `news`
  ADD INDEX IF NOT EXISTS `idx_news_created_at` (`created_at`);

-- ── course ────────────────────────────────────────────────────
ALTER TABLE `course`
  ADD INDEX IF NOT EXISTS `idx_course_name` (`name`(191));

ALTER TABLE `course`
  ADD INDEX IF NOT EXISTS `idx_course_isShowOnTop` (`isShowOnTop`);

ALTER TABLE `course`
  ADD INDEX IF NOT EXISTS `idx_course_isShowOnHome` (`isShowOnHome`);

-- ── next_student_signups (Next.js auth table) ─────────────────
ALTER TABLE `next_student_signups`
  ADD INDEX IF NOT EXISTS `idx_student_email` (`email`);

-- ── next_admin_users (Next.js auth table) ────────────────────
ALTER TABLE `next_admin_users`
  ADD INDEX IF NOT EXISTS `idx_admin_email` (`email`);

-- ── college_reviews ───────────────────────────────────────────
ALTER TABLE `college_reviews`
  ADD INDEX IF NOT EXISTS `idx_reviews_college_id` (`collegeprofile_id`);

-- ── gallery ───────────────────────────────────────────────────
ALTER TABLE `gallery`
  ADD INDEX IF NOT EXISTS `idx_gallery_college_id` (`collegeprofile_id`);

-- ── placement ─────────────────────────────────────────────────
ALTER TABLE `placement`
  ADD INDEX IF NOT EXISTS `idx_placement_college_id` (`collegeprofile_id`);

-- ── faculty ───────────────────────────────────────────────────
ALTER TABLE `faculty`
  ADD INDEX IF NOT EXISTS `idx_faculty_college_id` (`collegeprofile_id`);

-- ── college_faqs ──────────────────────────────────────────────
ALTER TABLE `college_faqs`
  ADD INDEX IF NOT EXISTS `idx_faqs_college_id` (`collegeprofile_id`);

-- ── college_scholarships ──────────────────────────────────────
ALTER TABLE `college_scholarships`
  ADD INDEX IF NOT EXISTS `idx_scholarships_college_id` (`collegeprofile_id`);

-- ── bookmarks ─────────────────────────────────────────────────
ALTER TABLE `bookmarks`
  ADD INDEX IF NOT EXISTS `idx_bookmarks_user` (`users_id`);

-- ── application ───────────────────────────────────────────────
ALTER TABLE `application`
  ADD INDEX IF NOT EXISTS `idx_app_student` (`student_id`);

ALTER TABLE `application`
  ADD INDEX IF NOT EXISTS `idx_app_college` (`college_id`);

ALTER TABLE `application`
  ADD INDEX IF NOT EXISTS `idx_app_status` (`status`);

-- ============================================================
--  Done! Run SHOW INDEX FROM collegeprofile; to verify.
--
--  PRIORITY INDEXES (run these first after freeing disk space on the
--  MySQL tmpdir drive — they eliminate the temp-file DISTINCT sorts that
--  were causing /top-colleges and /top-university to time out):
--    idx_cp_showontop_city  (isShowOnTop, registeredAddressCityId)
--    idx_cp_topuniv_city    (isTopUniversity, registeredAddressCityId)
-- ============================================================
SELECT 'Indexes applied successfully!' AS result;

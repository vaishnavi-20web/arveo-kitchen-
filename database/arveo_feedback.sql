-- =========================================================
-- ARVEO Feedback — Database Setup Script
-- =========================================================
-- Run this script in MySQL (CLI, Workbench, or phpMyAdmin) to
-- create the database and the `feedbacks` table used by the
-- backend API.
-- =========================================================

-- 1. Create the database
CREATE DATABASE IF NOT EXISTS arveo_feedback
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE arveo_feedback;

-- 2. Create the feedbacks table
DROP TABLE IF EXISTS feedbacks;

CREATE TABLE feedbacks (
  id                 INT AUTO_INCREMENT PRIMARY KEY,

  -- Customer information
  full_name          VARCHAR(150)      NOT NULL,
  phone              VARCHAR(10)       NOT NULL,
  email              VARCHAR(150)      NOT NULL,

  -- Overall experience
  overall_rating     TINYINT UNSIGNED  NOT NULL,

  -- Detailed category ratings (1-5 stars each)
  food_quality       TINYINT UNSIGNED  DEFAULT 0,
  taste              TINYINT UNSIGNED  DEFAULT 0,
  service            TINYINT UNSIGNED  DEFAULT 0,
  staff_behaviour    TINYINT UNSIGNED  DEFAULT 0,
  cleanliness        TINYINT UNSIGNED  DEFAULT 0,
  ambience           TINYINT UNSIGNED  DEFAULT 0,
  waiting_time       TINYINT UNSIGNED  DEFAULT 0,
  value_for_money    TINYINT UNSIGNED  DEFAULT 0,

  -- Quick mood reaction (happy / neutral / sad)
  emoji_reaction     VARCHAR(20)       DEFAULT NULL,

  -- Yes/Maybe/No style responses
  visit_again        VARCHAR(10)       NOT NULL,
  recommend          VARCHAR(15)       NOT NULL,

  -- Multi-select menu items tried, stored as JSON array text
  menu_items         JSON              DEFAULT NULL,

  -- Free-text feedback
  experience         TEXT              DEFAULT NULL,
  suggestions        TEXT              DEFAULT NULL,

  created_at         TIMESTAMP         DEFAULT CURRENT_TIMESTAMP
);

-- 3. (Optional) Sample data for testing the API without the frontend
INSERT INTO feedbacks (
  full_name, phone, email, overall_rating,
  food_quality, taste, service, staff_behaviour,
  cleanliness, ambience, waiting_time, value_for_money,
  emoji_reaction, visit_again, recommend, menu_items,
  experience, suggestions
) VALUES
(
  'Ananya Rao', '9876543210', 'ananya.rao@example.com', 5,
  5, 5, 4, 5,
  5, 4, 3, 4,
  'happy', 'Yes', 'Definitely', JSON_ARRAY('Starters', 'Main Course', 'Desserts'),
  'Wonderful evening, the staff were attentive and the ambience was lovely.',
  'Maybe add a few more vegetarian dessert options.'
),
(
  'Rahul Mehta', '9123456780', 'rahul.mehta@example.com', 3,
  3, 3, 2, 3,
  4, 3, 2, 3,
  'neutral', 'Maybe', 'Maybe', JSON_ARRAY('Main Course', 'Beverages'),
  'Food was decent but the wait time was longer than expected.',
  'Please improve service speed during peak hours.'
);

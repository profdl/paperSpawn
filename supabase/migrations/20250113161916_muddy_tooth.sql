/*
  # Create property presets table

  1. New Tables
    - `property_presets`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `property_values` (jsonb, not null)
      - `user_id` (uuid, not null, references auth.users)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `property_presets` table
    - Add policies for authenticated users to:
      - Read their own presets
      - Create new presets
      - Update their own presets
*/

CREATE TABLE IF NOT EXISTS property_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  property_values jsonb NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE property_presets ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own presets
CREATE POLICY "Users can read own presets"
  ON property_presets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to create new presets
CREATE POLICY "Users can create presets"
  ON property_presets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own presets
CREATE POLICY "Users can update own presets"
  ON property_presets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
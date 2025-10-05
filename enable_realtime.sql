-- Enable Realtime for symptoms and entries tables
-- Run this in Supabase SQL Editor

-- Enable realtime for symptoms table
ALTER PUBLICATION supabase_realtime ADD TABLE symptoms;

-- Enable realtime for entries table
ALTER PUBLICATION supabase_realtime ADD TABLE entries;

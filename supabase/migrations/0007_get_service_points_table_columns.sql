SELECT 
  c.column_name, 
  c.data_type, 
  c.is_nullable,
  c.column_default
FROM information_schema.columns c
WHERE c.table_schema = 'public' 
  AND c.table_name = 'service_points'
ORDER BY c.ordinal_position;
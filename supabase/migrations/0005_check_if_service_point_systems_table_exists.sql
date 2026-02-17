SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name IN ('service_points', 'service_point_systems')
ORDER BY table_name, ordinal_position;
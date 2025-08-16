-- Check current migration status
SELECT * FROM migrations ORDER BY id DESC;

-- Since the database already has some tables, let's mark the old migrations as completed
-- and only run the new ones for Brazilian foods and health features

-- First, let's check what tables already exist
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Mark the migrations that have already been partially applied
INSERT INTO migrations (timestamp, name) VALUES 
(1735938000000, 'CreateGeneratedPromptTable1735938000000'),
(1735960000000, 'ChangeCaloriasDiariasToInteger1735960000000'),
(1751587400000, 'DropUnusedTables1751587400000'),
(1751587500000, 'RenameGeneratedPromptToDiet1751587500000'),
(1751650000000, 'AddPasswordResetFields1751650000000'),
(1751700000000, 'AddCpfToUserData1751700000000'),
(1751700100000, 'AddRegenerationCountToDiet1751700100000'),
(1751700200000, 'AddDietRegenerationFields1751700200000')
ON CONFLICT DO NOTHING;

-- Now the new migrations for Brazilian foods and health features can be run separately
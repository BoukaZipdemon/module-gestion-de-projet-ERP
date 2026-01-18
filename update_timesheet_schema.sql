-- Drop the existing constraint
ALTER TABLE public.timesheets DROP CONSTRAINT IF EXISTS timesheets_status_check;

-- Re-add the constraint with 'REJECTED' included
ALTER TABLE public.timesheets ADD CONSTRAINT timesheets_status_check 
CHECK (status IN ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'));

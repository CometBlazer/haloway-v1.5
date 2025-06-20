-- Add additional profile fields
alter table profiles 
add column if not exists full_name text,
add column if not exists grade text,
add column if not exists dream_school text,
add column if not exists referral_source text;

-- Set default value for unsubscribed field (false means subscribed to emails)
alter table profiles 
alter column unsubscribed set default false;

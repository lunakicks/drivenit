-- Function to update own profile display name
-- Bypasses RLS by using security definer, but strictly limits scope to own user ID
-- Returns debug info
create or replace function update_profile_display_name(new_display_name text)
returns jsonb
language plpgsql
security definer
as $$
declare
  result jsonb;
  rows_updated int;
begin
  update public.profiles
  set display_name = new_display_name
  where id = auth.uid();
  
  get diagnostics rows_updated = row_count;
  
  result := jsonb_build_object(
    'success', true,
    'rows_updated', rows_updated,
    'auth_uid', auth.uid(),
    'target_display_name', new_display_name
  );
  
  return result;
end;
$$;

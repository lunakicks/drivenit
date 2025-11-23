  -- Function to fetch random questions for Test Mode
  create or replace function public.get_random_questions(limit_count int)
  returns setof public.questions
  language sql
  as $$
    select * from public.questions
    order by random()
    limit limit_count;
  $$;

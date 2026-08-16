REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.weekly_leaderboard() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.weekly_leaderboard() TO authenticated;
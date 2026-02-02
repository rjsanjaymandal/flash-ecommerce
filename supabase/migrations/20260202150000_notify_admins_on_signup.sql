-- Trigger to notify admins when a new user profile is created

CREATE OR REPLACE FUNCTION public.notify_admins_on_new_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert notification for all admins
  -- We use a precise selection to avoid duplicate notifications and ensure target validity
  INSERT INTO public.notifications (user_id, title, message, type, action_url)
  SELECT 
    id,
    'New User Joined! 🚀',
    COALESCE(NEW.name, 'Someone') || ' (' || COALESCE(NEW.email, 'No Email') || ') just signed up.',
    'info',
    '/admin/customers/' || NEW.id
  FROM public.profiles
  WHERE role = 'admin';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing if any (cleanup)
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;

-- Create the trigger
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE PROCEDURE public.notify_admins_on_new_profile();

-- Create function to update vote count
CREATE OR REPLACE FUNCTION public.handle_new_vote()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.concepts
  SET vote_count = vote_count + 1
  WHERE id = NEW.concept_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.handle_remove_vote()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.concepts
  SET vote_count = vote_count - 1
  WHERE id = OLD.concept_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
DROP TRIGGER IF EXISTS on_vote_added ON public.concept_votes;
CREATE TRIGGER on_vote_added
  AFTER INSERT ON public.concept_votes
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_vote();

DROP TRIGGER IF EXISTS on_vote_removed ON public.concept_votes;
CREATE TRIGGER on_vote_removed
  AFTER DELETE ON public.concept_votes
  FOR EACH ROW EXECUTE FUNCTION public.handle_remove_vote();

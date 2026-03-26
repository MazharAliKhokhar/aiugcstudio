-- Atomic credit deduction: checks balance >= amount, deducts, returns new balance.
-- Returns -1 if insufficient credits (so caller can detect failure).
CREATE OR REPLACE FUNCTION public.deduct_credits(p_user_id uuid, p_amount integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_balance integer;
BEGIN
  UPDATE profiles
    SET credits = credits - p_amount,
        updated_at = now()
    WHERE id = p_user_id
      AND credits >= p_amount
    RETURNING credits INTO new_balance;

  -- If no row was updated, the user had insufficient credits
  IF NOT FOUND THEN
    RETURN -1;
  END IF;

  RETURN new_balance;
END;
$$;

-- Atomic credit increment: adds credits to a user, returns new balance.
CREATE OR REPLACE FUNCTION public.increment_credits(p_user_id uuid, p_amount integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_balance integer;
BEGIN
  UPDATE profiles
    SET credits = credits + p_amount,
        updated_at = now()
    WHERE id = p_user_id
    RETURNING credits INTO new_balance;

  IF NOT FOUND THEN
    RETURN -1;
  END IF;

  RETURN new_balance;
END;
$$;

-- 002_create_rpc_functions.sql
-- Creates atomic RPC functions for core payment operations

/*
  # Atomic Donation Processing Function

  1. Function: atomic_apply_donation
    - Validates user balance is sufficient
    - Deducts amount from user balance
    - Increments user total_donated counter
    - Creates transaction record with insights
    - Returns complete transaction details and updated balance

  2. Security
    - Function runs with invoker privileges (respects RLS when applied)
    - Atomic transaction ensures consistency
    - Returns detailed error messages for debugging

  3. Usage
    SELECT * FROM atomic_apply_donation(
      p_user_id := 'uuid-here',
      p_charity_id := 'uuid-here',
      p_amount := 25.00,
      p_note := 'Monthly donation',
      p_meta := '{"impactRate": 2, "impactMetric": "meals"}'::jsonb
    );
*/

CREATE OR REPLACE FUNCTION atomic_apply_donation(
  p_user_id uuid,
  p_charity_id uuid,
  p_amount numeric,
  p_note text DEFAULT NULL,
  p_meta jsonb DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_user_balance numeric;
  v_charity_name text;
  v_transaction_id uuid;
  v_transaction_record record;
  v_new_balance numeric;
  v_impact_rate numeric;
  v_impact_metric text;
  v_impact_units integer;
  v_insights jsonb;
BEGIN
  -- Validate amount
  IF p_amount <= 0 THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', 'invalid_amount',
      'message', 'Amount must be greater than 0'
    );
  END IF;

  -- Get user balance
  SELECT balance INTO v_user_balance
  FROM app_users
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', 'user_not_found',
      'message', 'User does not exist'
    );
  END IF;

  -- Check sufficient balance
  IF v_user_balance < p_amount THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', 'insufficient_balance',
      'message', 'Insufficient balance',
      'balance', v_user_balance,
      'required', p_amount
    );
  END IF;

  -- Get charity details
  IF p_charity_id IS NOT NULL THEN
    SELECT name, impact_rate, impact_metric
    INTO v_charity_name, v_impact_rate, v_impact_metric
    FROM charities
    WHERE id = p_charity_id;

    IF NOT FOUND THEN
      RETURN jsonb_build_object(
        'ok', false,
        'error', 'charity_not_found',
        'message', 'Charity does not exist'
      );
    END IF;
  ELSE
    v_charity_name := 'General Donation';
    v_impact_rate := NULL;
    v_impact_metric := NULL;
  END IF;

  -- Calculate impact for insights
  IF v_impact_rate IS NOT NULL AND v_impact_rate > 0 THEN
    v_impact_units := FLOOR(p_amount * v_impact_rate);
    v_insights := jsonb_build_array(
      jsonb_build_object(
        'message', format('Your $%s donation will provide approximately %s %s through %s. Thank you for your generosity!',
          p_amount::text,
          v_impact_units::text,
          COALESCE(v_impact_metric, 'units'),
          v_charity_name
        ),
        'meta', jsonb_build_object(
          'generated', true,
          'impactRate', v_impact_rate,
          'impactUnits', v_impact_units,
          'impactMetric', v_impact_metric
        )
      )
    );
  ELSE
    v_insights := jsonb_build_array(
      jsonb_build_object(
        'message', format('Thank you for your $%s donation to %s!', p_amount::text, v_charity_name),
        'meta', jsonb_build_object('generated', true)
      )
    );
  END IF;

  -- Merge provided meta with charity metadata
  IF p_meta IS NULL THEN
    p_meta := jsonb_build_object(
      'impactRate', v_impact_rate,
      'impactMetric', v_impact_metric
    );
  ELSE
    p_meta := p_meta || jsonb_build_object(
      'impactRate', COALESCE((p_meta->>'impactRate')::numeric, v_impact_rate),
      'impactMetric', COALESCE(p_meta->>'impactMetric', v_impact_metric)
    );
  END IF;

  -- Update user balance and total_donated atomically
  UPDATE app_users
  SET
    balance = balance - p_amount,
    total_donated = total_donated + p_amount,
    updated_at = now()
  WHERE id = p_user_id
  RETURNING balance INTO v_new_balance;

  -- Create transaction record
  INSERT INTO transactions (
    user_id,
    type,
    category,
    entity_id,
    entity_name,
    amount,
    direction,
    note,
    timestamp,
    meta,
    insights
  ) VALUES (
    p_user_id,
    'donation',
    'charity',
    p_charity_id::text,
    v_charity_name,
    p_amount,
    'outgoing',
    p_note,
    now(),
    p_meta,
    v_insights
  )
  RETURNING * INTO v_transaction_record;

  v_transaction_id := v_transaction_record.id;

  -- Return success with complete details
  RETURN jsonb_build_object(
    'ok', true,
    'tx', row_to_json(v_transaction_record),
    'balance', v_new_balance,
    'previous_balance', v_user_balance,
    'amount_donated', p_amount
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', 'transaction_failed',
      'message', SQLERRM,
      'detail', SQLSTATE
    );
END;
$$;

/*
  # Atomic Send Money Function

  1. Function: atomic_apply_send
    - Validates sender balance
    - Creates or finds recipient user
    - Deducts from sender, adds to recipient
    - Creates transaction records for both parties
    - Returns transaction details

  2. Security
    - Atomic transaction ensures both sides complete or rollback
    - Validates all inputs
*/

CREATE OR REPLACE FUNCTION atomic_apply_send(
  p_sender_id uuid,
  p_recipient_email text,
  p_recipient_name text,
  p_amount numeric,
  p_note text DEFAULT NULL,
  p_meta jsonb DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_sender_balance numeric;
  v_recipient_id uuid;
  v_sender_tx_id uuid;
  v_recipient_tx_id uuid;
  v_new_sender_balance numeric;
BEGIN
  -- Validate amount
  IF p_amount <= 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_amount');
  END IF;

  -- Get sender balance
  SELECT balance INTO v_sender_balance FROM app_users WHERE id = p_sender_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'sender_not_found');
  END IF;

  -- Check sufficient balance
  IF v_sender_balance < p_amount THEN
    RETURN jsonb_build_object('ok', false, 'error', 'insufficient_balance');
  END IF;

  -- Find or create recipient
  SELECT id INTO v_recipient_id FROM app_users WHERE email = p_recipient_email;

  IF NOT FOUND THEN
    INSERT INTO app_users (email, display_name, full_name, balance)
    VALUES (p_recipient_email, p_recipient_name, p_recipient_name, 0.00)
    RETURNING id INTO v_recipient_id;
  END IF;

  -- Update balances atomically
  UPDATE app_users SET balance = balance - p_amount, updated_at = now()
  WHERE id = p_sender_id
  RETURNING balance INTO v_new_sender_balance;

  UPDATE app_users SET balance = balance + p_amount, updated_at = now()
  WHERE id = v_recipient_id;

  -- Create sender transaction
  INSERT INTO transactions (user_id, type, category, entity_id, entity_name, amount, direction, note, meta)
  VALUES (p_sender_id, 'send', 'transfer', v_recipient_id::text, p_recipient_name, p_amount, 'outgoing', p_note, p_meta)
  RETURNING id INTO v_sender_tx_id;

  -- Create recipient transaction
  INSERT INTO transactions (user_id, type, category, entity_id, entity_name, amount, direction, note, meta)
  VALUES (v_recipient_id, 'receive', 'transfer', p_sender_id::text, 'Payment received', p_amount, 'incoming', p_note, p_meta)
  RETURNING id INTO v_recipient_tx_id;

  RETURN jsonb_build_object(
    'ok', true,
    'sender_tx_id', v_sender_tx_id,
    'recipient_tx_id', v_recipient_tx_id,
    'new_balance', v_new_sender_balance
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('ok', false, 'error', 'transaction_failed', 'message', SQLERRM);
END;
$$;

-- Helper function to get user with computed fields
CREATE OR REPLACE FUNCTION get_user_profile(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'id', u.id,
    'email', u.email,
    'full_name', u.full_name,
    'display_name', u.display_name,
    'balance', u.balance,
    'total_donated', u.total_donated,
    'created_at', u.created_at,
    'updated_at', u.updated_at,
    'transaction_count', (SELECT COUNT(*) FROM transactions WHERE user_id = u.id),
    'recent_donations', (
      SELECT COALESCE(jsonb_agg(t.*), '[]'::jsonb)
      FROM (
        SELECT * FROM transactions
        WHERE user_id = u.id AND type = 'donation'
        ORDER BY timestamp DESC
        LIMIT 5
      ) t
    )
  ) INTO v_result
  FROM app_users u
  WHERE u.id = p_user_id;

  RETURN v_result;
END;
$$;

-- Grant execute permissions (adjust for your RLS policies)
GRANT EXECUTE ON FUNCTION atomic_apply_donation TO authenticated, anon;
GRANT EXECUTE ON FUNCTION atomic_apply_send TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_user_profile TO authenticated, anon;

-- --- 310 lines --- Oct 21

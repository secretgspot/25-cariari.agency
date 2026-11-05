CREATE UNIQUE INDEX IF NOT EXISTS properties_msl_key
	ON public.properties (msl);

CREATE TABLE public.property_msl_reservations (
	msl text PRIMARY KEY,
	reservation_token uuid NOT NULL UNIQUE,
	user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
	expires_at timestamptz NOT NULL
);

ALTER TABLE public.property_msl_reservations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.property_msl_reservations FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.reserve_property_msl(p_reservation_token uuid)
RETURNS TABLE (msl text, reservation_token uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
	v_user_id uuid := auth.uid();
	v_msl text;
	v_token uuid;
	v_number bigint;
	v_limit bigint;
BEGIN
	IF v_user_id IS NULL THEN
		RAISE EXCEPTION 'Authentication is required to reserve an MSL'
			USING ERRCODE = '28000';
	END IF;

	PERFORM pg_catalog.pg_advisory_xact_lock(22121, 1);
	DELETE FROM public.property_msl_reservations AS r
	WHERE r.expires_at <= pg_catalog.now();

	IF p_reservation_token IS NOT NULL THEN
		UPDATE public.property_msl_reservations AS r
		SET expires_at = pg_catalog.now() + INTERVAL '2 hours'
		WHERE r.reservation_token = p_reservation_token
			AND r.user_id = v_user_id
			AND NOT EXISTS (
				SELECT 1
				FROM public.properties AS p
				WHERE p.msl = r.msl
			)
		RETURNING r.msl INTO v_msl;

		IF FOUND THEN
			RETURN QUERY SELECT v_msl, p_reservation_token;
			RETURN;
		END IF;

		DELETE FROM public.property_msl_reservations AS r
		WHERE r.reservation_token = p_reservation_token
			AND r.user_id = v_user_id;
	END IF;

	SELECT pg_catalog.count(*) + 1
	INTO v_limit
	FROM (
		SELECT p.msl
		FROM public.properties AS p
		UNION
		SELECT r.msl
		FROM public.property_msl_reservations AS r
	) AS occupied;

	FOR v_number IN 1..v_limit LOOP
		v_msl := 'CR-' || CASE
			WHEN v_number < 1000 THEN pg_catalog.lpad(v_number::text, 3, '0')
			ELSE v_number::text
		END;

		IF NOT EXISTS (
			SELECT 1 FROM public.properties AS p WHERE p.msl = v_msl
		) AND NOT EXISTS (
			SELECT 1 FROM public.property_msl_reservations AS r WHERE r.msl = v_msl
		) THEN
			v_token := pg_catalog.gen_random_uuid();
			INSERT INTO public.property_msl_reservations (msl, reservation_token, user_id, expires_at)
			VALUES (v_msl, v_token, v_user_id, pg_catalog.now() + INTERVAL '2 hours');

			RETURN QUERY SELECT v_msl, v_token;
			RETURN;
		END IF;
	END LOOP;

	RAISE EXCEPTION 'Unable to find an available MSL';
END;
$function$;

REVOKE ALL ON FUNCTION public.reserve_property_msl(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reserve_property_msl(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.confirm_property_msl_reservation(
	p_reservation_token uuid,
	p_msl text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
	v_user_id uuid := auth.uid();
	v_confirmed boolean := false;
BEGIN
	IF v_user_id IS NULL THEN
		RETURN false;
	END IF;

	PERFORM pg_catalog.pg_advisory_xact_lock(22121, 1);

	UPDATE public.property_msl_reservations AS r
	SET expires_at = pg_catalog.now() + INTERVAL '2 hours'
	WHERE r.reservation_token = p_reservation_token
		AND r.msl = p_msl
		AND r.user_id = v_user_id
		AND r.expires_at > pg_catalog.now()
	RETURNING true INTO v_confirmed;

	RETURN v_confirmed;
END;
$function$;

REVOKE ALL ON FUNCTION public.confirm_property_msl_reservation(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.confirm_property_msl_reservation(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.enforce_property_msl_reservation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
	v_user_id uuid := auth.uid();
BEGIN
	IF TG_OP = 'UPDATE' THEN
		IF NEW.msl IS NOT DISTINCT FROM OLD.msl OR v_user_id IS NULL THEN
			RETURN NEW;
		END IF;

		PERFORM pg_catalog.pg_advisory_xact_lock(22121, 1);
		IF EXISTS (
			SELECT 1
			FROM public.property_msl_reservations AS r
			WHERE r.msl = NEW.msl
				AND r.expires_at > pg_catalog.now()
		) THEN
			RAISE EXCEPTION 'MSL % is currently reserved', NEW.msl
				USING ERRCODE = '23505';
		END IF;

		RETURN NEW;
	END IF;

	IF v_user_id IS NULL THEN
		RETURN NEW;
	END IF;

	IF NEW.user_id IS DISTINCT FROM v_user_id THEN
		RAISE EXCEPTION 'A property can only use an MSL reserved by its creator'
			USING ERRCODE = '42501';
	END IF;

	PERFORM pg_catalog.pg_advisory_xact_lock(22121, 1);
	DELETE FROM public.property_msl_reservations AS r
	WHERE r.msl = NEW.msl
		AND r.user_id = v_user_id
		AND r.expires_at > pg_catalog.now();

	IF NOT FOUND THEN
		RAISE EXCEPTION 'A valid MSL reservation is required to add a property'
			USING ERRCODE = '23514';
	END IF;

	RETURN NEW;
END;
$function$;

REVOKE ALL ON FUNCTION public.enforce_property_msl_reservation() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER properties_require_msl_reservation
BEFORE INSERT ON public.properties
FOR EACH ROW EXECUTE FUNCTION public.enforce_property_msl_reservation();

CREATE TRIGGER properties_protect_reserved_msl
BEFORE UPDATE OF msl ON public.properties
FOR EACH ROW EXECUTE FUNCTION public.enforce_property_msl_reservation();

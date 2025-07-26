

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgsodium";








ALTER SCHEMA "public" OWNER TO "postgres";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "http" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."delete_claim"("uid" "uuid", "claim" "text") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
    BEGIN
      IF NOT is_claims_admin() THEN
          RETURN 'error: access denied';
      ELSE        
        update auth.users set raw_app_meta_data = 
          raw_app_meta_data - claim where id = uid;
        return 'OK';
      END IF;
    END;
$$;


ALTER FUNCTION "public"."delete_claim"("uid" "uuid", "claim" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_photo_storage"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
DECLARE
    bucket_name text;
    file_path text;
BEGIN
    -- Get the bucket name and file path from the deleted record
    bucket_name := OLD.bucket_id;
    file_path := OLD.file_path;
    
    -- Log the initial values
    RAISE LOG 'delete_photo_storage triggered for bucket_id=%, file_path=%', bucket_name, file_path;
    
    -- Delete the file from storage.objects table using security definer to bypass RLS
    BEGIN
        -- Use security definer context to bypass RLS policies
        DELETE FROM storage.objects 
        WHERE bucket_id = bucket_name 
        AND name = file_path;
        
        RAISE LOG 'Successfully deleted file from storage: bucket=%, path=%', bucket_name, file_path;
    EXCEPTION WHEN OTHERS THEN
        -- Log the error but don't fail the transaction
        RAISE LOG 'Error deleting file from storage: % %', SQLERRM, SQLSTATE;
    END;
    
    RETURN OLD;
EXCEPTION WHEN OTHERS THEN
    -- Log any errors but don't fail the transaction
    RAISE LOG 'Error in delete_photo_storage: % %', SQLERRM, SQLSTATE;
    RETURN OLD;
END;
$$;


ALTER FUNCTION "public"."delete_photo_storage"() OWNER TO "supabase_read_only_user";


CREATE OR REPLACE FUNCTION "public"."delete_photos"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$begin
DELETE FROM storage.objects
WHERE name LIKE format('%s/%%', OLD.msl);
return null;
end;$$;


ALTER FUNCTION "public"."delete_photos"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_photos_by_msl"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$begin
DELETE FROM storage.objects
WHERE name LIKE format('%s/%%', OLD.msl);
return null;
end;$$;


ALTER FUNCTION "public"."delete_photos_by_msl"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_claim"("uid" "uuid", "claim" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
    DECLARE retval jsonb;
    BEGIN
      IF NOT is_claims_admin() THEN
          RETURN '{"error":"access denied"}'::jsonb;
      ELSE
        select coalesce(raw_app_meta_data->claim, null) from auth.users into retval where id = uid::uuid;
        return retval;
      END IF;
    END;
$$;


ALTER FUNCTION "public"."get_claim"("uid" "uuid", "claim" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_claims"("uid" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
    DECLARE retval jsonb;
    BEGIN
      IF NOT is_claims_admin() THEN
          RETURN '{"error":"access denied"}'::jsonb;
      ELSE
        select raw_app_meta_data from auth.users into retval where id = uid::uuid;
        return retval;
      END IF;
    END;
$$;


ALTER FUNCTION "public"."get_claims"("uid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_claim"("claim" "text") RETURNS "jsonb"
    LANGUAGE "sql" STABLE
    AS $$
  select 
  	coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb -> 'app_metadata' -> claim, null)
$$;


ALTER FUNCTION "public"."get_my_claim"("claim" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_claims"() RETURNS "jsonb"
    LANGUAGE "sql" STABLE
    AS $$
  select 
  	coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb -> 'app_metadata', '{}'::jsonb)::jsonb
$$;


ALTER FUNCTION "public"."get_my_claims"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."install_available_extensions_and_test"() RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
DECLARE extension_name TEXT;
allowed_extentions TEXT[] := string_to_array(current_setting('supautils.privileged_extensions'), ',');
BEGIN 
  FOREACH extension_name IN ARRAY allowed_extentions 
  LOOP
    SELECT trim(extension_name) INTO extension_name;
    /* skip below extensions check for now */
    CONTINUE WHEN extension_name = 'pgroonga' OR  extension_name = 'pgroonga_database' OR extension_name = 'pgsodium';
    CONTINUE WHEN extension_name = 'plpgsql' OR  extension_name = 'plpgsql_check' OR extension_name = 'pgtap';
    CONTINUE WHEN extension_name = 'supabase_vault' OR extension_name = 'wrappers';
    RAISE notice 'START TEST FOR: %', extension_name;
    EXECUTE format('DROP EXTENSION IF EXISTS %s CASCADE', quote_ident(extension_name));
    EXECUTE format('CREATE EXTENSION %s CASCADE', quote_ident(extension_name));
    RAISE notice 'END TEST FOR: %', extension_name;
  END LOOP;
    RAISE notice 'EXTENSION TESTS COMPLETED..';
    return true;
END;
$$;


ALTER FUNCTION "public"."install_available_extensions_and_test"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_claims_admin"() RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
  BEGIN
    IF session_user = 'authenticator' THEN
      --------------------------------------------
      -- To disallow any authenticated app users
      -- from editing claims, delete the following
      -- block of code and replace it with:
      -- RETURN FALSE;
      --------------------------------------------
      IF extract(epoch from now()) > coalesce((current_setting('request.jwt.claims', true)::jsonb)->>'exp', '0')::numeric THEN
        return false; -- jwt expired
      END IF; 
      IF coalesce((current_setting('request.jwt.claims', true)::jsonb)->'app_metadata'->'claims_admin', 'false')::bool THEN
        return true; -- user has claims_admin set to true
      ELSE
        return false; -- user does NOT have claims_admin set to true
      END IF;
      --------------------------------------------
      -- End of block 
      --------------------------------------------
    ELSE -- not a user session, probably being called from a trigger or something
      return true;
    END IF;
  END;
$$;


ALTER FUNCTION "public"."is_claims_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."jsonb_array_overlaps"("jsonb_array" "jsonb", "text_array" "text"[]) RETURNS boolean
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
BEGIN
    RETURN jsonb_array @> to_jsonb(text_array);
END;
$$;


ALTER FUNCTION "public"."jsonb_array_overlaps"("jsonb_array" "jsonb", "text_array" "text"[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."populate_photos_table"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin
    insert into public.photos (id, user_id, file_path, bucket_id)
    values (new.id, new.owner, new.name, new.bucket_id);
   -- raise log 'trigger';
    return null;
end;
$$;


ALTER FUNCTION "public"."populate_photos_table"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_claim"("uid" "uuid", "claim" "text", "value" "jsonb") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
    BEGIN
      IF NOT is_claims_admin() THEN
          RETURN 'error: access denied';
      ELSE        
        update auth.users set raw_app_meta_data = 
          raw_app_meta_data || 
            json_build_object(claim, value)::jsonb where id = uid;
        return 'OK';
      END IF;
    END;
$$;


ALTER FUNCTION "public"."set_claim"("uid" "uuid", "claim" "text", "value" "jsonb") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."photos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "file_path" "text",
    "name" "text",
    "msl" "text",
    "file_url" "text",
    "user_id" "uuid" DEFAULT "auth"."uid"(),
    "property_id" "uuid"
);


ALTER TABLE "public"."photos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."properties" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "msl" "text" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "description" "text",
    "address" "text",
    "location" "jsonb",
    "land_use" "text",
    "lot_size" integer,
    "year_built" integer,
    "building_size" integer,
    "building_style" "text",
    "rooms" integer,
    "beds" integer,
    "baths" integer,
    "half_baths" integer,
    "parking_spaces" integer,
    "features" "jsonb",
    "price" integer,
    "rent" integer,
    "fees" integer,
    "taxes" integer,
    "contact_email" "text",
    "contact_phone" "text",
    "contact_realtor" "text",
    "property_for" "jsonb",
    "user_id" "uuid"
);


ALTER TABLE "public"."properties" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."properties_preview" AS
 SELECT "p"."id",
    "p"."created_at",
    "p"."updated_at",
    "p"."msl",
    "p"."is_active",
    "p"."description",
    "p"."address",
    "p"."location",
    "p"."land_use",
    "p"."lot_size",
    "p"."year_built",
    "p"."building_size",
    "p"."building_style",
    "p"."rooms",
    "p"."beds",
    "p"."baths",
    "p"."half_baths",
    "p"."parking_spaces",
    "p"."features",
    "p"."price",
    "p"."rent",
    "p"."fees",
    "p"."taxes",
    "p"."contact_email",
    "p"."contact_phone",
    "p"."contact_realtor",
    "p"."property_for",
    "p"."user_id",
    ( SELECT "ph"."file_url"
           FROM "public"."photos" "ph"
          WHERE ("ph"."msl" = "p"."msl")
          ORDER BY "ph"."created_at"
         LIMIT 1) AS "photo"
   FROM "public"."properties" "p"
  ORDER BY "p"."msl";


ALTER VIEW "public"."properties_preview" OWNER TO "postgres";


ALTER TABLE ONLY "public"."photos"
    ADD CONSTRAINT "photos_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."photos"
    ADD CONSTRAINT "photos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."properties"
    ADD CONSTRAINT "properties_id_unique" UNIQUE ("id");



ALTER TABLE ONLY "public"."properties"
    ADD CONSTRAINT "properties_msl_key" UNIQUE ("msl");



ALTER TABLE ONLY "public"."properties"
    ADD CONSTRAINT "properties_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_photos_msl" ON "public"."photos" USING "btree" ("msl");



CREATE INDEX "idx_photos_name" ON "public"."photos" USING "btree" ("name");



CREATE INDEX "idx_properties_msl" ON "public"."properties" USING "btree" ("msl");



CREATE OR REPLACE TRIGGER "delete_photos_from_bucket" AFTER DELETE ON "public"."properties" FOR EACH ROW EXECUTE FUNCTION "public"."delete_photos"();



CREATE OR REPLACE TRIGGER "trigger_delete_photo_storage" AFTER DELETE ON "public"."photos" FOR EACH ROW EXECUTE FUNCTION "public"."delete_photo_storage"();



ALTER TABLE ONLY "public"."photos"
    ADD CONSTRAINT "photos_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."photos"
    ADD CONSTRAINT "photos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."properties"
    ADD CONSTRAINT "properties_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



CREATE POLICY "Enable all for admin" ON "public"."photos" TO "authenticated" USING ((((("auth"."jwt"() ->> 'app_metadata'::"text"))::"jsonb" ->> 'claims_admin'::"text") = 'true'::"text")) WITH CHECK ((((("auth"."jwt"() ->> 'app_metadata'::"text"))::"jsonb" ->> 'claims_admin'::"text") = 'true'::"text"));



CREATE POLICY "Enable all for admin" ON "public"."properties" USING (COALESCE(("public"."get_my_claim"('claims_admin'::"text"))::boolean, false)) WITH CHECK (COALESCE(("public"."get_my_claim"('claims_admin'::"text"))::boolean, false));



CREATE POLICY "Enable delete for record owners" ON "public"."photos" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Enable delete for users based on user_id" ON "public"."properties" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Enable insert for authenticated users only" ON "public"."properties" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for record owners" ON "public"."photos" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Enable read access for all users" ON "public"."photos" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."properties" FOR SELECT USING (true);



CREATE POLICY "Enable update for record owners" ON "public"."photos" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Enable update for users based on  user_id" ON "public"."properties" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."photos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."properties" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;
GRANT ALL ON SCHEMA "public" TO PUBLIC;
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";





















































































































































































































GRANT ALL ON FUNCTION "public"."delete_claim"("uid" "uuid", "claim" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."delete_claim"("uid" "uuid", "claim" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_claim"("uid" "uuid", "claim" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_photos"() TO "anon";
GRANT ALL ON FUNCTION "public"."delete_photos"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_photos"() TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_photos_by_msl"() TO "anon";
GRANT ALL ON FUNCTION "public"."delete_photos_by_msl"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_photos_by_msl"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_claim"("uid" "uuid", "claim" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_claim"("uid" "uuid", "claim" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_claim"("uid" "uuid", "claim" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_claims"("uid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_claims"("uid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_claims"("uid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_my_claim"("claim" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_claim"("claim" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_claim"("claim" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_my_claims"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_claims"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_claims"() TO "service_role";



GRANT ALL ON FUNCTION "public"."install_available_extensions_and_test"() TO "anon";
GRANT ALL ON FUNCTION "public"."install_available_extensions_and_test"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."install_available_extensions_and_test"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_claims_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_claims_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_claims_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."jsonb_array_overlaps"("jsonb_array" "jsonb", "text_array" "text"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."jsonb_array_overlaps"("jsonb_array" "jsonb", "text_array" "text"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."jsonb_array_overlaps"("jsonb_array" "jsonb", "text_array" "text"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."populate_photos_table"() TO "anon";
GRANT ALL ON FUNCTION "public"."populate_photos_table"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."populate_photos_table"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_claim"("uid" "uuid", "claim" "text", "value" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."set_claim"("uid" "uuid", "claim" "text", "value" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_claim"("uid" "uuid", "claim" "text", "value" "jsonb") TO "service_role";












GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."photos" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."photos" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."photos" TO "service_role";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."photos" TO "authenticator";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."properties" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."properties" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."properties" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."properties_preview" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."properties_preview" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."properties_preview" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO "service_role";






























RESET ALL;

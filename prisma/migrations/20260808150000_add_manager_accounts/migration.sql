CREATE TABLE "Manager" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "clubId" INTEGER,
    "onboardingStatus" TEXT NOT NULL DEFAULT 'ACCOUNT_CREATED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Manager_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Manager_normalizedName_key"
ON "Manager"("normalizedName");

CREATE UNIQUE INDEX "Manager_clubId_key"
ON "Manager"("clubId");

ALTER TABLE "Manager"
ADD CONSTRAINT "Manager_clubId_fkey"
FOREIGN KEY ("clubId") REFERENCES "Club"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE OR REPLACE FUNCTION public.handle_biliardo_manager_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    manager_name TEXT;
BEGIN
    manager_name := btrim(NEW.raw_user_meta_data ->> 'manager_name');

    IF manager_name IS NULL
       OR char_length(manager_name) < 3
       OR char_length(manager_name) > 30 THEN
        RAISE EXCEPTION 'manager_name_invalid';
    END IF;

    INSERT INTO public."Manager" (
        "id",
        "name",
        "normalizedName",
        "updatedAt"
    )
    VALUES (
        NEW.id,
        manager_name,
        lower(manager_name),
        CURRENT_TIMESTAMP
    );

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_biliardo_manager_auth_user_created
ON auth.users;

CREATE TRIGGER on_biliardo_manager_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_biliardo_manager_signup();

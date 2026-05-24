CREATE SEQUENCE IF NOT EXISTS "order_number_seq" AS bigint
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

DO $$
DECLARE
  max_order_number bigint;
BEGIN
  SELECT COALESCE(MAX(substring("orderNumber" FROM '^PED-(\d+)$')::bigint), 0)
  INTO max_order_number
  FROM "orders"
  WHERE "orderNumber" ~ '^PED-\d+$';

  IF max_order_number > 0 THEN
    PERFORM setval('order_number_seq', max_order_number, true);
  ELSE
    PERFORM setval('order_number_seq', 1, false);
  END IF;
END $$;

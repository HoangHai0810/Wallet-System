ALTER TABLE users ADD COLUMN phone_number VARCHAR(20);

UPDATE users SET phone_number = '00000000' || id WHERE phone_number IS NULL;

ALTER TABLE users ALTER COLUMN phone_number SET NOT NULL;
ALTER TABLE users ADD CONSTRAINT users_phone_number_unique UNIQUE (phone_number);

ALTER TABLE transactions ADD COLUMN category VARCHAR(50);
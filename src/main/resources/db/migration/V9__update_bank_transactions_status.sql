ALTER TABLE bank_transactions ADD COLUMN user_id BIGINT;
ALTER TABLE bank_transactions ADD COLUMN status VARCHAR(20) DEFAULT 'PENDING';

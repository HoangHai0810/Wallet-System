CREATE TABLE bank_transactions (
    id               BIGSERIAL PRIMARY KEY,
    gateway          VARCHAR(50) NOT NULL,
    account_number   VARCHAR(50),
    transfer_type    VARCHAR(10) NOT NULL,
    amount           DECIMAL(15, 2) NOT NULL,
    content          TEXT,
    ai_category      VARCHAR(50),
    reference_number VARCHAR(100) UNIQUE,
    transaction_date TIMESTAMP,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

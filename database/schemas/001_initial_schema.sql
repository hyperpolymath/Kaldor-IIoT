-- Kaldor IIoT - Database Schema
-- PostgreSQL + TimescaleDB

-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'operator',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_login TIMESTAMP,
    active BOOLEAN NOT NULL DEFAULT true
);

-- Create index on username
CREATE INDEX idx_users_username ON users(username);

-- Looms table
CREATE TABLE IF NOT EXISTS looms (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    model VARCHAR(100),
    serial_number VARCHAR(100),
    configuration JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- BBW Measurements table (TimescaleDB hypertable)
CREATE TABLE IF NOT EXISTS bbw_measurements (
    time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    loom_id VARCHAR(50) NOT NULL,
    device_id VARCHAR(50) NOT NULL,
    bbw_avg FLOAT,
    bbw_min FLOAT,
    bbw_max FLOAT,
    bbw_stddev FLOAT,
    temperature FLOAT,
    vibration FLOAT,
    quality_flag INT,
    metadata JSONB
);

-- Convert to hypertable
SELECT create_hypertable('bbw_measurements', 'time', if_not_exists => TRUE);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bbw_loom_time ON bbw_measurements (loom_id, time DESC);
CREATE INDEX IF NOT EXISTS idx_bbw_device_time ON bbw_measurements (device_id, time DESC);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    loom_id VARCHAR(50) NOT NULL,
    device_id VARCHAR(50) NOT NULL,
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'warning',
    value FLOAT,
    message TEXT,
    acknowledged BOOLEAN NOT NULL DEFAULT false,
    acknowledged_at TIMESTAMP,
    acknowledged_by INT REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_alerts_loom ON alerts(loom_id, created_at DESC);
CREATE INDEX idx_alerts_severity ON alerts(severity, acknowledged);

-- Devices table
CREATE TABLE IF NOT EXISTS devices (
    id VARCHAR(50) PRIMARY KEY,
    loom_id VARCHAR(50) REFERENCES looms(id),
    device_type VARCHAR(50) NOT NULL,
    firmware_version VARCHAR(20),
    ip_address INET,
    mac_address MACADDR,
    last_seen TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'offline',
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Maintenance logs table
CREATE TABLE IF NOT EXISTS maintenance_logs (
    id SERIAL PRIMARY KEY,
    loom_id VARCHAR(50) NOT NULL REFERENCES looms(id),
    performed_by INT REFERENCES users(id),
    maintenance_type VARCHAR(50) NOT NULL,
    description TEXT,
    parts_replaced TEXT[],
    cost DECIMAL(10, 2),
    duration_minutes INT,
    performed_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Production runs table
CREATE TABLE IF NOT EXISTS production_runs (
    id SERIAL PRIMARY KEY,
    loom_id VARCHAR(50) NOT NULL REFERENCES looms(id),
    product_type VARCHAR(100),
    target_bbw FLOAT NOT NULL,
    tolerance FLOAT NOT NULL,
    started_at TIMESTAMP NOT NULL,
    ended_at TIMESTAMP,
    total_length_meters FLOAT,
    quality_grade VARCHAR(20),
    notes TEXT
);

-- Configuration history table
CREATE TABLE IF NOT EXISTS config_history (
    id SERIAL PRIMARY KEY,
    loom_id VARCHAR(50) NOT NULL REFERENCES looms(id),
    changed_by INT REFERENCES users(id),
    old_config JSONB,
    new_config JSONB,
    changed_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Continuous aggregates for analytics (TimescaleDB feature)
-- 1-minute aggregates
CREATE MATERIALIZED VIEW IF NOT EXISTS bbw_1min
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('1 minute', time) AS bucket,
    loom_id,
    AVG(bbw_avg) as avg_bbw,
    MIN(bbw_min) as min_bbw,
    MAX(bbw_max) as max_bbw,
    AVG(bbw_stddev) as stddev_bbw,
    AVG(temperature) as avg_temp,
    AVG(vibration) as avg_vib,
    AVG(quality_flag) as avg_quality,
    COUNT(*) as sample_count
FROM bbw_measurements
GROUP BY bucket, loom_id;

-- 1-hour aggregates
CREATE MATERIALIZED VIEW IF NOT EXISTS bbw_1hour
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('1 hour', time) AS bucket,
    loom_id,
    AVG(bbw_avg) as avg_bbw,
    MIN(bbw_min) as min_bbw,
    MAX(bbw_max) as max_bbw,
    AVG(bbw_stddev) as stddev_bbw,
    AVG(temperature) as avg_temp,
    AVG(vibration) as avg_vib,
    AVG(quality_flag) as avg_quality,
    COUNT(*) as sample_count
FROM bbw_measurements
GROUP BY bucket, loom_id;

-- 1-day aggregates
CREATE MATERIALIZED VIEW IF NOT EXISTS bbw_1day
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('1 day', time) AS bucket,
    loom_id,
    AVG(bbw_avg) as avg_bbw,
    MIN(bbw_min) as min_bbw,
    MAX(bbw_max) as max_bbw,
    AVG(bbw_stddev) as stddev_bbw,
    AVG(temperature) as avg_temp,
    AVG(vibration) as avg_vib,
    AVG(quality_flag) as avg_quality,
    COUNT(*) as sample_count
FROM bbw_measurements
GROUP BY bucket, loom_id;

-- Data retention policy
-- Keep raw data for 7 days
SELECT add_retention_policy('bbw_measurements', INTERVAL '7 days', if_not_exists => TRUE);

-- Refresh policies for continuous aggregates
SELECT add_continuous_aggregate_policy('bbw_1min',
    start_offset => INTERVAL '2 hours',
    end_offset => INTERVAL '1 minute',
    schedule_interval => INTERVAL '1 minute',
    if_not_exists => TRUE);

SELECT add_continuous_aggregate_policy('bbw_1hour',
    start_offset => INTERVAL '4 hours',
    end_offset => INTERVAL '1 hour',
    schedule_interval => INTERVAL '1 hour',
    if_not_exists => TRUE);

SELECT add_continuous_aggregate_policy('bbw_1day',
    start_offset => INTERVAL '3 days',
    end_offset => INTERVAL '1 day',
    schedule_interval => INTERVAL '1 day',
    if_not_exists => TRUE);

-- Insert default admin user (password: admin123 - CHANGE IN PRODUCTION!)
INSERT INTO users (username, email, password_hash, role) VALUES
    ('admin', 'admin@kaldor-iiot.local', '$2a$10$qMkHKUMvKl3XLEtJNGEo5.t7LZLk0Q5mYz5h0lQpKxXy5yGZ6nKxS', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Insert sample looms
INSERT INTO looms (id, name, description, location, model) VALUES
    ('LOOM-001', 'Loom #1', 'Main production loom', 'Factory Floor A', 'Kaldor-2000'),
    ('LOOM-002', 'Loom #2', 'Secondary production loom', 'Factory Floor A', 'Kaldor-2000'),
    ('LOOM-003', 'Loom #3', 'Testing loom', 'Quality Control Lab', 'Kaldor-2500')
ON CONFLICT (id) DO NOTHING;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_looms_updated_at BEFORE UPDATE ON looms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON devices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable the TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Create hypertable for device_data
SELECT create_hypertable('device_data', 'timestamp', if_not_exists => TRUE);

"""
Kaldor IIoT - Analytics Service

Python-based analytics engine for predictive maintenance and anomaly detection
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import psycopg2
import redis
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import logging

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database connection
def get_db_connection():
    return psycopg2.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        port=os.getenv('DB_PORT', '5432'),
        database=os.getenv('DB_NAME', 'kaldor_iiot'),
        user=os.getenv('DB_USER', 'kaldor'),
        password=os.getenv('DB_PASSWORD', 'kaldor')
    )

# Redis connection
redis_client = redis.Redis(
    host=os.getenv('REDIS_HOST', 'localhost'),
    port=int(os.getenv('REDIS_PORT', '6379')),
    password=os.getenv('REDIS_PASSWORD', None),
    decode_responses=True
)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'service': 'analytics'
    })

@app.route('/api/v1/analytics/anomaly-detection', methods=['POST'])
def detect_anomalies():
    """
    Detect anomalies in BBW measurements using statistical methods
    """
    try:
        data = request.json
        loom_id = data.get('loom_id')
        hours = data.get('hours', 24)

        # Fetch data from database
        conn = get_db_connection()
        cursor = conn.cursor()

        query = """
            SELECT time, bbw_avg, bbw_stddev
            FROM bbw_measurements
            WHERE loom_id = %s
              AND time >= NOW() - INTERVAL '%s hours'
            ORDER BY time DESC
        """

        cursor.execute(query, (loom_id, hours))
        rows = cursor.fetchall()

        if not rows:
            return jsonify({'anomalies': []}), 200

        # Convert to pandas DataFrame
        df = pd.DataFrame(rows, columns=['time', 'bbw_avg', 'bbw_stddev'])

        # Calculate z-scores
        mean = df['bbw_avg'].mean()
        std = df['bbw_avg'].std()

        df['z_score'] = (df['bbw_avg'] - mean) / std

        # Detect anomalies (|z| > 3)
        anomalies = df[abs(df['z_score']) > 3]

        result = {
            'loom_id': loom_id,
            'period_hours': hours,
            'total_measurements': len(df),
            'anomaly_count': len(anomalies),
            'anomalies': anomalies.to_dict('records'),
            'statistics': {
                'mean': float(mean),
                'std': float(std),
                'min': float(df['bbw_avg'].min()),
                'max': float(df['bbw_avg'].max())
            }
        }

        cursor.close()
        conn.close()

        return jsonify(result), 200

    except Exception as e:
        logger.error(f'Anomaly detection error: {str(e)}')
        return jsonify({'error': str(e)}), 500

@app.route('/api/v1/analytics/predict-maintenance', methods=['POST'])
def predict_maintenance():
    """
    Predict maintenance needs based on historical data
    """
    try:
        data = request.json
        loom_id = data.get('loom_id')

        # Fetch historical data
        conn = get_db_connection()
        cursor = conn.cursor()

        query = """
            SELECT
                time_bucket('1 hour', time) as hour,
                AVG(bbw_avg) as avg_bbw,
                AVG(bbw_stddev) as avg_stddev,
                AVG(temperature) as avg_temp,
                AVG(vibration) as avg_vib
            FROM bbw_measurements
            WHERE loom_id = %s
              AND time >= NOW() - INTERVAL '30 days'
            GROUP BY hour
            ORDER BY hour
        """

        cursor.execute(query, (loom_id,))
        rows = cursor.fetchall()

        df = pd.DataFrame(rows, columns=['hour', 'avg_bbw', 'avg_stddev', 'avg_temp', 'avg_vib'])

        # Simple trend analysis
        trend = np.polyfit(range(len(df)), df['avg_stddev'], 1)[0]

        # Calculate health score (0-100)
        health_score = 100 - min(100, abs(trend) * 10000)

        # Predict maintenance needs
        if health_score < 70:
            maintenance_needed = True
            urgency = 'high' if health_score < 50 else 'medium'
        else:
            maintenance_needed = False
            urgency = 'low'

        result = {
            'loom_id': loom_id,
            'health_score': round(health_score, 2),
            'maintenance_needed': maintenance_needed,
            'urgency': urgency,
            'trend': 'increasing' if trend > 0 else 'decreasing',
            'recommendation': get_maintenance_recommendation(health_score, trend)
        }

        cursor.close()
        conn.close()

        return jsonify(result), 200

    except Exception as e:
        logger.error(f'Predictive maintenance error: {str(e)}')
        return jsonify({'error': str(e)}), 500

@app.route('/api/v1/analytics/quality-report', methods=['POST'])
def generate_quality_report():
    """
    Generate quality report for a production run
    """
    try:
        data = request.json
        loom_id = data.get('loom_id')
        start_time = data.get('start_time')
        end_time = data.get('end_time', datetime.now().isoformat())

        conn = get_db_connection()
        cursor = conn.cursor()

        query = """
            SELECT
                COUNT(*) as total_measurements,
                AVG(bbw_avg) as avg_bbw,
                STDDEV(bbw_avg) as stddev_bbw,
                MIN(bbw_min) as min_bbw,
                MAX(bbw_max) as max_bbw,
                AVG(quality_flag) as avg_quality
            FROM bbw_measurements
            WHERE loom_id = %s
              AND time >= %s
              AND time <= %s
        """

        cursor.execute(query, (loom_id, start_time, end_time))
        row = cursor.fetchone()

        report = {
            'loom_id': loom_id,
            'period': {
                'start': start_time,
                'end': end_time
            },
            'measurements': {
                'total_count': row[0],
                'average_bbw': round(row[1], 2) if row[1] else 0,
                'std_deviation': round(row[2], 2) if row[2] else 0,
                'min_bbw': round(row[3], 2) if row[3] else 0,
                'max_bbw': round(row[4], 2) if row[4] else 0,
                'quality_score': round(row[5], 2) if row[5] else 0
            }
        }

        cursor.close()
        conn.close()

        return jsonify(report), 200

    except Exception as e:
        logger.error(f'Quality report error: {str(e)}')
        return jsonify({'error': str(e)}), 500

def get_maintenance_recommendation(health_score, trend):
    """Generate maintenance recommendation based on health score and trend"""
    if health_score < 50:
        return "Immediate maintenance required. Schedule inspection within 24 hours."
    elif health_score < 70:
        return "Maintenance recommended within the next week. Monitor closely."
    elif trend > 0.001:
        return "Increasing variability detected. Schedule preventive maintenance."
    else:
        return "System operating normally. Continue regular monitoring."

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=os.getenv('DEBUG', 'False') == 'True')

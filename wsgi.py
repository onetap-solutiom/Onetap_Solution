import os
import sys

# Add the backend directory to the Python path
backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend')
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Import the 'app' instance from 'backend/app.py'
try:
    from app import app
except ImportError as e:
    # Fallback to direct import if needed
    from backend.app import app

# This entry point is used by Gunicorn: gunicorn wsgi:app
if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)

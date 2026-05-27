import os
import sys

# Add the backend directory to the Python path
# This allows the app to find modules like 'config', 'database', etc.
backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend')
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

try:
    # Option 1: Try to import the 'app' instance from 'backend/app.py'
    # Since we added 'backend' to sys.path, 'import app' should work.
    from app import app
except ImportError:
    # Option 2: Fallback to importing through the package if Option 1 fails
    try:
        from backend.app import app
    except ImportError as e:
        print(f"CRITICAL: Could not find 'app' instance. Error: {e}")
        print(f"Current sys.path: {sys.path}")
        raise e

# This file serves as the main entry point for Gunicorn on Render
# Command: gunicorn app:app
if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)

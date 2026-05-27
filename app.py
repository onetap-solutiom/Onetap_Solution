import os
import sys

# Add the backend directory to the Python path
# This allows the app to find modules like 'config', 'database', etc. inside backend/
backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend')
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Import the 'app' instance directly from the backend package
# We use 'from backend.app import app' to be explicit and avoid any 'app.py' (this file) vs 'app' (module) confusion
try:
    from backend.app import app
except ImportError as e:
    # If the above fails, try a direct import if backend is already in sys.path
    try:
        from app import app
    except ImportError:
        print(f"CRITICAL: Could not find 'app' instance in backend/app.py. Error: {e}")
        print(f"Current sys.path: {sys.path}")
        raise e

# This file serves as the main entry point for Gunicorn on Render
# Command: gunicorn app:app
if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)


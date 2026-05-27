import os
import sys

# Add the backend directory to the Python path
# This ensures that Gunicorn can find 'config', 'models', etc. inside backend/
backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend')
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

try:
    # Import the 'app' instance from backend/app.py
    from backend.app import app
except Exception as e:
    print(f"CRITICAL ERROR during app initialization: {e}")
    import traceback
    traceback.print_exc()
    raise e

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)


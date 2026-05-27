import sys
import os

# Add the backend directory to the Python path
backend_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend')
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

try:
    # Now we can safely import from the backend's app module
    from app import app
except Exception as e:
    print(f"CRITICAL: Failed to initialize application from backend/app.py: {e}")
    import traceback
    traceback.print_exc()
    raise e

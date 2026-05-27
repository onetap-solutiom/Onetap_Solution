import sys
import os

# Add the backend directory to the Python path so imports work correctly
backend_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend')
sys.path.insert(0, backend_path)

try:
    from app import app
except Exception as e:
    print(f"CRITICAL: Failed to initialize application: {e}")
    import traceback
    traceback.print_exc()
    raise e

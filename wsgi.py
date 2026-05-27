import sys
import os
import importlib.util

# Add the backend directory to the Python path
backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend')
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

try:
    # Use dynamic import to satisfy linters and handle the subdirectory structure
    spec = importlib.util.spec_from_file_location("backend_app", os.path.join(backend_dir, "app.py"))
    app_module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(app_module)
    
    # Expose the 'app' instance for Gunicorn
    app = app_module.app
    
except Exception as e:
    print(f"CRITICAL: Failed to initialize application: {e}")
    import traceback
    traceback.print_exc()
    raise e

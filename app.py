import sys
import os

# Add the backend directory to the Python path so imports work correctly
backend_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend')
sys.path.insert(0, backend_path)

from app import app

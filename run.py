import os
import sys
import subprocess
import argparse

def install_dependencies():
    print("Installing requirements from backend/requirements.txt...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "backend/requirements.txt"])
        print("\nAll dependencies installed successfully!")
    except Exception as e:
        print(f"\nError installing dependencies: {e}")
        print("Please ensure pip is installed and you have internet access.")

def run_train():
    print("Executing ML Training Pipeline...")
    try:
        subprocess.check_call([sys.executable, "ml/src/train.py"])
        print("\nModel training and validation completed successfully!")
    except Exception as e:
        print(f"\nError running training: {e}")

def run_backend():
    print("Starting FastAPI Backend Server on http://localhost:8000...")
    try:
        # Check if model has been trained
        if not os.path.exists("ml/models/hybrid_xgb.pkl"):
            print("\nWarning: Model binaries not found in ml/models/. We highly recommend running 'python run.py train' first!")
            
        import uvicorn
        # Add backend/app to system path for running uvicorn
        sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "backend/app")))
        uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=False)
    except ImportError:
        print("\nError: uvicorn is not installed. Please run 'python run.py install' first.")
    except Exception as e:
        print(f"\nServer error: {e}")

def run_tests():
    print("Running Suite Unit Tests...")
    try:
        # Run preprocess tests
        print("\nRunning ML Preprocessing Tests:")
        subprocess.call([sys.executable, "-m", "unittest", "tests/test_ml.py"])
        
        # Run API tests
        print("\nRunning API Route Tests:")
        subprocess.call([sys.executable, "-m", "unittest", "tests/test_api.py"])
    except Exception as e:
        print(f"\nError running tests: {e}")

def main():
    parser = argparse.ArgumentParser(description="Amazon Review Intelligence Suite Orchestration Tool")
    parser.add_argument(
        "command", 
        choices=["install", "train", "backend", "test"],
        help="Command to execute: install dependencies, train models, start the backend, or run unit tests."
    )
    
    args = parser.parse_args()
    
    if args.command == "install":
        install_dependencies()
    elif args.command == "train":
        run_train()
    elif args.command == "backend":
        run_backend()
    elif args.command == "test":
        run_tests()

if __name__ == "__main__":
    main()

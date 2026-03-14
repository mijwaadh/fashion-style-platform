import sys
import os
from rembg import remove, new_session
from PIL import Image
import io

def remove_background(input_path, output_path):
    # Using 'silueta' model because it's lightweight (~40MB) and fast
    # Good for memory-constrained environments like Render Starter
    model_name = "silueta"
    session = new_session(model_name)

    try:
        with open(input_path, 'rb') as i:
            input_data = i.read()
            
        output_data = remove(input_data, session=session)
        
        with open(output_path, 'wb') as o:
            o.write(output_data)
            
        print(f"Successfully removed background: {output_path}")
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python bg_remover.py <input_path> <output_path>")
        sys.exit(1)
        
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    
    remove_background(input_path, output_path)


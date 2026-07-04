# ─── SENTINEL Local File Scanner Service ──────────────────────────────────────
import os
import hashlib
import logging
from typing import Dict, Any, List

logger = logging.getLogger("SENTINEL.FileScanner")

def scan_user_directory(directory_path: str, permission_granted: bool) -> List[Dict[str, Any]]:
    """Calculates SHA256 hashes and metadata for files in a user-selected path."""
    if not permission_granted:
        return [{"status": "disabled", "error": "This feature is currently disabled. Please enable Documents/Desktop Scanning permission from Privacy Settings."}]

    if not directory_path or not os.path.exists(directory_path):
        return [{"status": "error", "message": "The selected folder directory does not exist."}]

    scanned_files = []
    
    # Restrict to scanning folders directly, not recursively traversing system files
    try:
        for filename in os.listdir(directory_path):
            filepath = os.path.join(directory_path, filename)
            if not os.path.isfile(filepath):
                continue
                
            # Compute file size and extension details
            stat = os.stat(filepath)
            size_kb = round(stat.st_size / 1024, 2)
            _, ext = os.path.splitext(filename)
            
            # Read first 1MB and compute SHA256 hash
            sha256 = hashlib.sha256()
            try:
                with open(filepath, 'rb') as f:
                    for chunk in iter(lambda: f.read(65536), b''):
                        sha256.update(chunk)
                file_hash = sha256.hexdigest()
            except Exception:
                file_hash = "N/A"
                
            # Perform YARA-style signature rule matching on executable files
            threat_status = "Safe"
            reasons = []
            
            is_executable = ext.lower() in ['.exe', '.dll', '.bat', '.ps1', '.vbs', '.msi']
            
            if is_executable and file_hash != "N/A":
                try:
                    # Look for suspicious binary/script pattern markers
                    with open(filepath, 'rb') as f:
                        content = f.read(1024 * 1024) # Scan first 1MB max
                        
                    suspicious_patterns = [
                        (b'WScript.Shell', "Windows Scripting Host command shell instantiation"),
                        (b'CreateRemoteThread', "Potential process injection API hook"),
                        (b'VirtualAlloc', "Memory allocation frequently used in shellcode loading"),
                        (b'bypass', "Script tries to bypass ExecutionPolicy security layers")
                    ]
                    
                    for pattern, desc in suspicious_patterns:
                        if pattern in content:
                            threat_status = "Suspicious"
                            reasons.append(desc)
                            
                except Exception:
                    pass
                    
            scanned_files.append({
                "filename": filename,
                "path": filepath,
                "size_kb": size_kb,
                "sha256": file_hash,
                "is_executable": is_executable,
                "status": threat_status,
                "reasons": reasons
            })
            
            if len(scanned_files) >= 30:  # Safety cap on files listed in one pass
                break
                
    except Exception as e:
        logger.error(f"Directory scan interrupted ({e})")
        return [{"status": "error", "message": f"Scan failed: {str(e)}"}]
        
    return scanned_files

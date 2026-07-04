# ─── SENTINEL Local Browser Scanner Service ────────────────────────────────────
import os
import shutil
import sqlite3
import json
import logging
import tempfile
from typing import Dict, Any, List

logger = logging.getLogger("SENTINEL.BrowserScanner")

def _get_chrome_history_path() -> str:
    """Returns local path to Chrome History sqlite database."""
    user_profile = os.environ.get('USERPROFILE')
    if not user_profile:
        return ""
    return os.path.join(user_profile, 'AppData', 'Local', 'Google', 'Chrome', 'User Data', 'Default', 'History')

def _get_chrome_extensions_path() -> str:
    """Returns local path to Chrome extensions folder."""
    user_profile = os.environ.get('USERPROFILE')
    if not user_profile:
        return ""
    return os.path.join(user_profile, 'AppData', 'Local', 'Google', 'Chrome', 'User Data', 'Default', 'Extensions')

def scan_browser_history(permission_granted: bool) -> List[Dict[str, Any]]:
    """Copies and parses local browser history file to scan domains."""
    if not permission_granted:
        return [{"status": "disabled", "error": "This feature is currently disabled. Please enable Browser Access from Privacy Settings."}]

    history_path = _get_chrome_history_path()
    if not history_path or not os.path.exists(history_path):
        return [{"status": "error", "message": "Chrome User History database not found at default location."}]

    temp_dir = tempfile.gettempdir()
    temp_history = os.path.join(temp_dir, 'sentinel_history_temp')
    
    records = []
    try:
        # Copy to avoid 'database is locked' errors while Chrome is running
        shutil.copy2(history_path, temp_history)
        
        conn = sqlite3.connect(temp_history)
        cursor = conn.cursor()
        
        # Query recently visited URLs and titles
        cursor.execute("SELECT url, title, last_visit_time FROM urls ORDER BY last_visit_time DESC LIMIT 15")
        rows = cursor.fetchall()
        
        for url, title, timestamp in rows:
            # Check for suspicious keywords
            is_suspicious = False
            if any(k in url.lower() for k in ['phish', 'login-secure', 'paypal', 'cryptocurrency', 'free-crypto']):
                is_suspicious = True
                
            records.append({
                "url": url,
                "title": title or "No Title",
                "status": "Suspicious" if is_suspicious else "Verified"
            })
            
        cursor.close()
        conn.close()
    except Exception as e:
        logger.error(f"Failed to scan Chrome History: {e}")
        return [{"status": "error", "message": f"Scan failed: {str(e)}"}]
    finally:
        if os.path.exists(temp_history):
            try:
                os.remove(temp_history)
            except Exception:
                pass
                
    return records

def scan_browser_extensions(permission_granted: bool) -> List[Dict[str, Any]]:
    """Inspects Chrome extensions directory and parses manifest.json files."""
    if not permission_granted:
        return [{"status": "disabled", "error": "This feature is currently disabled. Please enable Browser Extensions permission from Privacy Settings."}]

    extensions_path = _get_chrome_extensions_path()
    if not extensions_path or not os.path.exists(extensions_path):
        return [{"status": "error", "message": "Chrome Extensions directory not found."}]

    extensions_list = []
    try:
        for ext_id in os.listdir(extensions_path):
            ext_dir = os.path.join(extensions_path, ext_id)
            if not os.path.isdir(ext_dir):
                continue
                
            # Extensions contain subfolders representing versions
            versions = os.listdir(ext_dir)
            if not versions:
                continue
                
            latest_ver_dir = os.path.join(ext_dir, versions[0])
            manifest_path = os.path.join(latest_ver_dir, 'manifest.json')
            
            if os.path.exists(manifest_path):
                with open(manifest_path, 'r', encoding='utf-8') as f:
                    manifest = json.load(f)
                    
                name = manifest.get('name') or ext_id
                # Translate localized Chrome messages if needed
                if name.startswith('__MSG_') and name.endswith('__'):
                    name = f"Extension ({ext_id[:8]})"
                    
                extensions_list.append({
                    "id": ext_id,
                    "name": name,
                    "version": manifest.get('version', '0.0'),
                    "permissions": manifest.get('permissions', [])
                })
    except Exception as e:
        logger.error(f"Failed to read Chrome Extensions: {e}")
        return [{"status": "error", "message": f"Scan failed: {str(e)}"}]
        
    return extensions_list

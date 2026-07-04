# ─── SENTINEL System Telemetry Service ─────────────────────────────────────────
import psutil
import winreg
import logging
from typing import Dict, Any, List

logger = logging.getLogger("SENTINEL.SystemMonitor")

def get_running_processes(permission_granted: bool) -> List[Dict[str, Any]]:
    """Retrieves actual running system processes if user granted access."""
    if not permission_granted:
        return [{"status": "disabled", "error": "This feature is currently disabled. Please enable Running Processes permission from Privacy Settings."}]

    processes = []
    for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent', 'ppid', 'exe']):
        try:
            info = proc.info
            cpu = info.get('cpu_percent') or 0.0
            ram = info.get('memory_percent') or 0.0
            
            # Detect simple indicators of suspicious names
            is_suspicious = False
            name_lower = (info.get('name') or '').lower()
            if any(k in name_lower for k in ['xmrig', 'miner', 'keylogger', 'exploit', 'mimikatz']):
                is_suspicious = True
                
            processes.append({
                "pid": info['pid'],
                "name": info['name'] or "Unknown",
                "cpu": round(cpu, 2),
                "ram": round(ram, 2),
                "ppid": info['ppid'] or 0,
                "path": info['exe'] or "N/A",
                "status": "Suspicious" if is_suspicious else "Normal"
            })
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            continue
            
    # Sort processes by CPU usage descending
    processes.sort(key=lambda x: x.get("cpu", 0), reverse=True)
    return processes

def get_installed_software(permission_granted: bool) -> List[Dict[str, Any]]:
    """Scans the Windows Registry to list installed applications."""
    if not permission_granted:
        return [{"status": "disabled", "error": "This feature is currently disabled. Please enable Installed Applications permission from Privacy Settings."}]

    software_list = []
    registry_paths = [
        (winreg.HKEY_LOCAL_MACHINE, r"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall"),
        (winreg.HKEY_LOCAL_MACHINE, r"SOFTWARE\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall"),
        (winreg.HKEY_CURRENT_USER, r"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall")
    ]

    for hive, path in registry_paths:
        try:
            key = winreg.OpenKey(hive, path)
            for i in range(0, winreg.QueryInfoKey(key)[0]):
                try:
                    subkey_name = winreg.EnumKey(key, i)
                    subkey = winreg.OpenKey(key, subkey_name)
                    
                    try:
                        name = winreg.QueryValueEx(subkey, "DisplayName")[0]
                        version = winreg.QueryValueEx(subkey, "DisplayVersion")[0]
                        publisher = winreg.QueryValueEx(subkey, "Publisher")[0]
                    except FileNotFoundError:
                        continue
                        
                    software_list.append({
                        "name": name,
                        "version": version or "Unknown",
                        "publisher": publisher or "Unknown"
                    })
                except Exception:
                    continue
        except OSError:
            continue

    # De-duplicate software items by name
    unique_software = {}
    for sw in software_list:
        unique_software[sw["name"]] = sw
        
    return sorted(list(unique_software.values()), key=lambda x: x["name"])

def get_startup_applications(permission_granted: bool) -> List[Dict[str, Any]]:
    """Scans startup registry paths for persistent applications."""
    if not permission_granted:
        return [{"status": "disabled", "error": "This feature is currently disabled. Please enable Startup Programs permission from Privacy Settings."}]

    startup = []
    registry_paths = [
        (winreg.HKEY_LOCAL_MACHINE, r"SOFTWARE\Microsoft\Windows\CurrentVersion\Run"),
        (winreg.HKEY_CURRENT_USER, r"SOFTWARE\Microsoft\Windows\CurrentVersion\Run")
    ]

    for hive, path in registry_paths:
        try:
            key = winreg.OpenKey(hive, path)
            for i in range(winreg.QueryInfoKey(key)[1]):
                try:
                    name, value, _ = winreg.EnumValue(key, i)
                    startup.append({
                        "name": name,
                        "command": value,
                        "location": "HKLM" if hive == winreg.HKEY_LOCAL_MACHINE else "HKCU"
                    })
                except OSError:
                    break
        except OSError:
            continue
            
    return startup

def get_usb_devices(permission_granted: bool) -> List[Dict[str, Any]]:
    """Queries WMI to trace connected USB controllers and storage devices."""
    if not permission_granted:
        return [{"status": "disabled", "error": "This feature is currently disabled. Please enable USB Monitoring permission from Privacy Settings."}]

    devices = []
    try:
        import wmi
        c = wmi.WMI()
        # Find all USB controller device associations
        for disk in c.Win32_PnPEntity(ConfigManagerErrorCode=0):
            name = disk.Name or ""
            device_id = disk.DeviceID or ""
            if "USB" in name or "USB" in device_id or "Storage" in name:
                devices.append({
                    "name": name,
                    "device_id": device_id,
                    "status": "Active"
                })
    except Exception as e:
        logger.warning(f"WMI USB check failed ({e}). Falling back to active disk partitions.")
        # Fallback to active partitions list
        for part in psutil.disk_partitions(all=True):
            if 'removable' in part.opts or part.fstype == '':
                devices.append({
                    "name": f"Removable Volume ({part.device})",
                    "device_id": part.mountpoint,
                    "status": "Active"
                })
                
    return devices

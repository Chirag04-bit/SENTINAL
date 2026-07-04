# ─── SENTINEL Network Telemetry Service ────────────────────────────────────────
import logging
import psutil
from typing import Dict, Any, List

logger = logging.getLogger("SENTINEL.NetworkMonitor")

# Try to import scapy for raw packet sniffing
try:
    from scapy.all import sniff, IP, TCP, UDP
    SCAPY_AVAILABLE = True
except ImportError:
    SCAPY_AVAILABLE = False

def get_live_packets(permission_granted: bool) -> List[Dict[str, Any]]:
    """Sniffs live local network packets if permission is granted."""
    if not permission_granted:
        return [{"status": "disabled", "error": "This feature is currently disabled. Please enable Network Monitoring permission from Privacy Settings."}]

    packets_list = []
    
    if SCAPY_AVAILABLE:
        try:
            # Sniff up to 10 packets with a brief timeout to prevent blocking
            scapy_packets = sniff(count=10, timeout=0.8)
            for pkt in scapy_packets:
                if IP in pkt:
                    proto = "TCP" if TCP in pkt else "UDP" if UDP in pkt else "IP"
                    sport = pkt.sport if (TCP in pkt or UDP in pkt) else 0
                    dport = pkt.dport if (TCP in pkt or UDP in pkt) else 0
                    
                    # Compute a simple heuristic threat score
                    threat_score = 5
                    if dport in [22, 23, 445, 3389]:  # Common target ports
                        threat_score = 45
                        
                    packets_list.append({
                        "protocol": proto,
                        "src_ip": pkt[IP].src,
                        "dst_ip": pkt[IP].dst,
                        "src_port": sport,
                        "dst_port": dport,
                        "length": len(pkt),
                        "threat_score": threat_score
                    })
        except Exception as e:
            logger.warning(f"Scapy sniffing failed ({e}). Falling back to active socket telemetry.")
            
    # Fallback to active system connection sockets if scapy is unavailable or fails
    if not packets_list:
        try:
            connections = psutil.net_connections(kind='inet')
            for conn in connections[:12]:  # Limit to 12 connections for UI performance
                if conn.raddr:
                    proto = "TCP" if conn.type == 1 else "UDP"
                    dport = conn.raddr.port
                    
                    # Simple threat heuristics
                    threat_score = 10
                    if dport in [22, 23, 445, 3389]:
                        threat_score = 55
                        
                    packets_list.append({
                        "protocol": proto,
                        "src_ip": conn.laddr.ip,
                        "dst_ip": conn.raddr.ip,
                        "src_port": conn.laddr.port,
                        "dst_port": dport,
                        "length": 0,  # Length not accessible via netstat
                        "threat_score": threat_score
                    })
        except Exception as e:
            logger.error(f"Network fallback connection check failed ({e})")
            
    return packets_list

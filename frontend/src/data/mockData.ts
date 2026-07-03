// ─── SENTINEL Mock Data Engine ───────────────────────────────────────────────
// Realistic fake data used until the ML backend is connected.
// Replace only the API calls in services/api.ts when backend is ready.

import type {
  User, Alert, SentinelEvent, DashboardStats, AlertTrendPoint,
  RiskDistribution, ThreatTypeCount, ThreatMapPoint, Report,
  Notification, ActivityItem, RiskScoreData,
} from '../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
const hoursAgo = (h: number) => new Date(Date.now() - h * 3600000).toISOString();
const daysAgo  = (d: number) => new Date(Date.now() - d * 86400000).toISOString();

const LOCATIONS = [
  { city: 'Mumbai',        country: 'India',          code: 'IN', lat: 19.076,  lng: 72.877  },
  { city: 'Delhi',         country: 'India',          code: 'IN', lat: 28.613,  lng: 77.209  },
  { city: 'Lagos',         country: 'Nigeria',        code: 'NG', lat: 6.524,   lng: 3.379   },
  { city: 'Moscow',        country: 'Russia',         code: 'RU', lat: 55.755,  lng: 37.617  },
  { city: 'Beijing',       country: 'China',          code: 'CN', lat: 39.904,  lng: 116.407 },
  { city: 'São Paulo',     country: 'Brazil',         code: 'BR', lat: -23.550, lng: -46.633 },
  { city: 'London',        country: 'United Kingdom', code: 'GB', lat: 51.507,  lng: -0.127  },
  { city: 'New York',      country: 'United States',  code: 'US', lat: 40.712,  lng: -74.005 },
  { city: 'Nairobi',       country: 'Kenya',          code: 'KE', lat: -1.286,  lng: 36.820  },
  { city: 'Bucharest',     country: 'Romania',        code: 'RO', lat: 44.426,  lng: 26.103  },
  { city: 'Bangalore',     country: 'India',          code: 'IN', lat: 12.971,  lng: 77.594  },
  { city: 'Jakarta',       country: 'Indonesia',      code: 'ID', lat: -6.208,  lng: 106.845 },
];
const DEVICES   = ['Chrome / Windows 11','Safari / macOS','Firefox / Linux','Unknown Android Device','Unknown iOS Device','Edge / Windows 10','Opera / Ubuntu','Unknown Device'];
const IPS       = ['192.168.1.','45.33.32.','198.51.100.','203.0.113.','172.16.0.','10.0.0.','185.220.101.','91.108.4.'];
const USER_NAMES = ['Aryan Sharma','Priya Patel','Rohan Mehta','Ananya Singh','Vikram Nair','Neha Gupta','Rahul Verma','Pooja Iyer','Aditya Kumar','Kavya Reddy','Siddharth Joshi','Divya Kapoor','Amit Tiwari','Shreya Bose','Karan Malhotra'];

const fakeIP   = () => pick(IPS) + rand(1, 254);
const fakeLoc  = () => pick(LOCATIONS);

// ─── Users (50) ───────────────────────────────────────────────────────────────
export const MOCK_USERS: User[] = USER_NAMES.map((name, i) => {
  const score = rand(0, 100);
  const level = score < 31 ? 'low' : score < 61 ? 'medium' : score < 81 ? 'high' : 'critical';
  const loc   = fakeLoc();
  return {
    id:          `USR-${String(i + 1).padStart(4, '0')}`,
    name,
    email:       name.toLowerCase().replace(' ', '.') + '@email.com',
    role:        i === 0 ? 'admin' : i < 3 ? 'analyst' : 'user',
    riskScore:   score,
    riskLevel:   level as any,
    isActive:    Math.random() > 0.2,
    lastLogin:   hoursAgo(rand(0, 48)),
    location:    `${loc.city}, ${loc.country}`,
    device:      pick(DEVICES),
    joinedAt:    daysAgo(rand(30, 365)),
    totalAlerts: rand(0, 25),
    openAlerts:  rand(0, 8),
  };
});

// ─── Alerts (100) ─────────────────────────────────────────────────────────────
const ALERT_TEMPLATES = [
  {
    title: 'High Risk Login Detected',
    type: 'login' as const,
    reasons: ['Unknown device used','Login from new country','Login at unusual hour (3 AM)','3 failed attempts before success'],
    action: 'Verify account identity before allowing further access.',
    shap: [
      { feature: 'unknown_device',    label: 'Unknown Device',       value:  0.31, displayValue: 'Never seen before' },
      { feature: 'location_mismatch', label: 'New Location',         value:  0.28, displayValue: 'Lagos, Nigeria' },
      { feature: 'hour_of_day',       label: 'Unusual Login Hour',   value:  0.19, displayValue: '3:14 AM' },
      { feature: 'failed_attempts',   label: 'Failed Login Attempts',value:  0.14, displayValue: '3 failures' },
    ],
  },
  {
    title: 'Suspicious Transaction Flagged',
    type: 'transaction' as const,
    reasons: ['Transaction amount far exceeds user average','New payment method detected','Foreign currency transaction'],
    action: 'Block transaction and request identity verification.',
    shap: [
      { feature: 'amount_ratio',       label: 'Amount vs Average',    value:  0.42, displayValue: '18× above average' },
      { feature: 'new_payment_method', label: 'New Payment Method',   value:  0.24, displayValue: 'First-time use' },
      { feature: 'foreign_currency',   label: 'Foreign Currency',     value:  0.18, displayValue: 'USD → NGN' },
      { feature: 'merchant_category',  label: 'Merchant Category',    value: -0.06, displayValue: 'Electronics' },
    ],
  },
  {
    title: 'Network Intrusion Attempt',
    type: 'intrusion' as const,
    reasons: ['Port scan detected on multiple ports','High SYN error rate (88%)','Rapid connection attempts from single IP'],
    action: 'Block source IP and escalate to network team.',
    shap: [
      { feature: 'serror_rate',  label: 'SYN Error Rate',  value:  0.45, displayValue: '88%' },
      { feature: 'count',        label: 'Connection Count', value:  0.32, displayValue: '512 in 2s' },
      { feature: 'src_bytes',    label: 'Source Bytes',    value:  0.18, displayValue: '2.4 MB' },
      { feature: 'protocol',     label: 'Protocol',        value:  0.09, displayValue: 'TCP' },
    ],
  },
  {
    title: 'Impossible Travel Detected',
    type: 'fraud' as const,
    reasons: ['Login from India at 8:00 PM','Login from USA at 8:45 PM — physically impossible','45 minutes between logins, 13,000 km apart'],
    action: 'Temporarily suspend session and verify user identity.',
    shap: [
      { feature: 'impossible_travel', label: 'Impossible Travel', value:  0.55, displayValue: '13,000 km in 45min' },
      { feature: 'location_delta',    label: 'Location Delta',    value:  0.28, displayValue: 'India → USA' },
      { feature: 'time_delta',        label: 'Time Between Logins',value: 0.12, displayValue: '45 minutes' },
      { feature: 'session_count',     label: 'Active Sessions',   value:  0.07, displayValue: '2 simultaneous' },
    ],
  },
  {
    title: 'Multiple Rapid Transactions',
    type: 'transaction' as const,
    reasons: ['7 transactions within 3 minutes','All transactions to different merchants','Pattern consistent with card testing attack'],
    action: 'Freeze card temporarily and notify card holder.',
    shap: [
      { feature: 'txn_velocity',   label: 'Transaction Velocity', value:  0.38, displayValue: '7 in 3 minutes' },
      { feature: 'merchant_count', label: 'Unique Merchants',     value:  0.29, displayValue: '7 different' },
      { feature: 'amount_pattern', label: 'Small Amounts',        value:  0.21, displayValue: '₹1–₹50 each' },
      { feature: 'time_of_day',    label: 'Time of Day',          value:  0.08, displayValue: '2:30 AM' },
    ],
  },
];

export const MOCK_ALERTS: Alert[] = Array.from({ length: 100 }, (_, i) => {
  const template  = pick(ALERT_TEMPLATES);
  const user      = pick(MOCK_USERS);
  const loc       = fakeLoc();
  const score     = rand(35, 99);
  const level     = score < 61 ? 'medium' : score < 81 ? 'high' : 'critical';
  const statuses  = ['open', 'open', 'open', 'resolved', 'dismissed'];
  return {
    id:               `ALT-2026-${String(i + 1).padStart(5, '0')}`,
    userId:           user.id,
    userName:         user.name,
    userEmail:        user.email,
    eventId:          `EVT-${String(i + 1).padStart(5, '0')}`,
    title:            template.title,
    description:      `Anomalous activity detected for user ${user.name}. Immediate review recommended.`,
    type:             template.type,
    severity:         level as any,
    riskScore:        score,
    confidenceScore:  rand(78, 99),
    reasons:          template.reasons,
    recommendedAction:template.action,
    status:           pick(statuses) as any,
    timestamp:        hoursAgo(rand(0, 168)),
    ipAddress:        fakeIP(),
    device:           pick(DEVICES),
    location:         `${loc.city}, ${loc.country}`,
    country:          loc.country,
    amount:           template.type === 'transaction' ? rand(500, 150000) : undefined,
    shapFactors:      template.shap,
  };
});

// ─── Events (200) ─────────────────────────────────────────────────────────────
export const MOCK_EVENTS: SentinelEvent[] = Array.from({ length: 200 }, (_, i) => {
  const user    = pick(MOCK_USERS);
  const loc     = fakeLoc();
  const score   = rand(0, 100);
  const types   = ['fraud','intrusion','login','transaction','system'] as const;
  return {
    id:          `EVT-${String(i + 1).padStart(5, '0')}`,
    userId:      user.id,
    userName:    user.name,
    type:        pick(types),
    source:      pick(['web','mobile','api','internal']),
    amount:      Math.random() > 0.5 ? rand(100, 200000) : undefined,
    ipAddress:   fakeIP(),
    device:      pick(DEVICES),
    location:    `${loc.city}, ${loc.country}`,
    country:     loc.country,
    countryCode: loc.code,
    latitude:    loc.lat,
    longitude:   loc.lng,
    timestamp:   hoursAgo(rand(0, 720)),
    status:      score > 70 ? 'flagged' : score > 40 ? 'suspicious' : 'normal',
    riskScore:   score,
  };
});

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
export const MOCK_STATS: DashboardStats = {
  totalEvents:      MOCK_EVENTS.length,
  totalAlerts:      MOCK_ALERTS.length,
  openAlerts:       MOCK_ALERTS.filter(a => a.status === 'open').length,
  criticalAlerts:   MOCK_ALERTS.filter(a => a.severity === 'critical').length,
  totalUsers:       MOCK_USERS.length,
  activeUsers:      MOCK_USERS.filter(u => u.isActive).length,
  flaggedUsers:     MOCK_USERS.filter(u => u.riskLevel === 'high' || u.riskLevel === 'critical').length,
  safeUsers:        MOCK_USERS.filter(u => u.riskLevel === 'low').length,
  systemHealth:     94,
  modelConfidence:  91,
  eventsPerMinute:  rand(8, 24),
  resolvedToday:    rand(12, 40),
};

// ─── Alert Trend (30 days) ────────────────────────────────────────────────────
export const MOCK_ALERT_TREND: AlertTrendPoint[] = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(); d.setDate(d.getDate() - (29 - i));
  const label = d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
  const low = rand(5, 25), medium = rand(3, 18), high = rand(1, 12), critical = rand(0, 5);
  return { date: label, low, medium, high, critical, total: low + medium + high + critical };
});

// ─── Hourly Activity (last 7 days × 24 hours) ─────────────────────────────────
const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
export const MOCK_HOURLY = DAYS.flatMap(day =>
  Array.from({ length: 24 }, (_, hour) => ({
    day, hour,
    value: (hour >= 2 && hour <= 5) ? rand(15, 45) :
           (hour >= 9 && hour <= 17) ? rand(2, 15) : rand(5, 25),
  }))
);

// ─── Risk Distribution ────────────────────────────────────────────────────────
export const MOCK_RISK_DIST: RiskDistribution[] = [
  { name: 'Low',      value: MOCK_USERS.filter(u => u.riskLevel === 'low').length,      color: '#10B981' },
  { name: 'Medium',   value: MOCK_USERS.filter(u => u.riskLevel === 'medium').length,   color: '#F59E0B' },
  { name: 'High',     value: MOCK_USERS.filter(u => u.riskLevel === 'high').length,     color: '#F97316' },
  { name: 'Critical', value: MOCK_USERS.filter(u => u.riskLevel === 'critical').length, color: '#EF4444' },
];

// ─── Threat Types ──────────────────────────────────────────────────────────────
export const MOCK_THREAT_TYPES: ThreatTypeCount[] = [
  { name: 'Card Fraud',         count: 38, percentage: 38 },
  { name: 'Brute Force',        count: 22, percentage: 22 },
  { name: 'Account Takeover',   count: 18, percentage: 18 },
  { name: 'Network Intrusion',  count: 12, percentage: 12 },
  { name: 'Phishing',           count:  7, percentage:  7 },
  { name: 'Data Exfiltration',  count:  3, percentage:  3 },
];

// ─── Threat Map ────────────────────────────────────────────────────────────────
export const MOCK_THREAT_MAP: ThreatMapPoint[] = LOCATIONS.map((loc, i) => ({
  id:       `TMP-${i}`,
  lat:      loc.lat + (Math.random() - 0.5) * 2,
  lng:      loc.lng + (Math.random() - 0.5) * 2,
  country:  loc.country,
  city:     loc.city,
  count:    rand(2, 45),
  severity: pick(['low','medium','high','critical']) as any,
}));

// ─── Reports ──────────────────────────────────────────────────────────────────
export const MOCK_REPORTS: Report[] = [
  { id:'RPT-001', title:'Daily Security Report', type:'daily',   dateFrom:daysAgo(1),  dateTo:daysAgo(0),   generatedAt:hoursAgo(2),  generatedBy:'System',        format:'pdf', totalAlerts:18, criticalAlerts:3,  summary:'18 alerts detected. 3 critical threats resolved. System health at 94%.' },
  { id:'RPT-002', title:'Weekly Threat Summary',  type:'weekly',  dateFrom:daysAgo(7),  dateTo:daysAgo(0),   generatedAt:daysAgo(1),   generatedBy:'Admin',         format:'pdf', totalAlerts:87, criticalAlerts:12, summary:'87 alerts this week. Spike in brute-force attempts on Wednesday.' },
  { id:'RPT-003', title:'Monthly Analytics',      type:'monthly', dateFrom:daysAgo(30), dateTo:daysAgo(0),   generatedAt:daysAgo(5),   generatedBy:'Admin',         format:'csv', totalAlerts:312,criticalAlerts:41, summary:'Card fraud increased 23% vs last month. Intrusion attempts stable.' },
  { id:'RPT-004', title:'Fraud Analysis Q2',      type:'custom',  dateFrom:daysAgo(90), dateTo:daysAgo(30),  generatedAt:daysAgo(28),  generatedBy:'Aryan Sharma',  format:'pdf', totalAlerts:891,criticalAlerts:98, summary:'Q2 fraud patterns analyzed. Peak hours 2–4 AM. Nigeria, Russia top sources.' },
];

// ─── Notifications ────────────────────────────────────────────────────────────
export const MOCK_NOTIFICATIONS: Notification[] = [
  { id:'N1', title:'Critical Alert', message:'High-risk login detected for Priya Patel.', type:'alert',   isRead:false, timestamp:hoursAgo(0.5) },
  { id:'N2', title:'New Report Ready', message:'Weekly threat summary is available for download.', type:'info', isRead:false, timestamp:hoursAgo(2) },
  { id:'N3', title:'Alert Resolved', message:'Alert ALT-2026-00042 has been resolved.', type:'success', isRead:true,  timestamp:hoursAgo(4) },
  { id:'N4', title:'System Warning', message:'Model confidence dropped to 78% — retraining recommended.', type:'warning', isRead:false, timestamp:hoursAgo(8) },
  { id:'N5', title:'Intrusion Blocked', message:'Port scan from 185.220.101.47 blocked automatically.', type:'alert', isRead:true, timestamp:hoursAgo(12) },
];

// ─── Current User Risk Score ───────────────────────────────────────────────────
export const MOCK_MY_RISK: RiskScoreData = {
  score:  24,
  level:  'low',
  factors: [
    { name:'Device Trust',        weight:0.20, signal:false, description:'Using a known, trusted device' },
    { name:'Location Check',      weight:0.20, signal:false, description:'Login from your usual location' },
    { name:'Login Time',          weight:0.10, signal:false, description:'Login at normal business hours' },
    { name:'Transaction Amount',  weight:0.15, signal:false, description:'Amounts within normal range' },
    { name:'Transaction Velocity',weight:0.10, signal:false, description:'Normal transaction frequency' },
    { name:'Failed Logins',       weight:0.10, signal:false, description:'No failed login attempts' },
    { name:'Impossible Travel',   weight:0.15, signal:false, description:'No impossible travel detected' },
  ],
  trend: [18, 22, 19, 24, 21, 20, 24],
  updatedAt: new Date().toISOString(),
};

// ─── Activity Timeline (current user) ─────────────────────────────────────────
export const MOCK_MY_ACTIVITY: ActivityItem[] = [
  { id:'A1', action:'Login',               detail:'Chrome · Mumbai, India',            timestamp:hoursAgo(0.5),  type:'login',       riskLevel:'low',    icon:'🔑' },
  { id:'A2', action:'Transaction ₹2,400',  detail:'Swiggy · Food Delivery',            timestamp:hoursAgo(2),    type:'transaction', riskLevel:'low',    icon:'💳' },
  { id:'A3', action:'Transaction ₹850',    detail:'Amazon · Electronics',              timestamp:hoursAgo(6),    type:'transaction', riskLevel:'low',    icon:'💳' },
  { id:'A4', action:'Login',               detail:'Safari · Bangalore, India',         timestamp:hoursAgo(24),   type:'login',       riskLevel:'low',    icon:'🔑' },
  { id:'A5', action:'Password Changed',    detail:'Security settings updated',         timestamp:hoursAgo(48),   type:'settings',    riskLevel:'low',    icon:'🔒' },
  { id:'A6', action:'Transaction ₹12,000', detail:'HDFC · Bank Transfer',             timestamp:hoursAgo(72),   type:'transaction', riskLevel:'medium', icon:'💳' },
  { id:'A7', action:'Login',               detail:'Chrome · Delhi, India',             timestamp:hoursAgo(96),   type:'login',       riskLevel:'low',    icon:'🔑' },
];

// ─── Live stream simulation ────────────────────────────────────────────────────
export const generateLiveEvent = (): SentinelEvent => {
  const user  = pick(MOCK_USERS);
  const loc   = fakeLoc();
  const score = rand(0, 100);
  const types = ['fraud','intrusion','login','transaction','system'] as const;
  return {
    id:          `EVT-LIVE-${Date.now()}`,
    userId:      user.id,
    userName:    user.name,
    type:        pick(types),
    source:      pick(['web','mobile','api']),
    amount:      Math.random() > 0.6 ? rand(100, 100000) : undefined,
    ipAddress:   fakeIP(),
    device:      pick(DEVICES),
    location:    `${loc.city}, ${loc.country}`,
    country:     loc.country,
    countryCode: loc.code,
    latitude:    loc.lat,
    longitude:   loc.lng,
    timestamp:   new Date().toISOString(),
    status:      score > 70 ? 'flagged' : score > 40 ? 'suspicious' : 'normal',
    riskScore:   score,
  };
};

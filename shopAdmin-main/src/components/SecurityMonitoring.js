import { useState } from 'react';
import { AlertTriangle, Shield, Lock, TrendingUp, Activity, Zap, Eye, EyeOff } from 'react-feather';

const SecurityMonitoring = () => {
  const [showDetails, setShowDetails] = useState({});

  const threatAlerts = [
    { id: 1, type: 'Brute Force Attack', severity: 'High', source: '192.168.1.100', time: '5 mins ago', status: 'Blocked', affected: 'LoginService' },
    { id: 2, type: 'Suspicious API Usage', severity: 'Medium', source: '203.0.113.45', time: '12 mins ago', status: 'Investigating', affected: 'APIGateway' },
    { id: 3, type: 'SQL Injection Attempt', severity: 'High', source: '198.51.100.20', time: '23 mins ago', status: 'Blocked', affected: 'Database' },
    { id: 4, type: 'DDoS Activity', severity: 'Critical', source: 'Multiple', time: '1 hour ago', status: 'Mitigated', affected: 'CDN' },
    { id: 5, type: 'Unauthorized Access', severity: 'Medium', source: '192.0.2.80', time: '2 hours ago', status: 'Resolved', affected: 'AdminPanel' }
  ];

  const securityMetrics = [
    { label: 'System Uptime', value: '99.98%', target: '99.99%', trend: '+0.02%', icon: TrendingUp, color: 'from-emerald-500 to-teal-500' },
    { label: 'Threats Blocked', value: '2,847', trend: '+12 today', icon: Shield, color: 'from-blue-500 to-cyan-500' },
    { label: 'Active Sessions', value: '2,340', trend: '+8%', icon: Activity, color: 'from-purple-500 to-pink-500' },
    { label: 'Encryption Level', value: 'AES-256', status: 'Active', icon: Lock, color: 'from-green-500 to-emerald-500' }
  ];

  const auditLogs = [
    { id: 1, user: 'admin@devsolution.com', action: 'User Created', resource: 'UserManagement', timestamp: '2026-05-27 14:32:15', status: 'Success', ip: '203.0.113.1' },
    { id: 2, user: 'super_admin', action: 'Enterprise Suspended', resource: 'EnterpriseControl', timestamp: '2026-05-27 14:28:42', status: 'Success', ip: '203.0.113.1' },
    { id: 3, user: 'security_bot', action: 'Threat Detected', resource: 'SecurityCenter', timestamp: '2026-05-27 14:15:28', status: 'Blocked', ip: '198.51.100.20' },
    { id: 4, user: 'admin@devsolution.com', action: 'Permission Updated', resource: 'RoleManagement', timestamp: '2026-05-27 13:45:10', status: 'Success', ip: '203.0.113.1' },
    { id: 5, user: 'backup_service', action: 'Database Backup', resource: 'BackupManager', timestamp: '2026-05-27 13:00:00', status: 'Success', ip: '10.0.0.1' }
  ];

  const systemSecurity = [
    { check: 'SSL/TLS Certificate', status: 'Valid', validity: 'Until 2027-05-27', icon: Lock },
    { check: 'Firewall Status', status: 'Active', ips: '450+ blocked today', icon: Shield },
    { check: 'Backup Status', status: 'Healthy', lastBackup: '2 hours ago', icon: Activity },
    { check: 'Intrusion Detection', status: 'Monitoring', alerts: '12 today', icon: Zap },
  ];

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'Critical': return 'from-red-500 to-rose-500';
      case 'High': return 'from-orange-500 to-red-500';
      case 'Medium': return 'from-yellow-500 to-orange-500';
      default: return 'from-blue-500 to-cyan-500';
    }
  };

  const getSeverityBadgeColor = (severity) => {
    switch(severity) {
      case 'Critical': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'High': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default: return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    }
  };

  const MetricCard = ({ icon: Icon, label, value, subtext, color }) => (
    <div className={`rounded-2xl backdrop-blur-md bg-gradient-to-br ${color} bg-opacity-10 p-6 border border-white/10 hover:border-white/20 transition-all`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-white/70 uppercase tracking-wider">{label}</p>
          <p className="mt-3 text-3xl font-bold text-white">{value}</p>
          {subtext && <p className="mt-2 text-xs text-white/60">{subtext}</p>}
        </div>
        <div className={`rounded-xl p-3 bg-gradient-to-br ${color} bg-opacity-20`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl backdrop-blur-md bg-gradient-to-br from-slate-900/50 to-slate-800/50 p-8 border border-white/10">
        <h2 className="text-3xl font-bold text-white">Security & Monitoring</h2>
        <p className="mt-2 text-white/60">AI-powered threat detection, real-time monitoring, and security analytics</p>
      </div>

      {/* Security Metrics */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {securityMetrics.map((metric, idx) => (
          <MetricCard 
            key={idx}
            icon={metric.icon}
            label={metric.label}
            value={metric.value}
            subtext={metric.trend || metric.status}
            color={metric.color}
          />
        ))}
      </div>

      {/* Critical Threats */}
      <div className="rounded-3xl backdrop-blur-md bg-gradient-to-br from-slate-900/50 to-slate-800/50 p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-400" size={24} />
            <h3 className="text-xl font-bold text-white">Threat Alerts (Real-Time)</h3>
          </div>
          <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-sm font-medium border border-red-500/30">
            {threatAlerts.length} Active
          </span>
        </div>

        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {threatAlerts.map((alert) => (
            <div 
              key={alert.id}
              className={`rounded-2xl backdrop-blur-md bg-gradient-to-br ${getSeverityColor(alert.severity)} bg-opacity-10 p-4 border border-white/10 hover:border-white/20 transition-all cursor-pointer`}
              onClick={() => setShowDetails({ ...showDetails, [alert.id]: !showDetails[alert.id] })}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${getSeverityBadgeColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                    <h4 className="text-white font-bold">{alert.type}</h4>
                  </div>
                  <p className="text-sm text-white/70">Source: <span className="font-mono text-white/90">{alert.source}</span></p>
                  <p className="text-xs text-white/60 mt-1">{alert.time}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                    alert.status === 'Blocked' ? 'bg-emerald-500/20 text-emerald-300' :
                    alert.status === 'Mitigated' ? 'bg-blue-500/20 text-blue-300' :
                    alert.status === 'Resolved' ? 'bg-green-500/20 text-green-300' :
                    'bg-yellow-500/20 text-yellow-300'
                  } border border-white/20`}>
                    {alert.status}
                  </span>
                  <button onClick={() => setShowDetails({ ...showDetails, [alert.id]: !showDetails[alert.id] })}>
                    {showDetails[alert.id] ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {showDetails[alert.id] && (
                <div className="mt-4 pt-4 border-t border-white/10 space-y-2 text-sm text-white/70">
                  <p><span className="text-white font-medium">Affected Service:</span> {alert.affected}</p>
                  <p><span className="text-white font-medium">Detection Time:</span> {alert.time}</p>
                  <p><span className="text-white font-medium">Response Action:</span> {alert.status}</p>
                  <p><span className="text-white font-medium">Recommendation:</span> Monitor for repeated attempts from same source IP</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* System Security Status */}
      <div className="rounded-3xl backdrop-blur-md bg-gradient-to-br from-slate-900/50 to-slate-800/50 p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-6">System Security Status</h3>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {systemSecurity.map((item) => (
            <div key={item.check} className="rounded-2xl bg-white/5 border border-white/10 p-4 hover:border-white/20 transition-all">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-bold">{item.check}</h4>
                <item.icon size={20} className="text-emerald-400" />
              </div>
              <p className="text-emerald-400 font-medium">{item.status}</p>
              <p className="text-xs text-white/60 mt-2">{item.validity || item.ips || item.lastBackup || item.alerts}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Logs */}
      <div className="rounded-3xl backdrop-blur-md bg-gradient-to-br from-slate-900/50 to-slate-800/50 p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-6">Audit Logs</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-4 px-4 text-white/70 font-semibold">User</th>
                <th className="text-left py-4 px-4 text-white/70 font-semibold">Action</th>
                <th className="text-left py-4 px-4 text-white/70 font-semibold">Resource</th>
                <th className="text-left py-4 px-4 text-white/70 font-semibold">Timestamp</th>
                <th className="text-left py-4 px-4 text-white/70 font-semibold">Status</th>
                <th className="text-left py-4 px-4 text-white/70 font-semibold">IP Address</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id} className="border-b border-white/10 hover:bg-white/5 transition-all">
                  <td className="py-4 px-4 text-white/80">{log.user}</td>
                  <td className="py-4 px-4 text-white font-medium">{log.action}</td>
                  <td className="py-4 px-4 text-white/70">{log.resource}</td>
                  <td className="py-4 px-4 text-white/70 text-xs font-mono">{log.timestamp}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      log.status === 'Success' ? 'bg-emerald-500/20 text-emerald-300' :
                      'bg-rose-500/20 text-rose-300'
                    } border border-white/20`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-white/70 font-mono text-xs">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SecurityMonitoring;

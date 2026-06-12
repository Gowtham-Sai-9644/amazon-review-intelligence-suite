'use client';

import React, { useState, useEffect } from 'react';
import { getHealthCheck, HealthCheckResponse } from '../lib/api';
import { ShieldCheck, Activity, Database, Cpu } from 'lucide-react';

export default function DeploymentStatus() {
  const [status, setStatus] = useState<HealthCheckResponse & { loading: boolean; error: boolean }>({
    status: 'offline',
    model_loaded: false,
    database_connected: false,
    loading: true,
    error: false,
  });

  useEffect(() => {
    let active = true;
    const checkStatus = async () => {
      try {
        const res = await getHealthCheck();
        if (active) {
          setStatus({
            status: res.status,
            model_loaded: res.model_loaded,
            database_connected: res.database_connected,
            loading: false,
            error: false,
          });
        }
      } catch (err) {
        if (active) {
          setStatus({
            status: 'offline',
            model_loaded: false,
            database_connected: false,
            loading: false,
            error: true,
          });
        }
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30s
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const dotColor = (online: boolean) => (online ? 'bg-emerald-400' : 'bg-rose-400');
  const pingAnim = (online: boolean) => (online ? 'animate-ping bg-emerald-400' : 'bg-rose-400');
  const textColor = (online: boolean) => (online ? 'text-white/80' : 'text-rose-400/80');

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 py-3 px-5 glass rounded-full text-[10px] sm:text-xs font-mono border border-white/[0.04] bg-white/[0.01]">
      <div className="flex items-center gap-2">
        <Activity className="w-3.5 h-3.5 text-blue-400" />
        <span className="text-white/40 uppercase font-semibold">System Status:</span>
      </div>

      {/* Frontend */}
      <div className="flex items-center gap-2">
        <span className="relative flex h-1.5 w-1.5">
          <span className={`${pingAnim(true)} absolute inline-flex h-full w-full rounded-full opacity-75`} />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
        </span>
        <span className="text-white/80">Frontend: <span className="font-semibold text-emerald-400">Online</span></span>
      </div>

      {/* Divider */}
      <span className="hidden sm:inline w-px h-3 bg-white/10" />

      {/* Backend */}
      <div className="flex items-center gap-2">
        <span className="relative flex h-1.5 w-1.5">
          <span className={`${status.error ? '' : pingAnim(status.status === 'healthy')} absolute inline-flex h-full w-full rounded-full opacity-75`} />
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${status.status === 'healthy' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
        </span>
        <span className={textColor(status.status === 'healthy')}>
          Backend: <span className="font-semibold">{status.status === 'healthy' ? 'Online' : 'Offline'}</span>
        </span>
      </div>

      {/* Divider */}
      <span className="hidden sm:inline w-px h-3 bg-white/10" />

      {/* Model Status */}
      <div className="flex items-center gap-2">
        <Cpu className={`w-3 h-3 ${status.model_loaded ? 'text-indigo-400' : 'text-white/20'}`} />
        <span className={textColor(status.model_loaded)}>
          Model: <span className="font-semibold">{status.model_loaded ? 'Loaded (v1.0)' : 'Not Loaded'}</span>
        </span>
      </div>

      {/* Divider */}
      <span className="hidden sm:inline w-px h-3 bg-white/10" />

      {/* Database Connection */}
      <div className="flex items-center gap-2">
        <Database className={`w-3 h-3 ${status.database_connected ? 'text-cyan-400' : 'text-white/20'}`} />
        <span className={textColor(status.database_connected)}>
          DB: <span className="font-semibold">{status.database_connected ? 'Connected' : 'Disconnected'}</span>
        </span>
      </div>
    </div>
  );
}

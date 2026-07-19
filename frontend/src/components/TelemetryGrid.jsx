import React from 'react';

function TelemetryGrid({ telemetry, loading }) {
    return (
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>

            {/* PostgreSQL Health Card */}
            <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.5)' }}>
                <h3 style={{ margin: '0 0 1rem 0', color: '#f8fafc' }}>PostgreSQL Cluster Target</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Status:</span>
                    <span style={{ color: telemetry?.database_status === 'HEALTHY' ? '#4ade80' : '#ef4444', fontWeight: 'bold' }}>
                        {loading ? 'CHECKING...' : telemetry?.database_status || 'OFFLINE'}
                    </span>
                </div>
                <div style={{ marginTop: '1rem', borderTop: '1px solid #334155', paddingTop: '1rem' }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8' }}>Active System Sessions</p>
                    <h2 style={{ margin: '5px 0 0 0', color: '#38bdf8' }}>{loading ? '--' : telemetry?.active_connections}</h2>
                </div>
            </div>

            {/* Redis Cache Health Card */}
            <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.5)' }}>
                <h3 style={{ margin: '0 0 1rem 0', color: '#f8fafc' }}>Redis Guardrail Cache</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Status:</span>
                    <span style={{ color: telemetry?.cache_layer === 'CONNECTED' ? '#4ade80' : '#ef4444', fontWeight: 'bold' }}>
                        {loading ? 'CHECKING...' : telemetry?.cache_layer || 'OFFLINE'}
                    </span>
                </div>
                <div style={{ marginTop: '1rem', borderTop: '1px solid #334155', paddingTop: '1rem' }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8' }}>Cache Optimization Engine</p>
                    <h2 style={{ margin: '5px 0 0 0', color: '#a78bfa' }}>ACTIVE</h2>
                </div>
            </div>

        </section>
    );
}

export default TelemetryGrid;
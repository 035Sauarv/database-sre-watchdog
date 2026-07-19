import React, { useState, useEffect } from 'react';
import TelemetryGrid from './components/TelemetryGrid';
import TaskDispatcher from './components/TaskDispatcher';

function App() {
    const [telemetry, setTelemetry] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 🔐 Tracks the simulated logged-in role state
    const [userRole, setUserRole] = useState('Operator');

    const fetchData = async () => {
        try {
            const telemetryRes = await fetch('http://localhost:8000/telemetry');
            if (!telemetryRes.ok) throw new Error('Failed to fetch telemetry metrics');
            const telemetryData = await telemetryRes.json();
            setTelemetry(telemetryData);

            const tasksRes = await fetch('http://localhost:8000/tasks');
            if (!tasksRes.ok) throw new Error('Failed to fetch operational task index');
            const tasksData = await tasksRes.json();
            setTasks(tasksData);

            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        try {
            const response = await fetch('http://localhost:8000/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Role': userRole
                },
                body: JSON.stringify({ title: newTaskTitle }),
            });
            if (!response.ok) throw new Error('Could not insert new operation task. Check role permissions.');
            setNewTaskTitle('');
            fetchData();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleCompleteTask = async (id) => {
        try {
            const response = await fetch(`http://localhost:8000/tasks/${id}/complete`, {
                method: 'PUT',
                headers: { 'X-User-Role': userRole }
            });
            if (!response.ok) throw new Error('Could not complete task. Check role permissions.');
            fetchData();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteTask = async (id) => {
        try {
            const response = await fetch(`http://localhost:8000/tasks/${id}`, {
                method: 'DELETE',
                headers: { 'X-User-Role': userRole }
            });
            if (!response.ok) throw new Error('Could not delete task. Check role permissions.');
            fetchData();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div style={{ backgroundColor: '#0e1013', color: '#e2e8f0', minHeight: '100vh', fontFamily: 'sans-serif', padding: '2rem' }}>
            <header style={{ borderBottom: '1px solid #1e293b', paddingBottom: '1rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ color: '#38bdf8', margin: 0 }}>SRE Watchdog Control Engine</h1>
                    <p style={{ color: '#94a3b8', margin: '5px 0 0 0' }}>Live Infrastructure Sandbox Topology Console (Modular Mode)</p>
                </div>

                {/* 🔑 Role Selection Element Panel */}
                <div style={{ backgroundColor: '#1e293b', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid #334155' }}>
                    <label style={{ marginRight: '10px', fontWeight: 'bold', color: '#94a3b8', fontSize: '0.9rem' }}>Active Profile Identity: </label>
                    <select
                        value={userRole}
                        onChange={(e) => setUserRole(e.target.value)}
                        style={{ backgroundColor: '#0e1013', color: '#f8fafc', border: '1px solid #475569', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        <option value="Admin">Admin (Full Control)</option>
                        <option value="Operator">Operator (Write/Complete)</option>
                        <option value="Viewer">Viewer (Read-Only)</option>
                    </select>
                </div>
            </header>

            {error && (
                <div style={{ backgroundColor: '#7f1d1d', border: '1px solid #f87171', color: '#fca5a5', padding: '1rem', borderRadius: '6px', marginBottom: '2rem' }}>
                    <strong>Security Engine Feedback:</strong> {error}
                </div>
            )}

            <main>
                <TelemetryGrid telemetry={telemetry} loading={loading} />
                <TaskDispatcher
                    tasks={tasks}
                    newTaskTitle={newTaskTitle}
                    setNewTaskTitle={setNewTaskTitle}
                    handleCreateTask={handleCreateTask}
                    onCompleteTask={handleCompleteTask}
                    onDeleteTask={handleDeleteTask}
                    userRole={userRole}
                />
            </main>
        </div>
    );
}

export default App;
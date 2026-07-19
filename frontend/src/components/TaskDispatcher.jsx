import React from 'react';

function TaskDispatcher({ tasks, newTaskTitle, setNewTaskTitle, handleCreateTask, onCompleteTask, onDeleteTask, userRole = 'Operator' }) {
    const isReadOnly = userRole === 'Viewer';

    return (
        <section style={{ backgroundColor: '#1e293b', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.5)' }}>
            <h2 style={{ color: '#f8fafc', marginTop: 0, marginBottom: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem' }}>
                Operational Tasks Dispatcher
                <span style={{ fontSize: '0.9rem', color: '#38bdf8', marginLeft: '10px' }}>({userRole} View)</span>
            </h2>

            <form onSubmit={handleCreateTask} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <input
                    type="text"
                    disabled={isReadOnly}
                    placeholder={isReadOnly ? "Access Denied: Read-Only profile mode active..." : "Type a new production command..."}
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    style={{
                        flex: 1,
                        padding: '0.75rem 1rem',
                        borderRadius: '6px',
                        border: '1px solid #475569',
                        backgroundColor: isReadOnly ? '#1e293b' : '#0e1013',
                        color: isReadOnly ? '#64748b' : '#f8fafc',
                        fontSize: '1rem'
                    }}
                />
                <button
                    type="submit"
                    disabled={isReadOnly}
                    style={{
                        backgroundColor: isReadOnly ? '#475569' : '#38bdf8',
                        color: isReadOnly ? '#94a3b8' : '#0f172a',
                        border: 'none',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        cursor: isReadOnly ? 'not-allowed' : 'pointer',
                        fontSize: '1rem'
                    }}
                >
                    Dispatch Task
                </button>
            </form>

            <div>
                <h4 style={{ color: '#94a3b8', margin: '0 0 1rem 0' }}>Active Tasks Log ({tasks.length})</h4>
                {tasks.length === 0 ? (
                    <p style={{ color: '#64748b', fontStyle: 'italic', margin: 0 }}>No dispatched tasks found in the database.</p>
                ) : (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {tasks.map((task) => (
                            <li
                                key={task.id}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr auto',
                                    alignItems: 'center',
                                    backgroundColor: '#334155',
                                    padding: '1rem',
                                    borderRadius: '6px',
                                    marginBottom: '0.75rem',
                                    borderLeft: task.completed ? '4px solid #4ade80' : '4px solid #38bdf8',
                                    opacity: task.completed ? 0.6 : 1,
                                    gap: '1rem'
                                }}
                            >
                                <span style={{ fontSize: '1.05rem', color: '#f8fafc', textDecoration: task.completed ? 'line-through' : 'none', wordBreak: 'break-all' }}>
                                    {task.title}
                                </span>

                                {!isReadOnly ? (
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', minWidth: 'fit-content' }}>
                                        {!task.completed && (
                                            <button
                                                onClick={() => onCompleteTask(task.id)}
                                                style={{ backgroundColor: '#4ade80', color: '#0f172a', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
                                            >
                                                ✓ Complete
                                            </button>
                                        )}
                                        <button
                                            onClick={() => onDeleteTask(task.id)}
                                            style={{ backgroundColor: '#ef4444', color: '#ffffff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
                                        >
                                            ✕ Delete
                                        </button>
                                    </div>
                                ) : (
                                    <span style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic', paddingRight: '10px' }}>
                                        🔒 Locked
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
}

export default TaskDispatcher;
import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import api from '../../services/api';

export function TaskAssignModal({ student, onClose, onSuccess }) {
    const [task, setTask] = useState({ title: '', description: '', dueDate: '', assignedTo: student ? student._id : '' });
    const [loading, setLoading] = useState(false);
    const [students, setStudents] = useState([]);
    const [fetchingStudents, setFetchingStudents] = useState(false);

    useEffect(() => {
        if (!student) {
            fetchStudents();
        }
    }, [student]);

    const fetchStudents = async () => {
        setFetchingStudents(true);
        try {
            const res = await api.get('/admin/students');
            setStudents(res.data.data || []);
        } catch (error) {
            console.error('Failed to fetch students', error);
        } finally {
            setFetchingStudents(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!task.title || !task.assignedTo) return;
        setLoading(true);
        try {
            await api.post('/admin/tasks', task);
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to assign task:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl transform transition-all overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-xl font-bold text-gray-900">{student ? `Assign Task to ${student.firstName}` : 'Create New Task'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {!student && (
                        <Select
                            label="Assign To"
                            value={task.assignedTo}
                            onChange={(e) => setTask({ ...task, assignedTo: e.target.value })}
                            options={students.map(s => ({ value: s._id, label: `${s.firstName} ${s.lastName} (${s.email})` }))}
                            required
                            disabled={fetchingStudents}
                        />
                    )}
                    <Input
                        label="Task Title"
                        value={task.title}
                        onChange={(e) => setTask({ ...task, title: e.target.value })}
                        placeholder="e.g., Complete Mock Test 5"
                        required
                    />
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-y min-h-[80px]"
                            value={task.description}
                            onChange={(e) => setTask({ ...task, description: e.target.value })}
                            placeholder="Optional details..."
                        />
                    </div>
                    <Input
                        label="Due Date"
                        type="date"
                        value={task.dueDate}
                        onChange={(e) => setTask({ ...task, dueDate: e.target.value })}
                    />

                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit" variant="primary" loading={loading}>Assign Task</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

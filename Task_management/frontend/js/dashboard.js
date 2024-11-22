document.addEventListener('DOMContentLoaded', () => {
    if (isAuthenticated()) {
        loadDashboard();
    }
});
const welcome = document.getElementById("welcomeUser");
async function loadDashboard() {
    const dashboardContainer = document.getElementById('dashboardContainer');
    
    try {
        const response = await apiService.tasks.getAll();
        const tasks = Array.isArray(response.data.tasks) ? response.data.tasks : 
                     (Array.isArray(response.data) ? response.data : []);
        
        // Calculate statistics
        const stats = {
            total: tasks.length,
            completed: tasks.filter(t => t.status === 'completed').length,
            inProgress: tasks.filter(t => t.status === 'in-progress').length,
            onHold: tasks.filter(t => t.status === 'hold').length
        };

        // Filter tasks for dashboard sections
        const highPriorityTasks = tasks.filter(t => t.priority === 'high');
        const upcomingTasks = tasks.filter(t => {
            const deadline = new Date(t.deadline);
            const today = new Date();
            const threeDays = new Date();
            threeDays.setDate(today.getDate() + 3);
            return deadline <= threeDays && deadline >= today;
        });

        dashboardContainer.innerHTML = `
            <div class="dashboard">
                <div class="stats-container">
                    <div class="stat-card total">
                        <h3>Total Tasks</h3>
                        <h1>${stats.total}</h1>
                    </div>
                    <div class="stat-card completed">
                        <h3>Completed</h3>
                        <h1>${stats.completed}</h1>
                    </div>
                    <div class="stat-card in-progress">
                        <h3>In Progress</h3>
                        <h1>${stats.inProgress}</h1>
                    </div>
                    <div class="stat-card on-hold">
                        <h3>On Hold</h3>
                        <h1>${stats.onHold}</h1>
                    </div>
                </div>
                <div class="priority-deadline-container">
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Failed to load dashboard:', error);
    }
}

function renderDashboardTasks(tasks) {
    if (!tasks.length) {
        return '<p class="no-tasks-message">No tasks to display</p>';
    }

    return tasks.map(task => `
        <div class="dashboard-task-card">
            <h3>${task.title}</h3>
            <div class="task-info">
                <span class="status ${task.status}">${task.status}</span>
                <span class="deadline">Due: ${new Date(task.deadline).toLocaleDateString()}</span>
            </div>
        </div>
    `).join('');
}
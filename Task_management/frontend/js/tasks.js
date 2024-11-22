document.addEventListener('DOMContentLoaded', () => {
    if (isAuthenticated()) {
        loadTasks();
    }
});

const taskList = document.getElementById('taskList');
const taskFormModal = document.getElementById('taskFormModal');
//----------------------------------------------------------------------------------------
const taskSearch = document.getElementById('taskSearch');
let filteredTasks = [];
const statusFilter = document.getElementById('statusFilter');
const priorityFilter = document.getElementById('priorityFilter');
// const startDateFilter = document.getElementById('startDateFilter');
// const endDateFilter = document.getElementById('endDateFilter');
const applyFiltersButton = document.getElementById('applyFilters');

// Add event listener for search input
document.addEventListener('DOMContentLoaded', () => {
    if (isAuthenticated()) {
        loadTasks();
        // Add search event listener
        taskSearch.addEventListener('input', handleSearch);
    }
});

// Add this new function for handling search
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    filteredTasks = tasks.filter(task => 
        task.title.toLowerCase().includes(searchTerm) ||
        task.description.toLowerCase().includes(searchTerm)
        // task.status.toLowerCase().includes(searchTerm) ||
        // task.priority.toLowerCase().includes(searchTerm)
    );
    renderTasks(filteredTasks);
}
applyFiltersButton.addEventListener('click', applyFilters);

function applyFilters() {
    const status = statusFilter.value;
    const priority = priorityFilter.value;
    // const startDate = new Date(startDateFilter.value);
    // const endDate = new Date(endDateFilter.value);

    filteredTasks = tasks.filter(task => {
        const taskStatusMatch = status === 'all' || task.status === status;
        const taskPriorityMatch = priority === 'all' || task.priority === priority;
        // const taskDeadline = new Date(task.deadline);
        // const taskDateMatch = (!startDateFilter.value || taskDeadline >= startDate) &&
        //                       (!endDateFilter.value || taskDeadline <= endDate);

        // return taskStatusMatch && taskPriorityMatch && taskDateMatch;
        return taskStatusMatch && taskPriorityMatch;
    });

    renderTasks(filteredTasks);
}

let tasks = [];
let editingTaskId = null;



async function loadTasks() {
    try {
        const response = await apiService.tasks.getAll();
        console.log('Tasks fetched:', response.data);
        tasks = Array.isArray(response.data.tasks) ? response.data.tasks : 
               (Array.isArray(response.data) ? response.data : []);
        renderTasks();
    } catch (error) {
        console.error('Error fetching tasks:', error);
        if (error.response?.status === 401) {
            window.location.href = 'login.html';
        }
        showError('Failed to load tasks');
    }
}


function renderTasks(tasksToRender = tasks) {
    console.log('Tasks array:', tasksToRender);
    const taskList = document.getElementById('taskList');
    if (!taskList) {
        console.error('Task list element not found');
        return;
    }

    if (!tasksToRender || tasksToRender.length === 0) {
        taskList.innerHTML = `
            <div class="no-tasks">
                <p>No tasks available</p>
            </div>
        `;
        return;
    }

    taskList.innerHTML = tasksToRender.map(task => `
        <div class="task-card">
            <div class="task-header">
                <h3>${task.title}</h3>
                <div class="task-buttons">
                    <button type="button" onclick="showEditTaskForm(${task.id})" class="btn edit-btn">
                        Edit
                    </button>
                    <button type="button" onclick="deleteTask(${task.id})" class="btn delete-btn">
                        Delete
                    </button>
                </div>
            </div>
            <p class="task-description">${task.description || ''}</p>
            <div class="task-details">
                <span class="tag priority-${task.priority.toLowerCase()}">
                    Priority: ${task.priority}
                </span>
                <span class="tag status-${task.status.toLowerCase()}">
                    Status: ${task.status}
                </span>
                <span class="tag deadline">
                    Due: ${new Date(task.deadline).toLocaleDateString()}
                </span>
            </div>
        </div>
    `).join('');
}

function showAddTaskForm() {
    editingTaskId = null;
    showTaskForm();
}

function showEditTaskForm(taskId) {
    editingTaskId = taskId;
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        showTaskForm(task);
    }
}

function showTaskForm(task = null) {
    const modalTitle = task ? 'Edit Task' : 'Create New Task';
    const submitLabel = task ? 'Update Task' : 'Create Task';

    taskFormModal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">${modalTitle}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="taskForm" onsubmit="handleTaskSubmit(event)">
                        <div class="mb-3">
                            <input type="text" class="form-control" name="title" 
                                placeholder="Task Title" required 
                                value="${task?.title || ''}">
                        </div>
                        <div class="mb-3">
                            <textarea class="form-control" name="description" 
                                placeholder="Task Description" required>${task?.description || ''}</textarea>
                        </div>
                        <div class="mb-3">
                            <select class="form-control" name="priority" required>
                                ${['low', 'medium', 'high'].map(p => `
                                    <option value="${p}" ${task?.priority === p ? 'selected' : ''}>
                                        ${p.charAt(0).toUpperCase() + p.slice(1)}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="mb-3">
                            <select class="form-control" name="status" required>
                                ${['yet-to-start', 'in-progress', 'completed', 'hold'].map(s => `
                                    <option value="${s}" ${task?.status === s ? 'selected' : ''}>
                                        ${s.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="mb-3">
                            <input type="date" class="form-control" name="deadline" 
                                required value="${task?.deadline || ''}">
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary"
                                data-bs-dismiss="modal">Cancel</button>
                            <button type="submit" class="btn btn-primary">${submitLabel}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
 
    const modal = new bootstrap.Modal(taskFormModal);
    modal.show();
}

async function handleTaskSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const taskData = Object.fromEntries(formData.entries());

    try {
        if (editingTaskId) {
            await apiService.tasks.update(editingTaskId, taskData);
        } else {
            await apiService.tasks.create(taskData);
        }
        
        bootstrap.Modal.getInstance(taskFormModal).hide();
        await loadTasks();
        await loadDashboard();
    } catch (error) {
        showError('Failed to save task');
    }
}

async function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        try {
            await apiService.tasks.delete(taskId);
            await loadTasks();
            await loadDashboard();
        } catch (error) {
            showError('Failed to delete task');
        }
    }
}

function showError(message) {
    
    alert(message);
}


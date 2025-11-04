let activities = [
    { id: 1, name: 'Work Session', icon: 'fas fa-laptop', color: 'bg-blue-400', duration: 3 },
    { id: 2, name: 'Exercise', icon: 'fas fa-running', color: 'bg-green-400', duration: 2 },
    { id: 3, name: 'Creative Time', icon: 'fas fa-paint-brush', color: 'bg-purple-400', duration: 2 },
    { id: 4, name: 'Learning', icon: 'fas fa-book', color: 'bg-yellow-400', duration: 2 },
    { id: 5, name: 'Meals', icon: 'fas fa-utensils', color: 'bg-orange-400', duration: 1 },
    { id: 6, name: 'Social Time', icon: 'fas fa-users', color: 'bg-pink-400', duration: 2 },
    { id: 7, name: 'Rest', icon: 'fas fa-couch', color: 'bg-gray-400', duration: 1 },
    { id: 8, name: 'Planning', icon: 'fas fa-tasks', color: 'bg-indigo-400', duration: 1 },
    { id: 9, name: 'Sleep', icon: 'fas fa-bed', color: 'bg-blue-300', duration: 8 }
];

// Templates
const templates = {
    productive: [
        { activityId: 9, startHour: 23 },
        { activityId: 8, startHour: 6 },
        { activityId: 1, startHour: 7 },
        { activityId: 5, startHour: 12 },
        { activityId: 1, startHour: 13 },
        { activityId: 2, startHour: 16 },
        { activityId: 5, startHour: 18 },
        { activityId: 4, startHour: 19 }
    ],
    balanced: [
        { activityId: 9, startHour: 22 },
        { activityId: 2, startHour: 6 },
        { activityId: 1, startHour: 8 },
        { activityId: 5, startHour: 12 },
        { activityId: 6, startHour: 13 },
        { activityId: 3, startHour: 15 },
        { activityId: 5, startHour: 18 },
        { activityId: 7, startHour: 20 }
    ],
    creative: [
        { activityId: 9, startHour: 0 },
        { activityId: 3, startHour: 8 },
        { activityId: 5, startHour: 12 },
        { activityId: 3, startHour: 13 },
        { activityId: 4, startHour: 15 },
        { activityId: 6, startHour: 17 },
        { activityId: 5, startHour: 19 },
        { activityId: 7, startHour: 21 }
    ]
};

// State
let timeline = Array(24).fill(null);
let draggedActivity = null;
let selectedColor = 'bg-blue-400';
let nextCustomId = 1000;

// Animation functions
function fadeIn(element, delay = 0) {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = `all 0.5s ease ${delay}ms`;
    
    setTimeout(() => {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
    }, 50);
}

function scaleIn(element, delay = 0) {
    element.style.opacity = '0';
    element.style.transform = 'scale(0.9)';
    element.style.transition = `all 0.3s ease ${delay}ms`;
    
    setTimeout(() => {
        element.style.opacity = '1';
        element.style.transform = 'scale(1)';
    }, 50);
}

function pulse(element) {
    element.style.transform = 'scale(1.05)';
    element.style.transition = 'transform 0.2s ease';
    
    setTimeout(() => {
        element.style.transform = 'scale(1)';
    }, 200);
}

function slideIn(element, direction = 'left', delay = 0) {
    const translateX = direction === 'left' ? '-20px' : '20px';
    element.style.opacity = '0';
    element.style.transform = `translateX(${translateX})`;
    element.style.transition = `all 0.4s ease ${delay}ms`;
    
    setTimeout(() => {
        element.style.opacity = '1';
        element.style.transform = 'translateX(0)';
    }, 50);
}

// Initialize the app
function init() {
    renderActivities();
    renderTimeline();
    updateStats();
    setupEventListeners();
    
    // Select first color by default
    document.querySelector('.color-btn').classList.add('selected');
    
    // Animate initial elements
    animateInitialLoad();
}

function animateInitialLoad() {
    // Animate header elements
    const header = document.querySelector('h1');
    const subtitle = document.querySelector('p');
    const stats = document.querySelectorAll('.text-center');
    
    fadeIn(header, 100);
    fadeIn(subtitle, 200);
    
    stats.forEach((stat, index) => {
        fadeIn(stat, 300 + (index * 100));
    });
    
    // Animate activity palette
    const activitySection = document.querySelector('.lg\\:col-span-1');
    fadeIn(activitySection, 400);
    
    // Animate timeline
    const timelineSection = document.querySelector('.lg\\:col-span-3');
    slideIn(timelineSection, 'right', 500);
}

// Render activity palette
function renderActivities() {
    const palette = document.getElementById('activityPalette');
    palette.innerHTML = '';

    activities.forEach((activity, index) => {
        const usedCount = timeline.filter(slot => slot?.id === activity.id).length;
        
        const activityElement = document.createElement('div');
        activityElement.className = `activity-item p-3 rounded-lg cursor-grab`;
        activityElement.draggable = true;
        activityElement.dataset.activityId = activity.id;
        
        activityElement.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="p-2 rounded-lg ${activity.color} text-white">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="flex-1">
                    <div class="font-medium text-gray-800 text-sm">${activity.name}</div>
                    <div class="text-gray-500 text-xs">${activity.duration}h</div>
                </div>
                ${usedCount > 0 ? `
                    <div class="activity-count px-2 py-1 rounded text-xs font-medium">
                        ${usedCount}
                    </div>
                ` : ''}
            </div>
        `;
        
        palette.appendChild(activityElement);
        fadeIn(activityElement, index * 50);
    });
}

// Render timeline
function renderTimeline() {
    const timelineContainer = document.getElementById('timeline');
    timelineContainer.innerHTML = '';

    timeline.forEach((activity, hour) => {
        const isStart = activity && timeline[hour - 1]?.id !== activity.id;
        const slotElement = document.createElement('div');
        
        if (activity) {
            slotElement.className = `timeline-slot filled flex items-center gap-3 p-3 rounded-lg ${activity.color} text-white`;
            slotElement.innerHTML = `
                <div class="time-marker text-xs font-medium bg-white bg-opacity-20 px-2 py-1 rounded">
                    ${formatHour(hour)}
                </div>
                <div class="flex-1">
                    <div class="flex items-center gap-2">
                        <div class="p-1 bg-white bg-opacity-20 rounded">
                            <i class="${activity.icon} text-xs"></i>
                        </div>
                        <div>
                            <div class="font-medium text-sm">${activity.name}</div>
                            ${isStart ? `
                                <div class="text-xs text-white text-opacity-80">
                                    ${activity.duration}h
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        } else {
            slotElement.className = 'timeline-slot empty drop-zone flex items-center gap-3 p-3 rounded-lg bg-gray-50';
            slotElement.innerHTML = `
                <div class="time-marker text-xs font-medium text-gray-500 px-2 py-1 rounded bg-white">
                    ${formatHour(hour)}
                </div>
                <div class="flex-1 text-gray-400 text-sm">
                    Drop activity here
                </div>
            `;
        }
        
        slotElement.dataset.hour = hour;
        timelineContainer.appendChild(slotElement);
        
        // Animate timeline slots
        if (activity) {
            scaleIn(slotElement, hour * 30);
        } else {
            fadeIn(slotElement, hour * 20);
        }
    });
}

// Format hour for display
function formatHour(hour) {
    if (hour === 0) return '12AM';
    if (hour === 12) return '12PM';
    return hour < 12 ? `${hour}AM` : `${hour - 12}PM`;
}

// Update statistics
function updateStats() {
    const usedHours = timeline.filter(Boolean).length;
    const activityCount = new Set(timeline.filter(Boolean).map(a => a?.id)).size;
    const percentage = Math.round((usedHours / 24) * 100);
    const efficiency = Math.round((usedHours / 24) * 100);
    
    // Animate number changes
    animateCounter('hoursUsed', usedHours);
    animateCounter('hoursFree', 24 - usedHours);
    animateCounter('activitiesCount', activityCount);
    
    document.getElementById('efficiencyScore').textContent = `${efficiency}%`;
    
    // Animate progress bar
    const progressFill = document.getElementById('progressFill');
    progressFill.style.transition = 'width 0.8s ease';
    progressFill.style.width = `${percentage}%`;
}

function animateCounter(elementId, targetValue) {
    const element = document.getElementById(elementId);
    const currentValue = parseInt(element.textContent) || 0;
    
    if (currentValue === targetValue) return;
    
    let start = null;
    const duration = 800;
    
    function step(timestamp) {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        
        const current = Math.floor(progress * (targetValue - currentValue) + currentValue);
        element.textContent = current;
        
        // Pulse animation when value changes
        if (current !== currentValue) {
            pulse(element);
        }
        
        if (progress < 1) {
            requestAnimationFrame(step);
        }
    }
    
    requestAnimationFrame(step);
}

// Setup event listeners
function setupEventListeners() {
    // Activity drag start
    document.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('activity-item')) {
            const activityId = parseInt(e.target.dataset.activityId);
            draggedActivity = activities.find(a => a.id === activityId);
            e.target.style.opacity = '0.6';
            e.target.style.transform = 'rotate(5deg)';
            e.target.style.transition = 'all 0.2s ease';
        }
    });

    // Activity drag end
    document.addEventListener('dragend', (e) => {
        if (e.target.classList.contains('activity-item')) {
            e.target.style.opacity = '1';
            e.target.style.transform = 'rotate(0deg)';
        }
    });

    // Timeline drag over
    document.addEventListener('dragover', (e) => {
        const slot = e.target.closest('.timeline-slot');
        if (slot && slot.classList.contains('empty')) {
            e.preventDefault();
            slot.classList.add('drag-over');
            slot.style.transform = 'scale(1.02)';
            slot.style.transition = 'transform 0.2s ease';
        }
    });

    // Timeline drag leave
    document.addEventListener('dragleave', (e) => {
        const slot = e.target.closest('.timeline-slot');
        if (slot) {
            slot.classList.remove('drag-over');
            slot.style.transform = 'scale(1)';
        }
    });

    // Timeline drop
    document.addEventListener('drop', (e) => {
        e.preventDefault();
        const slot = e.target.closest('.timeline-slot');
        if (slot) {
            slot.classList.remove('drag-over');
            slot.style.transform = 'scale(1)';
            const hourIndex = parseInt(slot.dataset.hour);
            handleDrop(hourIndex);
        }
    });

    // Clear timeline slot on click
    document.addEventListener('click', (e) => {
        const slot = e.target.closest('.timeline-slot.filled');
        if (slot) {
            // Add click animation
            slot.style.transform = 'scale(0.95)';
            slot.style.transition = 'transform 0.1s ease';
            setTimeout(() => {
                slot.style.transform = 'scale(1)';
            }, 100);
            
            const hourIndex = parseInt(slot.dataset.hour);
            setTimeout(() => handleClearSlot(hourIndex), 150);
        }
    });

    // Button hover animations
    document.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'translateY(-2px)';
            btn.style.transition = 'transform 0.2s ease';
        });
        
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translateY(0)';
        });
    });

    // Clear all button
document.getElementById('clearAllBtn').addEventListener('click', () => {
    if (confirm('Clear your entire timeline?')) {
        // Add clear animation
        const timelineSlots = document.querySelectorAll('.timeline-slot.filled');
        timelineSlots.forEach((slot, index) => {
            setTimeout(() => {
                slot.style.opacity = '0';
                slot.style.transform = 'scale(0.8)';
                slot.style.transition = 'all 0.3s ease';
            }, index * 30);
        });
        
        setTimeout(() => {
            timeline = Array(24).fill(null);
            
            // Clear the saved timeline from localStorage
            localStorage.removeItem('dayPlannerTimeline');
            
            renderActivities();
            renderTimeline();
            updateStats();
        }, timelineSlots.length * 30);
    }
});

    // Save day button
    document.getElementById('saveDayBtn').addEventListener('click', () => {
        const usedHours = timeline.filter(Boolean).length;
        if (usedHours === 0) {
            alert('Add some activities to your timeline first!');
            return;
        }
        
        const efficiency = Math.round((usedHours / 24) * 100);
        alert(`Day plan saved!\n\n${usedHours} hours scheduled\n${efficiency}% efficiency`);
        
        // Save to localStorage
        localStorage.setItem('dayPlannerTimeline', JSON.stringify(timeline));
        localStorage.setItem('dayPlannerActivities', JSON.stringify(activities));
    });

    // Export button
    document.getElementById('exportBtn').addEventListener('click', exportTimeline);

    // Template buttons
    document.querySelectorAll('.template-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            pulse(e.currentTarget);
            setTimeout(() => {
                const template = btn.dataset.template;
                applyTemplate(template);
            }, 200);
        });
    });

    // Custom activity modal
    document.getElementById('addCustomBtn').addEventListener('click', () => {
        document.getElementById('customModal').classList.remove('hidden');
        setTimeout(() => {
            const modal = document.getElementById('customModal');
            scaleIn(modal.querySelector('.modal-content'));
        }, 50);
    });

    document.getElementById('cancelCustomBtn').addEventListener('click', () => {
        const modal = document.getElementById('customModal');
        modal.querySelector('.modal-content').style.opacity = '0';
        modal.querySelector('.modal-content').style.transform = 'scale(0.9)';
        setTimeout(() => {
            document.getElementById('customModal').classList.add('hidden');
        }, 300);
    });

    document.getElementById('saveCustomBtn').addEventListener('click', addCustomActivity);

    // Edit activities modal
    document.getElementById('editActivitiesBtn').addEventListener('click', () => {
        showEditActivitiesModal();
        setTimeout(() => {
            const modal = document.getElementById('editActivitiesModal');
            scaleIn(modal.querySelector('.modal-content'));
        }, 50);
    });

    document.getElementById('cancelEditBtn').addEventListener('click', () => {
        const modal = document.getElementById('editActivitiesModal');
        modal.querySelector('.modal-content').style.opacity = '0';
        modal.querySelector('.modal-content').style.transform = 'scale(0.9)';
        setTimeout(() => {
            document.getElementById('editActivitiesModal').classList.add('hidden');
        }, 300);
    });

    document.getElementById('saveEditBtn').addEventListener('click', saveEditedActivities);

    // Color selection
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.color-btn').forEach(b => {
                b.classList.remove('selected');
                b.style.transform = 'scale(1)';
            });
            btn.classList.add('selected');
            btn.style.transform = 'scale(1.1)';
            btn.style.transition = 'transform 0.2s ease';
            selectedColor = btn.dataset.color;
        });
    });

    // Load saved data
    loadSavedData();
}

// Handle drop on timeline slot
function handleDrop(hourIndex) {
    if (draggedActivity && !timeline[hourIndex]) {
        let hasSpace = true;
        for (let i = 0; i < draggedActivity.duration; i++) {
            if (hourIndex + i >= 24 || timeline[hourIndex + i]) {
                hasSpace = false;
                break;
            }
        }
        
        if (hasSpace) {
            const newTimeline = [...timeline];
            for (let i = 0; i < draggedActivity.duration; i++) {
                newTimeline[hourIndex + i] = draggedActivity;
            }
            timeline = newTimeline;
            
            renderActivities();
            renderTimeline();
            updateStats();
        } else {
            alert(`Need ${draggedActivity.duration} consecutive hours for "${draggedActivity.name}"`);
        }
    }
}

// Handle clearing a timeline slot
function handleClearSlot(hourIndex) {
    const activity = timeline[hourIndex];
    if (activity) {
        const newTimeline = [...timeline];
        for (let i = 0; i < 24; i++) {
            if (newTimeline[i]?.id === activity.id) {
                let isStart = i === 0 || newTimeline[i - 1]?.id !== activity.id;
                if (isStart) {
                    for (let j = 0; j < activity.duration && i + j < 24; j++) {
                        newTimeline[i + j] = null;
                    }
                }
            }
        }
        timeline = newTimeline;
        
        renderActivities();
        renderTimeline();
        updateStats();
    }
}

// Apply template
function applyTemplate(templateName) {
    if (!confirm(`Apply ${templateName} template?`)) return;

    timeline = Array(24).fill(null);
    const template = templates[templateName];
    
    template.forEach(item => {
        const activity = activities.find(a => a.id === item.activityId);
        if (activity) {
            for (let i = 0; i < activity.duration; i++) {
                if (item.startHour + i < 24) {
                    timeline[item.startHour + i] = activity;
                }
            }
        }
    });
    
    renderActivities();
    renderTimeline();
    updateStats();
}

// Add custom activity
function addCustomActivity() {
    const name = document.getElementById('customName').value.trim();
    const duration = parseInt(document.getElementById('customDuration').value);
    
    if (!name) {
        alert('Enter an activity name!');
        return;
    }
    
    if (duration < 1 || duration > 8) {
        alert('Duration: 1-8 hours');
        return;
    }
    
    const newActivity = {
        id: nextCustomId++,
        name: name,
        icon: 'fas fa-star',
        color: selectedColor,
        duration: duration
    };
    
    activities.push(newActivity);
    document.getElementById('customModal').classList.add('hidden');
    document.getElementById('customName').value = '';
    document.getElementById('customDuration').value = '1';
    
    renderActivities();
}

// Show edit activities modal
function showEditActivitiesModal() {
    const editList = document.getElementById('editActivitiesList');
    editList.innerHTML = '';
    
    activities.forEach((activity, index) => {
        const activityElement = document.createElement('div');
        activityElement.className = 'edit-activity-item';
        activityElement.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div>
                    <label class="block text-gray-600 text-sm font-medium mb-1">Name</label>
                    <input type="text" value="${activity.name}" 
                           class="w-full px-3 py-2 border border-gray-300 rounded activity-name" 
                           data-index="${index}">
                </div>
                <div>
                    <label class="block text-gray-600 text-sm font-medium mb-1">Duration (h)</label>
                    <input type="number" min="1" max="12" value="${activity.duration}" 
                           class="w-full px-3 py-2 border border-gray-300 rounded activity-duration" 
                           data-index="${index}">
                </div>
                <div>
                </div>
                <div>
                    <label class="block text-gray-600 text-sm font-medium mb-1">Icon</label>
                    <select class="w-full px-3 py-2 border border-gray-300 rounded activity-icon" data-index="${index}">
                        <option value="fa-laptop" ${activity.icon.includes('fa-laptop') ? 'selected' : ''}>Laptop</option>
                        <option value="fa-running" ${activity.icon.includes('fa-running') ? 'selected' : ''}>Running</option>
                        <option value="fa-paint-brush" ${activity.icon.includes('fa-paint-brush') ? 'selected' : ''}>Paint</option>
                        <option value="fa-book" ${activity.icon.includes('fa-book') ? 'selected' : ''}>Book</option>
                        <option value="fa-utensils" ${activity.icon.includes('fa-utensils') ? 'selected' : ''}>Utensils</option>
                        <option value="fa-users" ${activity.icon.includes('fa-users') ? 'selected' : ''}>Users</option>
                        <option value="fa-couch" ${activity.icon.includes('fa-couch') ? 'selected' : ''}>Couch</option>
                        <option value="fa-tasks" ${activity.icon.includes('fa-tasks') ? 'selected' : ''}>Tasks</option>
                        <option value="fa-bed" ${activity.icon.includes('fa-bed') ? 'selected' : ''}>Bed</option>
                        <option value="fa-star" ${activity.icon.includes('fa-star') ? 'selected' : ''}>Star</option>
                    </select>
                </div>
            </div>
        `;
        editList.appendChild(activityElement);
        fadeIn(activityElement, index * 50);
    });
    
    document.getElementById('editActivitiesModal').classList.remove('hidden');
}


// Save edited activities
function saveEditedActivities() {
    const nameInputs = document.querySelectorAll('.activity-name');
    const durationInputs = document.querySelectorAll('.activity-duration');
    const iconInputs = document.querySelectorAll('.activity-icon');
    
    activities = activities.map((activity, index) => ({
        ...activity,
        name: nameInputs[index].value,
        duration: parseInt(durationInputs[index].value),
        icon: `fas ${iconInputs[index].value}`
    }));
    
    document.getElementById('editActivitiesModal').classList.add('hidden');
    renderActivities();
    renderTimeline();
}

// Export timeline
function exportTimeline() {
    const usedHours = timeline.filter(Boolean).length;
    if (usedHours === 0) {
        alert('No activities to export!');
        return;
    }
    
    let exportText = 'MY DAILY SCHEDULE\n\n';
    let currentActivity = null;
    let startHour = 0;
    
    for (let hour = 0; hour < 24; hour++) {
        const activity = timeline[hour];
        
        if (activity !== currentActivity) {
            if (currentActivity) {
                exportText += `${formatHour(startHour)} - ${formatHour(hour)}: ${currentActivity.name}\n`;
            }
            currentActivity = activity;
            startHour = hour;
        }
    }
    
    if (currentActivity) {
        exportText += `${formatHour(startHour)} - 12 AM: ${currentActivity.name}\n`;
    }
    
    exportText += `\nTotal: ${usedHours}/24 hours planned`;
    
    // Create download
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-daily-schedule.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Load saved data
function loadSavedData() {
    const savedTimeline = localStorage.getItem('dayPlannerTimeline');
    const savedActivities = localStorage.getItem('dayPlannerActivities');
    
    // Only load timeline if it's not empty
    if (savedTimeline) {
        const parsedTimeline = JSON.parse(savedTimeline);
        // Check if timeline has any activities
        const hasActivities = parsedTimeline.some(slot => slot !== null);
        if (hasActivities) {
            timeline = parsedTimeline;
        }
    }
    
    if (savedActivities) {
        activities = JSON.parse(savedActivities);
    }
    
    renderActivities();
    renderTimeline();
    updateStats();
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
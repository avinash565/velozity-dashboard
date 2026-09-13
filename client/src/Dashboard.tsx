import { useEffect, useState } from 'react'
import { CheckSquare, CircleDashed, Circle, CheckCircle, TriangleAlert, } from "lucide-react"

type Task = {
    id: number
    title: string
    status: string
    priority: string
    dueDate: string
    assignedDeveloperId: number
}

type User = {
    id: number
    name: string
    email: string
    role: string
}

type Activity = {
    id: number
    action: string
    createdAt: string
    user: {
        name: string
    }
    task: {
        title: string
    } | null
}

type Notification = {
    id: number
    message: string
    isRead: boolean
    createdAt: string
}

const Dashboard = () => {
    const [user, setUser] = useState<User | null>(null)
    const [tasks, setTasks] = useState<Task[]>([])
    const [error, setError] = useState('')
    const [activities, setActivities] = useState<Activity[]>([])
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [statusFilter, setStatusFilter] = useState("")
    const [priorityFilter, setPriorityFilter] = useState("")
    const [dueDateFrom, setDueDateFrom] = useState("")
    const [dueDateTo, setDueDateTo] = useState("")

    function handleLogout() {
        localStorage.removeItem("accessToken")
        window.location.href = "/"
    }

    const totalTasks = tasks.length

    const inProgressTasks = tasks.filter(
        (task) => task.status === "IN_PROGRESS"
    ).length

    const completedTasks = tasks.filter(
        (task) => task.status === "DONE"
    ).length

    const blockedTasks = tasks.filter(
        (task) => task.status === "BLOCKED"
    ).length

    const todoTasks = tasks.filter(
        (task) => task.status === "TODO"
    ).length

    async function refreshAccessToken() {
        const response = await fetch("http://localhost:5001/auth/refresh", {
            method: "POST",
            credentials: "include",
        })

        if (!response.ok) {
            localStorage.removeItem("accessToken")
            return null
        }

        const data = await response.json()

        localStorage.setItem("accessToken", data.accessToken)

        return data.accessToken
    }

    async function handleStatusChange(taskId: number, status: string) {
        const token = localStorage.getItem("accessToken")

        try {
            const response = await fetch(
                `http://localhost:5001/tasks/${taskId}/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ status }),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                setError(data.message || "Failed to update status")
                return
            }

            setTasks((currentTasks) =>
                currentTasks.map((task) =>
                    task.id === taskId
                        ? { ...task, status: data.task.status }
                        : task
                )
            )
        } catch {
            setError("Unable to connect to server")
        }
    }

    useEffect(() => {
        async function fetchUser() {
            const token = localStorage.getItem("accessToken")

            const response = await fetch("http://localhost:5001/auth/me", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (response.status === 401) {
                const newToken = await refreshAccessToken()

                if (!newToken) {
                    setError("Session expired. Please login again.")
                    return
                }

                const retryResponse = await fetch(
                    "http://localhost:5001/auth/me",
                    {
                        headers: {
                            Authorization: `Bearer ${newToken}`,
                        },
                    }
                )

                const retryData = await retryResponse.json()

                if (!retryResponse.ok) {
                    setError(retryData.message || "Failed to fetch user")
                    return
                }

                setUser(retryData.user)
                return
            }

            const data = await response.json()

            if (response.ok) {
                setUser({
                    id: data.user.userId,
                    name: data.user.name,
                    email: data.user.email,
                    role: data.user.role,
                })
            }
        }
        async function fetchTasks() {
            try {
                const params = new URLSearchParams()

                if (statusFilter) {
                    params.set("status", statusFilter)
                }

                if (priorityFilter) {
                    params.set("priority", priorityFilter)
                }

                if (dueDateFrom) {
                    params.set("dueDateFrom", dueDateFrom)
                }

                if (dueDateTo) {
                    params.set("dueDateTo", dueDateTo)
                }

                const queryString = params.toString()
                const tasksUrl = queryString
                    ? `http://localhost:5001/tasks?${queryString}`
                    : "http://localhost:5001/tasks"

                const token = localStorage.getItem('accessToken')

                const response = await fetch(tasksUrl, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })

                if (response.status === 401) {
                    const newToken = await refreshAccessToken()

                    if (!newToken) {
                        setError("Session expired. Please login again.")
                        return
                    }

                    const retryResponse = await fetch(tasksUrl, {
                        headers: {
                            Authorization: `Bearer ${newToken}`,
                        },
                    })

                    const retryData = await retryResponse.json()

                    if (!retryResponse.ok) {
                        setError(retryData.message || "Failed to fetch tasks")
                        return
                    }

                    setTasks(retryData.tasks)
                    return
                }

                const data = await response.json()

                if (!response.ok) {
                    setError(data.message || "Failed to fetch tasks")
                    return
                }

                setTasks(data.tasks)
            } catch {
                setError('Unable to connect to server')
            }
        }
        async function fetchNotifications() {
            try {
                const token = localStorage.getItem("accessToken")

                const response = await fetch("http://localhost:5001/notifications", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })

                const data = await response.json()

                if (response.ok) {
                    setNotifications(data.notifications)
                }
            } catch {
                console.error("Failed to fetch notifications")
            }
        }
        async function fetchActivities() {
            const token = localStorage.getItem("accessToken")

            const response = await fetch("http://localhost:5001/activities", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (response.status === 401) {
                const newToken = await refreshAccessToken()

                if (!newToken) {
                    setError("Session expired. Please login again.")
                    return
                }

                const retryResponse = await fetch(
                    "http://localhost:5001/activities",
                    {
                        headers: {
                            Authorization: `Bearer ${newToken}`,
                        },
                    }
                )

                const retryData = await retryResponse.json()

                if (!retryResponse.ok) {
                    setError(retryData.message || "Failed to fetch activities")
                    return
                }

                setActivities(retryData.activities)
                return
            }

            const data = await response.json()

            if (response.ok) {
                setActivities(data.activities)
            }
        }

        fetchUser()
        fetchTasks()
        fetchActivities()
        fetchNotifications()

        const ws = new WebSocket("ws://localhost:5001")

        ws.onopen = () => {
            ws.send(
                JSON.stringify({
                    type: "AUTH",
                    token: localStorage.getItem("accessToken"),
                })
            )
        }

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data)

            if (data.type === "ACTIVITY") {
                fetchActivities()

            }
            ws.onerror = (error) => {
                console.error("WebSocket error:", error)
            }
        }
        return () => {
            ws.close()
        }
    }, [statusFilter, priorityFilter, dueDateFrom, dueDateTo])

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>Velozity Dashboard</h1>

                <button className="logout-btn" onClick={handleLogout}>
                    Logout
                </button>
            </div>

            {user && (
                <p className="user-role">
                    {user.name} · {user.role.replace("_", " ")}
                </p>
            )}

            <div className="summary-cards">
                <div className="summary-card blue">
                    <CheckSquare className="summary-icon" />
                    <h3>Total Tasks</h3>
                    <p>{totalTasks}</p>
                </div>

                <div className="summary-card purple">
                    <CircleDashed size={32} />
                    <h3>TODO</h3>
                    <p>{todoTasks}</p>
                </div>

                <div className="summary-card orange">
                    <Circle className="summary-icon" />
                    <h3>In Progress</h3>
                    <p>{inProgressTasks}</p>
                </div>

                <div className="summary-card green">
                    <CheckCircle className="summary-icon" />
                    <h3>Completed</h3>
                    <p>{completedTasks}</p>
                </div>

                <div className="summary-card red">
                    <TriangleAlert className="summary-icon" />
                    <h3>Blocked</h3>
                    <p>{blockedTasks}</p>
                </div>
            </div>

            <h2>Tasks</h2>

            <div className="task-filters">
                <select className="status-filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">All Status</option>
                    <option value="TODO">TODO</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="BLOCKED">BLOCKED</option>
                    <option value="DONE">DONE</option>
                </select>

                <select className="priority-filter"
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                >
                    <option value="">All Priority</option>
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                </select>

                <input className="date-filter"
                    type="date"
                    value={dueDateFrom}
                    onChange={(e) => setDueDateFrom(e.target.value)}
                />

                <input className="date-filter"
                    type="date"
                    value={dueDateTo}
                    onChange={(e) => setDueDateTo(e.target.value)}
                />
            </div>

            {error && <p>{error}</p>}

            {tasks.map((task) => (
                <div className="task-card" key={task.id}>
                    <h3 className="task-title">{task.title}</h3>

                    <p className="task-status">
                        Status: {task.status}
                    </p>

                    <p className="task-priority">
                        Priority: {task.priority}
                    </p>

                    <p className="task-due">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                    <select
                        defaultValue={task.status}
                        disabled={
                            user?.role === "DEVELOPER" &&
                            Number(user.id) !== Number(task.assignedDeveloperId)
                        }
                        onChange={(e) =>
                            handleStatusChange(task.id, e.target.value)
                        }
                    >
                        <option value="TODO">TODO</option>
                        <option value="IN_PROGRESS">IN PROGRESS</option>
                        <option value="BLOCKED">BLOCKED</option>
                        <option value="DONE">DONE</option>
                    </select>
                </div>
            ))}
            <section className="activity-section">
                <h2>Recent Activity</h2>

                {activities.map((activity) => (
                    <div className="activity-item" key={activity.id}>
                        <strong>{activity.user.name}</strong>{" "}
                        {activity.action}

                        {activity.task && (
                            <span> — {activity.task.title}</span>
                        )}

                        <small>
                            {new Date(activity.createdAt).toLocaleString()}
                        </small>
                    </div>
                ))}
            </section>
            <section className="notification-section">
                <h2>Notifications</h2>

                {notifications.length === 0 ? (
                    <p>No notifications</p>
                ) : (
                    notifications.map((notification) => (
                        <div className="notification-item" key={notification.id}>
                            <strong>{notification.message}</strong>

                            <small>
                                {new Date(notification.createdAt).toLocaleString()}
                            </small>
                        </div>
                    ))
                )}
            </section>
        </div>
    )
}

export default Dashboard

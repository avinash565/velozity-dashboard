import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "../src/config/env.js";
import bcrypt from "bcryptjs";
import { UserRole } from "../src/generated/prisma/enums.js";
import { TaskStatus, TaskPriority } from "../src/generated/prisma/enums.js";

const adapter = new PrismaPg({
    connectionString: env.databaseUrl,
});

const prisma = new PrismaClient({
    adapter,
});

const users = [
    {
        name: "Admin",
        email: "admin@velozity.com",
        password: "Admin@123",
        role: UserRole.ADMIN
    },
    {
        name: "Project Manager 1",
        email: "pm1@velozity.com",
        password: "PM1@123",
        role: UserRole.PROJECT_MANAGER,
    },
    {
        name: "Project Manager 2",
        email: "pm2@velozity.com",
        password: "PM2@123",
        role: UserRole.PROJECT_MANAGER, 
    },
    {
        name: "Developer 1",
        email: "dev1@velozity.com",
        password: "Dev1@123",
        role: UserRole.DEVELOPER,
    },
    {
        name: "Developer 2",
        email: "dev2@velozity.com",
        password: "Dev2@123",
        role: UserRole.DEVELOPER,
    },
    {
        name: "Developer 3",
        email: "pm3@velozity.com",
        password: "Dev3@123",
        role: UserRole.DEVELOPER,
    },
    {
        name: "Developer 4",
        email: "pm4@velozity.com",
        password: "Dev4@123",
        role: UserRole.DEVELOPER,
    },

];
for (const user of users) {
    const passwordHash = await bcrypt.hash(user.password, 10);

    await prisma.user.create({
        data: {
            name: user.name,
            email: user.email,
            passwordHash,
            role: user.role,
        },
    });
}

const clients = [
    {
        name: "Client One",
    },
    {
        name: "Client Two",
    },
    {
        name: "Client Three",
    },
];
for (const client of clients) {
    await prisma.client.create({
        data: {
            name: client.name,
        },
    });
}

const projects = [
    {
        name: "Dashboard Project",
        description: "Real-time project dashboard",
        clientId: 1,
        managerId: 2,
    },
    {
        name: "Dashboard Project",
        description: "Real-time project dashboard",
        clientId: 2,
        managerId: 2,
    },
    {
        name: "Dashboard Project",
        description: "Real-time project dashboard",
        clientId: 3,
        managerId: 3,
    },
];
for (const project of projects) {
    await prisma.project.create({
        data: {
            name: project.name,
            description: project.description,
            clientId: project.clientId,
            managerId: project.managerId,
        },
    });
}

const tasks = [
    {
        title: "Design Dashboard",
        description: "Create the dashboard layout",
        projectId: 1,
        assignedDeveloperId: 4,
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        dueDate: new Date("2026-09-20"),
    },
    {
        title: "Build Login Page",
        description: "Implement login screen",
        projectId: 1,
        assignedDeveloperId: 5,
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.MEDIUM,
        dueDate: new Date("2026-09-18"),
    },
    {
        title: "Fix Authentication Bug",
        description: "Resolve token validation issue",
        projectId: 2,
        assignedDeveloperId: 6,
        status: TaskStatus.BLOCKED,
        priority: TaskPriority.HIGH,
        dueDate: new Date("2026-09-10"),
    },
    {
        title: "Implement Dashboard Layout",
        description: "Build the main dashboard layout to display projects, tasks, statuses, priorities, and due dates.",
        projectId: 3,
        assignedDeveloperId: 4,
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        dueDate: new Date("2026-09-20"),
    },
    {
        title: "Build Navbar",
        description: "Create a responsive navigation bar with links for dashboard, projects, tasks, and profile.",
        projectId: 1,
        assignedDeveloperId: 5,
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        dueDate: new Date("2026-09-22"),
    },
    {
        title: "Create Database Schema",
        description: "Design and implement the required database tables and relationships for the dashboard.",
        projectId: 1,
        assignedDeveloperId: 6,
        status: TaskStatus.DONE,
        priority: TaskPriority.MEDIUM,
        dueDate: new Date("2026-09-15"),
    },
    {
        title: "Add API Validation",
        description: "Add server-side validation for request fields, IDs, task status, priority, and due dates.",
        projectId: 1,
        assignedDeveloperId: 7,
        status: TaskStatus.TODO,
        priority: TaskPriority.LOW,
        dueDate: new Date("2026-09-19"),
    },
    {
        title: "Implement User Profile",
        description: "Create a user profile section that displays the logged-in user's basic information.",
        projectId: 2,
        assignedDeveloperId: 4,
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.MEDIUM,
        dueDate: new Date("2026-09-17"),
    },
    {
        title: "Fix Dashboard Bug",
        description: "Investigate and resolve an issue causing incorrect project and task information on the dashboard.",
        projectId: 2,
        assignedDeveloperId: 5,
        status: TaskStatus.BLOCKED,
        priority: TaskPriority.HIGH,
        dueDate: new Date("2026-09-09"),
    },
    {
        title: "Add Notifications",
        description: "Implement notifications for important task updates and overdue tasks.",
        projectId: 2,
        assignedDeveloperId: 6,
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        dueDate: new Date("2026-09-05"),
    },
    {
        title: "Create Activity Feed",
        description: "Display recent project and task activities in a real-time activity feed.",
        projectId: 3,
        assignedDeveloperId: 7,
        status: TaskStatus.DONE,
        priority: TaskPriority.MEDIUM,
        dueDate: new Date("2026-09-23"),
    },
    {
        title: "Test WebSocket Events",
        description: "Test real-time WebSocket events and verify that users receive only authorized activity updates.",
        projectId: 3,
        assignedDeveloperId: 4,
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        dueDate: new Date("2026-09-21"),
    },
    {
        title: "Implement Task Filters",
        description: "Add filters for task status, priority, and due date on the project dashboard.",
        projectId: 2,
        assignedDeveloperId: 5,
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        dueDate: new Date("2026-09-27"),
    },
    {
        title: "Build Project Overview",
        description: "Create a project overview showing project details, task progress, and assigned developers.",
        projectId: 3,
        assignedDeveloperId: 6,
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        dueDate: new Date("2026-09-28"),
    },
    {
        title: "Add Task Activity Logging",
        description: "Record task updates with the user, previous status, new status, and timestamp.",
        projectId: 3,
        assignedDeveloperId: 7,
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        dueDate: new Date("2026-09-29"),
    },
];
for (const task of tasks) {
    await prisma.task.create({
        data: {
            title: task.title,
            description: task.description,
            projectId: task.projectId,
            assignedDeveloperId: task.assignedDeveloperId,
            status: task.status,
            priority: task.priority,
            dueDate: task.dueDate,
        },
    });
}

const activityLogs = [
  {
    projectId: 1,
    taskId: 1,
    userId: 4,
    action: "TASK_STATUS_CHANGED",
    oldStatus: TaskStatus.TODO,
    newStatus: TaskStatus.IN_PROGRESS,
  },
  {
    projectId: 1,
    taskId: 2,
    userId: 5,
    action: "TASK_STATUS_CHANGED",
    oldStatus: TaskStatus.IN_PROGRESS,
    newStatus: TaskStatus.DONE,
  },
  {
    projectId: 2,
    taskId: 3,
    userId: 6,
    action: "TASK_STATUS_CHANGED",
    oldStatus: TaskStatus.TODO,
    newStatus: TaskStatus.BLOCKED,
  },
  {
    projectId: 2,
    taskId: 4,
    userId: 7,
    action: "TASK_STATUS_CHANGED",
    oldStatus: TaskStatus.IN_PROGRESS,
    newStatus: TaskStatus.DONE,
  },
  {
    projectId: 3,
    taskId: 5,
    userId: 4,
    action: "TASK_STATUS_CHANGED",
    oldStatus: TaskStatus.TODO,
    newStatus: TaskStatus.IN_PROGRESS,
  },
];
for (const activity of activityLogs) {
  await prisma.activityLog.create({
    data: {
      projectId: activity.projectId,
      taskId: activity.taskId,
      userId: activity.userId,
      action: activity.action,
      oldStatus: activity.oldStatus,
      newStatus: activity.newStatus,
    },
  });
}
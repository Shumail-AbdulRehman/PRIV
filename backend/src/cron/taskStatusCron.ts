import cron from "node-cron";
import { prisma } from "../prisma/prisma.js";

cron.schedule("*/5 * * * *", async () => {
  try {
    const now = new Date();

    
    const missedTasks = await prisma.taskInstance.updateMany({
      where: {
        shiftEnd: { lt: now },
        status: "PENDING",
        isActive: true
      },
      data: {
        status: "MISSED"
      }
    });

    
    
    const incompleteTasks = await prisma.taskInstance.updateMany({
      where: {
        shiftEnd: { lt: now },
        status: "IN_PROGRESS",
        completedAt: null,
        isActive: true
      },
      data: {
        status: "NOT_COMPLETED_INTIME"
      }
    });

    console.log(`Cron: ${missedTasks.count} missed, ${incompleteTasks.count} not_completed_intime`);
  } catch (error) {
    console.error("Task status cron error:", error);
  }
});
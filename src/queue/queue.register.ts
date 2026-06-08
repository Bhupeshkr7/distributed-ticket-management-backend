import { createWorker, createRepeatJob } from "./queue.factory";

export const QUEUES = {
  EMAIL: "email.queue",
  CLEANUP: "cleanup.queue",
};

export async function registerQueues() {
  createWorker(QUEUES.EMAIL, async (job) => {
    // await sendEmailService(job.data);
  });

  createWorker(QUEUES.CLEANUP, async () => {
    // await cleanupExpiredSeats();
  });

  await createRepeatJob(
    QUEUES.CLEANUP,
    "cleanup-job",
    {},
    "*/1 * * * *"
  );
}

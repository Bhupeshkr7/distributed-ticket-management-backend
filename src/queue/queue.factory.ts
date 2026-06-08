import { Queue, Worker, Job, WorkerOptions, JobsOptions, QueueEvents } from "bullmq";
import redisClient from "../config/redis.config";

const queues = new Map<string, Queue>();
const workers = new Map<string, Worker>();
const events = new Map<string, QueueEvents>();

export function getQueue(name: string): Queue {
  if (!queues.has(name)) {
    const queue = new Queue(name, {
      connection: redisClient,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 1000 },
        removeOnComplete: 100,
        removeOnFail: 500,
      },
    });
    queues.set(name, queue);
  }
  return queues.get(name)!;
}

export function createWorker(
  queueName: string,
  processor: (job: Job) => Promise<void>,
  options?: WorkerOptions
): Worker {
  if (workers.has(queueName)) return workers.get(queueName)!;

  const worker = new Worker(queueName, processor, {
    connection: redisClient,
    concurrency: 5,
    ...options,
  });

  const queueEvents = new QueueEvents(queueName, { connection: redisClient });

  worker.on("completed", (job) => {
    console.log(`[${queueName}] completed ${job.name} ${job.id}`);
  });

  worker.on("failed", (job, err) => {
    console.error(`[${queueName}] failed ${job?.name} ${job?.id}`, err);
  });

  queueEvents.on("stalled", ({ jobId }) => {
    console.warn(`[${queueName}] stalled ${jobId}`);
  });

  workers.set(queueName, worker);
  events.set(queueName, queueEvents);

  return worker;
}

export async function createJob(
  queueName: string,
  jobName: string,
  payload: any,
  options?: JobsOptions
) {
  const queue = getQueue(queueName);
  return queue.add(jobName, payload, {
    jobId: payload?.id ? `${jobName}:${payload.id}` : undefined,
    ...options,
  });
}

export async function createBulkJobs(
  queueName: string,
  jobs: { name: string; data: any; opts?: JobsOptions }[]
) {
  const queue = getQueue(queueName);
  return queue.addBulk(
    jobs.map((j) => ({
      name: j.name,
      data: j.data,
      opts: j.opts,
    }))
  );
}

export async function createDelayedJob(
  queueName: string,
  jobName: string,
  payload: any,
  delay: number,
  options?: JobsOptions
) {
  return createJob(queueName, jobName, payload, {
    delay,
    ...options,
  });
}

export async function createRepeatJob(
  queueName: string,
  jobName: string,
  payload: any,
  cron: string,
  options?: JobsOptions
) {
  const queue = getQueue(queueName);

  return queue.add(jobName, payload, {
    repeat: { pattern: cron },
    jobId: `repeat:${queueName}:${jobName}`,
    ...options,
  });
}

export async function removeJob(queueName: string, jobId: string) {
  const queue = getQueue(queueName);
  const job = await queue.getJob(jobId);
  if (job) await job.remove();
}

export async function pauseQueue(queueName: string) {
  const queue = getQueue(queueName);
  await queue.pause();
}

export async function resumeQueue(queueName: string) {
  const queue = getQueue(queueName);
  await queue.resume();
}

export async function cleanQueue(queueName: string) {
  const queue = getQueue(queueName);
  await queue.drain();
}

export async function obliterateQueue(queueName: string) {
  const queue = getQueue(queueName);
  await queue.obliterate({ force: true });
  queues.delete(queueName);
}

export async function getQueueStats(queueName: string) {
  const queue = getQueue(queueName);

  const [waiting, active, delayed, failed, completed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getDelayedCount(),
    queue.getFailedCount(),
    queue.getCompletedCount(),
  ]);

  return { waiting, active, delayed, failed, completed };
}

export async function closeAllQueues() {
  for (const worker of workers.values()) {
    await worker.close();
  }
  for (const event of events.values()) {
    await event.close();
  }
  for (const queue of queues.values()) {
    await queue.close();
  }
  workers.clear();
  events.clear();
  queues.clear();
}

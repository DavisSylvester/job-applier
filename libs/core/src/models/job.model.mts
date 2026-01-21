import type { Job } from "@job-applier/interfaces";
import type { ObjectId, WithId } from "mongodb";

export interface JobDocument extends Omit<Job, "id"> {
  _id?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type JobWithId = WithId<JobDocument>;

export const JOBS_COLLECTION = "jobs";

// Index definitions for MongoDB
export const JOB_INDEXES = [
  { key: { title: 1 }, name: "title_1" },
  { key: { company: 1 }, name: "company_1" },
  { key: { location: 1 }, name: "location_1" },
  { key: { url: 1 }, name: "url_1", unique: true },
  { key: { source: 1 }, name: "source_1" },
  { key: { applied: 1 }, name: "applied_1" },
  { key: { company: 1, title: 1 }, name: "company_1_title_1" },
  { key: { applied: 1, createdAt: -1 }, name: "applied_1_createdAt_-1" },
  { key: { location: 1, applied: 1 }, name: "location_1_applied_1" },
  { key: { source: 1, applied: 1 }, name: "source_1_applied_1" },
] as const;

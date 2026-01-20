import mongoose, { Schema, type Document } from "mongoose";
import type { Job } from "../interfaces/job.mts";

export interface JobDocument extends Omit<Job, "id">, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<JobDocument>(
  {
    title: {
      type: String,
      required: true,
      index: true,
    },
    company: {
      type: String,
      required: true,
      index: true,
    },
    location: {
      type: String,
      required: true,
      index: true,
    },
    url: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      required: true,
      index: true,
    },
    salary: {
      type: String,
      required: false,
    },
    postedDate: {
      type: String,
      required: false,
    },
    applied: {
      type: Boolean,
      required: true,
      default: false,
      index: true,
    },
    appliedDate: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
    collection: "jobs",
  },
);

// Create compound indexes for common queries
JobSchema.index({ company: 1, title: 1 });
JobSchema.index({ applied: 1, createdAt: -1 });
JobSchema.index({ location: 1, applied: 1 });
JobSchema.index({ source: 1, applied: 1 });

export const JobModel = mongoose.model<JobDocument>("Job", JobSchema);

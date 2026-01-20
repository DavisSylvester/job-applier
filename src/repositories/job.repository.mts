import { JobModel, type JobDocument } from "../models/job.model.mts";
import type { Job } from "../interfaces/job.mts";

export class JobRepository {
  /**
   * Save a single job to the database
   * If job URL already exists, update it instead of creating a duplicate
   */
  async save(job: Job): Promise<JobDocument> {
    try {
      const existingJob = await JobModel.findOne({ url: job.url });

      if (existingJob) {
        // Update existing job
        existingJob.title = job.title;
        existingJob.company = job.company;
        existingJob.location = job.location;
        existingJob.description = job.description;
        existingJob.source = job.source;
        existingJob.salary = job.salary;
        existingJob.postedDate = job.postedDate;
        existingJob.applied = job.applied;
        existingJob.appliedDate = job.appliedDate;

        return await existingJob.save();
      }

      // Create new job
      const newJob = new JobModel({
        title: job.title,
        company: job.company,
        location: job.location,
        url: job.url,
        description: job.description,
        source: job.source,
        salary: job.salary,
        postedDate: job.postedDate,
        applied: job.applied,
        appliedDate: job.appliedDate,
      });

      return await newJob.save();
    } catch (error) {
      console.error("Error saving job:", error);
      throw error;
    }
  }

  /**
   * Save multiple jobs to the database
   * Uses upsert operation for efficiency
   */
  async saveMany(jobs: Job[]): Promise<number> {
    try {
      if (jobs.length === 0) {
        return 0;
      }

      const bulkOps = jobs.map((job) => ({
        updateOne: {
          filter: { url: job.url },
          update: {
            $set: {
              title: job.title,
              company: job.company,
              location: job.location,
              description: job.description,
              source: job.source,
              salary: job.salary,
              postedDate: job.postedDate,
              applied: job.applied,
              appliedDate: job.appliedDate,
            },
          },
          upsert: true,
        },
      }));

      const result = await JobModel.bulkWrite(bulkOps);
      return result.upsertedCount + result.modifiedCount;
    } catch (error) {
      console.error("Error saving multiple jobs:", error);
      throw error;
    }
  }

  /**
   * Find job by URL
   */
  async findByUrl(url: string): Promise<JobDocument | null> {
    try {
      return await JobModel.findOne({ url });
    } catch (error) {
      console.error("Error finding job by URL:", error);
      throw error;
    }
  }

  /**
   * Find job by ID
   */
  async findById(id: string): Promise<JobDocument | null> {
    try {
      return await JobModel.findById(id);
    } catch (error) {
      console.error("Error finding job by ID:", error);
      throw error;
    }
  }

  /**
   * Find all jobs matching criteria
   */
  async findAll(
    criteria: {
      applied?: boolean;
      company?: string;
      location?: string;
      source?: string;
      limit?: number;
      skip?: number;
    } = {},
  ): Promise<JobDocument[]> {
    try {
      const filter: Record<string, unknown> = {};

      if (criteria.applied !== undefined) {
        filter.applied = criteria.applied;
      }
      if (criteria.company) {
        filter.company = { $regex: criteria.company, $options: "i" };
      }
      if (criteria.location) {
        filter.location = { $regex: criteria.location, $options: "i" };
      }
      if (criteria.source) {
        filter.source = criteria.source;
      }

      let query = JobModel.find(filter).sort({ createdAt: -1 });

      if (criteria.skip) {
        query = query.skip(criteria.skip);
      }
      if (criteria.limit) {
        query = query.limit(criteria.limit);
      }

      return await query.exec();
    } catch (error) {
      console.error("Error finding jobs:", error);
      throw error;
    }
  }

  /**
   * Count jobs matching criteria
   */
  async count(
    criteria: {
      applied?: boolean;
      company?: string;
      location?: string;
      source?: string;
    } = {},
  ): Promise<number> {
    try {
      const filter: Record<string, unknown> = {};

      if (criteria.applied !== undefined) {
        filter.applied = criteria.applied;
      }
      if (criteria.company) {
        filter.company = { $regex: criteria.company, $options: "i" };
      }
      if (criteria.location) {
        filter.location = { $regex: criteria.location, $options: "i" };
      }
      if (criteria.source) {
        filter.source = criteria.source;
      }

      return await JobModel.countDocuments(filter);
    } catch (error) {
      console.error("Error counting jobs:", error);
      throw error;
    }
  }

  /**
   * Mark job as applied
   */
  async markAsApplied(
    id: string,
    appliedDate: string,
  ): Promise<JobDocument | null> {
    try {
      return await JobModel.findByIdAndUpdate(
        id,
        {
          $set: {
            applied: true,
            appliedDate: appliedDate,
          },
        },
        { new: true },
      );
    } catch (error) {
      console.error("Error marking job as applied:", error);
      throw error;
    }
  }

  /**
   * Delete job by ID
   */
  async delete(id: string): Promise<boolean> {
    try {
      const result = await JobModel.findByIdAndDelete(id);
      return result !== null;
    } catch (error) {
      console.error("Error deleting job:", error);
      throw error;
    }
  }

  /**
   * Get statistics about stored jobs
   */
  async getStats(): Promise<{
    total: number;
    applied: number;
    notApplied: number;
  }> {
    try {
      const [total, applied] = await Promise.all([
        JobModel.countDocuments(),
        JobModel.countDocuments({ applied: true }),
      ]);

      return {
        total,
        applied,
        notApplied: total - applied,
      };
    } catch (error) {
      console.error("Error getting job statistics:", error);
      throw error;
    }
  }
}

import {
  type JobDocument,
  type JobWithId,
  JOBS_COLLECTION,
  JOB_INDEXES,
} from "../models/job.model.mts";
import type { Job } from "@job-applier/interfaces";
import type { Collection, Db, ObjectId } from "mongodb";

export class JobRepository {
  private collection: Collection<JobDocument> | null = null;
  private indexesCreated = false;

  /**
   * Initialize repository with database instance
   */
  initialize(db: Db): void {
    this.collection = db.collection<JobDocument>(JOBS_COLLECTION);
  }

  /**
   * Ensure indexes are created
   */
  private async ensureIndexes(): Promise<void> {
    if (this.indexesCreated || !this.collection) {
      return;
    }

    try {
      for (const index of JOB_INDEXES) {
        await this.collection.createIndex(index.key, {
          name: index.name,
          unique: index.unique,
        });
      }
      this.indexesCreated = true;
    } catch (error) {
      console.error("Error creating indexes:", error);
    }
  }

  /**
   * Get collection instance
   */
  private getCollection(): Collection<JobDocument> {
    if (!this.collection) {
      throw new Error("Repository not initialized. Call initialize(db) first.");
    }
    return this.collection;
  }

  /**
   * Save a single job to the database
   * If job URL already exists, update it instead of creating a duplicate
   */
  async save(job: Job): Promise<JobWithId> {
    try {
      await this.ensureIndexes();
      const collection = this.getCollection();

      const existingJob = await collection.findOne({ url: job.url });

      const now = new Date();
      const jobData: Partial<JobDocument> = {
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
        updatedAt: now,
      };

      if (existingJob) {
        // Update existing job
        const result = await collection.findOneAndUpdate(
          { url: job.url },
          { $set: jobData },
          { returnDocument: "after" },
        );

        if (!result) {
          throw new Error("Failed to update job");
        }
        return result;
      }

      // Create new job
      const newJob: JobDocument = {
        ...jobData,
        createdAt: now,
      } as JobDocument;

      const result = await collection.insertOne(newJob);
      return { ...newJob, _id: result.insertedId } as JobWithId;
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

      await this.ensureIndexes();
      const collection = this.getCollection();

      const now = new Date();
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
              updatedAt: now,
            },
            $setOnInsert: {
              createdAt: now,
            },
          },
          upsert: true,
        },
      }));

      const result = await collection.bulkWrite(bulkOps);
      return result.upsertedCount + result.modifiedCount;
    } catch (error) {
      console.error("Error saving multiple jobs:", error);
      throw error;
    }
  }

  /**
   * Find job by URL
   */
  async findByUrl(url: string): Promise<JobWithId | null> {
    try {
      const collection = this.getCollection();
      return await collection.findOne({ url });
    } catch (error) {
      console.error("Error finding job by URL:", error);
      throw error;
    }
  }

  /**
   * Find job by ID
   */
  async findById(id: string | ObjectId): Promise<JobWithId | null> {
    try {
      const collection = this.getCollection();
      const { ObjectId: ObjectIdConstructor } = await import("mongodb");
      const objectId =
        typeof id === "string" ? new ObjectIdConstructor(id) : id;
      return await collection.findOne({ _id: objectId });
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
  ): Promise<JobWithId[]> {
    try {
      const collection = this.getCollection();
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

      let query = collection.find(filter).sort({ createdAt: -1 });

      if (criteria.skip) {
        query = query.skip(criteria.skip);
      }
      if (criteria.limit) {
        query = query.limit(criteria.limit);
      }

      return await query.toArray();
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
      const collection = this.getCollection();
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

      return await collection.countDocuments(filter);
    } catch (error) {
      console.error("Error counting jobs:", error);
      throw error;
    }
  }

  /**
   * Mark job as applied
   */
  async markAsApplied(
    id: string | ObjectId,
    appliedDate: string,
  ): Promise<JobWithId | null> {
    try {
      const collection = this.getCollection();
      const { ObjectId: ObjectIdConstructor } = await import("mongodb");
      const objectId =
        typeof id === "string" ? new ObjectIdConstructor(id) : id;

      return await collection.findOneAndUpdate(
        { _id: objectId },
        {
          $set: {
            applied: true,
            appliedDate: appliedDate,
            updatedAt: new Date(),
          },
        },
        { returnDocument: "after" },
      );
    } catch (error) {
      console.error("Error marking job as applied:", error);
      throw error;
    }
  }

  /**
   * Delete job by ID
   */
  async delete(id: string | ObjectId): Promise<boolean> {
    try {
      const collection = this.getCollection();
      const { ObjectId: ObjectIdConstructor } = await import("mongodb");
      const objectId =
        typeof id === "string" ? new ObjectIdConstructor(id) : id;

      const result = await collection.deleteOne({ _id: objectId });
      return result.deletedCount > 0;
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
      const collection = this.getCollection();

      const [total, applied] = await Promise.all([
        collection.countDocuments(),
        collection.countDocuments({ applied: true }),
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

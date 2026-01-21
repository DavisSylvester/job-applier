import { MongoClient, Db } from "mongodb";
import type { Config } from "@job-applier/config";

export class DatabaseService {
  private config: Config;
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private isConnected = false;

  constructor(config: Config) {
    this.config = config;
  }

  /**
   * Build MongoDB connection URI
   */
  private buildConnectionUri(): string {
    const { username, password, host, dbName } = this.config.mongodb;

    // MongoDB Atlas connection string format
    // Host should already include the full domain (e.g., cluster0.abc123.mongodb.net)
    const uri = `mongodb+srv://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${host}/${dbName}?retryWrites=true&w=majority`;

    return uri;
  }

  /**
   * Connect to MongoDB
   */
  async connect(): Promise<void> {
    if (this.isConnected && this.client) {
      console.log("Already connected to MongoDB");
      return;
    }

    try {
      const uri = this.buildConnectionUri();

      this.client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      await this.client.connect();
      this.db = this.client.db(this.config.mongodb.dbName);
      this.isConnected = true;
      console.log("✓ Connected to MongoDB successfully");
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error);
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * Disconnect from MongoDB
   */
  async disconnect(): Promise<void> {
    if (!this.isConnected || !this.client) {
      return;
    }

    try {
      await this.client.close();
      this.client = null;
      this.db = null;
      this.isConnected = false;
      console.log("Disconnected from MongoDB");
    } catch (error) {
      console.error("Error disconnecting from MongoDB:", error);
      throw error;
    }
  }

  /**
   * Get the database instance
   */
  getDb(): Db {
    if (!this.db) {
      throw new Error("Database not connected. Call connect() first.");
    }
    return this.db;
  }

  /**
   * Check if connected to MongoDB
   */
  isConnectedToDatabase(): boolean {
    return this.isConnected && this.client !== null;
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): string {
    if (this.isConnected && this.client) {
      return "connected";
    }
    return "disconnected";
  }
}

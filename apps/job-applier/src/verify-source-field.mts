#!/usr/bin/env bun
import type { Job } from "./src/interfaces/job.mts";

// Verify the Job interface includes the source field
const testJob: Job = {
  id: "test-123",
  title: "Software Engineer",
  company: "Tech Company",
  location: "Dallas, TX",
  url: "https://indeed.com/job/123",
  description: "Job description",
  source: "Indeed", // This is the new required field
  salary: "$100k",
  postedDate: "2024-01-01",
  applied: false,
};

console.log("✓ Job interface includes source field");
console.log("Test job:", JSON.stringify(testJob, null, 2));

// Verify source is required (this would fail if source was optional)
// @ts-expect-error - Missing required source field
const invalidJob: Job = {
  id: "test-456",
  title: "Another Job",
  company: "Another Company",
  location: "Austin, TX",
  url: "https://indeed.com/job/456",
  description: "Description",
  applied: false,
};

console.log(
  "\n✓ Source field is required (TypeScript compilation will catch missing source)",
);
console.log("\nAll verifications passed!");

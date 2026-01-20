import { z } from 'zod';

const ConfigSchema = z.object({
  indeed: z.object({
    email: z.string().email(),
    password: z.string().min(1),
    authProvider: z.enum(['password', 'google']).default('password'),
  }),
  proxy: z.object({
    host: z.string(),
    port: z.number(),
    username: z.string().optional(),
    password: z.string().optional(),
    enabled: z.boolean(),
  }),
  jobSearch: z.object({
    keywords: z.array(z.string()),
    location: z.string(),
    radius: z.number(),
  }),
  application: z.object({
    autoApply: z.boolean(),
    dryRun: z.boolean(),
    maxApplicationsPerDay: z.number(),
    headless: z.boolean(),
  }),
  paths: z.object({
    resume: z.string(),
    coverLetter: z.string(),
  }),
  google: z.object({
    email: z.string().email().optional(),
    password: z.string().optional(),
  }).default({}),
});

export type Config = z.infer<typeof ConfigSchema>;

export function loadConfig(): Config {

  const config = {
    indeed: {
      email: process.env.INDEED_EMAIL || '',
      password: process.env.INDEED_PASSWORD || '',
      authProvider: (process.env.INDEED_AUTH_PROVIDER === 'google') ? 'google' : 'password',
    },
    proxy: {
      host: process.env.PROXY_HOST || '',
      port: parseInt(process.env.PROXY_PORT || '8080', 10),
      username: process.env.PROXY_USERNAME,
      password: process.env.PROXY_PASSWORD,
      enabled: process.env.USE_PROXY === 'true',
    },
    jobSearch: {
      keywords: (process.env.JOB_SEARCH_KEYWORDS || '').split(',').map(k => k.trim()),
      location: process.env.JOB_LOCATION || '',
      radius: parseInt(process.env.JOB_RADIUS || '50', 10),
    },
    application: {
      autoApply: process.env.AUTO_APPLY === 'true',
      dryRun: process.env.DRY_RUN === 'true',
      maxApplicationsPerDay: parseInt(process.env.MAX_APPLICATIONS_PER_DAY || '10', 10),
      headless: process.env.HEADLESS === 'true',
    },
    paths: {
      resume: process.env.RESUME_PATH || './data/resume.pdf',
      coverLetter: process.env.COVER_LETTER_PATH || './data/cover-letter.txt',
    },
    google: {
      email: process.env.GOOGLE_EMAIL,
      password: process.env.GOOGLE_PASSWORD,
    },
  };

  return ConfigSchema.parse(config);
}

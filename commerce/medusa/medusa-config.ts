import { loadEnv, defineConfig, Modules } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS ?? "http://localhost:4321",
      adminCors: process.env.ADMIN_CORS ?? "http://localhost:7001",
      authCors: process.env.AUTH_CORS ?? "http://localhost:4321,http://localhost:7001",
      jwtSecret: process.env.JWT_SECRET ?? "supersecret",
      cookieSecret: process.env.COOKIE_SECRET ?? "supersecret",
    },
  },

  admin: {
    // Admin panel is served at /app by default in production
    // Restrict access via Railway private networking or a VPN
    disable: process.env.DISABLE_MEDUSA_ADMIN === "true",
    backendUrl: process.env.MEDUSA_BACKEND_URL ?? "http://localhost:9000",
  },

  modules: [
    // ─── Stripe Payment Provider ────────────────────────────────────────────
    {
      resolve: "@medusajs/payment-stripe",
      options: {
        apiKey: process.env.STRIPE_SECRET_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
        // Automatic tax calculation via Stripe Tax
        automatic_payment_methods: true,
      },
    },

    // ─── File Storage (local in dev, swap to S3/R2 in prod) ─────────────────
    {
      resolve: "@medusajs/file-local",
      id: Modules.FILE,
      options: {
        upload_dir: "uploads",
        backend_url: process.env.MEDUSA_BACKEND_URL ?? "http://localhost:9000",
      },
    },

    // ─── Email Notifications (SendGrid or nodemailer SMTP) ───────────────────
    {
      resolve: "@medusajs/notification-sendgrid",
      id: Modules.NOTIFICATION,
      options: {
        channels: ["email"],
        api_key: process.env.SENDGRID_API_KEY,
        from: process.env.SENDGRID_FROM_EMAIL ?? "orders@pieceofstass.com",
      },
    },

    // ─── Custom Dropship Module ──────────────────────────────────────────────
    {
      resolve: "./src/modules/dropship",
      options: {
        // Supplier contact emails — set in environment
        supplierEmails: {
          chenyico: process.env.SUPPLIER_EMAIL_CHENYICO,
          "117034687": process.env.SUPPLIER_EMAIL_117034687,
          "3293950449": process.env.SUPPLIER_EMAIL_3293950449,
          miao2017: process.env.SUPPLIER_EMAIL_MIAO2017,
          ypd2023: process.env.SUPPLIER_EMAIL_YPD2023,
          "775180006": process.env.SUPPLIER_EMAIL_775180006,
          jmshop88: process.env.SUPPLIER_EMAIL_JMSHOP88,
          xtd8288: process.env.SUPPLIER_EMAIL_XTD8288,
        },
        smtpHost: process.env.SMTP_HOST,
        smtpPort: parseInt(process.env.SMTP_PORT ?? "587"),
        smtpUser: process.env.SMTP_USER,
        smtpPass: process.env.SMTP_PASS,
        fromEmail: process.env.SUPPLIER_NOTIFY_FROM ?? "ops@pieceofstass.com",
      },
    },
  ],
})

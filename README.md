# ReportBot 📊🤖

> **Automated Sales Analytics, Data Quality Quarantine & Boardroom PDF Publishing Pipeline**

ReportBot is an end-to-end automated analytics pipeline and management dashboard. It continuously ingests raw sales data, isolates corrupt records through an automated quarantine engine, computes business intelligence KPIs with Python & Pandas, compiles boardroom-ready multi-page executive PDF reports using ReportLab Platypus, and delivers them to stakeholders via a scheduled email dispatcher.

---

## 🚀 Key Features

### 1. Ingestion & Quality Control Quarantine
- **Queue Ingestion**: Automatically watches `/data/incoming/` for transactional sales CSVs.
- **Strict Schema Validation**: Validates required fields, data types, and logical bounds (non-negative pricing, valid order dates, quantity checks).
- **Automated Quarantine System**: Isolates defective rows into `/data/quarantine/` with diagnostic failure reasons, allowing the healthy dataset to continue processing without pipeline interruption.
- **Sample Data Generator**: Generates realistic multi-region enterprise transaction batches on demand.

### 2. Business Intelligence & Financial Analytics
- **Executive KPIs**: Computes Gross Revenue, Total Orders, Units Sold, Average Order Value (AOV), Customer Lifetime Value (CLV), and Month-over-Month (MoM) revenue growth.
- **Dimensional Breakdowns**: Generates regional sales shares (North America, Europe, APAC, LATAM, MEA), product category revenue contributions, top-performing SKUs, and weekly/daily trends.
- **Interactive Visualizations**: Real-time charts powered by Recharts with interactive tooltips and revenue breakdowns.

### 3. Boardroom-Grade PDF Publishing (ReportLab Platypus)
- **Cover Page & Executive Deck**: Formatted with a navy corporate branding palette, run identifiers, confidentiality notices, and generation timestamps.
- **Embedded Visual Charts**: Renders vector-quality 300 DPI Matplotlib charts directly into PDF pages.
- **Formatted Platypus Tables**: Alternating row stripes, wrapped text cells, and currency formatting.
- **Two-Pass Page Numbering**: Uses a custom `NumberedCanvas` engine that prints dynamic *"Page X of Y"* totals and running document headers across variable-length reports.
- **In-App PDF Viewer**: Preview compiled PDFs inline directly in the browser or download with a single click.

### 4. Automated Delivery & Schedule Configuration
- **Automatic Delivery Switch**: Enable or pause automated daily/scheduled report compilation and distribution.
- **Preferred Delivery Hours**: Select enterprise presets (*Morning Briefing 09:00 AM UTC*, *Midday Checkpoint 12:00 PM UTC*, *End of Day Digest 05:00 PM UTC*, *Nightly Audit Batch 09:00 PM UTC*) or choose custom 24-hour delivery chips (`06:00` to `23:00`).
- **Cadence & Timezone Controls**: Configure delivery frequency (*Daily* vs. *Weekdays*) synchronized with the backend daemon.

### 5. Latency Tracking & Audit Observability
- **Execution Sparkline Widget**: Renders an interactive SVG sparkline chart of execution times across the last 10 pipeline runs, complete with a 10-run mean benchmark line, min/max bounds, and run inspector pills.
- **SQLite Audit Ledger**: Complete audit trail stored in `data/reportbot.db` (`pipeline_runs`, `email_dispatch_log`, `pipeline_config`, `quarantine_records`).
- **Interactive Browser Terminal**: Built-in CLI console providing immediate execution of `reportbot` commands.

---

## 🏗️ Architecture & Data Flow

```text
  Raw CSV Batch Ingestion
      (/data/incoming)
             │
             ▼
  ┌───────────────────────────────────────────────┐
  │         Schema Validation & Hygiene           │
  └──────────────────────┬────────────────────────┘
                         │
         ┌───────────────┴───────────────┐
         │ Valid                         │ Malformed
         ▼                               ▼
  Pandas BI Analytics Engine      Data Quarantine Archive
  (Revenue, AOV, CLV, MoM)        (/data/quarantine/*.json)
         │
         ▼
  ReportLab Platypus Engine
  (Multi-page PDF + Matplotlib Charts)
         │
         ▼
  Automated Delivery Dispatcher (SMTP)
  (Executive Email Preview & Attachments)
         │
         ▼
  SQLite Audit Ledger & UI Dashboard
  (Metrics, Sparkline Widget, Reports, Logs)

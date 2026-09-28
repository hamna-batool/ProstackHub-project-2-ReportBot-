export interface KPIMetrics {
  total_revenue: number;
  total_orders: number;
  total_units: number;
  unique_customers: number;
  aov: number;
  clv: number;
  mom_growth_pct: number;
}

export interface DailyRevenue {
  order_date_dt: string;
  revenue: number;
  orders: number;
  units: number;
}

export interface WeeklyRevenue {
  year_week: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  product_id: string;
  product_name: string;
  category: string;
  total_revenue: number;
  units_sold: number;
  avg_price: number;
  revenue_share: number;
}

export interface RegionalBreakdown {
  region: string;
  total_revenue: number;
  order_count: number;
  units_sold: number;
  revenue_share: number;
  aov: number;
}

export interface CustomerTier {
  tier: string;
  customers: number;
  total_revenue: number;
  revenue_share: number;
}

export interface AnalyticsMetrics {
  kpis: KPIMetrics;
  daily_revenue: DailyRevenue[];
  weekly_revenue: WeeklyRevenue[];
  top_products: TopProduct[];
  regional_breakdown: RegionalBreakdown[];
  monthly_revenue: { year_month: string; revenue: number; orders: number }[];
  category_breakdown: { category: string; total_revenue: number; units_sold: number; revenue_share: number }[];
  customer_tiers: CustomerTier[];
  date_range: { min_date: string; max_date: string };
}

export interface PipelineRun {
  id: number;
  run_id: string;
  timestamp: string;
  trigger_type: string;
  status: string;
  files_processed: number;
  valid_rows: number;
  quarantined_rows: number;
  total_revenue: number;
  aov: number;
  clv: number;
  mom_growth: number;
  pdf_path: string;
  email_sent: number;
  email_recipients: string;
  duration_ms: number;
  summary_json?: AnalyticsMetrics | null;
  error_message?: string;
}

export interface QuarantinedRecord {
  id: number;
  run_id: string;
  filename: string;
  row_index: number;
  raw_data: string;
  validation_error: string;
  timestamp: string;
  parsed_data?: Record<string, any> | string;
}

export interface QuarantineFile {
  filename: string;
  size: number;
  date: string;
}

export interface GeneratedReport {
  filename: string;
  size: number;
  createdAt: string;
  downloadUrl: string;
  viewUrl: string;
  thumbnailUrl: string | null;
}

export interface EmailPreviewData {
  subject: string;
  to: string;
  cc: string;
  bcc: string;
  pdfAttachment: string;
  hasThumbnail: boolean;
  thumbnailUrl: string | null;
  kpis: KPIMetrics;
  runId: string;
  timestamp: string;
}

export interface EmailLog {
  id: number;
  run_id: string;
  to_recipients: string;
  cc_recipients: string;
  bcc_recipients: string;
  subject: string;
  status: string;
  attempts: number;
  timestamp: string;
  error_details: string;
}

export interface SystemStatus {
  status: string;
  service: string;
  uptime: number;
  currentTime: string;
  scheduleTime: string;
  incomingQueueCount: number;
  incomingFiles: string[];
  totalRuns: number;
  quarantineCount: number;
  lastRun: PipelineRun | null;
  config: Record<string, string>;
}

export interface ScheduleConfig {
  autoDelivery: boolean;
  preferredHours: string[];
  scheduleTime: string;
  deliveryDays?: string;
  timezone?: string;
  recipient?: string;
}

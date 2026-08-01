export type LabStatus = "Not Started" | "In Progress" | "Completed";

export interface LabProgress {
  labId: string;
  status: LabStatus;
  scoreEarned: number;
  maxScore: number;
  timeSeconds: number;
  completedAt?: string;
  answers?: (number | null)[];
}

const LAB_PROGRESS_KEY = "cyberpulse_lab_progress";

export function getLabProgressAll(): LabProgress[] {
  try {
    return JSON.parse(localStorage.getItem(LAB_PROGRESS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function getLabProgress(labId: string): LabProgress | null {
  return getLabProgressAll().find((p) => p.labId === labId) ?? null;
}

export function saveLabProgress(progress: LabProgress): void {
  const all = getLabProgressAll().filter((p) => p.labId !== progress.labId);
  all.push(progress);
  localStorage.setItem(LAB_PROGRESS_KEY, JSON.stringify(all));
}

/** Format elapsed seconds into "Xm Ys" or "Xh Ym" */
export function formatLabTime(seconds: number): string {
  if (seconds <= 0) return "0m 0s";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s}s`;
}

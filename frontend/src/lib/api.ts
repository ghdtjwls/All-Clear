// src/lib/api.ts

// ✅ HTTPS/HTTP 자동 분기 + 환경변수 우선 적용
// const isHttps =
  // typeof window !== "undefined" && window.location.protocol === "https:";

//export const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";
export const API_BASE = import.meta.env.VITE_API_BASE || "/api";

if (!API_BASE) {
  console.warn("⚠️ VITE_API_BASE 가 설정되지 않았습니다. 기본값으로 /api 를 사용합니다.");
}

/** 백엔드 생존자 데이터 타입 */
export type ApiSurvivor = {
  id: number;
  survivorNumber: number;
  location: {
    buildingName: string;
    floor: number;
    roomNumber: string;
    fullAddress?: string;
  };
  currentStatus: "CONSCIOUS" | "UNCONSCIOUS" | "INJURED" | "TRAPPED";
  detectionMethod: "WIFI" | "CCTV";
  rescueStatus: "WAITING" | "IN_RESCUE" | "RESCUED" | "CANCELED";
};

/** 프론트 UI용 생존자 타입 */
export type Survivor = {
  id: string;
  rank: number;
  riskScore: number;
  location: string;
  floor: number;
  room: string;
  status: "conscious" | "unconscious" | "injured" | "trapped";
  detectionMethod: "wifi" | "cctv";
  rescueStatus: "pending" | "dispatched" | "rescued";
  x: number;
  y: number;
};

/** 매핑 */
const mapStatus = {
  CONSCIOUS: "conscious",
  UNCONSCIOUS: "unconscious",
  INJURED: "injured",
  TRAPPED: "trapped",
} as const;

const mapMethod = {
  CCTV: "cctv",
  WIFI: "wifi",
} as const;

const mapRescue = {
  WAITING: "pending",
  IN_RESCUE: "dispatched",
  RESCUED: "rescued",
  CANCELED: "pending",
} as const;

/** 생존자 위험도 기본값 (AI 분석 결과로 DetailPanel에서 덮어씀) */
function estimateRiskScore(): number {
  return 10;
}

/** ✅ 생존자 목록 가져오기 */
export async function fetchSurvivors(): Promise<Survivor[]> {
  const res = await fetch(`${API_BASE}/survivors`);
  if (!res.ok) throw new Error("서버에서 생존자 목록을 가져오지 못했습니다.");

  const arr: ApiSurvivor[] = await res.json();

  return arr.map((a, i) => ({
    id: String(a.id),
    rank: 0,
    riskScore: estimateRiskScore(),
    location: a.location.buildingName,
    floor: a.location.floor,
    room: a.location.fullAddress ?? a.location.roomNumber,
    status: mapStatus[a.currentStatus],
    detectionMethod: mapMethod[a.detectionMethod],
    rescueStatus: mapRescue[a.rescueStatus],
    x: 50 + ((i * 7) % 40),
    y: 50 + ((i * 11) % 40),
  }));
}

/** ✅ 구조 상태 변경 */
export async function updateRescueStatus(
  id: string,
  status: "WAITING" | "IN_RESCUE" | "RESCUED" | "CANCELED"
) {
  const res = await fetch(
    `${API_BASE}/survivors/${id}/rescue-status?rescueStatus=${status}`,
    { method: "PATCH" }
  );
  if (!res.ok) throw new Error("구조 상태 변경 실패");
}

/** ✅ 생존자 삭제 (오탐 처리) */
export async function deleteSurvivor(id: string) {
  const res = await fetch(`${API_BASE}/survivors/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("오탐 제거 실패");
}

/** ✅ AI 분석 정보 타입 */
export type AiAnalysis = {
  survivorId: number;
  survivorNumber: number;
  aiAnalysisResult: string;
  locationId: number;
  fullAddress: string;
  currentStatus: string;
  currentStatusDescription: string;
  detectionMethod: string;
  detectionMethodDescription: string;
  statusScore: number;
  environmentScore: number;
  confidenceCoefficient: number;
  finalRiskScore: number;
};

/** ✅ AI 분석 정보 가져오기 (최신 API 반영) */
export async function fetchAiAnalysis(
  survivorId: string
): Promise<AiAnalysis> {
  const res = await fetch(
    `${API_BASE}/detections/survivor/${survivorId}/analysis`
  );
  if (!res.ok) throw new Error("AI 분석 정보를 가져오지 못했습니다.");
  return await res.json();
}
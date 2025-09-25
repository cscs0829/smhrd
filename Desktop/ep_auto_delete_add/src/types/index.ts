export interface ClickDataResponse {
  success: boolean;
  totalCsvItems: number;
  zeroClickItems: number;
  movedToDelect: number;
  notFoundInEpData: number;
  totalMovedToDelect: number;
  error?: string;
}

export interface TitleResult {
  id: string;
  title: string;
  score: number;
}

export interface GenerateTitlesRequest {
  keywords: string;
}

export interface GenerateTitlesResponse {
  success: boolean;
  titles: TitleResult[];
  keywordCount: number;
  error?: string;
  message?: string;
}

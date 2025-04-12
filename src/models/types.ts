export interface Config {
  alwaysAccept: boolean;
  model: string;
  timeoutSeconds: number;
  customPrompt?: string;
}

export interface CommitMessageResponse {
  message: string;
  fullMessage: string;
  toString(): string;
}

export interface GitChangeset {
  files: string[];
  diff: string;
}

export interface OllamaApiResponse {
  response: string;
  error?: string;
}

export interface GenerationOptions {
  model: string;
  timeout: number;
  maxLength?: number;
}

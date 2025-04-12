import {
  CommitMessageResponse,
  Config,
  GenerationOptions,
  GitChangeset,
} from "../models/types";

export interface IConfigService {
  getConfig(): Config;
  updateConfig(newConfig: Partial<Config>): Config;
}

export interface IGitService {
  isGitRepository(): Promise<boolean>;
  getStagedFiles(): Promise<string[]>;
  getStagedDiff(): Promise<string | null>;
  commitWithMessage(message: string): Promise<void>;
}

export interface ILanguageModelService {
  isInstalled(): Promise<boolean>;
  isRunning(): Promise<boolean>;
  generateText(prompt: string, options: GenerationOptions): Promise<string>;
  listAvailableModels(): Promise<string[]>;
}

export interface IPromptService {
  getCommitMessagePrompt(
    changeset: GitChangeset,
    customPrompt?: string
  ): string;
  getConfigPromptTemplate(): string;
}

export interface ICommitMessageService {
  generateCommitMessage(
    changeset: GitChangeset
  ): Promise<CommitMessageResponse>;
}

export interface IConsoleService {
  confirmCommit(message: CommitMessageResponse): Promise<boolean>;
  showError(error: Error): void;
  showSuccess(message: string): void;
  showInfo(message: string): void;
  showWarning(message: string): void;
  debug(message: string, ...args: any[]): void;
}

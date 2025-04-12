import { IGitService } from "../interfaces";
import { exec } from "child_process";
import { promisify } from "util";

export class GitService implements IGitService {
  private execAsync = promisify(exec);

  public async isGitRepository(): Promise<boolean> {
    try {
      await this.execAsync("git rev-parse --is-inside-work-tree");
      return true;
    } catch (error) {
      return false;
    }
  }

  public async getStagedFiles(): Promise<string[]> {
    try {
      const { stdout } = await this.execAsync("git diff --name-only --cached");
      return stdout.split("\n").filter((line) => line.trim() !== "");
    } catch (error) {
      throw new Error(
        `Failed to get staged files: ${this.getErrorMessage(error)}`
      );
    }
  }

  public async getStagedDiff(): Promise<string | null> {
    try {
      const { stdout } = await this.execAsync("git diff --cached");
      return stdout.trim() || null;
    } catch (error) {
      throw new Error(
        `Failed to get staged diff: ${this.getErrorMessage(error)}`
      );
    }
  }

  public async commitWithMessage(message: string): Promise<void> {
    try {
      // Escape quotes in commit message
      const escapedMessage = message.replace(/"/g, '\\"');
      await this.execAsync(`git commit -m "${escapedMessage}"`);
    } catch (error) {
      throw new Error(`Failed to commit: ${this.getErrorMessage(error)}`);
    }
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }
}

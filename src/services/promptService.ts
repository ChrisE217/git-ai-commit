import { IPromptService, IConsoleService } from "../interfaces";
import { GitChangeset } from "../models/types";

export class PromptService implements IPromptService {
  private readonly MAX_DIFF_LENGTH = 2000;

  constructor(private readonly consoleService: IConsoleService) {}

  public getCommitMessagePrompt(
    changeset: GitChangeset,
    customPrompt?: string
  ): string {
    if (customPrompt) {
      this.consoleService.debug(
        "Using custom prompt template instead of default"
      );
      return this.interpolateCustomPrompt(customPrompt, changeset);
    }

    return this.getDefaultCommitPrompt(changeset);
  }

  public getConfigPromptTemplate(): string {
    return `Generate a concise git commit message for these files: \${files.join(", ")}.

Rules:
- Keep it under 100 characters
- Do NOT include emojis
- Be specific and clear
- Do NOT use prefixes like "feat:", "fix:", etc.
- Analyze the diff to identify the most significant changes and include specific details about them
- Focus on the content/purpose of the main changes, not just which files were changed

Changes:
\${diff}`;
  }

  private getDefaultCommitPrompt(changeset: GitChangeset): string {
    const { files, diff } = changeset;
    const truncatedDiff = this.truncateDiff(diff);

    return `Generate a concise git commit message for these files: ${files.join(
      ", "
    )}.

Rules:
- Keep it under 100 characters
- Do NOT include emojis
- Be specific and clear
- Do NOT use prefixes like "feat:", "fix:", etc.
- Analyze the diff to identify the most significant changes and include specific details about them
- Focus on the content/purpose of the main changes, not just which files were changed

Changes:
${truncatedDiff}`;
  }

  private truncateDiff(diff: string): string {
    if (diff.length <= this.MAX_DIFF_LENGTH) {
      return diff;
    }
    return `${diff.substring(0, this.MAX_DIFF_LENGTH)}...`;
  }

  private interpolateCustomPrompt(
    template: string,
    changeset: GitChangeset
  ): string {
    try {
      const interpolationFn = new Function(
        "files",
        "diff",
        `return \`${template}\``
      );
      return interpolationFn(changeset.files, changeset.diff);
    } catch (error) {
      this.consoleService.showError(
        error instanceof Error ? error : new Error(String(error))
      );
      this.consoleService.debug(
        "Error with custom prompt, falling back to default"
      );
      return this.getDefaultCommitPrompt(changeset);
    }
  }
}

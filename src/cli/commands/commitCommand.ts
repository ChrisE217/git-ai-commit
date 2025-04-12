import {
  ICommitMessageService,
  IGitService,
  IConsoleService,
} from "../../interfaces";
import { GitChangeset } from "../../models/types";

export class CommitCommand {
  constructor(
    private readonly gitService: IGitService,
    private readonly commitMessageService: ICommitMessageService,
    private readonly consoleService: IConsoleService
  ) {}

  public async execute(): Promise<void> {
    try {
      this.consoleService.debug("Starting AI commit generation");

      if (!(await this.gitService.isGitRepository())) {
        throw new Error("Not in a git repository");
      }

      this.consoleService.debug("Getting staged changes");
      const diff = await this.gitService.getStagedDiff();

      if (!diff) {
        throw new Error(
          "No staged changes. Please add files with git add first."
        );
      }

      const files = await this.gitService.getStagedFiles();
      this.consoleService.debug(`Found ${diff.length} characters of diff`);
      this.consoleService.debug(`Staged files: ${files.join(", ")}`);

      const changeset: GitChangeset = { files, diff };

      this.consoleService.showInfo("Generating commit message...");
      this.consoleService.debug("Calling commit message service");
      const commitMessage =
        await this.commitMessageService.generateCommitMessage(changeset);
      this.consoleService.debug("Received commit message");

      const confirmed = await this.consoleService.confirmCommit(commitMessage);

      if (confirmed) {
        this.consoleService.debug("User confirmed commit");
        await this.gitService.commitWithMessage(commitMessage.message);
        this.consoleService.showSuccess("Committed successfully!");
      } else {
        this.consoleService.debug("User rejected commit");
        this.consoleService.showWarning("Commit aborted.");
      }
    } catch (error) {
      this.consoleService.debug("Error occurred:", error);
      if (error instanceof Error) {
        this.consoleService.showError(error);
      } else {
        this.consoleService.showError(new Error(String(error)));
      }
      process.exit(1);
    }
  }
}

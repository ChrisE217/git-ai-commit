import { exec } from "child_process";
import { promisify } from "util";
import chalk from "chalk";

const execAsync = promisify(exec);

async function setupGitAlias() {
  try {
    console.log(chalk.blue("Setting up git-ai-commit..."));

    // Check if git is installed
    try {
      await execAsync("which git");
    } catch (error) {
      console.error(
        chalk.red("Git is not installed. Please install Git first.")
      );
      process.exit(1);
    }

    // Add git alias git commit aic'
    await execAsync('git config --global alias.aic "!git-ai-commit"');

    console.log(chalk.green("✓ Git alias set up successfully!"));
    console.log(chalk.blue("You can now use the following commands:"));
    console.log(
      chalk.cyan(
        "  • git aic           - Generate an AI commit message for staged changes"
      )
    );
    console.log(
      chalk.cyan(
        "  • git-ai-commit     - Generate an AI commit message for staged changes"
      )
    );
    console.log(
      chalk.cyan("  • git-ai-commit config - Configure git-ai-commit settings")
    );

    console.log(chalk.yellow("\nTo create a commit with AI:"));
    console.log(chalk.white("1. Stage your changes: git add <files>"));
    console.log(chalk.white("2. Run: git aic"));
  } catch (error) {
    console.error(
      chalk.red(
        `Error setting up git alias: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    );
    process.exit(1);
  }
}

// Run setup if this script is executed directly
if (require.main === module) {
  setupGitAlias();
}

export default setupGitAlias;

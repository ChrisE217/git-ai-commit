import { IConfigService, IConsoleService } from "../interfaces";
import { CommitMessageResponse } from "../models/types";
import inquirer from "inquirer";
import chalk from "chalk";

export class ConsoleService implements IConsoleService {
  private readonly DEBUG = process.env.DEBUG === "true";

  constructor(private readonly configService: IConfigService) {}

  public async confirmCommit(message: CommitMessageResponse): Promise<boolean> {
    const config = this.configService.getConfig();

    // If always accept is enabled, skip confirmation
    if (config.alwaysAccept) {
      return true;
    }

    this.showSuccess("Generated commit message:");
    console.log(chalk.cyan(message.fullMessage));

    const answer = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirmCommit",
        message: "Do you want to use this commit message?",
        default: true,
      },
    ]);

    return answer.confirmCommit;
  }

  public showError(error: Error): void {
    console.error(chalk.red(`Error: ${error.message}`));

    if (process.env.DEBUG === "true" && error.stack) {
      console.error(chalk.gray(error.stack));
    }
  }

  public showSuccess(message: string): void {
    console.log(chalk.green(message));
  }

  public showInfo(message: string): void {
    console.log(chalk.blue(message));
  }

  public showWarning(message: string): void {
    console.log(chalk.yellow(message));
  }

  public debug(message: string, ...args: any[]): void {
    if (process.env.DEBUG === "true") {
      console.log(chalk.gray(`[DEBUG] ${message}`), ...args);
    }
  }
}

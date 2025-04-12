import {
  IConfigService,
  ILanguageModelService,
  IPromptService,
  IConsoleService,
} from "../../interfaces";
import inquirer from "inquirer";

export class ConfigCommand {
  constructor(
    private readonly configService: IConfigService,
    private readonly promptService: IPromptService,
    private readonly languageModelService: ILanguageModelService,
    private readonly consoleService: IConsoleService
  ) {}

  public async execute(): Promise<void> {
    try {
      const config = this.configService.getConfig();

      const isOllamaActive = await this.languageModelService.isRunning();

      let availableModels: string[] = [];
      if (isOllamaActive) {
        try {
          availableModels =
            await this.languageModelService.listAvailableModels();
        } catch (error) {
          this.consoleService.showWarning(
            "Failed to fetch available models from Ollama"
          );
        }
      }

      const defaultModels = ["llama3:8b", "mistral", "gemma:7b"];

      const answers = await inquirer.prompt([
        {
          type: "confirm",
          name: "alwaysAccept",
          message: "Always accept the AI-generated commit message?",
          default: config.alwaysAccept,
        },
        {
          type: "list",
          name: "model",
          message: "Select the model to use:",
          choices: availableModels.length ? availableModels : defaultModels,
          default: config.model,
        },
        {
          type: "number",
          name: "timeoutSeconds",
          message:
            "Timeout in seconds for Ollama (increase for larger models):",
          default: config.timeoutSeconds || 30,
          validate: (value) => {
            if (value < 5) return "Timeout must be at least 5 seconds";
            if (value > 300) return "Timeout must be less than 5 minutes";
            return true;
          },
        },
        {
          type: "confirm",
          name: "customizePrompt",
          message:
            "Do you want to customize the prompt used for generating commit messages?",
          default: !!config.customPrompt,
        },
        {
          type: "editor",
          name: "customPrompt",
          message: "Edit the custom prompt:",
          default:
            config.customPrompt || this.promptService.getConfigPromptTemplate(),
          when: (answers) => answers.customizePrompt,
        },
      ]);

      const newConfig = {
        alwaysAccept: answers.alwaysAccept,
        model: answers.model,
        timeoutSeconds: answers.timeoutSeconds,
        customPrompt: answers.customizePrompt
          ? answers.customPrompt
          : undefined,
      };

      this.configService.updateConfig(newConfig);

      this.consoleService.showSuccess("Configuration updated successfully!");
    } catch (error) {
      if (error instanceof Error) {
        this.consoleService.showError(error);
      } else {
        this.consoleService.showError(new Error(String(error)));
      }
      process.exit(1);
    }
  }
}

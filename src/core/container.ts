import {
  ICommitMessageService,
  IConfigService,
  IGitService,
  ILanguageModelService,
  IPromptService,
  IConsoleService,
} from "../interfaces";
import { ConfigService } from "../services/configService";
import { GitService } from "../services/gitService";
import { OllamaService } from "../services/ollamaService";
import { PromptService } from "../services/promptService";
import { CommitMessageService } from "../services/commitMessageService";
import { ConsoleService } from "../services/consoleService";

export class Container {
  private static instance: Container;
  private services: Map<string, any> = new Map();

  private constructor() {
    this.registerSingleton<IConfigService>(
      "configService",
      new ConfigService()
    );

    this.registerSingleton<IGitService>("gitService", new GitService());

    this.registerSingleton<IConsoleService>(
      "consoleService",
      new ConsoleService(this.get<IConfigService>("configService"))
    );

    this.registerSingleton<ILanguageModelService>(
      "languageModelService",
      new OllamaService(this.get<IConsoleService>("consoleService"))
    );

    this.registerSingleton<IPromptService>(
      "promptService",
      new PromptService(this.get<IConsoleService>("consoleService"))
    );

    this.registerSingleton<ICommitMessageService>(
      "commitMessageService",
      new CommitMessageService(
        this.get<IConfigService>("configService"),
        this.get<IPromptService>("promptService"),
        this.get<ILanguageModelService>("languageModelService")
      )
    );
  }

  public static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  private registerSingleton<T>(serviceName: string, implementation: T): void {
    this.services.set(serviceName, implementation);
  }

  public get<T>(serviceName: string): T {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not found in container`);
    }
    return service as T;
  }
}

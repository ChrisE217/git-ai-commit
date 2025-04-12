import {
  ICommitMessageService,
  IConfigService,
  ILanguageModelService,
  IPromptService,
} from "../interfaces";
import {
  CommitMessageResponse,
  GitChangeset,
  GenerationOptions,
} from "../models/types";

export class CommitMessageService implements ICommitMessageService {
  constructor(
    private readonly configService: IConfigService,
    private readonly promptService: IPromptService,
    private readonly languageModelService: ILanguageModelService
  ) {}

  public async generateCommitMessage(
    changeset: GitChangeset
  ): Promise<CommitMessageResponse> {
    const config = this.configService.getConfig();

    const prompt = this.promptService.getCommitMessagePrompt(
      changeset,
      config.customPrompt
    );

    const options: GenerationOptions = {
      model: config.model,
      timeout: config.timeoutSeconds * 1000,
    };

    const rawMessage = await this.languageModelService.generateText(
      prompt,
      options
    );

    return this.processCommitMessage(rawMessage);
  }

  private processCommitMessage(rawMessage: string): CommitMessageResponse {
    const fullMessage = rawMessage.trim();
    let conciseMessage = fullMessage;

    if (conciseMessage.includes("\n")) {
      conciseMessage = conciseMessage.split("\n")[0].trim();
    }

    if (conciseMessage.length > 100) {
      conciseMessage = conciseMessage.substring(0, 97) + "...";
    }

    return {
      message: conciseMessage,
      fullMessage: fullMessage,
      toString: function () {
        return this.message;
      },
    };
  }
}

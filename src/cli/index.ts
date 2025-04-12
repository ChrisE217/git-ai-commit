#!/usr/bin/env node

import { program } from "commander";
import { Container } from "../core/container";
import { CommitCommand } from "./commands/commitCommand";
import { ConfigCommand } from "./commands/configCommand";
import {
  IGitService,
  ICommitMessageService,
  IConsoleService,
  IConfigService,
  IPromptService,
  ILanguageModelService,
} from "../interfaces";
import * as path from "path";
import * as fs from "fs";

const packageJsonPath = path.resolve(__dirname, "../../package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
const version = packageJson.version;

const container = Container.getInstance();

const gitService = container.get<IGitService>("gitService");
const commitMessageService = container.get<ICommitMessageService>(
  "commitMessageService"
);
const consoleService = container.get<IConsoleService>("consoleService");
const configService = container.get<IConfigService>("configService");
const promptService = container.get<IPromptService>("promptService");
const languageModelService = container.get<ILanguageModelService>(
  "languageModelService"
);

const commitCommand = new CommitCommand(
  gitService,
  commitMessageService,
  consoleService
);

const configCommand = new ConfigCommand(
  configService,
  promptService,
  languageModelService,
  consoleService
);

program
  .name("git-ai-commit")
  .description("AI-powered git commit message generator")
  .version(version);

program
  .command("commit")
  .description("Generate and use an AI-powered commit message")
  .action(() => commitCommand.execute());

program
  .command("config")
  .description("Configure git-ai-commit settings")
  .action(() => configCommand.execute());

program.action(() => commitCommand.execute());

program.parse(process.argv);

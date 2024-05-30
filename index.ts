#!/usr/bin/env node

import { Command } from 'commander'
import { description, version, commands } from './package.json'
import * as actions from './actions'

const program = new Command()

// main command: srd
program
  .name('srd')
  .version(version, '-v, --version', '버전 번호를 출력합니다')
  .description(description)
  .helpOption('-h, --help', '도움말을 표시합니다')
  .helpCommand('help [command]', '명령어에 대한 도움말을 표시합니다')

// command: ls
program
  .command(commands.list.command)
  .alias(commands.list.alias)
  .description(commands.list.description)
  .action(actions.list)

// command: add
program
  .command(commands.add.command)
  .description(commands.add.description)
  .argument(commands.add.arguments[0].name, commands.add.arguments[0].description)
  .action(actions.add)

// command: remove
program
  .command(commands.remove.command)
  .alias(commands.remove.alias)
  .description(commands.remove.description)
  .argument(commands.remove.arguments[0].name, commands.remove.arguments[0].description)
  .action(actions.remove)

// command: scan
program
  .command(commands.scan.command)
  .description(commands.scan.description)
  .argument(commands.scan.arguments[0].name, commands.scan.arguments[0].description)
  .action(actions.scan)

// command: open
program
  .command(commands.open.command)
  .description(commands.open.description)
  .argument(commands.open.arguments[0].name, commands.open.arguments[0].description)
  .action(actions.open)

// command: export
program
  .command(commands.export.command)
  .description(commands.export.description)
  .argument(commands.export.arguments[0].name, commands.export.arguments[0].description)
  .action(actions.exportProject)

// command: import
program
  .command(commands.import.command)
  .description(commands.import.description)
  .argument(commands.import.arguments[0].name, commands.import.arguments[0].description)
  .action(actions.importProject)

// command: run
program
  .command(commands.run.command)
  .description(commands.run.description)
  .argument(commands.run.arguments[0].name, commands.run.arguments[0].description)
  .argument(commands.run.arguments[1].name, commands.run.arguments[1].description)
  .action(actions.run)

program.parse()

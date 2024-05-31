import { execPromise, executeCommandAsync, getProjectPath, lineTool, readPackageJson } from './common'
import select from '@inquirer/select'
import confirm from '@inquirer/confirm'
import { spawn } from 'node:child_process'
import process from 'process'
import { resolve } from 'path'
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'

const getScriptKey = async() => {
  const { scripts } = readPackageJson(process.cwd())

  if (scripts === undefined) {
    throw new Error('package.json 내에 스크립트 정보가 없습니다.')
  }

  return select<string>({
    message: '실행할 스크립트를 선택해 주세요',
    choices: Object.entries(scripts).map(([key]) => ({ value: key })),
    loop: false
  })
}

const checkForUpdates = async() => {
  const ora = (await import('ora')).default
  const spinner = ora('원격 저장소의 업데이트를 확인합니다...').start()

  try {
    const statusOutput = await execPromise('git remote update && git status -uno')

    spinner.succeed('원격 저장소의 업데이트 확인이 완료되었습니다.')
    lineTool.clearThisLine()

    if (statusOutput.includes('Your branch is behind')) {
      return true
    }
  } catch (e) {
    spinner.fail('git 업데이트 확인 중 오류가 발생했습니다.')
    throw e
  }

  return false
}

const getInstallTools = async() => {
  const checkCommandList = [
    { command: 'npm', lockFile: 'package-lock.json' },
    { command: 'yarn', lockFile: 'yarn.lock' },
    { command: 'pnpm', lockFile: 'pnpm-lock.yaml' },
    { command: 'bun', lockFile: 'bun.lockb' }
  ]
  const tools: { command: string; recommend: boolean }[] = []

  for (const { command, lockFile } of checkCommandList) {
    try {
      await execPromise(`${command} --version`)
      const recommend = existsSync(resolve(process.cwd(), lockFile))

      tools.push({ command, recommend })
    } catch {
      // pass
    }
  }

  return tools.sort(({ recommend: a }, { recommend: b }) => (a ? -1 : b ? 1 : 0)) // 추천 위로 정렬
}

const updateProject = async() => {
  console.info('새로운 변경 사항이 있습니다.\n')

  if (!(await confirm({ message: '업데이트 하시겠습니까?' }))) return

  const ora = (await import('ora')).default
  const spinner = ora('업데이트를 시작합니다...').start()

  try {
    const { isEqual, cloneDeep } = await import('lodash-es')
    const jsonPath = resolve(process.cwd(), 'package.json')
    const oldPackageJson = cloneDeep(JSON.parse(await readFile(jsonPath, 'utf-8')))

    await execPromise('git pull')
    spinner.succeed('업데이트가 완료되었습니다.\n')

    const newPackageJson = cloneDeep(JSON.parse(await readFile(jsonPath, 'utf-8')))

    if (isEqual(oldPackageJson, newPackageJson)) return

    console.info('package.json 파일에 변동사항이 있습니다.\n종속성 업데이트를 시작합니다.\n')

    const availableTools = await getInstallTools()

    if (availableTools.length === 0) {
      console.info('설치 가능한 패키지 관리 도구가 없습니다.')

      return
    }

    let installCommand: string

    if (availableTools.filter(({ recommend }) => recommend).length === 1) {
      installCommand = availableTools.find(({ recommend }) => recommend)!.command
    } else {
      installCommand = await select({
        message: '종속성을 설치할 도구를 선택해 주세요:',
        choices: availableTools.map(({ command, recommend }) => ({
          name: `${command}${recommend ? ' (추천)' : ''}`,
          value: command
        })),
        loop: false
      })
      lineTool.insertBlankLine()
    }

    console.info(`${installCommand}으로 종속성 설치를 시작합니다.\n`)
    await executeCommandAsync(`${installCommand} install`)
    console.info('\n종속성 설치가 완료되었습니다.\n')
  } catch (error) {
    spinner.fail('업데이트 중 오류가 발생했습니다.')
    throw error
  }
}

const run = async(projectName?: string, scriptName?: string) => {
  try {
    const projectPath = await getProjectPath(projectName)

    process.chdir(projectPath)

    if (await checkForUpdates()) {
      await updateProject()
    }

    const scriptKey = scriptName ?? await getScriptKey()

    spawn('npm', ['run', scriptKey], { stdio: 'inherit', shell: true })
      .on('error', console.error)
      .on('exit', (code, signal) => {
        if (code === 0) {
          console.log('\n스트립트가 종료되었습니다.')
        } else {
          console.error(`\nexitCode: ${code}, signal: ${signal}`)
        }
      })
  } catch (e) {
    console.info('\n' + (e as Error).message)
  }
}

export default run

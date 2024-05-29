import { IProjectInfo, readPackageJson, readSetting } from './common'
import select from '@inquirer/select'
import { spawn } from 'node:child_process'

const getProjectPath = async(projectName?: string) => {
  const { projects } = readSetting()

  if (projectName !== undefined) {
    return projects.find(({ name }: IProjectInfo) => name === projectName).path
  }

  const projectIndex = await select<number>({
    message: '프로젝트를 선택해 주세요.',
    choices: projects.map(({ name }: IProjectInfo, index: number) => ({
      name,
      value: index,
    })),
    loop: false
  })

  return projects[projectIndex].path
}

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

const run = async(projectName?: string, scriptName?: string) => {
  try {
    const projectPath = await getProjectPath(projectName)

    process.chdir(projectPath)

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

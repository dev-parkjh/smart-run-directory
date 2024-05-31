import { spawn } from 'node:child_process'
import { getProjectPath, isCommandAvailable } from './common.js'
import select from '@inquirer/select'

interface IEditorInfo {
  name: string;
  command: string;
}

const getEditorList = async() => {
  const checkCommandList: IEditorInfo[] = [
    { name: 'vscode', command: 'code' },
    { name: 'intellij', command: 'idea' },
  ]

  const editorList: IEditorInfo[] = []

  for (const editorInfo of checkCommandList) {
    if (await isCommandAvailable(editorInfo.command)) {
      editorList.push(editorInfo)
    }
  }

  return editorList
}

const open = async(projectName?: string) => {
  try {
    const editorList = await getEditorList()

    if (editorList.length === 0) {
      console.info('\n사용 가능한 에디터가 없습니다.\n\n다음과 같은 에디터를 지원합니다.\n- vscode   (https://code.visualstudio.com/)\n- intellij (https://www.jetbrains.com/ko-kr/idea)\n\n설치된 에디터 및 환경변수를 확인하고, 필요시 해당 에디터를 사용해 주세요.')

      return
    }

    const projectPath = await getProjectPath(projectName)

    const command = await select({
      message: '사용할 에디터를 선택해 주세요',
      choices: editorList.map(({ name, command }) => ({ name, value: command })),
      loop: false
    })

    spawn(command, [projectPath], { stdio: 'inherit', shell: true })
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

export default open

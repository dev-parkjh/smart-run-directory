import { findPath, readSetting } from './common'
import { execSync, exec } from 'node:child_process'
import { name, version as current } from '../package.json'
import confirm from '@inquirer/confirm'
import { resolve } from 'path'
import fs from 'fs'
import importProjects from './import'

const execPromise = (command: string) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout) => {
      if (error) {
        reject(error)

        return
      }

      resolve(stdout)
    })
  })
}

const updateInstall = async() => {
  const spinner = (await import('ora')).default('업데이트를 설치합니다...').start()

  await execPromise(`npm i -g ${name}`)
  spinner.succeed('설치가 완료되었습니다.')
}

const update = async() => {
  try {
    const newVersion = execSync(`npm view ${name} version`).toString().trim()

    if (newVersion === current) {
      console.info(`\n현재 v${current} 최신 버전입니다.`)

      return
    }

    if (!(await confirm({ message: `CLI 도구를 업데이트 하시겠습니까? (${current} -> ${newVersion})` }))) return

    const setting = readSetting(true)
    
    if (setting.projects.length === 0) {
      await updateInstall()

      return
    }

    console.info('\n기존 프로젝트 정보를 백업합니다.\n')
    const path = await findPath('프로젝트 정보를 저장할 경로를 지정해주세요')
    const backupFile = resolve(path, 'srd-backup.json')

    fs.writeFileSync(backupFile, JSON.stringify({ projects: setting.projects }, null, 2))
    console.info('\n프로젝트 정보가 백업 완료 되었습니다.\n')
      
    await updateInstall()
    
    console.info('\n백업된 프로젝트 정보를 불러옵니다.')
    await importProjects(backupFile)
    console.log('\n')

    if (await confirm({ message: '백업 데이터를 삭제할까요?' })) {
      fs.unlinkSync(backupFile)
      console.info('\n백업 데이터가 삭제되었습니다.')
    }
    
    console.info('\n업데이트가 완료되었습니다.')
  } catch (e) {
    console.info('\n' + (e as Error).message)
  }
}

export default update

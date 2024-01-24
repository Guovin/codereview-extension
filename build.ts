import * as fs from 'fs'
import * as path from 'path'
import {
  CRX_OUTDIR,
  CRX_CONTENT_OUTDIR,
  CRX_BACKGROUND_OUTDIR
} from './globalConfig'

const copyDirectory = (srcDir: string, destDir: string) => {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir)
  }
  fs.readdirSync(srcDir).forEach((file: string) => {
    const srcPath = path.join(srcDir, file)
    const destPath = path.join(destDir, file)
    if (fs.lstatSync(srcPath).isDirectory()) {
      copyDirectory(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  })
}

const deleteDirectory = (dir: string) => {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach((file: string) => {
      const curPath = path.join(dir, file)
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteDirectory(curPath)
      } else {
        fs.unlinkSync(curPath)
      }
    })
    fs.rmdirSync(dir)
  }
}

const contentOutDir = path.resolve(process.cwd(), CRX_CONTENT_OUTDIR)
const backgroundOutDir = path.resolve(process.cwd(), CRX_BACKGROUND_OUTDIR)
const outDir = path.resolve(process.cwd(), CRX_OUTDIR)

copyDirectory(contentOutDir, outDir)
copyDirectory(backgroundOutDir, outDir)
deleteDirectory(contentOutDir)
deleteDirectory(backgroundOutDir)

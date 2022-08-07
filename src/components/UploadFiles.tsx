import { useRef, useState } from 'react'
import { Web3Storage } from 'web3.storage'
import buildPreviewHtml from './BuildPreviewHtml'
import EncryptPackage from './Lit'

interface IUploadFiles {
    filename: string;
    setCId: Function;
    // optionals
    allowMultipleFile?: boolean;
    doEncrypt?: boolean;
    encryptForContract?: string;
}

export default function UploadFiles({ filename, setCId, allowMultipleFile }: IUploadFiles) {
    const [cId, setPreviewImage] = useState('')
    const [uploading, setUploading] = useState(false)
    const fileInput = useRef<HTMLInputElement>(null)
    const [uploadProgress, setUploadProgress] = useState(0)

    const ipfsToHTTP = (uri: string) => uri.replace("ipfs://", "https://cloudflare-ipfs.com/ipfs/")

    const getAccessToken = () => process.env.NEXT_PUBLIC_WEB3_STORAGE_API_KEY
    
    /* @ts-ignore */
    const makeStorageClient = () => new Web3Storage({ token: getAccessToken() })

    const replaceFileIndex = (filename: string, index: number) => filename.replace('%id%', index.toString())

    const readImageAsArrayBuffer = (inputFile:File) => {
        const temporaryFileReader = new FileReader();
      
        return new Promise((resolve, reject) => {
            temporaryFileReader.onerror = () => {
                temporaryFileReader.abort()
                reject(new DOMException("Problem parsing input file."))
            }
            temporaryFileReader.onload = () => {
                resolve(temporaryFileReader.result)
            }
            temporaryFileReader.readAsArrayBuffer(inputFile)
        })
    }

    const prepareFilesList = async () => {
        return new Promise(async (resolve, reject) => {
            if(fileInput.current != null) {
                // get first file element from input
                // @ts-ignore
                const files = []
                // @ts-ignore    
                const inputFiles = [...fileInput.current.files]
                for await(const file of inputFiles) {
                    const arrayBuffer = await readImageAsArrayBuffer(file)
                    // @ts-ignore
                    const blob = new Blob([arrayBuffer], {type : 'image/png'})
                    files.push(new File([blob], replaceFileIndex(filename, files.length)))
                }  
                // add html file for preview listing
                if(allowMultipleFile) {
                    const htmlFile = new File([buildPreviewHtml({
                        title: 'Preview', 
                        description: 'Preview Files of creativegene package.',
                        filesNumber: files.length,
                    })], 'index.html')
                    files.push(htmlFile)
                }   
                console.log('files', files)
                resolve(files)
            }else{
                reject()
            }
        })
    }

    const storeWithProgress = async (files:any) => {
        // show the root cid as soon as it's ready
        const onRootCidReady = (cid:any) => {
            console.log('uploading files with cid:', cid)
            
            if(!allowMultipleFile) {
                setPreviewImage(cid + '/' + filename)
                setCId(cid+ '/' + filename)
            }else{
                setCId(cid)
            }
            setUploading(false)
        }      
        // when each chunk is stored, update the percentage complete and display
        const totalSize = files.map((f:any) => f.size).reduce((a:any, b:any) => a + b, 0)
        let uploaded = 0
      
        const onStoredChunk = (size:any) => {
          uploaded += size
          const pct = 100 * (uploaded / totalSize)
          console.log(`Uploading... ${pct.toFixed(2)}% complete`)
          setUploadProgress(parseInt(pct.toFixed(2)))
        }
      
        // makeStorageClient returns an authorized Web3.Storage client instance
        const client = makeStorageClient()
      
        // client.put will invoke our callbacks during the upload
        // and return the root cid when the upload completes        
        return client.put(files, { 
            onRootCidReady, 
            onStoredChunk 
        })
      }

    const uploadFile = async (e:any) => {
        setUploading(true)
        const files = await prepareFilesList()
        await storeWithProgress(files)        
    }
    return (
        <>
            {(!allowMultipleFile && cId) && 
                <img    src={"https://cloudflare-ipfs.com/ipfs/" + cId} 
                        width="100"
                />
            }
            
            {(!cId && !uploading && !allowMultipleFile) && <>
                <input ref={fileInput} type="file" />
                <button onClick={uploadFile}>Upload</button>
            </>}

            {(!cId && !uploading && allowMultipleFile) && <>
                <input ref={fileInput} type="file" multiple />
                <button onClick={uploadFile}>Upload</button>
            </>}


            {uploading && <p>Uploading... {uploadProgress} %</p>}
        </>
    )
}


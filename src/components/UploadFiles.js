import { Web3Storage } from 'web3.storage'

const apiToken = process.env.NEXT_PUBLIC_WEB3_STORAGE_API_KEY

// Construct with token and endpoint
const client = new Web3Storage({
    token: apiToken 
})

export default function UploadFiles() {
    const uploadFile = async (e) => {
        const fileInput = document.querySelector('input[type="file"]')
        console.log(fileInput.files)
        // Pack files into a CAR and send to web3.storage
        const rootCid = await client.put(fileInput.files, {
            name: 'cat pics',
            maxRetries: 3,
        })
        console.log('rootCid:', rootCid)
    }
    return (
        <>
            <input type="file" />
            <button onClick={uploadFile}>Upload</button>
        </>
    )
}


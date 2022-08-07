import { useRouter } from "next/router";
import { useEffect } from "react";
import { DecryptPackage } from "../../components/Lit";

export default function DownloadEncryptedFile() {
    const router = useRouter()

    const decryptAndDownload = async (cId:string) => {
        // based on id start download and decrypt
        const fileBuffer = await DecryptPackage({cId})
        const url = window.URL.createObjectURL(new Blob([fileBuffer]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'creativegene.zip')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    useEffect(() => {
        // get router query params
        const { id } = router.query
        if(id) {
            console.warn('found cId', id)
            decryptAndDownload(id as string)
        }
    }, [router.isReady])

    return (
        <div>
            <h1>Download LIT Encrypted ZIP File</h1>
        </div>
    );
}

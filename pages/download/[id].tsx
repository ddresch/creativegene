import { useRouter } from "next/router";
import { useEffect } from "react";
import { DecryptPackage } from "../../components/Lit";

export default function DownloadEncryptedFile() {
    const router = useRouter()

    useEffect(() => {
        // get router query params
        const { id } = router.query
        if(id) {
            console.warn('found cId', id)
            // based on id start download and decrypt
            DecryptPackage({
                cId: id as string,
            })
        }
    }, [router.isReady])

    return (
        <div>
            <h1>Download LIT Encrypted ZIP File</h1>
        </div>
    );
}

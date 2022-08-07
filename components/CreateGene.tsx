import { useEffect, useState } from "react"
import { useAccount, useContractWrite, useWaitForTransaction} from "wagmi"
import type {IERC721Drop} from '@zoralabs/nft-drop-contracts/dist/typechain/ZoraNFTCreatorV1'
import { ZORA_CREATOR_CONTRACT_ADDRESS } from "../constants"
import { parseEther } from "ethers/lib/utils"
import ZoraCreatorABI from '@zoralabs/nft-drop-contracts/dist/artifacts/ZoraNFTCreatorV1.sol/ZoraNFTCreatorV1.json'
/* @ts-ignore */
import AbiDecode from 'abi-decoder'
import UploadFiles from "./UploadFiles"

export default function CreateGene() {
    // content for essay, title, and description
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [geneContractAddress, setGeneContractAddress] = useState(undefined)
    const [previewCid, setPreviewCid] = useState('')
    const [htmlCid, setHtmlCid] = useState('')
    const [packageCid, setPackageCid] = useState('')
    const { address } = useAccount()

    function getSalesConfig(): IERC721Drop.SalesConfigurationStruct {
        return {
          // 0.1 eth sales price
          publicSalePrice: parseEther('0.1'),
          // Sets 100 purchases per address
          maxSalePurchasePerAddress: 100,
          publicSaleStart: 0,
          // Sets the sale to last a week: 60 seconds -> minute 60 -> mins hour -> 24 hours in a day -> 7 days in a week
          // publicSaleEnd: Math.floor(new Date().getTime()/1000) + 7*24*60*60,
          publicSaleEnd: 0,
          // Disables presale
          presaleStart: 0,
          presaleEnd: 0,
          presaleMerkleRoot: '0x0000000000000000000000000000000000000000000000000000000000000000',
        }
    }

    const config = {
        addressOrName: ZORA_CREATOR_CONTRACT_ADDRESS,
        contractInterface: ZoraCreatorABI.abi,
        functionName: 'createEdition',
        enabled: false,
        args: [
            title,
            title.toUpperCase().replace(/^[A-Za-z0-9]/g, '').substring(1, 8),
            100, // edition size
            1000, // 10%,
            address!,
            address!,
            getSalesConfig(),
            description,
            `ipfs://${htmlCid}`,
            `ipfs://${previewCid}`
        ],
    }

    /* @ts-ignore */
    const { data, write, isLoading: isWriting } = useContractWrite(config)

    const { isLoading, isSuccess, isError, error } = useWaitForTransaction({
        confirmations: 1,
        hash: data?.hash,
        onSuccess(data) {
            console.log('tx hash', data.transactionHash)
            // decode the tx logs
            AbiDecode.addABI(ZoraCreatorABI.abi)
            const decoded = AbiDecode.decodeLogs(data.logs)
            const geneAddress = decoded.find(
                (l:any) => l.name === 'CreatedDrop')['events']
                .find((e:any) => e.name === 'editionContractAddress')
                .value
            console.log('gene address', geneAddress)
            setGeneContractAddress(geneAddress)
        },
    })

    return (
        <div>
            <h1>Create new gene</h1>

            <h5>Title</h5>
            <input  placeholder="Title of creativegene package"
                    onChange={(e) => setTitle(e.target.value)}
                    value={title}
                    className="input"
            /><br />

            <h5>Description</h5>
            <input
                    placeholder="Short description of your package"
                    onChange={(e) => setDescription(e.target.value)}
                    value={description}
                    className="input"
            /><br />

            <h5>Price</h5>
            <p>For the hackathon purpose it is fixed at 0.1 ETHER</p>

            <h5>Listing Image</h5>
            <p>This is the image which is displayed on all NFT market place listings.</p>
            <UploadFiles 
                filename="preview.png" 
                setCId={(id:string) => setPreviewCid(id)} 
            />

            <h5>Preview Files</h5>
            <p>These are the e.g. images, audio, video files which help to describe your <i>creativegene</i> package.</p>
            <UploadFiles 
                allowMultipleFile={true}
                filename="preview_%id%.png" 
                setCId={(id:string) => setHtmlCid(id)} 
            />
            {htmlCid && <iframe src={`https://ipfs.io/ipfs/${htmlCid}`} 
                                height="250" width="250" 
                                className="previewFrame">
                        </iframe>
            }

            {/* @ts-ignore */}
            {/* {(!write || isLoading || isWriting) &&  */}
                <div className="button-bar">
                    <button className="button" onClick={() => write()}
                            disabled={!write || isLoading || isWriting}>
                        Create Gene
                    </button>
                </div>
            {/* }             */}

            {(isLoading || isWriting) && <div>Creating Gene...</div>}

            {isSuccess && <div>
                Gene Created!<br/>
                <a href={`https://rinkeby.etherscan.io/tx/${data?.hash}`}>Check TX Etherscan here.</a><br/>
                {geneContractAddress && <strong>Gene Contract Address: {geneContractAddress}</strong>}
            </div>}

            {/* @ts-ignore */}
            {isError && <div>Error: {error.message}</div>}

            {geneContractAddress && <>
                <h5>Content Package ZIP File</h5>
                <p>Now upload your content package which will be secured by creativegene NFT token.</p>
                <UploadFiles 
                    filename="creativegene.zip"
                    setCId={(id:string) => setPackageCid(id)} 
                    doEncrypt={true}
                    encryptForContract={geneContractAddress}
                />
                {packageCid && 
                    <p> 
                        Package CID: {packageCid}<br/>
                        <a href={`https://ipfs.io/ipfs/${packageCid}`}>Download Encrypted ZIP</a>
                    </p>
                }
            </>
            }
            {/* <UploadFiles 
                    filename="creativegene.zip"
                    setCId={(id:string) => setPackageCid(id)} 
                    doEncrypt={true}
                    encryptForContract={'0xa5a8892885633eea519b55be8812ea6b8ef4429a'}
                />             */}
        </div>
    )
}

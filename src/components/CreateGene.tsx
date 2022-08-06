import { useState } from "react"
import { useAccount, useContractWrite, useWaitForTransaction} from "wagmi"
import type {IERC721Drop} from '@zoralabs/nft-drop-contracts/dist/typechain/ZoraNFTCreatorV1'
import { ZORA_CREATOR_CONTRACT_ADDRESS } from "../constants"
import { parseEther } from "ethers/lib/utils"
import ZoraCreatorABI from '@zoralabs/nft-drop-contracts/dist/artifacts/ZoraNFTCreatorV1.sol/ZoraNFTCreatorV1.json'
/* @ts-ignore */
import AbiDecode from 'abi-decoder'

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

export default function CreatePage() {
    // content for essay, title, and description
    const [title, setTitle] = useState("monoape monkey ape")
    const [description, setDescription] = useState("ape never kills ape")
    const [geneContractAddress, setGeneContractAddress] = useState(undefined)
    const { address } = useAccount()

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
            `ipfs://contentIPFS}`,
            `ipfs://imageIPFS}`
        ],
    }

    /* @ts-ignore */
    const { data, write, isLoading: isWriting } = useContractWrite(config)

    const { isLoading, isSuccess, isError, error } = useWaitForTransaction({
        confirmations: 1,
        hash: data?.hash,
        onSuccess(data) {
            console.log('tx hash', data.transactionHash)
            console.log('tx logs', data.logs)
            // decode the tx logs
            AbiDecode.addABI(ZoraCreatorABI.abi)
            const decoded = AbiDecode.decodeLogs(data.logs)
            console.log(decoded)
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

            <input  placeholder="Title"
                    onChange={(e) => setTitle(e.target.value)}
                    value={title}
            />

            <input
                    placeholder="Description"
                    onChange={(e) => setDescription(e.target.value)}
                    value={description}
            />

            {/* @ts-ignore */}
            <button disabled={!write || isLoading || isWriting} onClick={() => write()}>
                Create Gene
            </button>

            {(isLoading || isWriting) && <div>Creating Gene...</div>}
            {isSuccess && <div>
                Gene Created!<br/>
                <a href={`https://rinkeby.etherscan.io/tx/${data?.hash}`}>Check TX Etherscan here.</a><br/>
                {geneContractAddress && <strong>Gene Contract Address: {geneContractAddress}</strong>}
            </div>}
            {/* @ts-ignore */}
            {isError && <div>Error: {error.message}</div>}
        </div>
    )
}

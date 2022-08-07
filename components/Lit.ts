// @ts-ignore
import * as LitJsSdk from 'lit-js-sdk'

const chain = 'rinkeby';

interface IEncryptPackage {
  contractAddress: string;
  packageBlob: Blob;
}

const EncryptPackage = async ({contractAddress, packageBlob}:IEncryptPackage) => {
    // -- init litNodeClient
    const litNodeClient = new LitJsSdk.LitNodeClient();
    await litNodeClient.connect();


    const authSig = await LitJsSdk.checkAndSignAuthMessage({chain})

    const accessControlConditions = [
      {
        "contractAddress": contractAddress,
        "standardContractType": "ERC721",
        "chain": chain,
        "method": "balanceOf",
        "parameters": [ ":userAddress", "latest" ],
        "returnValueTest": { "comparator": ">", "value": "0" }
      }
    ]

    // 1. Encryption
    // <Blob> encryptedString
    // <Uint8Array(32)> symmetricKey 
    const { encryptedFile, symmetricKey } = await LitJsSdk.encryptFile({
      file: packageBlob
    })

    console.warn("symmetricKey:", symmetricKey)
    
    // 2. Saving the Encrypted Content to the Lit Nodes
    // <Unit8Array> encryptedSymmetricKey
    const encryptedSymmetricKey = await litNodeClient.saveEncryptionKey({
      accessControlConditions,
      symmetricKey,
      authSig,
      chain,
    })
    
    console.warn("encryptedSymmetricKey:", encryptedSymmetricKey)
    console.warn("encryptedFile:", encryptedFile)  
    
    const packagedData = {
      encryptedFile,
      encryptedSymmetricKey,
      accessControlConditions,
    }

    return packagedData
}

interface IDecryptPackage {
  cId: string;
}

export const DecryptPackage = async ({cId}:IDecryptPackage) => {

  // -- init litNodeClient
  const litNodeClient = new LitJsSdk.LitNodeClient();
  await litNodeClient.connect();

  const authSig = await LitJsSdk.checkAndSignAuthMessage({chain})

  // first download decryption package
  const response = await fetch(`https://ipfs.io/ipfs/${cId}/creativegene.zip.json`)  
  const keys = await response.json()
  console.log('keys:', keys)
  // 3. Decrypt it
  // <String> toDecrypt
  const toDecrypt = LitJsSdk.uint8arrayToString(Uint8Array.from(keys.encryptedSymmetricKey), 'base16')
  console.log("toDecrypt:", toDecrypt)

  // <Uint8Array(32)> _symmetricKey 
  const symmetricKey = await litNodeClient.getEncryptionKey({
    accessControlConditions: keys.accessControlConditions,
    toDecrypt,
    chain,
    authSig
  })

  console.warn("_symmetricKey:", symmetricKey)

  const fileResponse = await fetch(`https://ipfs.io/ipfs/${cId}/creativegene.zip`)
  const file = await fileResponse.blob()

  const { decryptedFile } = await LitJsSdk.decryptFile({
    file,
    symmetricKey
  })

  console.warn("decryptedFile:", decryptedFile)
}

export default EncryptPackage
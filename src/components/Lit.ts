// @ts-ignore
import * as LitJsSdk from 'lit-js-sdk'

// -- init litNodeClient
const litNodeClient = new LitJsSdk.LitNodeClient();
litNodeClient.connect();

interface IEncryptPackage {
  contractAddress: string;
}

const EncryptPackage = async ({contractAddress}:IEncryptPackage) => {

    const messageToEncrypt = "monoape monkey test";

    const chain = 'rinkeby';

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
    const { encryptedString, symmetricKey } = await LitJsSdk.encryptString(messageToEncrypt);

    console.warn("symmetricKey:", symmetricKey);
    
    // 2. Saving the Encrypted Content to the Lit Nodes
    // <Unit8Array> encryptedSymmetricKey
    const encryptedSymmetricKey = await litNodeClient.saveEncryptionKey({
      accessControlConditions,
      symmetricKey,
      authSig,
      chain,
    });
    
    console.warn("encryptedSymmetricKey:", encryptedSymmetricKey);
    console.warn("encryptedString:", encryptedString);

    // 3. Decrypt it
    // <String> toDecrypt
    const toDecrypt = LitJsSdk.uint8arrayToString(encryptedSymmetricKey, 'base16');
    console.log("toDecrypt:", toDecrypt);

    // <Uint8Array(32)> _symmetricKey 
    const _symmetricKey = await litNodeClient.getEncryptionKey({
      accessControlConditions,
      toDecrypt,
      chain,
      authSig
    })

    console.warn("_symmetricKey:", _symmetricKey);

    // <String> decryptedString
    const decryptedString = await LitJsSdk.decryptString(
      encryptedString,
      symmetricKey
    );

    console.warn("decryptedString:", decryptedString);   
}

export default EncryptPackage
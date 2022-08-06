interface IViewOnOpenSeaProps {
    contractAddress: string;
    tokenId: number;
}

export default function ViewOnOpenSea({contractAddress, tokenId}: IViewOnOpenSeaProps) {
    return (
        <>
            View on{' '}
            <a
                href={`https://testnets.opensea.io/assets/rinkeby/${contractAddress}/${tokenId}`}
            >
                Opensea
            </a>
        </>
    )
}
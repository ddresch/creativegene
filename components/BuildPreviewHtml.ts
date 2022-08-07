const buildPreviewHtml = (previewData:any) => {
    const { title, description, filesNumber } = previewData

    const html = `
        <html>
        <head>
            <title>${title}</title>
            <meta name="description" content="${description}" />         
            <style>
                body { margin: 0; padding: 0; background-color: black; }
                img { width: 100% }
                .navi { position: fixed; bottom: 0; left: 0; right: 0; background: rgb(244, 244, 244); display: flex; justify-content: space-between; padding: 10px; }
                .navi a { cursor: pointer; color: black; text-decoration: none; font-size: 14px; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="navi">
                <a rel="prev" onclick="showPrevImg()"><<</a>
                <a onclick="openDownloadPage()">Download</a>
                <a onclick="openRefererPage()">Buy</a>
                <a rel="next" onclick="showNextImg()">>></a>
            </div>
            <script type="text/javascript">
                let currentImg = 0
                const cId = window.location.href.split('/')[4]
                const baseUrl = 'https://ipfs.io/ipfs/' + cId + '/'
                const openDownloadPage = () => {
                    const cid = baseUrl.replace('https://ipfs.io/ipfs/','') 
                    window.location.href = 'https://creativegene.xyz/download?cid=' + cid
                }
                const openRefererPage = () => {
                    const cid = baseUrl.replace('https://ipfs.io/ipfs/','')
                    window.location.href = 'https://creativegene.xyz/referer?cid=' + cid
                }
                const hideAllImgs = (imgs) => {
                    for (let i = 0; i < imgs.length; i++) {
                        imgs[i].style.display = 'none'
                    }
                }
                const showPrevImg = (e) => {
                    if (e) e.preventDefault()
                    currentImg = (currentImg > 0) ? currentImg - 1 : ${filesNumber - 1}                    
                    showCurrentImg()
                }
                const showNextImg = (e) => {
                    if (e) e.preventDefault()
                    currentImg = (currentImg < ${filesNumber - 1}) ? currentImg + 1 : 0                    
                    showCurrentImg()
                }
                const showCurrentImg = () => {
                    console.log('current image: ', currentImg)
                    const imgs = document.getElementsByTagName('img')
                    hideAllImgs(imgs)
                    imgs[currentImg].style.display = 'block'
                }
                for(var i = 0; i < ${filesNumber}; i++) {
                    var img = document.createElement('img') 
                    img.src = baseUrl + 'preview_' + i + '.png'
                    img.style.display = 'none'
                    document.body.appendChild(img)
                }
                // show first image
                document.querySelector('img').style.display = 'block'
            </script>                
        </body>
        </html>
    `
    return html
}

export default buildPreviewHtml
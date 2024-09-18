const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

async function main() {
    try {
        const ccpPath = path.resolve(__dirname, '..', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        const identity = await wallet.get('appUser');
        if (!identity) {
            console.log('Identity not found');
            return;
        }

        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('assetContract');

        // Create an asset
        await contract.submitTransaction('createAsset', 'D001', 'MSISDN001', '1234', '1000', 'active', '500', 'credit', 'First transaction');
        console.log('Asset created');

        // Query an asset
        const asset = await contract.evaluateTransaction('queryAsset', 'MSISDN001');
        console.log(Asset: ${asset.toString()});

        // Update an asset
        await contract.submitTransaction('updateAsset', 'MSISDN001', '1500', 'active');
        console.log('Asset updated');

        // Retrieve asset history
        const history = await contract.evaluateTransaction('getAssetHistory', 'MSISDN001');
        console.log(Asset history: ${history.toString()});

        gateway.disconnect();

    } catch (error) {
        console.error(Failed to execute transaction: ${error});
    }
}

main();
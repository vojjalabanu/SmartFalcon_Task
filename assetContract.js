'use strict';

const { Contract } = require('fabric-contract-api');

class AssetContract extends Contract {

    async initLedger(ctx) {
        console.info('Ledger initialized');
    }

    async createAsset(ctx, dealerId, msisdn, mpin, balance, status, transAmount, transType, remarks) {
        const asset = {
            DEALERID: dealerId,
            MSISDN: msisdn,
            MPIN: mpin,
            BALANCE: parseFloat(balance),
            STATUS: status,
            TRANSAMOUNT: parseFloat(transAmount),
            TRANSTYPE: transType,
            REMARKS: remarks,
        };
        await ctx.stub.putState(msisdn, Buffer.from(JSON.stringify(asset)));
        console.info(Asset ${msisdn} created);
    }

    async queryAsset(ctx, msisdn) {
        const assetJSON = await ctx.stub.getState(msisdn);
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(Asset ${msisdn} does not exist);
        }
        return assetJSON.toString();
    }

    async updateAsset(ctx, msisdn, newBalance, newStatus) {
        const assetString = await this.queryAsset(ctx, msisdn);
        const asset = JSON.parse(assetString);

        asset.BALANCE = parseFloat(newBalance);
        asset.STATUS = newStatus;

        await ctx.stub.putState(msisdn, Buffer.from(JSON.stringify(asset)));
        console.info(Asset ${msisdn} updated);
    }

    async deleteAsset(ctx, msisdn) {
        await ctx.stub.deleteState(msisdn);
        console.info(Asset ${msisdn} deleted);
    }

    async getAssetHistory(ctx, msisdn) {
        const iterator = await ctx.stub.getHistoryForKey(msisdn);
        const allResults = [];
        while (true) {
            const res = await iterator.next();

            if (res.value) {
                const jsonRes = {};
                jsonRes.TxId = res.value.tx_id;
                jsonRes.Timestamp = res.value.timestamp;
                jsonRes.IsDelete = res.value.is_delete.toString();
                jsonRes.Value = res.value.value.toString('utf8');
                allResults.push(jsonRes);
            }

            if (res.done) {
                console.info('End of data');
                await iterator.close();
                return JSON.stringify(allResults);
            }
        }
    }
}

module.exports = AssetContract;
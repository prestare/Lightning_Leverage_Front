<script lang="ts">
import { BigNumber, Contract, Signer, ethers } from 'ethers';
import {
    bulker_ADDRESS,
    cUSDC_comet_ADDRESS,
} from '../address';
import { getMaxLeverage } from "./leverage";
import { deconstructMaxLever } from "./aaveLogic.vue";
export var COMET: Contract;

export const calcUserCOMPMaxLeverage = async (user: Signer, msg: string[]) => {
    console.log(await user.getAddress());
    // let depositAsset = msg[1];
    // let longAsset = msg[2];
    // let shortAsset = msg[3];
    // var depositAssetAddress = flashAssetList[depositAsset];
    // // console.log(depositAssetAddress);
    // var longAssetAddress = flashAssetList[longAsset];
    // var shortAssetAddress = flashAssetList[shortAsset];
    var leverMsg = deconstructMaxLever(msg);
    console.log("ok");
    let depositAssetPrice = await getAssetPriceOnComp(leverMsg.depositAssetAddress!);
    let userCollateralBalance = await getUserCollateralBalance(await user.getAddress(), leverMsg.depositAssetAddress!);
    console.log("Before any tx, the user collateral balance: ", userCollateralBalance.toString());

    // let LongAssetPrice = await getAssetPriceOnAAVE(longAssetAddress);
    // let shortAssetPrice = await getAssetPriceOnAAVE(shortAssetAddress);

    const depositValue = await calcUserAssetValue(userCollateralBalance, depositAssetPrice, 18);
    const maxleverage = await getMaxLeverageOnComp(leverMsg.depositAssetAddress!, leverMsg.depositAsset!);
    const maxBorrowCap = depositValue.mul(maxleverage);
    return [maxleverage.toString(), maxBorrowCap.toString()];
}

export const calcUserLeverFlashLoanComp = async (user: Signer, msg: string[]) => {
    var leverMsg = deconstructMaxLever(msg);

    let depositAssetPrice = await getAssetPriceOnComp(leverMsg.depositAssetAddress!);
    let userCollateralBalance = await getUserCollateralBalance(await user.getAddress(), leverMsg.depositAssetAddress!);
    const depositValue = await calcUserAssetValue(userCollateralBalance, depositAssetPrice, 18);

    let longAssetPrice = await getAssetPriceOnComp(leverMsg.longAssetAddress!);
    const longAssetDecimal = 18;

    console.log("   User choose to long %s Asset.", leverMsg.longAsset);
    console.log("   %s Price = $%s", leverMsg.longAsset, num2Fixed(longAssetPrice, 8));
    leverMsg.userLeverage = parseInt(msg[4]);
    console.log("   Current leverage = ", leverMsg.userLeverage);
    let newPosition = calcLeveragePosition(depositValue, leverMsg.userLeverage);
    console.log("       user want to leverage up their position to $%d", newPosition.toString());
    let needBorrowAmountUSD = calcNeedBorrowValue(depositValue, leverMsg.userLeverage);
    console.log("       so user need to flash loan (in USDC) = $%d", ethers.utils.formatUnits(needBorrowAmountUSD, 8).toString());
    let needBorrowAmount = calcNeedBorrowAmount(needBorrowAmountUSD, longAssetPrice);
    console.log("       so user need to borrow Long Amount = %d", ethers.utils.formatUnits(needBorrowAmount, 8).toString());
    let flashloanAmount = adoptTokenDicimals(needBorrowAmount, 8, longAssetDecimal);
    console.log("       so flash loan Amount = %s", flashloanAmount.toString());

    let shortAssetPrice = await getAssetPriceOnAAVE(leverMsg.shortAssetAddress!);
    console.log(shortAssetPrice);

    let flashLoanFee = await calcFlashLoanFee(flashloanAmount);
    let repayAmount = flashloanAmount.add(flashLoanFee);
    let repayAmountUSD = repayAmount.mul(longAssetPrice).div(ethers.utils.parseUnits("1.0", 18));

    leverMsg.slippage = parseInt(msg[5]);
    const slippageTolerance = new Percent(leverMsg.slippage, 10000);
    console.log("User's slippage = %s%", slippageTolerance.toFixed());
    let needSwapShortAsset = adoptTokenDicimals(calcNeedBorrowAmount(repayAmountUSD, shortAssetPrice), 8, 6).add(1);
    console.log("   After swap, we need %s Short to swap", num2Fixed(needSwapLongAsset, 18));
    let amountInMax = getAmountInleast(needSwapShortAsset, leverMsg.slippage);
    console.log("       According to the slippage, the max input should be = %d", num2Fixed(amountInMax, 6));
    return {
        flashloanAmount,
        amountInMax
    }
}

/********* compHelper ********/


export const initCompContract = async (signer: Signer) => {
    COMET = new ethers.Contract(cUSDC_comet_ADDRESS, CometABI, signer);
}

export const getUserCollateralBalance = async (userAddress: string, assetAddress: string) => {
    return (await COMET.collateralBalanceOf(userAddress, assetAddress));
}

export const getAssetPriceOnComp = async (assetAddress: string) => {
    let priceFeed = await getAssetPriceFeed(assetAddress);
    return (await COMET.callStatic.getPrice(priceFeed));
}

export const getMaxLeverageOnComp = async (asset: string, TokenName: string) => {
    let assetLTV = BigInt(await getAssetCF(asset));
    // MAX Leverage = 1 / (1 - LTV)
    let maxleverage = await getMaxLeverage(assetLTV);
    console.log("   According to the Comp %s Asset Configuration:", TokenName);
    console.log("       The Maximum leverage abilidity = ", maxleverage.toString());
    return maxleverage;
}


/********* ABI ********/
export const CometABI = [
    "function collateralBalanceOf(address account, address asset)external view returns (uint128)",
    "function getPrice(address priceFeed) external view returns (uint)",
    "function getAssetInfoByAddress(address asset) virtual external view returns (tuple(uint8, address, address, uint64, uint64, uint64, uint64, uint128)"
]
/********* ABI ********/

/********* compConfigHelper ********/
interface AssetInfo {
    offset: BigNumber;
    asset: String;
    priceFeed: String;
    scale: BigNumber;
    borrowCollateralFactor: BigNumber;
    liquidateCollateralFactor: BigNumber;
    liquidationFactor:BigNumber;
    supplyCap: BigNumber;
}

export const getAssetCF = async (assetAddress: string) => {
    let assetInfo: AssetInfo = await getAssetInfo(assetAddress);
    // borrowCollateralFactor is scaled up by 10^18
    // it need to convert it to the bps form 
    return assetInfo.borrowCollateralFactor.div(10 ** 14).toString();
}

export const getAssetPriceFeed = async (assetAddress: string) => {
    let assetInfo: AssetInfo = await getAssetInfo(assetAddress);
    return assetInfo.priceFeed;
}

export const getAssetInfo = async (assetAddress: string) => {
    return (await COMET.getAssetInfoByAddress(assetAddress));
}

/********* compConfigHelper ********/

/********* leverage ********/
export const getAmountInleast = (amount:BigNumber, slippage: number) => {
    return amount.mul(10000).div(10000 - slippage);
}
/********* leverage ********/
</script>
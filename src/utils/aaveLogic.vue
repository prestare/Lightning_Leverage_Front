<script lang="ts">
import { BigNumber, Contract, ethers, Signer } from 'ethers';
import JSBI from 'jsbi';
import {Percent} from '@uniswap/sdk-core';
import { 
  calcUserAssetValue,
  calcLeveragePosition,
  calcNeedBorrowValue,
  calcNeedBorrowAmount,
  adoptTokenDicimals,
  getAmountOutleast
} from './helpers/leverage';
import {
    flashAssetList,
    atokenList,
    WETH_TOKEN,
    DAI_TOKEN,
    USDC_TOKEN,
    globalProvider,
    AAVE_POOL
} from '../common/GLOBAL.vue';
import { 
    aTokenContract,
    getAssetPriceOnAAVE,
    getUserATokenBalance,
    getMaxLeverageOnAAVE,
    getAssetDebtTokenAddress,
    debtTokenContract,
    apporve2Borrow,
    checkBorrowAllowance,
    showUserAccountData
} from "./helpers/aaveHelper.vue";
import {
    packParams,
    processRoute
} from "./helpers/generalHelper";
import {
  registryToken,
  swapRoute,
} from "./helpers/UniswapQuoter.vue";
import {
    num2Fixed
} from "./helpers/generalHelper";
import {LIGHTNING_LEVERAGE_ADDRESS} from "./address";
export var tokenContractMap: Map<string, Contract> = new Map();
export var atokenContractMap: Map<string, Contract> = new Map();
export const initTokenAddress = (provider: ethers.providers.Provider) => {
    console.log("init");
    for (const key in atokenList) {
        const atokenAddress = atokenList[key];
        const aToken = aTokenContract(atokenAddress, provider);
        atokenContractMap.set(key, aToken);
    }
    console.log("test");
    registryToken('WETH', WETH_TOKEN);
    registryToken('DAI', DAI_TOKEN);
    registryToken('USDC', USDC_TOKEN);
    console.log("over");
}
initTokenAddress(globalProvider);

// export const initAAVEGlobal = async (user: Signer) => {
//     await initAAVEContract(user);
//     await initAavePriceOracle(user);
// }

interface UserLeverageMsg {
    depositAsset: string,
    longAsset: string,
    shortAsset: string,
    depositAssetAddress?: string,
    longAssetAddress?: string,
    shortAssetAddress?: string,
    userLeverage?: number,
    slippage?: number
}
export const deconstructMaxLever = (msg: string[]) => {
    var obj: UserLeverageMsg = {
        depositAsset : msg[1],
        longAsset: msg[2],
        shortAsset: msg[3],
    };
    obj.depositAssetAddress = flashAssetList[obj.depositAsset];
    obj.longAssetAddress = flashAssetList[obj.longAsset];
    obj.shortAssetAddress = flashAssetList[obj.shortAsset];
    return obj;
}
export const calcUserAAVEMaxLeverage = async (user: Signer, msg: string[]) => {
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
    let depositAssetPrice = await getAssetPriceOnAAVE(leverMsg.depositAssetAddress!);
    const aToken = atokenContractMap.get(leverMsg.depositAsset)!;
    console.log(aToken);
    let userBalance = await getUserATokenBalance(aToken, await user.getAddress());
    const balance = await aToken.balanceOf(await user.getAddress());
    console.log("Before any tx, the Wallet AToken Address is balance: ", balance.toString());
    
    // let LongAssetPrice = await getAssetPriceOnAAVE(longAssetAddress);
    // let shortAssetPrice = await getAssetPriceOnAAVE(shortAssetAddress);

    const depositValue = await calcUserAssetValue(userBalance, depositAssetPrice, 18);
    const maxleverage = await getMaxLeverageOnAAVE(leverMsg.depositAssetAddress!, AAVE_POOL, "");
    const maxBorrowCap = depositValue.mul(maxleverage);
    return [maxleverage.toString(), maxBorrowCap.toString()];
}

export const calcUserLeverFlashLoan = async (user: Signer, msg: string[]) => {
    var leverMsg = deconstructMaxLever(msg);

    let depositAssetPrice = await getAssetPriceOnAAVE(leverMsg.depositAssetAddress!);
    const aToken = atokenContractMap.get(leverMsg.depositAsset)!;
    let userBalance = await getUserATokenBalance(aToken, await user.getAddress());
    const balance = await aToken.balanceOf(await user.getAddress());
    const depositValue = await calcUserAssetValue(userBalance, depositAssetPrice, 18);
    // console.log(leverMsg.shortAssetAddress);
    let shortAssetPrice = await getAssetPriceOnAAVE(leverMsg.shortAssetAddress!);
    console.log(shortAssetPrice);
    console.log("   User choose to short %s Asset.", leverMsg.shortAsset);
    console.log("   %s Price = $%s", leverMsg.shortAsset, num2Fixed(shortAssetPrice, 8));
    leverMsg.userLeverage = parseInt(msg[4]);
    let shortAssetDecimal = 18;
    console.log("   Current leverage = ", leverMsg.userLeverage);
    let newPosition = calcLeveragePosition(depositValue, leverMsg.userLeverage);
    console.log("       user want to leverage up their position to $%d", newPosition.toString());
    let needBorrowAmountUSD = calcNeedBorrowValue(depositValue, leverMsg.userLeverage);
    console.log("       so user need to flash loan (in USDC) = $%d", ethers.utils.formatUnits(needBorrowAmountUSD, 8).toString());
    let needBorrowAmount = calcNeedBorrowAmount(needBorrowAmountUSD, shortAssetPrice);
    console.log("       so user need to borrow DAI Amount = %d", ethers.utils.formatUnits(needBorrowAmount, 8).toString());
    let flashloanAmount = adoptTokenDicimals(needBorrowAmount, 8, shortAssetDecimal);
    console.log("       so flash loan Amount = %s", flashloanAmount.toString());

    leverMsg.slippage = parseInt(msg[5]);
    const slippageTolerance = new Percent(leverMsg.slippage, 10000);
    console.log("User's slippage = %s%", slippageTolerance.toFixed());
    let needSwapLongAsset = calcNeedBorrowValue(userBalance, leverMsg.userLeverage);
    console.log("   After swap, we need %s ETH to deposit into the Platform", num2Fixed(needSwapLongAsset, 18));
    let amountOutLeast = getAmountOutleast(needSwapLongAsset, leverMsg.slippage);
    console.log("   So after swap, the output should be at least = %s", num2Fixed(amountOutLeast, 18));
    return {
        flashloanAmount, 
        needSwapLongAsset, 
        amountOutLeast
    }
}

export const quoterUniswap = async (flashLoanAmount:string, slippage: number) => {
    console.log("");
    console.log("Quoter Asset Swap");
    const slippageTolerance = new Percent(slippage, 10000);
    // const ZERO = JSBI.BigInt(0);
    // console.log(ZERO instanceof JSBI);
    // console.log(typeof ZERO === 'number');
    // console.log(typeof ZERO === 'string');

    const route = await swapRoute(
        'DAI',
        flashLoanAmount,
        'WETH',
        slippageTolerance
      );
    console.log("%s",slippageTolerance.toFixed())
    return processRoute(route!, slippageTolerance, WETH_TOKEN);

    // if (route == null || route.methodParameters == undefined) throw 'No route loaded';
    
    // // console.log(...route.trade.swaps);
    // const { route: routePath, outputAmount } = route.trade.swaps[0];
    // const minimumAmount = route.trade.minimumAmountOut(slippageTolerance, outputAmount).quotient;
    // // const minimumAmount = 0;
    // const path = encodeRouteToPath(routePath, false);
    // // const path = ethers.utils.solidityPack(["address", "uint24", "address"], [DaiAddress, 3000, WETHAddress]);
    // console.log(`   minimum Output Amount: ${minimumAmount}`);
    // console.log(`   route path: ${path}`);
    // console.log(`   You'll get ${route.quote.toFixed(WETH_TOKEN.decimals)} of ${WETH_TOKEN.symbol}`);
    // // output quote minus gas fees
    // console.log(`   Gas Adjusted Quote: ${route.quoteGasAdjusted.toFixed()}`);
    // console.log(`   Gas Used Quote Token: ${route.estimatedGasUsedQuoteToken.toFixed()}`);
    // console.log(`   Gas Used USD: ${route.estimatedGasUsedUSD.toFixed()}`);
    // console.log(`   Gas Used: ${route.estimatedGasUsed.toString()}`);
    // console.log(`   Gas Price Wei: ${route.gasPriceWei}`);

    // const paths = route.route[0].tokenPath.map(value => value.symbol);

    // console.log(`   route paths: ${paths}`);
    // console.log(`   trade: ${route.trade}`);
    // // const single = route.methodParameters.calldata.includes('5ae401dc');
    // const single = !route.methodParameters.calldata.startsWith('0x5ae401dc');
    // return {
    //     minimumAmount,
    //     single,
    //     path
    // }
}

export const execLeverage = async (user: Signer, flashAmount:string, amountOutLeast: BigNumber,msg: string[]) => {
    var leverMsg = deconstructMaxLever(msg);
    leverMsg.userLeverage = parseInt(msg[4]);
    leverMsg.slippage = parseInt(msg[5]);
    console.log()
    var flashLoanAmount = BigNumber.from(flashAmount);
    const {minimumAmount, single, path} = await quoterUniswap(flashAmount, leverMsg.slippage);
    console.log(`   route path: ${path}`);
    console.log("");
    // apporve flashloan to increase debt on fakesigner
    console.log(leverMsg.shortAssetAddress!);
    const debtTokenAddress = await getAssetDebtTokenAddress(leverMsg.shortAssetAddress!);
    const debtToken = debtTokenContract(debtTokenAddress, globalProvider);
    await apporve2Borrow(debtToken, user, LIGHTNING_LEVERAGE_ADDRESS, flashLoanAmount); 
    await checkBorrowAllowance(debtToken, await user.getAddress(), LIGHTNING_LEVERAGE_ADDRESS);
    const assets : string[] = [leverMsg.shortAssetAddress!,];
    const amounts : ethers.BigNumber[] = [flashLoanAmount, ]; 
    const interestRateModes : ethers.BigNumber[] = [BigNumber.from("2"), ];
    // this params is used to meet the condition in executeOperation
    // params: 1. address is long asset address 2. Slippage 500 ~ 0.05% 3000 ~ 0.3% 10000 ~ 1%
    // const poolFee = 3000;
    const mode = 1;
    let params = packParams(single, flashLoanAmount, amountOutLeast.toString(), path);
    console.log("");    
    console.log("Before leverage...");
    var oldaccountData = await AAVE_POOL.getUserAccountData(await user.getAddress());
    showUserAccountData(oldaccountData);
    console.log("Transaction Begin...");

    const tx2 = await AAVE_POOL.connect(user).flashLoan(
      LIGHTNING_LEVERAGE_ADDRESS,
      assets,
      amounts,
      interestRateModes,
      await user.getAddress(),
      params,
      0,
    );
    await tx2.wait();
    var accountData = await AAVE_POOL.getUserAccountData(await user.getAddress());
    showUserAccountData(accountData);

    console.log("account totalCollateralBase before = %d", oldaccountData[0]);
    console.log("account totalCollateralBase After = %d", accountData[0]);
    let calcLeverage: BigNumber = accountData[0].mul(ethers.utils.parseUnits("1", 8)).div(oldaccountData[0]);

    console.log("Now user leverage = %s", num2Fixed(calcLeverage, 8));
}
</script>
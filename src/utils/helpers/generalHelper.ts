import { SwapRoute } from "@uniswap/smart-order-router";
import { Contract, Signer, ethers, BigNumber } from "ethers";
import { TradeType, CurrencyAmount, Currency, Percent, SupportedChainId, Token } from '@uniswap/sdk-core';
import { pack } from '@ethersproject/solidity'

export const num2Fixed = (number: BigNumber, decimal: number): string => {
    return ethers.utils.formatUnits(number, decimal).toString() 
}

export const packParams = (
    single: boolean, 
    flashLoanAmount: BigNumber, 
    minimumAmount: string, 
    path: string
    ) => {
        var params = ethers.utils.defaultAbiCoder.encode(["bool", "uint256", "uint256", "bytes"], [ single, flashLoanAmount, minimumAmount.toString(), path]);
        params = ethers.utils.solidityPack(["bytes4", "bytes"], ["0x91431dec", params]);
        return params;
    }

export const processRoute = (route: SwapRoute, slippageTolerance: Percent, LongToken: Token) => {
    if (route == null || route.methodParameters == undefined) throw 'No route loaded';
    
    // console.log(...route.trade.swaps);
    const { route: routePath, outputAmount } = route.trade.swaps[0];
    // const minimumAmount = route.trade.minimumAmountOut(slippageTolerance, outputAmount).quotient;
    const minimumAmount = ethers.utils.parseEther(route.quote.toExact());
    const path = encodeRouteToPath(routePath, false);
    // const path = ethers.utils.solidityPack(["address", "uint24", "address"], [DaiAddress, 3000, WETHAddress]);
    console.log(`   minimum Output Amount: ${minimumAmount}`);
    console.log(`   route path: ${path}`);
    console.log(`   You'll get ${route.quote.toFixed(LongToken.decimals)} of ${LongToken.symbol}`);
    // output quote minus gas fees
    console.log(`   Gas Adjusted Quote: ${route.quoteGasAdjusted.toFixed()}`);
    console.log(`   Gas Used Quote Token: ${route.estimatedGasUsedQuoteToken.toFixed()}`);
    console.log(`   Gas Used USD: ${route.estimatedGasUsedUSD.toFixed()}`);
    console.log(`   Gas Used: ${route.estimatedGasUsed.toString()}`);
    console.log(`   Gas Price Wei: ${route.gasPriceWei}`);

    const paths = route.route[0].tokenPath.map(value => value.symbol);

    console.log(`   route paths: ${paths}`);
    console.log(`   trade: ${route.trade}`);
    // const single = route.methodParameters.calldata.includes('5ae401dc');
    const single = !route.methodParameters.calldata.startsWith('0x5ae401dc');
    return {
        minimumAmount,
        single,
        path
    }
}

export function encodeRouteToPath(route: Route<Currency, Currency>, exactOutput: boolean): string {
    const firstInputToken: Token = route.input.wrapped

    const { path, types } = route.pools.reduce(
        (
            { inputToken, path, types }: { inputToken: Token; path: (string | number)[]; types: string[] },
            pool: Pool,
            index
        ): { inputToken: Token; path: (string | number)[]; types: string[] } => {
            const outputToken: Token = pool.token0.equals(inputToken) ? pool.token1 : pool.token0
            if (index === 0) {
                return {
                    inputToken: outputToken,
                    types: ['address', 'uint24', 'address'],
                    path: [inputToken.address, pool.fee, outputToken.address]
                }
            } else {
                return {
                    inputToken: outputToken,
                    types: [...types, 'uint24', 'address'],
                    path: [...path, pool.fee, outputToken.address]
                }
            }
        },
        { inputToken: firstInputToken, path: [], types: [] }
    )

    return exactOutput ? pack(types.reverse(), path.reverse()) : pack(types, path)
}
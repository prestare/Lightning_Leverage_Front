<script lang="ts">
import { ethers, Contract } from 'ethers';
import { SupportedChainId, Token } from '@uniswap/sdk-core';
import {
    WETHAddress,
    DaiAddress,
    USDCAddress,
    AAVE_POOL_ADDRESS,
    WETH_GATEWAY_ADDRESS,
    AAVE_Price_Oricle_Address
} from '../../scripts/address';
import {
    aTokenAbi,
    debtTokenABI,
    WETHGateABI
} from "../utils/ABI";
import POOL_ABI from "../../scripts/abi/interfaces/AAVE/IPool.sol/IPool.json";
import PRICE_Oricle_ABI from "../../scripts/abi/interfaces/AAVE/IPriceOracle.sol/IPriceOracle.json"
import { 
    AlphaRouter,
    AlphaRouterParams,
    ChainId,
    AlphaRouterConfig
} from '@uniswap/smart-order-router';
import { Protocol } from '@uniswap/router-sdk';
export const WETH_TOKEN = new Token(
    SupportedChainId.MAINNET,
    WETHAddress,
    18,
    'WETH',
    'Wrapped Ether'
)

export const USDC_TOKEN = new Token(
    SupportedChainId.MAINNET,
    USDCAddress,
    6,
    'USDC',
    'USD//C'
)
export const DAI_TOKEN = new Token(
    SupportedChainId.MAINNET,
    DaiAddress,
    18,
    'DAI',
    'Dai Stablecoin'
)
export const mainnetUrl = 'https://eth-mainnet.g.alchemy.com/v2/azWjXVXAgsi9y3eCTE7hhJqfDfsNY8qC';
export const mainnetProvider = new ethers.providers.JsonRpcProvider(mainnetUrl);
export const al: AlphaRouterParams = {
    chainId: ChainId.MAINNET,
    provider: mainnetProvider,
};
export const router = new AlphaRouter({
    chainId: ChainId.MAINNET,
    provider: mainnetProvider,
})
export const alphaRouterConfig: AlphaRouterConfig = {
    maxSplits: 1,
    protocols: [Protocol.V3]
}
export const flashAssetList = {
    DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
}
export const atokenList = {
    DAI: "0x018008bfb33d285247A21d44E50697654f754e63",
    WETH: "0x4d5F47FA6A74757f35C14fD3a6Ef8E3C9BC514E8",
}
export const globalProvider = new ethers.providers.Web3Provider(window.ethereum);
export var AAVE_POOL: Contract = new ethers.Contract(AAVE_POOL_ADDRESS, POOL_ABI.abi, globalProvider);
export var WETH_GATEWAY: Contract = new ethers.Contract(WETH_GATEWAY_ADDRESS, WETHGateABI, globalProvider); ;
export var AavePriceOricle: Contract =new ethers.Contract(AAVE_Price_Oricle_Address, PRICE_Oricle_ABI.abi, globalProvider);
export var tokenMap = new Map();

</script>
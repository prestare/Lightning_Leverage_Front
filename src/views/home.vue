<template>
  <div>
    <home-container>
      <el-row style="margin-bottom:10px; float:right" :gutter="20">
        <el-col :span="12">
          <el-button type="warning" round  >Ethereum</el-button>
        </el-col>
        <el-col :span="12">
          <el-button type="primary" round @click="get()" >MetaMask</el-button>
        </el-col>
      </el-row>
      <el-row :gutter="24" class="home-card-one mb15" style="margin-bottom:20px;" >
        <el-col
            :xs="24"
            :sm="12"
            :md="12"
            :lg="12"
            :xl="12"
            v-for="(v, k) in homeOne"
            :key="k"
            :class="{ 'home-media home-media-lg': k > 1, 'home-media-sm': k === 1 }"
        >
          <div class="data-border">
            <div class="flex-margin flex w100" :class="` home-one-animation${k}`" style="margin-left:10px;">
              <div class="flex-auto" >
                <span class="font30">{{ v.num1 }}</span>
                <span class="ml5 font16" :style="{ color: v.color1 }">{{ v.num2 }}%</span>
                <div class="mt10">{{ v.num3 }}</div>
              </div>
              <div class="home-card-item-icon flex" :style="{ background: `var(${v.color2})` }">
                <i class="flex-margin font32" :class="v.num4" :style="{ color: `var(${v.color3})` }"></i>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
      <div class="border-class">
        <loanForm></loanForm>
      </div>
    </home-container>
  </div>
</template>

<script lang="ts" >
import {defineComponent, reactive, toRefs} from "vue";
import loanForm from "./flashloanForm/index.vue";
import detectEthereumProvider from '@metamask/detect-provider';
import { ethers } from "ethers";
import MetaMaskOnboarding from '@metamask/onboarding';
import { ElMessage }  from "element-plus";
import { globalProvider } from "../common/GLOBAL.vue";

export default defineComponent({
  name:'home',
  components:{loanForm},

  setup(){
    const state = reactive({
      homeOne: [
        {
          num1: '125,12',
          num2: '12.32',
          num3: 'TOTAL FLASH LOANS VOLUME',
          num4: 'fa fa-meetup',
          color1: '#FF6462',
          color2: '--next-color-primary-lighter',
          color3: '--el-color-primary',
        },
        {
          num1: '653,33',
          num2: '+42.32',
          num3: 'TOTAL TRANSACTION',
          num4: 'iconfont icon-ditu',
          color1: '#6690F9',
          color2: '--next-color-success-lighter',
          color3: '--el-color-success',
        },
      ],
    })
    return {
      ...toRefs(state),
    };
  },
  data() {
    return {
    };
  },
  methods: {
    postData() {
      console.log(this.user);
    },
    async get() {  // 唤起钱包
      const provider = await detectEthereumProvider();
      if (provider) {
        // From now on, this should always be true:
        // provider === window.ethereum
        console.log('Ethereum successfully detected!');
      } else {
        console.log('Please install MetaMask!');
      }
      try {
        await globalProvider.send("eth_requestAccounts", []);
        const { chainId } = await globalProvider.getNetwork()
        const account = globalProvider.getSigner();
        console.log(account);
        window.ethereum.on('networkChanged', () => {
          window.location.reload()
        })
        window.ethereum.on('accountsChanged', () => {
          window.location.reload()
        })
        window.ethereum.on('message', message => {
          console.log('message', message)
        })
        window.ethereum.on('disconnect', () => {
          localStorage.removeItem('walletType')
          localStorage.removeItem('walletTypeVerify')
          window.location.reload()
        })
        return {
          account,
          provider,
          chainId,
        }
      } catch (error) {
        console.log(error)
        ElMessage.error(error)
        return false
      }
      function isMetaMaskInstalled () {
        const { ethereum } = window
        return Boolean(ethereum && ethereum.isMetaMask)
      }
    },
  },

})

</script>
<style scoped lang="scss">
$homeNavLengh: 8;
.border-class {
  border: 1px  gray solid ;
  margin: 30px;
  box-shadow: 5px 5px 10px #aaa;
  height: 450px;
  border-radius: 2px;
}
.data-border{
  border: 1px  gray solid ;
  margin: 35px;
  width: 350px;
  box-shadow: 5px 5px 10px #aaa;
  height: 80px;
  .text{
    text-anchor: middle;
    dominant-baseline: middle;
  }
}
.home-container {
  overflow: hidden;
  height: 100%;
  width:100%;
  position:absolute;
  .home-card-one {
    .home-card-item {
      width: 100%;
      height: 300px;
      border-radius: 4px;
      transition: all ease 0.3s;
      padding: 20px;
      overflow: hidden;
      background: var(--el-color-white);
      color: var(--el-text-color-primary);
      border: 1px solid var(--next-border-color-light);
      &:hover {
        box-shadow: 0 2px 12px var(--next-color-dark-hover);
        transition: all ease 0.3s;
      }
      &-icon {
        width: 70px;
        height: 70px;
        border-radius: 100%;
        flex-shrink: 1;
        i {
          color: var(--el-text-color-placeholder);
        }
      }
      &-title {
        font-size: 15px;
        font-weight: bold;
        height: 30px;
      }
    }
    @for $i from 0 through 3 {
      .home-one-animation#{$i} {
        opacity: 0;
        animation-name: error-num;
        animation-duration: 0.5s;
        animation-fill-mode: forwards;
        animation-delay: calc($i/10) + s;
      }
    }
  }
}
</style>

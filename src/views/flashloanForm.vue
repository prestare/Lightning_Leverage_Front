<template>
  <div style="margin-top: 20px;" >
      <el-form ref="formRef" :model= "loanForm"  label-width="180px" >
        <el-form-item label="Selected Lending Protocol" prop="protocol">
          <el-select v-model="loanForm.protocol"  placeholder="please select your Protocol">
            <el-option label="AAVE" value="AAVE" />
            <el-option label="UNISWAP" value="UNISWAP" />
            <el-option label="DXDY" value="DXDY" />
          </el-select>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Deposit Token" prop="deposit" >
              <el-select v-model="loanForm.deposit" placeholder="please select your Deposit Token">
                <el-option label="WETH" value="WETH" />
                <el-option label="USDC" value="USDC" />
                <el-option label="DAI" value="DAI" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Long Asset" prop="longAsset">
              <el-select v-model="loanForm.longAsset"  placeholder="please select your Long Asset">
                <el-option label="WETH" value="WETH" />
                <el-option label="USDC" value="USDC" />
                <el-option label="DAI" value="DAI" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Short Asset" prop="shortAsset">
              <el-select v-model="loanForm.shortAsset"  placeholder="please select your Short Asset">
                <el-option label="WETH" value="WETH" />
                <el-option label="USDC" value="USDC" />
                <el-option label="DAI" value="DAI" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Amount To Deposit" prop="depositAmount">
              <el-input-number v-model="loanForm.depositAmount"  :min="1" :max="100000000" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Leverage" prop="leverage">
              <el-input-number v-model="loanForm.leverage"  :min="1" :max="10000000" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="Slippage" prop="slippage">
          <el-input-number v-model="loanForm.slippage"  :precision="2" :step="0.1" :max="10" />
        </el-form-item>
        <el-row style="float: right; margin-right: 10px;" >
          <el-form-item>
          <el-button type="primary" @click="onSubmit">Next</el-button>
          <el-button @click="resetForm" >Reset</el-button>
          </el-form-item>
        </el-row>
      </el-form>
  </div>
</template>
<script lang="ts" >
import {defineComponent, reactive, ref, toRefs, unref} from 'vue';
// import {testApi} from "../api/test";
// import {firstCommit} from "../api/loanForm";
import {ElMessage} from "element-plus";
import { ethers } from 'ethers';
import { calcUserAAVEMaxLeverage, calcUserLeverFlashLoan, execLeverage } from "../utils/aaveLogic.vue";

export default  defineComponent({
  name:'loanForm',
  setup(){
    const formRef = ref();
    const state=reactive({
      loanForm: {
        protocol: "",
        deposit: "",
        longAsset: "",
        shortAsset: "",
        slippage:"",
        leverage:"",
        maxLeverage:"",
        depositAmount:"",
      },
    });
    const testFunc = () => {
      // testApi({"变量名":"值例如state.loanForm.protocol"}).then((res: any) => {
      //   //state.tableData.param.userID = res.data.EntInfo.id;
      // });
    };
    const onSubmit = () => {
      const formWrap = unref(formRef) as any;
      const test = new ethers.providers.Web3Provider(window.ethereum);
      test.send("eth_requestAccounts", []).then();
      const account = test.getSigner();
      if (!formWrap) return;
      console.log("haha");
      formWrap.validate((valid: boolean) => {
        if (valid) {
          var msg = [state.loanForm.protocol, state.loanForm.deposit, state.loanForm.longAsset, state.loanForm.shortAsset];
          console.log(msg);
          var res = calcUserAAVEMaxLeverage(account, msg).then(value => {
            console.log(value);
            msg[4] = state.loanForm.leverage;
            msg[5] = state.loanForm.slippage;
            calcUserLeverFlashLoan(account, msg).then(value => {
              console.log(value);
              const { flashloanAmount, needSwapLongAsset, amountOutLeast } = value;
              console.log("flashloanAmount = ", flashloanAmount.toString());
              console.log("needSwapLongAsset = ", needSwapLongAsset.toString());
              console.log("amountOutLeast = ", amountOutLeast.toString());
              execLeverage(account, flashloanAmount.toString(), amountOutLeast, msg).then(value => {
                return value;
              });
              return value;
            })
            return value;
          });
          // calcUserAAVEMaxLeverage(account, msg).then((res: any) => {
          //   if (res.code == 0) {
          //     ElMessage.success('Submit Success!');
          //   } else {
          //     ElMessage.error('Error! ');
          //   }
          // });
          // }).catch(() => {
          //   ElMessage.success('Not Valid.');
          // });
        }
      });

      // this.$router.push({
      //   //调用的名称
      //   name: 'confirmForm',
      //   path: "/next",
      //   //传递参数
      //   params: {
      //     loanForm: 'loanForm' ,
      //   }
      // })
    };
    return {
      formRef,
      testFunc,
      onSubmit,
      ...toRefs(state),
    };
  },
  data() {
    return {
      loanForm: {
        protocol: "",
        deposit: "",
        longAsset: "",
        shortAsset: "",
        slippage:"",
        leverage:"",
        maxLeverage:"",
        depositAmount:"",
      }
    }
  },
  methods: {
    resetForm () {
      console.log(this)
      this.$refs.formRef.resetFields()
    }
  },
})

</script>

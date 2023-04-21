<template>
    <div id="box">
      <div id="leftBox">
        <div id="leftContainer">
          <ul id="leftUl">
            <li>
              <div class = "arrow" v-if="Index == 1"  ></div><div class="marginLeft" :class="{active : Index == 1}" >期望数额</div>
            </li>
            <li>
              <div class= "arrow" v-if="Index == 2" ></div> <div class="marginLeft" :class="{active : Index == 2}" >确认交易</div>
            </li>
            <li>
              <div  class="arrow" v-if="Index == 3" ></div><div class="marginLeft" :class="{active : Index == 3}" >完成</div>
            </li>
          </ul>
        </div>
      </div>
      <div id="rightBox">
        <div id="rightContainer" >
          <ul>
            <li>
                <div v-if="Index == 1" class = "line" style="margin-left: -15px;">
                    <el-form ref="loanformRef" :model= "loanForm"  label-width="180px" >
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
                        <el-button type="primary" style="width: 50px;" @click="onNextSteps">Next</el-button>
                        <el-button style="width: 50px;" @click="resetForm" >Reset</el-button>
                        </el-form-item>
                        </el-row>
                    </el-form>
                </div>
            </li>
            <li style="padding-top: 10px;">
              <div v-if="Index == 2" class = "line" style="margin-left: -15px;">
                    <el-form ref="loanformRef" :model="loanForm" label-width="120px">
                        <el-form-item label="Protocol" >
                            <span >{{loanForm.protocol}}</span>
                        </el-form-item>
                        <el-form-item label="LongAsset">
                            <span>{{loanForm.longAsset}}</span>
                        </el-form-item>
                        <el-form-item label="ShortAsset">
                            <span>{{loanForm.shortAsset}}</span>
                        </el-form-item>
                        <el-form-item label="Slippage">
                            <span>{{loanForm.slippage}}</span>
                        </el-form-item>
                        <el-col>
                            <el-text class="mx-1" type="warning">Calculating</el-text>
                            <br> <br>
                            <el-text class="mx-1" type="primary">Completed</el-text>
                            <br> <br>
                        </el-col>
                        <div style=" border:1px  gray solid ; margin-top: 3px;margin-bottom: 5px;">
                            <el-row style="margin-top: 10px;">
                                <el-form-item label="Leverage" prop="leverage">
                                    <el-input-number v-model="loanForm.leverage"  :min="1" :max="10000000" />
                                    <el-text>Max : {{loanForm.maxLeverage}}</el-text>
                                </el-form-item>
                                <el-form-item label="Slippage" prop="slippage">
                                    <el-input-number v-model="loanForm.slippage"  :precision="2" :step="0.1" :max="10" />
                                </el-form-item>
                            </el-row>
                        </div>
                        <el-row style="float: right; margin-right: 10px;" >
                        <el-form-item>
                            <el-button type="primary" style="width: 50px;" @click="onSubmit">Confirm</el-button>
                            <el-button style="width: 50px;" @click="lastForm" >Return</el-button>
                        </el-form-item>
                        </el-row>
                    </el-form>
              </div>
            </li>
            <li>
              <div v-if="Index == 3" class="line">
                <p>Completed!</p>>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </template>

<script lang="ts">
import { toRefs, reactive, defineComponent, ref, unref , nextTick} from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';
import { ethers } from 'ethers';
import { calcUserAAVEMaxLeverage, calcUserLeverFlashLoan, execLeverage } from "../../utils/aaveLogic.vue";
import { stat } from 'fs';

export default defineComponent({
	name: 'flashloanFrom',
	components: {
	},
	setup() {
		const loanformRef = ref();
		const router = useRouter();
		const state = reactive({
            Index: 1,
            msg: [""],
            loanForm: {
                protocol: "",
                deposit: "",
                longAsset: "",
                shortAsset: "",
                slippage:0,
                leverage:0,
                maxLeverage:"",
                depositAmount:"",
            },
		});

		// 下一步点击
		const onNextSteps = () => {
			const formWrap = unref(loanformRef) as any;
            const test = new ethers.providers.Web3Provider(window.ethereum);
            test.send("eth_requestAccounts", []).then();
            const account = test.getSigner();
            if (!formWrap) return;
            console.log("haha");
            formWrap.validate((valid: boolean) => {
                if (valid) {
                    state.msg = [state.loanForm.protocol, state.loanForm.deposit, state.loanForm.longAsset, state.loanForm.shortAsset];
                    console.log(state.msg);
                    var res = calcUserAAVEMaxLeverage(account, state.msg).then(value => {
                        console.log(value);
                        console.log("haha");
                        console.log(res);
                        state.loanForm.maxLeverage = value[0];
                    });
                }
            });
            console.log(state.loanForm.maxLeverage);
            state.Index = 2;
            state.loanForm.leverage = 0;
            state.loanForm.slippage = 0;
            console.log(state.Index);
		};
        const lastForm = () =>{
            state.Index = 1;
        }
		// 删除
		const onDelete = () => {
			ElMessageBox.confirm(`此操作将永久删除当前用户注册过的企业信息，是否继续?`, '提示', {
				confirmButtonText: '确认',
				cancelButtonText: '取消',
				type: 'warning',
			}).then(() => {
					// test:删除企业信息
			deleteEntInfo().then(async (res: any) => {
				if (res.code == 0) {
					ElMessage.success('删除成功');
				} else {
					ElMessage.error('删除失败');
				}
			}).catch(() => {
				ElMessage.error('删除失败');
			});
			}).catch(() => { });
		};

		// 上一步点击
		const onPreviousSteps = () => {
			if (state.stepsActive-- <= 1) state.stepsActive = 1;
		};

		// 提交：call stepThree API
		const onSubmit = () => {
            const formWrap = unref(loanformRef) as any;
            const test = new ethers.providers.Web3Provider(window.ethereum);
            test.send("eth_requestAccounts", []).then();
            const account = test.getSigner();
            if (!formWrap) return;
            console.log("haha");
            formWrap.validate((valid: boolean) => {
                if (valid) {
                        state.msg[4] = state.loanForm.leverage.toString();
                        state.msg[5] = state.loanForm.slippage.toString();
                        calcUserLeverFlashLoan(account, state.msg).then(value => {
                            console.log(value);
                            const { flashloanAmount, needSwapLongAsset, amountOutLeast } = value;
                            console.log("flashloanAmount = ", flashloanAmount.toString());
                            console.log("needSwapLongAsset = ", needSwapLongAsset.toString());
                            console.log("amountOutLeast = ", amountOutLeast.toString());
                            execLeverage(account, flashloanAmount.toString(), amountOutLeast, state.msg).then(value => {
                                return value;
                            });
                            return value;
                        });
                };
            });
		};

        const resetForm = ()=>{
			state.loanForm = {
				protocol: "",
                deposit: "",
                longAsset: "",
                shortAsset: "",
                slippage:"",
                leverage:"",
                maxLeverage:"",
                depositAmount:"",
			}
			nextTick(() => {
				if (!loanformRef.value) return;
				loanformRef.value.resetFields();
			});
		};

		return {
			loanformRef,
            lastForm,
			onNextSteps,
			onDelete,
			onPreviousSteps,
			onSubmit,
            resetForm,
			...toRefs(state),
		};
	},
});
</script>

<style scoped>
  #box{
    width: 100%;
    height: 100%;
    background: white;
    padding: 10px;
    overflow: hidden;
  }
  #leftBox{
    width: 20%;
    float: left;
    /*border: 1px solid black;*/
  }
  #rightBox{
    width: 80%;
    float: left;
    /*border: 1px solid black;*/
  }
  #leftBox, #rightBox{
    height: 100%;
    overflow: auto
  }


  /*标签初始化*/
  body,  dl, dt, dd, ul, ol, li, h1, h2, h3, h4, h5, h6, form, fieldset, img, button, textarea {
    margin: 0;
    padding: 0;
    border: none;
    list-style:none
  }
  /*标签初始化*/
  html,body {
    height:100%;overflow:hidden;
  }
  /*媒体查询*/
  /*1024*/
  @media screen and (min-width:1024px) {
    #leftContainer, #rightContainer {
      min-height:82vh;
      overflow-y: hidden;
    }
  }
  /*1101*/
  @media screen and (min-width:1101px) and (max-width:1280px){
    #leftContainer, #rightContainer {
      min-height:82vh;
      overflow-y: hidden;
    }
  }
  @media screen and (min-width:1507px) and (max-width:1619px){
    #leftContainer, #rightContainer {
      min-height:82vh;
      overflow-y: hidden;
    }
  }
  @media screen and (min-width:1620px) and (max-width:1848px){
    #leftContainer, #rightContainer {
      min-height:82vh!important;
      overflow-y: hidden;
    }
    .smallBox[data-v-3c60614f] {
      width: 90%;
      height: 80px;
      border: 1px solid #dddddd;
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
    }
    #leftContainer{
      min-height:82vh!important;
      padding: 5px 20px 5px 20px;
      width: 100%;
      overflow-y: hidden;
      background:#fff;
      box-shadow:2px 6px 6px #eee;
      border:1px solid #e9e9e9;
    }
    #rightContainer{
      position: relative;
      min-height:82vh!important;
      overflow-y: hidden;
      padding: 5px 10px 5px 30px;
      margin-left: 2%;
      width: 98%;
      background:#fff;
      box-shadow:2px 6px 6px #eee;
      border:1px solid #e9e9e9;
    }
  }

  #leftUl li div{
    color: #3c4353;
    font-weight: 400;
  }
  .leftResult{
    width: 80%;
  }
  .rightResult{
    width: 20%;
    border: 1px solid #e9e9eb;
    /*background: #99ffcc;*/
  }
  .marginLeft{
    margin-left: 10px;
  }
  .arrow{
    width: 0;
    height: 0;
    border-width: 5px;
    border-style: solid;
    border-color: transparent transparent transparent #0099CC;
  }
  #leftContainer{
    min-height:80vh;
    padding: 5px 20px 5px 20px;
    width: 100%;
    overflow-y: hidden;
    background:#fff;
    box-shadow:2px 6px 6px #eee;
    border:1px solid #e9e9e9;
  }
  #leftContainer ul li{
    padding: 20px;
    display: flex;
    flex-direction: row;
    height: 20px;
    line-height: 7px;
  }
  .rightImg{
    width: 100px;
  }
  .rightBox{
    padding-left: 26px;padding-top: 2px;
  }
  .smallTitle{
    font-size: 18px;
    border-bottom: 1px solid #e9e9e9;
    font-weight: 600;
  }
  .rightDescription{
    color: #a62bff;
    font-weight: 600;
  }
  .smallBox{
    width:90%;
    height: 70px;
    border: 1px solid #dddddd;
    display: flex
  }
  #leftContainer, #rightContainer {
    min-height:80vh;
    overflow-y: hidden;
  }
  #rightContainer{
    position: relative;
    min-height:80vh;
    overflow-y: hidden;
    padding: 5px 10px 5px 30px;
    margin-left: 2%;
    width: 98%;
    background:#fff;
    box-shadow:2px 6px 6px #eee;
    border:1px solid #e9e9e9;
  }
  .active1 {
    color: #fff;
    background: #e74c3c;
    width: 5px;height: 5px;background: red;
    border: 1px solid red;
  }
</style>
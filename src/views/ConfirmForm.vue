<template>
  <div>
    <!-- .prevent：取消表单的默认行为 -->
    <form @submit.prevent="postData">
      <el-form :model="confirmForm" label-width="120px">
        <el-form-item label="Protocol" >
          <span >{{confirmForm.protocol}}</span>
        </el-form-item>
        <el-form-item label="LongAsset">
          <span>{{confirmForm.longAsset}}</span>
        </el-form-item>
        <el-form-item label="ShortAsset">
          <span>{{confirmForm.shortAsset}}</span>
        </el-form-item>
        <el-form-item label="Slippage">
          <span>{{confirmForm.slippage}}</span>
        </el-form-item>
        <el-col>
          <el-text class="mx-1" type="warning">Calculating</el-text>
          <el-text class="mx-1" type="primary">Completed</el-text>
        </el-col>
        <div style="border:1px  gray solid ;">
          <el-row>
            <el-form-item label="Leverage" prop="leverage">
              <el-input-number v-model="confirmForm.leverage"  :min="1" :max="10000000" />
              <el-text>Max : {{confirmForm.maxLeverage}}</el-text>
            </el-form-item>
            <el-form-item label="Slippage" prop="slippage">
              <el-input-number v-model="confirmForm.slippage"  :precision="2" :step="0.1" :max="10" />
            </el-form-item>
          </el-row>
        </div>
        <el-row style="float: right; margin-right: 10px;" >
          <el-form-item>
            <el-button type="primary" @click="onSubmit">Confirm</el-button>
            <el-button @click="resetForm" >Cancel</el-button>
          </el-form-item>
        </el-row>
      </el-form>
    </form>
  </div>
</template>

<script lang="ts" >
import {defineComponent, ref, unref,reactive, toRefs} from "vue";
import {firstCommit, secondCommit} from "../api/loanForm";
import {ElMessage} from "element-plus";

export default defineComponent({
  name:'confirmForm',
  setup(){
    const formRef = ref();
    const state = reactive({
      confirmForm : this.$route.params.loanForm;
    });
    const onSubmit = () => {
      const formWrap = unref(formRef) as any;
      if (!formWrap) return;
      formWrap.validate((valid: boolean) => {
        if (valid) {
          secondCommit(state.confirmForm).then((res: any) => {
            if (res.code == 0) {
              ElMessage.success('Submit Success!');
            } else {
              ElMessage.error('Error! ');
            }
          }).catch(() => {
            ElMessage.success('Not Valid.');
          });
        }
      });
    }
    return {
      ...toRefs(state),
      onSubmit,
    };
  },
  data() {
    return {
      confirmForm: {
        protocol: "",
        deposit: "",
        longAsset: "",
        shortAsset: "",
        slippage:"",
        leverage:"",
        maxLeverage:"",
        depositAmount:"",
      },
    };
  },
  methods: {
    postData() {
      console.log(this.user);
    },
  },
})

</script>

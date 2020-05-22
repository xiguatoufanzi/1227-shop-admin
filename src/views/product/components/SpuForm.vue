<template>
  <el-form
    :model="form"
    :label-position="labelPosition"
    label-width="100px"
    v-show="visible"
  >
    <el-form-item label="SPU名称">
      <el-input placeholder="SPU名称"></el-input>
    </el-form-item>
    <el-form-item label="品牌">
      <el-select placeholder="请选择品牌" value="">
        <el-option label="A" value="1"></el-option>
        <el-option label="B" value="2"></el-option>
      </el-select>
    </el-form-item>

    <el-form-item label="SPU描述">
      <el-input type="textarea" placeholder="SPU描述" rows="4"></el-input>
    </el-form-item>
    <el-form-item label="SPU图片">
      <el-upload
        action="https://jsonplaceholder.typicode.com/posts/"
        list-type="picture-card"
        :on-preview="handlePictureCardPreview"
        :on-remove="handleRemove"
      >
        <i class="el-icon-plus"></i>
      </el-upload>
      <el-dialog :visible.sync="dialogVisible">
        <img width="100%" :src="dialogImageUrl" alt="" />
      </el-dialog>
    </el-form-item>

    <el-form-item label="销售属性">
      <el-select placeholder="请选择" value="">
        <el-option label="A" value="1"></el-option>
        <el-option label="B" value="2"></el-option>
      </el-select>
      <el-button type="primary" icon="el-icon-plus">添加销售属性</el-button>

      <el-table style="margin-top: 20px" border>
        <!-- 序号列 -->
        <el-table-column label="序号" type="index" width="80" align="center">
        </el-table-column>
        <el-table-column label="属性名"> </el-table-column>
        <el-table-column label="属性值名称"> </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="{ row, $index }">
            <el-button type="danger" icon="el-icon-delete" size="mini"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-form-item>

    <el-form-item>
      <el-button type="primary">保存</el-button>
      <el-button @click="back">返回</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  name: "SpuForm",
  props: {
    visible: Boolean
  },

  data() {
    return {
      labelPosition: "right", //右对齐

      dialogImageUrl: "",
      dialogVisible: false,

      form: {
        spuId: "", // 当前要更新的spuInfo的id
        spuInfo: {}, // 当前SpuInfo对象
        spuImageList: [], // Spu的图片列表
        trademarkList: [], //品牌列表
        saleAttrList: [] //销售属性列表
      }
    };
  },

  methods: {
    // 由父组件调用的方法,根据id请求加载相关数据
    initLoadUpdateData(spuId) {
      this.spuId = spuId;
      this.getSpuInfo();
      this.getSpuImageList();
      this.getTrademarkList();
      this.getSaleAttrList();
    },

    //根据SPU的id获取SPU的详情信息
    async getSpuInfo() {
      const result = await this.$API.spu.get(this.spuId);
      this.form.spuInfo = result.data;
    },
    //根据SPU的id获取SPU的图片列表
    async getSpuImageList() {
      const result = await this.$API.sku.getSpuImageList(this.spuId);
      this.form.spuImageList = result.data;
    },
    //获取所有品牌的列表
    async getTrademarkList() {
      const result = await this.$API.trademark.getList();
      this.form.trademarkList = result.data;
    },
    //获取所有销售属性(id/name)列表
    async getSaleAttrList() {
      const result = await this.$API.spu.getSaleList();
      this.form.saleAttrList = result.data;
    },

    handleRemove(file, fileList) {
      console.log(file, fileList);
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },

    back() {
      // 分发自定义事件, 让修改页面关闭
      this.$emit("update:visible", false);
    }
  }
};
</script>

<style lang="less" scoped></style>

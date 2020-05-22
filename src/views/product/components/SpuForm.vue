<template>
  <el-form
    :model="form"
    :label-position="labelPosition"
    label-width="100px"
    v-show="visible"
  >
    <el-form-item label="SPU名称">
      <el-input placeholder="SPU名称" v-model="form.spuInfo.spuName"></el-input>
    </el-form-item>
    <el-form-item label="品牌">
      <el-select placeholder="请选择品牌" v-model="form.trademarkId">
        <el-option
          v-for="t in form.trademarkList"
          :key="t.id"
          :label="t.tmName"
          :value="t.id"
        ></el-option>
      </el-select>
    </el-form-item>

    <el-form-item label="SPU描述">
      <el-input
        type="textarea"
        placeholder="SPU描述"
        rows="4"
        v-model="form.spuInfo.description"
      ></el-input>
    </el-form-item>

    <el-form-item label="SPU图片">
      <el-upload
        :file-list="form.spuUpImageList"
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
      <el-select placeholder="请选择品牌" v-model="form.saleId">
        <el-option
          v-for="s in form.saleAttrList"
          :key="s.id"
          :label="s.name"
          :value="s.id"
        ></el-option>
      </el-select>
      <el-button type="primary" icon="el-icon-plus">添加销售属性</el-button>

      <el-table
        style="margin-top: 20px"
        border
        :data="form.spuInfo.spuSaleAttrList"
      >
        <!-- 序号列 -->
        <el-table-column label="序号" type="index" width="80" align="center">
        </el-table-column>
        <el-table-column label="属性名" prop="saleAttrName"> </el-table-column>

        <el-table-column label="属性值名称">
          <template slot-scope="{ row, $index }">
            <el-tag
              :key="sAttr.id"
              v-for="sAttr in row.spuSaleAttrValueList"
              closable
              :disable-transitions="false"
              @close="handleClose(sAttr)"
            >
              {{ sAttr.saleAttrValueName }}
            </el-tag>
            <el-input
              class="input-new-tag"
              v-if="inputVisible"
              v-model="inputValue"
              ref="saveTagInput"
              size="small"
              @keyup.enter.native="handleInputConfirm"
              @blur="handleInputConfirm"
            >
            </el-input>
            <el-button
              v-else
              class="button-new-tag"
              size="small"
              @click="showInput"
              >+ 添加</el-button
            >
          </template>
        </el-table-column>

        <el-table-column label="操作">
          <template slot-scope="{ row, $index }">
            <el-popconfirm :title="`确定删除属性 吗?`">
              <hint-button
                type="danger"
                title="删除"
                icon="el-icon-delete"
                size="mini"
                slot="reference"
              ></hint-button>
            </el-popconfirm>
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
        saleId: "",
        trademarkId: "",
        spuId: "", // 当前要更新的spuInfo的id
        spuInfo: {}, // 当前SpuInfo对象
        spuImageList: [], // Spu的图片列表
        spuUpImageList: [], // Spu已上传的图片列表
        trademarkList: [], //品牌列表
        saleAttrList: [] //销售属性列表
      },

      inputVisible: false,
      inputValue: ""
    };
  },

  methods: {
    //有关销售属性表格的方法
    handleClose(tag) {
      this.dynamicTags.splice(this.dynamicTags.indexOf(tag), 1);
    },

    showInput() {
      this.inputVisible = true;
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },

    handleInputConfirm() {
      let inputValue = this.inputValue;
      if (inputValue) {
        this.dynamicTags.push(inputValue);
      }
      this.inputVisible = false;
      this.inputValue = "";
    },

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
      this.form.spuUpImageList = result.data.map(item => {
        let imgList = {};
        imgList.name = item.imgName;
        imgList.url = item.imgUrl;
        return imgList;
      });
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

    //上传图片所用回调
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

<style lang="less" scoped>
.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>
